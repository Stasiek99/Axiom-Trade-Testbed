import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

export function williamsR(bars: BarInput[], period: number): (number | null)[] {
  const n = bars.length;
  const result: (number | null)[] = new Array(n).fill(null);
  if (n < period) return result;

  for (let i = period - 1; i < n; i++) {
    let hh = bars[i - period + 1].high;
    let ll = bars[i - period + 1].low;
    for (let j = i - period + 2; j <= i; j++) {
      if (bars[j].high > hh) hh = bars[j].high;
      if (bars[j].low < ll) ll = bars[j].low;
    }
    const rng = hh - ll;
    result[i] = rng === 0 ? -50 : ((hh - bars[i].close) / rng) * -100;
  }
  return result;
}

const DEF: IndicatorDef<{ period: number }, number | null> = {
  meta: {
    id: 'williams-r',
    name: "Williams Percent Range",
    shortName: 'Williams %R',
    category: 'oscillators',
    overlay: false,
    description:
      'A momentum indicator that shows where the close is relative to the high-low range over a period. Values range from -100 to 0. Readings below -80 indicate oversold; above -20 indicate overbought.',
    params: [
      { key: 'period', label: 'Period', type: 'number', defaultValue: 14, min: 2, max: 100, description: 'Lookback period' },
    ],
  },
  defaultOptions: { period: 14 },
  calculate(bars, options) {
    return williamsR(bars, options.period);
  },
};

indicatorRegistry.register(DEF);
export { DEF as williamsRDef };
