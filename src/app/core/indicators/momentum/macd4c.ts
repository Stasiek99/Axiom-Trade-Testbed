import type { BarInput, IndicatorDef, MACD4CPoint } from '../types';
import { indicatorRegistry } from '../registry';

function ema(values: number[], period: number): (number | null)[] {
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
 * MACD 4-Colour Histogram.
 *
 * Standard MACD line and signal, but the histogram is colour-coded into
 * four categories based on the momentum trend:
 *
 *   color = 2   green   — histogram rising and positive (strong bull)
 *   color = 1   lime    — histogram falling but positive (weak bull)
 *   color = -1  orange  — histogram rising but negative (weak bear)
 *   color = -2  red     — histogram falling and negative (strong bear)
 */
export function macd4c(
  bars: BarInput[],
  fastLength: number,
  slowLength: number,
  signalLength: number,
): (MACD4CPoint | null)[] {
  const closes = bars.map(b => b.close);
  const fastEMA = ema(closes, fastLength);
  const slowEMA = ema(closes, slowLength);

  const macdLine: (number | null)[] = new Array(bars.length).fill(null);
  for (let i = 0; i < bars.length; i++) {
    const f = fastEMA[i];
    const s = slowEMA[i];
    if (f !== null && s !== null) macdLine[i] = f - s;
  }

  const signalLine = emaOfValues(macdLine, signalLength);

  return bars.map((_, i) => {
    const m = macdLine[i];
    const s = signalLine[i];
    if (m === null || s === null) return null;

    const histogram = m - s;
    const prevHist = i > 0 ? macdLine[i - 1] !== null && signalLine[i - 1] !== null
      ? (macdLine[i - 1] as number) - (signalLine[i - 1] as number)
      : null : null;

    let color: -2 | -1 | 1 | 2;
    if (histogram >= 0) {
      color = prevHist !== null && histogram >= prevHist ? 2 : 1;
    } else {
      color = prevHist !== null && histogram <= prevHist ? -2 : -1;
    }

    return { macd: m, signal: s, histogram, color };
  });
}

const MACD4C_DEF: IndicatorDef<
  { fastLength: number; slowLength: number; signalLength: number },
  MACD4CPoint | null
> = {
  meta: {
    id: 'macd4c',
    name: 'MACD 4-Colour Histogram',
    shortName: 'MACD4C',
    category: 'momentum',
    overlay: false,
    description:
      'Standard MACD with a colour-coded histogram. Green = rising & positive (strong bull), lime = falling & positive, orange = rising & negative, red = falling & negative (strong bear). Helps visualise momentum changes at a glance.',
    params: [
      {
        key: 'fastLength',
        label: 'Fast Period',
        type: 'number',
        defaultValue: 12,
        min: 2,
        max: 100,
        description: 'Period for the fast EMA',
      },
      {
        key: 'slowLength',
        label: 'Slow Period',
        type: 'number',
        defaultValue: 26,
        min: 2,
        max: 200,
        description: 'Period for the slow EMA',
      },
      {
        key: 'signalLength',
        label: 'Signal Period',
        type: 'number',
        defaultValue: 9,
        min: 2,
        max: 50,
        description: 'Period for the signal line EMA',
      },
    ],
  },
  defaultOptions: { fastLength: 12, slowLength: 26, signalLength: 9 },
  calculate(bars, options) {
    return macd4c(bars, options.fastLength, options.slowLength, options.signalLength);
  },
};

indicatorRegistry.register(MACD4C_DEF);
