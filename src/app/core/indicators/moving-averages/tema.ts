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

export function tema(bars: BarInput[], period: number): (number | null)[] {
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
  const e3Input: number[] = [];
  for (let i = period - 1; i < e2Dense.length; i++) {
    if (!isNaN(e2Dense[i])) e3Input.push(e2Dense[i]);
  }
  const e3Dense = emaOfDense(e3Input, period);
  const temaStart = 3 * (period - 1);
  for (let i = temaStart; i < bars.length; i++) {
    const e2Idx = i - (period - 1);
    const e3Idx = e2Idx - (period - 1);
    if (!isNaN(e2Dense[e2Idx]) && !isNaN(e3Dense[e3Idx])) {
      result[i] = 3 * (e1[i] as number) - 3 * e2Dense[e2Idx] + e3Dense[e3Idx];
    }
  }
  return result;
}

const TEMA_DEF: IndicatorDef<{ period: number }, number | null> = {
  meta: {
    id: 'tema',
    name: 'Triple Exponential Moving Average',
    shortName: 'TEMA',
    category: 'moving-averages',
    overlay: true,
    description:
      'Applies EMA three times for minimal lag: TEMA = 3*EMA - 3*EMA(EMA) + EMA(EMA(EMA)). Best used in strongly trending markets; highly sensitive to reversals.',
    params: [
      { key: 'period', label: 'Period', type: 'number', defaultValue: 21, min: 2, max: 500, description: 'Lookback period for all three EMA passes' },
    ],
  },
  defaultOptions: { period: 21 },
  calculate(bars, options) { return tema(bars, options.period); },
};
indicatorRegistry.register(TEMA_DEF);
