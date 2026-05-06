import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

export function bbBandWidth(bars: BarInput[], length: number, mult: number): (number | null)[] {
  const result: (number | null)[] = new Array(bars.length).fill(null);
  if (bars.length < length) return result;

  for (let i = length - 1; i < bars.length; i++) {
    // SMA
    let sum = 0;
    for (let j = i - length + 1; j <= i; j++) sum += bars[j].close;
    const mean = sum / length;

    // Standard deviation
    let sumSq = 0;
    for (let j = i - length + 1; j <= i; j++) {
      const diff = bars[j].close - mean;
      sumSq += diff * diff;
    }
    const stdDev = Math.sqrt(sumSq / length);

    const upper = mean + mult * stdDev;
    const lower = mean - mult * stdDev;

    // (upper − lower) / middle × 100 — express as percentage
    result[i] = ((upper - lower) / mean) * 100;
  }

  return result;
}

const BBBANDWIDTH_DEF: IndicatorDef<{ length: number; mult: number }, number | null> = {
  meta: {
    id: 'bb-bandwidth',
    name: 'Bollinger Bandwidth',
    shortName: 'BBWidth',
    category: 'volatility',
    overlay: false,
    description:
      'Shows the percentage width of Bollinger Bands: (upper − lower) / middle × 100. Narrows during low volatility (potential breakout), widens during high volatility (potential reversal).',
    params: [
      { key: 'length', label: 'Length', type: 'number', defaultValue: 20, min: 2, max: 200, description: 'SMA period' },
      { key: 'mult', label: 'Multiplier', type: 'number', defaultValue: 2, min: 0.5, max: 5, step: 0.1, description: 'Standard deviation multiplier' },
    ],
  },
  defaultOptions: { length: 20, mult: 2 },
  calculate(bars, options) { return bbBandWidth(bars, options.length, options.mult); },
};

indicatorRegistry.register(BBBANDWIDTH_DEF);
