import type { BarInput, IndicatorDef, MedianPoint } from '../types';
import { indicatorRegistry } from '../registry';

/**
 * Calculate the median of a sorted array. Assumes input is pre-sorted.
 */
function medianOfSorted(vals: number[]): number {
  const half = Math.floor(vals.length / 2);
  return vals.length % 2 === 1
    ? vals[half]
    : (vals[half - 1] + vals[half]) / 2;
}

export function calcMedian(
  bars: BarInput[],
  length: number,
  atrLength: number,
  atrMult: number,
): (MedianPoint | null)[] {
  const result: (MedianPoint | null)[] = new Array(bars.length).fill(null);
  if (bars.length < Math.max(length, atrLength + 1)) return result;

  // Median price per bar: (high + low) / 2
  const midPrices = bars.map(b => (b.high + b.low) / 2);

  // Rolling median of midPrices over `length` bars
  const medianVals: (number | null)[] = new Array(bars.length).fill(null);
  for (let i = length - 1; i < bars.length; i++) {
    const window = midPrices.slice(i - length + 1, i + 1).sort((a, b) => a - b);
    medianVals[i] = medianOfSorted(window);
  }

  // ATR (Wilder's smoothing)
  const atr: (number | null)[] = new Array(bars.length).fill(null);
  {
    const tr: number[] = new Array(bars.length);
    for (let i = 1; i < bars.length; i++) {
      tr[i] = Math.max(
        bars[i].high - bars[i].low,
        Math.abs(bars[i].high - bars[i - 1].close),
        Math.abs(bars[i].low - bars[i - 1].close),
      );
    }
    let sumTr = 0;
    for (let j = 1; j <= atrLength; j++) sumTr += tr[j];
    atr[atrLength] = sumTr / atrLength;
    const r = 1 / atrLength;
    for (let i = atrLength + 1; i < bars.length; i++) {
      atr[i] = tr[i] * r + (atr[i - 1] as number) * (1 - r);
    }
  }

  // EMA of midPrices for median EMA
  const emaK = 2 / (atrLength + 1);
  const ema: (number | null)[] = new Array(bars.length).fill(null);
  {
    let sum = 0;
    for (let j = 0; j < atrLength; j++) sum += midPrices[j];
    ema[atrLength - 1] = sum / atrLength;
    for (let i = atrLength; i < bars.length; i++) {
      ema[i] = midPrices[i] * emaK + (ema[i - 1] as number) * (1 - emaK);
    }
  }

  for (let i = 0; i < bars.length; i++) {
    if (medianVals[i] !== null && atr[i] !== null && ema[i] !== null) {
      const m = medianVals[i] as number;
      const a = atr[i] as number;
      result[i] = {
        median: m,
        upper: m + atrMult * a,
        lower: m - atrMult * a,
        ema: ema[i] as number,
      };
    }
  }

  return result;
}

const MEDIAN_DEF: IndicatorDef<{ length: number; atrLength: number; atrMult: number }, MedianPoint | null> = {
  meta: {
    id: 'median',
    name: 'Median',
    shortName: 'Median',
    category: 'channels-bands',
    overlay: true,
    description:
      'Rolling median of the midpoint price (H+L)/2 with ATR-based volatility bands and an EMA overlay. The thick centreline smooths price noise via median filtering, while bands expand and contract with ATR.',
    params: [
      { key: 'length', label: 'Median Length', type: 'number', defaultValue: 3, min: 2, max: 100, description: 'Rolling median window' },
      { key: 'atrLength', label: 'ATR Length', type: 'number', defaultValue: 14, min: 2, max: 200, description: 'ATR period for bands' },
      { key: 'atrMult', label: 'ATR Multiplier', type: 'number', defaultValue: 2, min: 0.5, max: 5, step: 0.1, description: 'ATR multiplier for band width' },
    ],
  },
  defaultOptions: { length: 3, atrLength: 14, atrMult: 2 },
  calculate(bars, options) { return calcMedian(bars, options.length, options.atrLength, options.atrMult); },
};

indicatorRegistry.register(MEDIAN_DEF);
