import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

export function lsma(bars: BarInput[], period: number, offset: number): (number | null)[] {
  const result: (number | null)[] = new Array(bars.length).fill(null);
  if (bars.length < period) return result;
  const n = period;
  const sumX = (n * (n - 1)) / 2;
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
  const denom = n * sumX2 - sumX * sumX;
  for (let i = period - 1; i < bars.length; i++) {
    let sumY = 0;
    let sumXY = 0;
    for (let j = 0; j < n; j++) {
      const c = bars[i - period + 1 + j].close;
      sumY += c;
      sumXY += j * c;
    }
    const slope = (n * sumXY - sumX * sumY) / denom;
    const intercept = (sumY - slope * sumX) / n;
    result[i] = slope * (period - 1 + offset) + intercept;
  }
  return result;
}

const LSMA_DEF: IndicatorDef<{ period: number; offset: number }, number | null> = {
  meta: {
    id: 'lsma',
    name: 'Least Squares Moving Average',
    shortName: 'LSMA',
    category: 'moving-averages',
    overlay: true,
    description:
      'Fits a linear regression line to the last N closes and returns its value at the endpoint. Tracks trend with less whipsaw than EMA; the offset shifts the projected endpoint forward or backward.',
    params: [
      { key: 'period', label: 'Period', type: 'number', defaultValue: 25, min: 2, max: 500, description: 'Regression window length' },
      { key: 'offset', label: 'Offset', type: 'number', defaultValue: 0, min: -100, max: 100, step: 1, description: 'Bar offset applied to the endpoint (negative = project backward)' },
    ],
  },
  defaultOptions: { period: 25, offset: 0 },
  calculate(bars, options) { return lsma(bars, options.period, options.offset); },
};
indicatorRegistry.register(LSMA_DEF);
