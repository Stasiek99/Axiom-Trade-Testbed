import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

export function alma(bars: BarInput[], windowSize: number, offset: number, sigma: number): (number | null)[] {
  const result: (number | null)[] = new Array(bars.length).fill(null);
  if (bars.length < windowSize) return result;
  const m = Math.floor(offset * (windowSize - 1));
  const s = windowSize / sigma;
  const weights: number[] = new Array(windowSize);
  let weightSum = 0;
  for (let j = 0; j < windowSize; j++) {
    const w = Math.exp(-((j - m) ** 2) / (2 * s * s));
    weights[j] = w;
    weightSum += w;
  }
  for (let i = windowSize - 1; i < bars.length; i++) {
    let sum = 0;
    for (let j = 0; j < windowSize; j++) {
      sum += bars[i - windowSize + 1 + j].close * weights[j];
    }
    result[i] = sum / weightSum;
  }
  return result;
}

const ALMA_DEF: IndicatorDef<{ windowSize: number; offset: number; sigma: number }, number | null> = {
  meta: {
    id: 'alma',
    name: 'Arnaud Legoux Moving Average',
    shortName: 'ALMA',
    category: 'moving-averages',
    overlay: true,
    description:
      'Applies a Gaussian-shaped weighting curve over a sliding window. The offset and sigma parameters let you tune the tradeoff between lag (smooth) and responsiveness (sharp).',
    params: [
      { key: 'windowSize', label: 'Window Size', type: 'number', defaultValue: 21, min: 2, max: 500, description: 'Number of bars in the window' },
      { key: 'offset', label: 'Offset', type: 'number', defaultValue: 0.85, min: 0, max: 1, step: 0.01, description: 'Gaussian center offset (0=left/smooth, 1=right/responsive)' },
      { key: 'sigma', label: 'Sigma', type: 'number', defaultValue: 6, min: 1, max: 50, step: 0.5, description: 'Gaussian standard deviation; lower = sharper peak = more responsive' },
    ],
  },
  defaultOptions: { windowSize: 21, offset: 0.85, sigma: 6 },
  calculate(bars, options) { return alma(bars, options.windowSize, options.offset, options.sigma); },
};
indicatorRegistry.register(ALMA_DEF);
