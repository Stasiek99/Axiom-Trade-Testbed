import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

export function standardDeviation(
  bars: BarInput[],
  length: number,
  src: 'close' | 'high' | 'low' | 'open' = 'close',
): (number | null)[] {
  const result: (number | null)[] = new Array(bars.length).fill(null);
  if (bars.length < length) return result;

  for (let i = length - 1; i < bars.length; i++) {
    let sum = 0;
    for (let j = i - length + 1; j <= i; j++) {
      sum += bars[j][src];
    }
    const mean = sum / length;

    let sumSq = 0;
    for (let j = i - length + 1; j <= i; j++) {
      const diff = bars[j][src] - mean;
      sumSq += diff * diff;
    }
    result[i] = Math.sqrt(sumSq / length);
  }

  return result;
}

const STDDEV_DEF: IndicatorDef<{ length: number; src: string }, number | null> = {
  meta: {
    id: 'standard-deviation',
    name: 'Standard Deviation',
    shortName: 'StdDev',
    category: 'volatility',
    overlay: false,
    description:
      'Measures the dispersion of prices around their mean over N bars. Higher values indicate higher volatility and wider price distribution.',
    params: [
      { key: 'length', label: 'Length', type: 'number', defaultValue: 20, min: 2, max: 200, description: 'Lookback period' },
      { key: 'src', label: 'Source', type: 'select', defaultValue: 'close', options: [
        { label: 'Close', value: 'close' },
        { label: 'High', value: 'high' },
        { label: 'Low', value: 'low' },
        { label: 'Open', value: 'open' },
      ], description: 'Price source' },
    ],
  },
  defaultOptions: { length: 20, src: 'close' },
  calculate(bars, options) {
    return standardDeviation(bars, options.length, options.src as 'close' | 'high' | 'low' | 'open');
  },
};

indicatorRegistry.register(STDDEV_DEF);
