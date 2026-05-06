import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

function typicalPrice(b: BarInput): number {
  return (b.high + b.low + b.close) / 3;
}

export function cci(bars: BarInput[], period: number): (number | null)[] {
  const n = bars.length;
  const result: (number | null)[] = new Array(n).fill(null);
  if (n < period) return result;

  const tp = bars.map(typicalPrice);
  const smaTp: number[] = [];

  for (let i = 0; i < n; i++) {
    if (i < period - 1) { smaTp.push(0); continue; }
    let s = 0;
    for (let j = i - period + 1; j <= i; j++) s += tp[j];
    smaTp.push(s / period);

    let md = 0;
    const mean = smaTp[i];
    for (let j = i - period + 1; j <= i; j++) md += Math.abs(tp[j] - mean);
    md /= period;

    result[i] = md === 0 ? 0 : (tp[i] - mean) / (0.015 * md);
  }
  return result;
}

const DEF: IndicatorDef<{ period: number }, number | null> = {
  meta: {
    id: 'cci',
    name: 'Commodity Channel Index',
    shortName: 'CCI',
    category: 'oscillators',
    overlay: false,
    description:
      'Measures the deviation of typical price from its statistical mean. Readings above +100 indicate overbought; below -100 indicate oversold. Useful for identifying cyclical trends.',
    params: [
      { key: 'period', label: 'Period', type: 'number', defaultValue: 20, min: 2, max: 100, description: 'Lookback period' },
    ],
  },
  defaultOptions: { period: 20 },
  calculate(bars, options) {
    return cci(bars, options.period);
  },
};

indicatorRegistry.register(DEF);
export { DEF as cciDef };
