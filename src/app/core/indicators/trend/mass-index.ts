import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

function ema(values: number[], period: number): number[] {
  const result: number[] = new Array(values.length).fill(0);
  if (values.length < period) return result;
  const k = 2 / (period + 1);
  let sum = 0;
  for (let j = 0; j < period; j++) sum += values[j];
  result[period - 1] = sum / period;
  for (let i = period; i < values.length; i++) {
    result[i] = values[i] * k + result[i - 1] * (1 - k);
  }
  return result;
}

function trueRange(bars: BarInput[], i: number): number {
  if (i === 0) return bars[i].high - bars[i].low;
  return Math.max(
    bars[i].high - bars[i].low,
    Math.abs(bars[i].high - bars[i - 1].close),
    Math.abs(bars[i].low - bars[i - 1].close),
  );
}

export function massIndex(bars: BarInput[], fastLength: number, slowLength: number): (number | null)[] {
  const result: (number | null)[] = new Array(bars.length).fill(null);
  if (bars.length < slowLength + 1) return result;

  const highLowDiffs: number[] = new Array(bars.length).fill(0);
  for (let i = 0; i < bars.length; i++) {
    const tr = trueRange(bars, i);
    const hl = bars[i].high - bars[i].low;
    highLowDiffs[i] = hl !== 0 ? tr / hl : 1;
  }

  const fastEMA = ema(highLowDiffs, fastLength);
  const slowEMA = ema(fastEMA, slowLength);

  for (let i = slowLength + fastLength - 2; i < bars.length; i++) {
    let sum = 0;
    for (let j = i - slowLength + 1; j <= i; j++) {
      sum += slowEMA[j];
    }
    result[i] = sum;
  }

  return result;
}

const MASS_INDEX_DEF: IndicatorDef<{ fastLength: number; slowLength: number }, number | null> = {
  meta: {
    id: 'mass-index',
    name: 'Mass Index',
    shortName: 'MassIdx',
    category: 'trend',
    overlay: false,
    description:
      'Identifies potential trend reversals by measuring the widening and narrowing of the high-low range. A reading above 27 followed by a drop below 26.5 can signal a reversal.',
    params: [
      {
        key: 'fastLength',
        label: 'Fast EMA Period',
        type: 'number',
        defaultValue: 9,
        min: 2,
        max: 50,
        description: 'Fast EMA period for the ratio',
      },
      {
        key: 'slowLength',
        label: 'Slow EMA Period',
        type: 'number',
        defaultValue: 25,
        min: 2,
        max: 100,
        description: 'Slow EMA period (summation window)',
      },
    ],
  },
  defaultOptions: { fastLength: 9, slowLength: 25 },
  calculate(bars: BarInput[], options: { fastLength: number; slowLength: number }): (number | null)[] {
    return massIndex(bars, options.fastLength, options.slowLength);
  },
};

indicatorRegistry.register(MASS_INDEX_DEF);