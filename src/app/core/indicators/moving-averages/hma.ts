import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

function wmaOfDense(values: number[], period: number): number[] {
  const result: number[] = new Array(values.length).fill(NaN);
  if (values.length < period) return result;
  const denom = (period * (period + 1)) / 2;
  for (let i = period - 1; i < values.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) sum += values[i - period + 1 + j] * (j + 1);
    result[i] = sum / denom;
  }
  return result;
}

function wmaLocal(bars: BarInput[], period: number): (number | null)[] {
  const result: (number | null)[] = new Array(bars.length).fill(null);
  if (bars.length < period) return result;
  const denom = (period * (period + 1)) / 2;
  for (let i = period - 1; i < bars.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) sum += bars[i - period + 1 + j].close * (j + 1);
    result[i] = sum / denom;
  }
  return result;
}

export function hma(bars: BarInput[], period: number): (number | null)[] {
  const result: (number | null)[] = new Array(bars.length).fill(null);
  if (bars.length < period) return result;
  const half = Math.floor(period / 2);
  const sqrtPeriod = Math.floor(Math.sqrt(period));
  const wma1 = wmaLocal(bars, half);
  const wma2 = wmaLocal(bars, period);
  const rawValues: number[] = new Array(bars.length).fill(NaN);
  for (let i = period - 1; i < bars.length; i++) {
    if (wma1[i] !== null && wma2[i] !== null) {
      rawValues[i] = 2 * (wma1[i] as number) - (wma2[i] as number);
    }
  }
  const rawStart = period - 1;
  const rawDense = rawValues.slice(rawStart);
  const wmaFinal = wmaOfDense(rawDense, sqrtPeriod);
  const hmaStart = rawStart + sqrtPeriod - 1;
  for (let i = hmaStart; i < bars.length; i++) {
    result[i] = wmaFinal[i - rawStart];
  }
  return result;
}

const HMA_DEF: IndicatorDef<{ period: number }, number | null> = {
  meta: {
    id: 'hma',
    name: 'Hull Moving Average',
    shortName: 'HMA',
    category: 'moving-averages',
    overlay: true,
    description:
      'Combines two WMAs and a final WMA on their difference to nearly eliminate lag while keeping smoothness. Formula: WMA(2*WMA(n/2) - WMA(n), sqrt(n)).',
    params: [
      { key: 'period', label: 'Period', type: 'number', defaultValue: 16, min: 4, max: 500, description: 'Base period (half and sqrt derived automatically)' },
    ],
  },
  defaultOptions: { period: 16 },
  calculate(bars, options) { return hma(bars, options.period); },
};
indicatorRegistry.register(HMA_DEF);
