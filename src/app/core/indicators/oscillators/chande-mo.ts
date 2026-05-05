import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

export function chandeMO(bars: BarInput[], period: number): (number | null)[] {
  const n = bars.length;
  const result: (number | null)[] = new Array(n).fill(null);
  if (n < period + 1) return result;

  for (let i = period; i < n; i++) {
    let sumUp = 0;
    let sumDown = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const ch = bars[j].close - bars[j - 1].close;
      if (ch > 0) sumUp += ch;
      else sumDown -= ch;
    }
    const total = sumUp + sumDown;
    result[i] = total === 0 ? 0 : 100 * (sumUp - sumDown) / total;
  }
  return result;
}

const DEF: IndicatorDef<{ period: number }, number | null> = {
  meta: {
    id: 'chande-mo',
    name: 'Chande Momentum Oscillator',
    shortName: 'CMO',
    category: 'oscillators',
    overlay: false,
    description:
      'A momentum oscillator that measures the ratio of upward to downward price changes over a period. Values range from -100 to +100. Unlike RSI, it uses absolute price differences instead of averages.',
    params: [
      { key: 'period', label: 'Period', type: 'number', defaultValue: 9, min: 2, max: 100, description: 'Lookback period' },
    ],
  },
  defaultOptions: { period: 9 },
  calculate(bars, options) {
    return chandeMO(bars, options.period);
  },
};

indicatorRegistry.register(DEF);
export { DEF as chandeMODef };
