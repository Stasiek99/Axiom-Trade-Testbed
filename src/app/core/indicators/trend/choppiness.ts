import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

function highest(values: number[], from: number, length: number): number {
  let max = -Infinity;
  for (let i = from - length + 1; i <= from; i++) {
    if (i >= 0 && i < values.length && values[i] > max) max = values[i];
  }
  return max;
}

function lowest(values: number[], from: number, length: number): number {
  let min = Infinity;
  for (let i = from - length + 1; i <= from; i++) {
    if (i >= 0 && i < values.length && values[i] < min) min = values[i];
  }
  return min;
}

function trueRange(bars: BarInput[], i: number): number {
  if (i === 0) return bars[i].high - bars[i].low;
  return Math.max(
    bars[i].high - bars[i].low,
    Math.abs(bars[i].high - bars[i - 1].close),
    Math.abs(bars[i].low - bars[i - 1].close),
  );
}

export function choppiness(bars: BarInput[], length: number): (number | null)[] {
  const result: (number | null)[] = new Array(bars.length).fill(null);
  if (bars.length < length + 1) return result;

  const highs = bars.map(b => b.high);
  const lows = bars.map(b => b.low);

  for (let i = length; i < bars.length; i++) {
    let sumTR = 0;
    for (let j = i - length + 1; j <= i; j++) {
      sumTR += trueRange(bars, j);
    }

    const hh = highest(highs, i, length);
    const ll = lowest(lows, i, length);
    const range = hh - ll;

    result[i] =
      range !== 0
        ? (100 * Math.log10(sumTR / range)) / Math.log10(length)
        : 0;
  }

  return result;
}

const CHOP_DEF: IndicatorDef<{ length: number }, number | null> = {
  meta: {
    id: 'choppiness',
    name: 'Choppiness Index',
    shortName: 'CHOP',
    category: 'trend',
    overlay: false,
    description:
      'Measures whether the market is trending or ranging on a scale of 0–100. Values above 61.8 indicate choppy/range-bound conditions; below 38.2 indicate a strong trend.',
    params: [
      {
        key: 'length',
        label: 'Period',
        type: 'number',
        defaultValue: 14,
        min: 2,
        max: 100,
        description: 'Number of bars for calculation',
      },
    ],
  },
  defaultOptions: { length: 14 },
  calculate(bars: BarInput[], options: { length: number }): (number | null)[] {
    return choppiness(bars, options.length);
  },
};

indicatorRegistry.register(CHOP_DEF);
