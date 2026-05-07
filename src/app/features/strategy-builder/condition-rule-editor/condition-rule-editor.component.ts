import {
  Component,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { skip } from 'rxjs/operators';
import {
  getConditionsForIndicator,
  conditionNeedsSecondarySlot,
  conditionNeedsThreshold,
  getCompatibleSecondaryShapes,
  type IndicatorOutputShape,
} from '../../../core/strategy/conditions.registry';
import type { ConditionDef } from '../../../core/strategy/conditions.registry';
import type { ConditionKey, ConditionRule, IndicatorSlot } from '../../../core/strategy/strategy.model';
import { LangService } from '../../../core/services/lang.service';
import { IndicatorSlotEditorComponent } from '../indicator-slot-editor/indicator-slot-editor.component';

const DEFAULT_PRIMARY_SLOT: IndicatorSlot = {
  indicatorId: 'ema',
  category:    'moving-averages',
  params:      { period: 10 },
};

const DEFAULT_SECONDARY_SLOT: IndicatorSlot = {
  indicatorId: 'ema',
  category:    'moving-averages',
  params:      { period: 30 },
};

function ruleKey(r: ConditionRule): string {
  return `${r.conditionKey}::${r.primarySlot.indicatorId}::${JSON.stringify(r.primarySlot.params)}`;
}

@Component({
  selector: 'app-condition-rule-editor',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    IndicatorSlotEditorComponent,
  ],
  templateUrl: './condition-rule-editor.component.html',
  styleUrl: './condition-rule-editor.component.scss',
})
export class ConditionRuleEditorComponent implements OnInit {
  label      = input.required<'entry' | 'exit'>();
  rule       = input.required<ConditionRule>();
  ruleChange = output<ConditionRule>();

  protected readonly lang = inject(LangService);

  protected readonly primarySlot   = signal<IndicatorSlot>(DEFAULT_PRIMARY_SLOT);
  protected readonly conditionKey  = signal<ConditionKey>('line_crosses_above');
  protected readonly threshold     = signal<number | undefined>(undefined);
  protected readonly secondarySlot = signal<IndicatorSlot>(DEFAULT_SECONDARY_SLOT);

  protected readonly availableConditions = computed<ConditionDef[]>(() =>
    getConditionsForIndicator(this.primarySlot().indicatorId)
  );

  protected readonly needsSecondary = computed(() =>
    conditionNeedsSecondarySlot(this.conditionKey())
  );

  protected readonly needsThreshold = computed(() =>
    conditionNeedsThreshold(this.conditionKey())
  );

  protected readonly secondaryAllowedShapes = computed<IndicatorOutputShape[]>(() =>
    this.needsSecondary() ? getCompatibleSecondaryShapes(this.primarySlot().indicatorId) : []
  );

  private lastRuleKey = '';

  constructor() {
    toObservable(this.rule)
      .pipe(skip(1), takeUntilDestroyed())
      .subscribe(r => {
        const key = ruleKey(r);
        if (key === this.lastRuleKey) return;
        this.lastRuleKey = key;
        this.primarySlot.set(r.primarySlot);
        this.conditionKey.set(r.conditionKey);
        this.threshold.set(r.threshold);
        if (r.secondarySlot) this.secondarySlot.set(r.secondarySlot);
      });
  }

  ngOnInit(): void {
    const r = this.rule();
    this.lastRuleKey = ruleKey(r);
    this.primarySlot.set(r.primarySlot);
    this.conditionKey.set(r.conditionKey);
    this.threshold.set(r.threshold);
    if (r.secondarySlot) this.secondarySlot.set(r.secondarySlot);
  }

  protected onPrimarySlotChange(slot: IndicatorSlot): void {
    this.primarySlot.set(slot);
    const conds = getConditionsForIndicator(slot.indicatorId);
    if (!conds.find(c => c.key === this.conditionKey())) {
      this.conditionKey.set(conds[0]?.key ?? 'price_above');
    }
    this.emitRule();
  }

  protected onConditionChange(key: ConditionKey): void {
    this.conditionKey.set(key);
    if (!conditionNeedsThreshold(key)) this.threshold.set(undefined);
    this.emitRule();
  }

  protected onThresholdChange(val: string): void {
    const n = parseFloat(val);
    this.threshold.set(isNaN(n) ? undefined : n);
    this.emitRule();
  }

  protected onSecondarySlotChange(slot: IndicatorSlot): void {
    this.secondarySlot.set(slot);
    this.emitRule();
  }

  private emitRule(): void {
    const rule: ConditionRule = {
      primarySlot:  this.primarySlot(),
      conditionKey: this.conditionKey(),
    };
    if (this.needsThreshold() && this.threshold() !== undefined) {
      rule.threshold = this.threshold();
    }
    if (this.needsSecondary()) {
      rule.secondarySlot = this.secondarySlot();
    }
    this.lastRuleKey = ruleKey(rule);
    this.ruleChange.emit(rule);
  }
}
