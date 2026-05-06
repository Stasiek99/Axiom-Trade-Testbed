import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

export function adr(bars: BarInput[], length: number): (number | null)[] {
  const result: (number | null)[] = new Array(bars.length).fill(null);
  if (bars.length < length) return result;

  for (let i = length - 1; i < bars.length; i++) {
    let sum = 0;
    for (let j = i - length + 1; j <= i; j++) {
      const range = bars[j].high - bars[j].low;
      sum += range;
    }
    result[i] = sum / length;
  }

  return result;
}

const ADR_DEF: IndicatorDef<{ length: number }, number | null> = {
  meta: {
    id: 'adr',
    name: 'Average Daily Range',
    shortName: 'ADR',
    category: 'volatility',
    overlay: true,
    description:
      'Simple moving average of the high-minus-low range over N bars. Shows the average intraday price range, useful for setting stop-loss and take-profit distances.',
    params: [
      { key: 'length', label: 'Length', type: 'number', defaultValue: 20, min: 2, max: 200, description: 'Number of bars averaged' },
    ],
  },
  defaultOptions: { length: 20 },
  calculate(bars, options) { return adr(bars, options.length); },
};

indicatorRegistry.register(ADR_DEF);
