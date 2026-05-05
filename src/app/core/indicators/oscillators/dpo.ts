import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

export function dpo(bars: BarInput[], period: number): (number | null)[] {
  const n = bars.length;
  const result: (number | null)[] = new Array(n).fill(null);
  if (n < period) return result;

  const closes = bars.map(b => b.close);
  const sma: (number | null)[] = new Array(period - 1).fill(null);

  let sum = 0;
  for (let i = 0; i < period - 1; i++) sum += closes[i];
  for (let i = period - 1; i < n; i++) {
    sum += closes[i];
    sma.push(sum / period);
    sum -= closes[i - period + 1];
  }

  const shift = Math.floor(period / 2) + 1;
  for (let i = period - 1 + shift; i < n; i++) {
    result[i] = closes[i] - sma[i - shift]!;
  }
  return result;
}

const DEF: IndicatorDef<{ period: number }, number | null> = {
  meta: {
    id: 'dpo',
    name: 'Detrended Price Oscillator',
    shortName: 'DPO',
    category: 'oscillators',
    overlay: false,
    description:
      'Removes the trend from price by subtracting an SMA shifted backward by period/2+1. Crossing above/below zero signals short-term momentum shifts. Useful for identifying cycles.',
    params: [
      { key: 'period', label: 'Period', type: 'number', defaultValue: 21, min: 3, max: 100, description: 'SMA period for detrending' },
    ],
  },
  defaultOptions: { period: 21 },
  calculate(bars, options) {
    return dpo(bars, options.period);
  },
};

indicatorRegistry.register(DEF);
export { DEF as dpoDef };
