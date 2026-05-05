import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

function calcLSMA(bars: BarInput[], period: number): (number | null)[] {
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
    result[i] = slope * (period - 1) + intercept;
  }
  return result;
}

export function zlsma(bars: BarInput[], period: number): (number | null)[] {
  const result: (number | null)[] = new Array(bars.length).fill(null);
  const lsmaVals = calcLSMA(bars, period);
  const lag = Math.floor((period - 1) / 2);
  const firstValid = period - 1 + lag;
  for (let i = firstValid; i < bars.length; i++) {
    result[i] = 2 * (lsmaVals[i] as number) - (lsmaVals[i - lag] as number);
  }
  return result;
}

const ZLSMA_DEF: IndicatorDef<{ period: number }, number | null> = {
  meta: {
    id: 'zlsma',
    name: 'Zero Lag LSMA',
    shortName: 'ZLSMA',
    category: 'moving-averages',
    overlay: true,
    description:
      'LSMA with zero-lag correction: doubles the current LSMA and subtracts the LSMA from lag bars ago. Significantly reduces the delay of linear regression lines in fast-moving markets.',
    params: [
      { key: 'period', label: 'Period', type: 'number', defaultValue: 25, min: 2, max: 500, description: 'Regression window length' },
    ],
  },
  defaultOptions: { period: 25 },
  calculate(bars, options) { return zlsma(bars, options.period); },
};
indicatorRegistry.register(ZLSMA_DEF);
