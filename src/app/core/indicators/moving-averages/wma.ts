import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

export function wma(bars: BarInput[], period: number): (number | null)[] {
  const result: (number | null)[] = new Array(bars.length).fill(null);
  if (bars.length < period) return result;
  const denominator = (period * (period + 1)) / 2;
  for (let i = period - 1; i < bars.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += bars[i - period + 1 + j].close * (j + 1);
    }
    result[i] = sum / denominator;
  }
  return result;
}

const WMA_DEF: IndicatorDef<{ period: number }, number | null> = {
  meta: {
    id: 'wma',
    name: 'Weighted Moving Average',
    shortName: 'WMA',
    category: 'moving-averages',
    overlay: true,
    description:
      'Assigns linearly increasing weights to each bar in the lookback window, giving the most recent price the highest weight. Reacts faster than SMA without the exponential bias of EMA.',
    params: [
      {
        key: 'period',
        label: 'Period',
        type: 'number',
        defaultValue: 14,
        min: 2,
        max: 500,
        description: 'Number of bars to include in the average',
      },
    ],
  },
  defaultOptions: { period: 14 },
  calculate(bars, options) {
    return wma(bars, options.period);
  },
};
indicatorRegistry.register(WMA_DEF);
