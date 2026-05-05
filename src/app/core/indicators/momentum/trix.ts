import type { BarInput, IndicatorDef, TRIXPoint } from '../types';
import { indicatorRegistry } from '../registry';

function ema(
  values: number[],
  period: number,
): (number | null)[] {
  const result: (number | null)[] = new Array(values.length).fill(null);
  if (values.length < period) return result;
  const k = 2 / (period + 1);
  let sum = 0;
  for (let j = 0; j < period; j++) sum += values[j];
  result[period - 1] = sum / period;
  for (let i = period; i < values.length; i++) {
    result[i] = values[i] * k + (result[i - 1] as number) * (1 - k);
  }
  return result;
}

function emaOfValues(
  values: (number | null)[],
  period: number,
): (number | null)[] {
  const result: (number | null)[] = new Array(values.length).fill(null);
  let startIdx = -1;
  for (let i = 0; i <= values.length - period; i++) {
    let allNonNull = true;
    for (let j = i; j < i + period; j++) {
      if (values[j] === null) {
        allNonNull = false;
        break;
      }
    }
    if (allNonNull) {
      startIdx = i;
      break;
    }
  }
  if (startIdx === -1) return result;
  let sum = 0;
  for (let j = startIdx; j < startIdx + period; j++)
    sum += values[j] as number;
  result[startIdx + period - 1] = sum / period;
  const k = 2 / (period + 1);
  for (let i = startIdx + period; i < values.length; i++) {
    result[i] =
      values[i] !== null
        ? (values[i] as number) * k + (result[i - 1] as number) * (1 - k)
        : null;
  }
  return result;
}

/**
 * TRIX — Triple Exponential Average (percentage rate of change).
 *
 * 1. Apply EMA three times to the closing price.
 * 2. Compute the percentage ROC of the triple EMA.
 * 3. Apply an additional EMA to produce the signal line.
 *
 * Acts as an oscillator that filters out less significant price movements.
 */
export function trix(
  bars: BarInput[],
  length: number,
  signalLength: number,
): (TRIXPoint | null)[] {
  const closes = bars.map(b => b.close);
  const ema1 = ema(closes, length);
  const ema2 = emaOfValues(ema1, length);
  const ema3 = emaOfValues(ema2, length);

  const trixLine: (number | null)[] = new Array(bars.length).fill(null);
  for (let i = 1; i < bars.length; i++) {
    const prev = ema3[i - 1];
    const curr = ema3[i];
    if (prev !== null && curr !== null && prev !== 0) {
      trixLine[i] = ((curr - prev) / prev) * 100;
    }
  }

  const signal = emaOfValues(trixLine, signalLength);

  return bars.map((_, i) => {
    const t = trixLine[i];
    const s = signal[i];
    if (t === null || s === null) return null;
    return { trix: t, signal: s };
  });
}

const TRIX_DEF: IndicatorDef<
  { length: number; signalLength: number },
  TRIXPoint | null
> = {
  meta: {
    id: 'trix',
    name: 'Triple Exponential Average',
    shortName: 'TRIX',
    category: 'momentum',
    overlay: false,
    description:
      'A momentum oscillator that applies a triple EMA smoothing to price data and shows the percentage rate of change of the result. Filters out noise and generates fewer false signals than ROC.',
    params: [
      {
        key: 'length',
        label: 'EMA Period',
        type: 'number',
        defaultValue: 18,
        min: 2,
        max: 100,
        description: 'Period for each of the three EMAs',
      },
      {
        key: 'signalLength',
        label: 'Signal EMA Period',
        type: 'number',
        defaultValue: 9,
        min: 2,
        max: 50,
        description: 'Period for the signal line EMA',
      },
    ],
  },
  defaultOptions: { length: 18, signalLength: 9 },
  calculate(bars, options) {
    return trix(bars, options.length, options.signalLength);
  },
};

indicatorRegistry.register(TRIX_DEF);
