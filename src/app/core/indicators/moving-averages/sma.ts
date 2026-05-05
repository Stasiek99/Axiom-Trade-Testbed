import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

export function sma(bars: BarInput[], period: number): (number | null)[] {
  const result: (number | null)[] = new Array(bars.length).fill(null);
  for (let i = period - 1; i < bars.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += bars[j].close;
    }
    result[i] = sum / period;
  }
  return result;
}

const SMA_DEF: IndicatorDef<{ period: number }, number | null> = {
  meta: {
    id: 'sma',
    name: 'Simple Moving Average',
    shortName: 'SMA',
    category: 'moving-averages',
    overlay: true,
    description:
      'Smooths price data by computing the arithmetic mean over a lookback period. Used to identify trend direction and filter noise. The larger the period, the smoother and slower the line.',
    params: [
      {
        key: 'period',
        label: 'Period',
        type: 'number',
        defaultValue: 20,
        min: 2,
        max: 500,
        description: 'Number of bars to include in the average',
      },
    ],
  },
  defaultOptions: { period: 20 },
  calculate(bars: BarInput[], options: { period: number }): (number | null)[] {
    return sma(bars, options.period);
  },
};

indicatorRegistry.register(SMA_DEF);
