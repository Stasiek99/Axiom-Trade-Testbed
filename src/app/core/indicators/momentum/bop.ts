import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

/**
 * Balance of Power: (close - open) / (high - low).
 * Measures the strength of buyers vs sellers within a single bar.
 * > 0 indicates buying pressure, < 0 indicates selling pressure.
 * High/low spread avoids the zero-division pitfall.
 */
export function bop(bars: BarInput[]): (number | null)[] {
  return bars.map(b => {
    const range = b.high - b.low;
    if (range === 0) return 0;
    return (b.close - b.open) / range;
  });
}

const BOP_DEF: IndicatorDef<Record<string, never>, number | null> = {
  meta: {
    id: 'bop',
    name: 'Balance of Power',
    shortName: 'BOP',
    category: 'momentum',
    overlay: false,
    description:
      'Evaluates the strength of buyers versus sellers by normalising the close-open difference against the bar range. Values above zero signal buying pressure; below zero signal selling pressure.',
    params: [],
  },
  defaultOptions: {},
  calculate(bars) {
    return bop(bars);
  },
};

indicatorRegistry.register(BOP_DEF);
