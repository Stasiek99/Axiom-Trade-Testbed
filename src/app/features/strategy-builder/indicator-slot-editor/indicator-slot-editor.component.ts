import {
  Component,
  OnInit,
  computed,
  effect,
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
import { INDICATOR_OUTPUT_SHAPES, type IndicatorOutputShape } from '../../../core/strategy/conditions.registry';
import { LangService } from '../../../core/services/lang.service';
import type { IndicatorSlot } from '../../../core/strategy/strategy.model';

export const STRATEGY_CATEGORIES: IndicatorCategory[] = [
  'moving-averages', 'oscillators', 'momentum', 'trend', 'volatility', 'channels-bands', 'volume',
];

// Indicators excluded from strategy conditions.
// 'zig-zag' / 'williams-fractals': use future bars → lookahead bias in backtests.
// 'maribbon' / 'donchian-trend-ribbon': return arrays, no scalar signal to condition on.
const STRATEGY_EXCLUDED: ReadonlySet<string> = new Set([
  'zig-zag',
  'williams-fractals',
  'maribbon',
  'donchian-trend-ribbon',
]);

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
  slot          = input<IndicatorSlot | undefined>();
  allowedShapes = input<IndicatorOutputShape[]>([]);

  slotChange = output<IndicatorSlot>();

  protected readonly lang = inject(LangService);

  protected readonly CATEGORIES = STRATEGY_CATEGORIES;

  protected readonly category    = signal<IndicatorCategory>('moving-averages');
  protected readonly indicatorId = signal<string>('ema');
  protected readonly paramValues = signal<Record<string, number | string | boolean>>({});

  // Categories that contain at least one indicator compatible with allowedShapes.
  // When no filter is active all categories are shown.
  protected readonly availableCategories = computed(() => {
    const allowed = this.allowedShapes();
    if (!allowed.length) return this.CATEGORIES;
    return this.CATEGORIES.filter(cat =>
      indicatorRegistry.getByCategory(cat).some(d => allowed.includes(INDICATOR_OUTPUT_SHAPES[d.meta.id]))
    );
  });

  protected readonly indicatorsInCategory = computed(() => {
    const all     = indicatorRegistry.getByCategory(this.category())
                      .filter(d => !STRATEGY_EXCLUDED.has(d.meta.id));
    const allowed = this.allowedShapes();
    if (!allowed.length) return all;
    return all.filter(d => allowed.includes(INDICATOR_OUTPUT_SHAPES[d.meta.id]));
  });

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

    // When allowedShapes narrows the visible list, auto-reset to the first valid indicator.
    // If the current category has no compatible indicators, switch to the first valid category.
    effect(() => {
      const allowed  = this.allowedShapes();
      if (!allowed.length) return;

      const visible  = this.indicatorsInCategory();
      if (visible.length === 0) {
        const validCat = this.availableCategories()[0];
        if (validCat) this.onCategoryChange(validCat);
      } else if (!visible.find(d => d.meta.id === this.indicatorId())) {
        this.setIndicator(visible[0].meta.id);
      }
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

  protected paramValue(key: string, fallback: number | string | boolean): number | string | boolean {
    const v = this.paramValues();
    return key in v ? v[key] : fallback;
  }

  protected onCategoryChange(cat: IndicatorCategory): void {
    this.category.set(cat);
    const allowed = this.allowedShapes();
    const all     = indicatorRegistry.getByCategory(cat);
    const inds    = allowed.length ? all.filter(d => allowed.includes(INDICATOR_OUTPUT_SHAPES[d.meta.id])) : all;
    const first   = inds[0] ?? all[0];
    if (first) this.setIndicator(first.meta.id);
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
