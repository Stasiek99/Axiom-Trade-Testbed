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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { skip } from 'rxjs/operators';
import { indicatorRegistry, type IndicatorCategory } from '../../../core/indicators';
import { LangService } from '../../../core/services/lang.service';
import type { IndicatorSlot } from '../../../core/strategy/strategy.model';

export const STRATEGY_CATEGORIES: IndicatorCategory[] = [
  'moving-averages', 'oscillators', 'momentum', 'trend', 'volatility', 'channels-bands', 'volume',
];

function slotKey(s: IndicatorSlot): string {
  return `${s.indicatorId}::${JSON.stringify(s.params)}`;
}

@Component({
  selector: 'app-indicator-slot-editor',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatSlideToggleModule,
    MatTooltipModule,
  ],
  templateUrl: './indicator-slot-editor.component.html',
  styleUrl: './indicator-slot-editor.component.scss',
})
export class IndicatorSlotEditorComponent implements OnInit {
  slot = input<IndicatorSlot | undefined>();

  slotChange = output<IndicatorSlot>();

  protected readonly lang = inject(LangService);

  protected readonly CATEGORIES = STRATEGY_CATEGORIES;

  protected readonly category    = signal<IndicatorCategory>('moving-averages');
  protected readonly indicatorId = signal<string>('ema');
  protected readonly paramValues = signal<Record<string, number | string | boolean>>({});

  protected readonly indicatorsInCategory = computed(() =>
    indicatorRegistry.getByCategory(this.category())
  );

  protected readonly currentDef = computed(() =>
    indicatorRegistry.get(this.indicatorId())
  );

  private lastSlotKey = '';

  constructor() {
    // Sync from parent input changes (e.g. preset loaded) without emitting back
    toObservable(this.slot)
      .pipe(skip(1), takeUntilDestroyed())
      .subscribe(s => {
        if (!s) return;
        const key = slotKey(s);
        if (key === this.lastSlotKey) return;
        this.lastSlotKey = key;
        this.category.set(s.category);
        this.indicatorId.set(s.indicatorId);
        this.paramValues.set({ ...s.params });
      });
  }

  ngOnInit(): void {
    const s = this.slot();
    if (s) {
      this.lastSlotKey = slotKey(s);
      this.category.set(s.category);
      this.indicatorId.set(s.indicatorId);
      this.paramValues.set({ ...s.params });
    } else {
      this.resetToDefaults('moving-averages');
    }
  }

  protected onCategoryChange(cat: IndicatorCategory): void {
    this.category.set(cat);
    const inds = indicatorRegistry.getByCategory(cat);
    if (inds.length > 0) {
      this.setIndicator(inds[0].meta.id);
    }
  }

  protected onIndicatorChange(id: string): void {
    this.setIndicator(id);
  }

  protected onParamChange(key: string, value: number | string | boolean): void {
    this.paramValues.update(prev => ({ ...prev, [key]: value }));
    this.emitSlot();
  }

  private setIndicator(id: string): void {
    this.indicatorId.set(id);
    const def = indicatorRegistry.get(id);
    if (def) {
      const defaults: Record<string, number | string | boolean> = {};
      for (const p of def.meta.params) {
        defaults[p.key] = p.defaultValue as number | string | boolean;
      }
      this.paramValues.set(defaults);
    }
    this.emitSlot();
  }

  private resetToDefaults(cat: IndicatorCategory): void {
    const inds = indicatorRegistry.getByCategory(cat);
    if (inds.length > 0) this.setIndicator(inds[0].meta.id);
  }

  private emitSlot(): void {
    const slot: IndicatorSlot = {
      indicatorId: this.indicatorId(),
      category:    this.category(),
      params:      { ...this.paramValues() },
    };
    this.lastSlotKey = slotKey(slot);
    this.slotChange.emit(slot);
  }
}
