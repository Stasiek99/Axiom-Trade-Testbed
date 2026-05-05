import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

function emaOfDense(values: number[], period: number): number[] {
  const result: number[] = new Array(values.length).fill(NaN);
  if (values.length < period) return result;
  const k = 2 / (period + 1);
  let sum = 0;
  for (let j = 0; j < period; j++) sum += values[j];
  result[period - 1] = sum / period;
  for (let i = period; i < values.length; i++) {
    result[i] = values[i] * k + result[i - 1] * (1 - k);
  }
  return result;
}

export function dema(bars: BarInput[], period: number): (number | null)[] {
  const result: (number | null)[] = new Array(bars.length).fill(null);
  if (bars.length < period) return result;
  const k = 2 / (period + 1);
  let sum = 0;
  for (let j = 0; j < period; j++) sum += bars[j].close;
  const e1: (number | null)[] = new Array(bars.length).fill(null);
  e1[period - 1] = sum / period;
  for (let i = period; i < bars.length; i++) {
    e1[i] = bars[i].close * k + (e1[i - 1] as number) * (1 - k);
  }
  const e1Dense: number[] = [];
  for (let i = period - 1; i < bars.length; i++) e1Dense.push(e1[i] as number);
  const e2Dense = emaOfDense(e1Dense, period);
  const demaStart = 2 * (period - 1);
  for (let i = demaStart; i < bars.length; i++) {
    const denseIdx = i - (period - 1);
    if (!isNaN(e2Dense[denseIdx])) result[i] = 2 * (e1[i] as number) - e2Dense[denseIdx];
  }
  return result;
}

const DEMA_DEF: IndicatorDef<{ period: number }, number | null> = {
  meta: {
    id: 'dema',
    name: 'Double Exponential Moving Average',
    shortName: 'DEMA',
    category: 'moving-averages',
    overlay: true,
    description:
      'Applies EMA twice to reduce lag significantly versus a single EMA. DEMA = 2*EMA - EMA(EMA). Tracks price more closely during trending markets.',
    params: [
      { key: 'period', label: 'Period', type: 'number', defaultValue: 21, min: 2, max: 500, description: 'Lookback period for both EMA passes' },
    ],
  },
  defaultOptions: { period: 21 },
  calculate(bars, options) { return dema(bars, options.period); },
};
indicatorRegistry.register(DEMA_DEF);
