import type { BarInput, IndicatorDef, ThreeBandPoint } from '../types';
import { indicatorRegistry } from '../registry';

export function bollingerBands(
  bars: BarInput[],
  length: number,
  mult: number,
): (ThreeBandPoint | null)[] {
  const result: (ThreeBandPoint | null)[] = new Array(bars.length).fill(null);
  if (bars.length < length) return result;

  for (let i = length - 1; i < bars.length; i++) {
    let sum = 0;
    for (let j = i - length + 1; j <= i; j++) sum += bars[j].close;
    const mean = sum / length;

    let sumSq = 0;
    for (let j = i - length + 1; j <= i; j++) {
      const diff = bars[j].close - mean;
      sumSq += diff * diff;
    }
    const stdDev = Math.sqrt(sumSq / length);

    result[i] = {
      upper: mean + mult * stdDev,
      middle: mean,
      lower: mean - mult * stdDev,
    };
  }

  return result;
}

const BOLLINGERBANDS_DEF: IndicatorDef<{ length: number; mult: number }, ThreeBandPoint | null> = {
  meta: {
    id: 'bollinger-bands',
    name: 'Bollinger Bands',
    shortName: 'BB',
    category: 'channels-bands',
    overlay: true,
    description:
      'Volatility bands placed above and below a simple moving average. The band width expands and contracts based on standard deviation. Prices touching the upper band suggest overbought conditions; the lower band suggests oversold.',
    params: [
      { key: 'length', label: 'Length', type: 'number', defaultValue: 20, min: 2, max: 200, description: 'SMA period' },
      { key: 'mult', label: 'Multiplier', type: 'number', defaultValue: 2, min: 0.5, max: 5, step: 0.1, description: 'Standard deviation multiplier' },
    ],
  },
  defaultOptions: { length: 20, mult: 2 },
  calculate(bars, options) { return bollingerBands(bars, options.length, options.mult); },
};

indicatorRegistry.register(BOLLINGERBANDS_DEF);
