import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

function stddev(values: number[], mean: number): number {
  let s = 0;
  for (const v of values) s += (v - mean) ** 2;
  return Math.sqrt(s / values.length);
}

export function bbPercentB(bars: BarInput[], period: number, mult: number): (number | null)[] {
  const n = bars.length;
  const result: (number | null)[] = new Array(n).fill(null);
  if (n < period) return result;

  for (let i = period - 1; i < n; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += bars[j].close;
    const mean = sum / period;

    const slice: number[] = [];
    for (let j = i - period + 1; j <= i; j++) slice.push(bars[j].close);
    const sd = stddev(slice, mean);

    const upper = mean + mult * sd;
    const lower = mean - mult * sd;
    const range = upper - lower;

    result[i] = range === 0 ? 0.5 : (bars[i].close - lower) / range;
  }
  return result;
}

const DEF: IndicatorDef<{ period: number; mult: number }, number | null> = {
  meta: {
    id: 'bb-percentb',
    name: 'Bollinger Band %B',
    shortName: '%B',
    category: 'oscillators',
    overlay: false,
    description:
      'Shows the position of price within Bollinger Bands as a 0–1 oscillator. Values below 0 mean price is below the lower band; above 1 means above the upper band. 0.5 is at the middle band.',
    params: [
      { key: 'period', label: 'Period', type: 'number', defaultValue: 20, min: 2, max: 100, description: 'SMA and standard deviation period' },
      { key: 'mult', label: 'Multiplier', type: 'number', defaultValue: 2, min: 0.5, max: 5, step: 0.1, description: 'Standard deviation multiplier' },
    ],
  },
  defaultOptions: { period: 20, mult: 2 },
  calculate(bars, options) {
    return bbPercentB(bars, options.period, options.mult);
  },
};

indicatorRegistry.register(DEF);
export { DEF as bbPercentBDef };
