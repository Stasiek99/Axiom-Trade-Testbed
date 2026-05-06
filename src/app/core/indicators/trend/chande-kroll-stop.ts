import type { BarInput, IndicatorDef, ChandeKrollPoint } from '../types';
import { indicatorRegistry } from '../registry';

function highest(values: number[], from: number, length: number): number {
  let max = -Infinity;
  const end = Math.min(from + 1, values.length);
  for (let i = end - length; i < end; i++) {
    if (i >= 0 && values[i] > max) max = values[i];
  }
  return max;
}

function lowest(values: number[], from: number, length: number): number {
  let min = Infinity;
  const end = Math.min(from + 1, values.length);
  for (let i = end - length; i < end; i++) {
    if (i >= 0 && values[i] < min) min = values[i];
  }
  return min;
}

function atr(bars: BarInput[], period: number): number[] {
  const result: number[] = new Array(bars.length).fill(0);
  if (bars.length < period + 1) return result;
  let sum = 0;
  for (let i = 1; i <= period; i++) {
    sum += Math.max(
      bars[i].high - bars[i].low,
      Math.abs(bars[i].high - bars[i - 1].close),
      Math.abs(bars[i].low - bars[i - 1].close),
    );
  }
  result[period] = sum / period;
  for (let i = period + 1; i < bars.length; i++) {
    const tr = Math.max(
      bars[i].high - bars[i].low,
      Math.abs(bars[i].high - bars[i - 1].close),
      Math.abs(bars[i].low - bars[i - 1].close),
    );
    result[i] = (result[i - 1] * (period - 1) + tr) / period;
  }
  return result;
}

export function chandeKrollStop(
  bars: BarInput[],
  p: number,
  q: number,
  x: number,
): (ChandeKrollPoint | null)[] {
  const result: (ChandeKrollPoint | null)[] = new Array(bars.length).fill(null);
  if (bars.length < p + q) return result;

  const highs = bars.map(b => b.high);
  const lows = bars.map(b => b.low);
  const atrValues = atr(bars, q);

  for (let i = p + q - 1; i < bars.length; i++) {
    const hh = highest(highs, i, p);
    const ll = lowest(lows, i, p);
    const avgAtr = atrValues.slice(i - q + 1, i + 1).reduce((a, b) => a + b, 0) / q;

    result[i] = {
      shortStop: hh - x * avgAtr,
      longStop: ll + x * avgAtr,
    };
  }

  return result;
}

const CHANDE_DEF: IndicatorDef<{ p: number; q: number; x: number }, ChandeKrollPoint | null> = {
  meta: {
    id: 'chande-kroll-stop',
    name: 'Chande Kroll Stop',
    shortName: 'CK Stop',
    category: 'trend',
    overlay: true,
    description:
      'ATR-based trailing stop system. The long stop is placed below price, the short stop above. A buy signal occurs when price crosses above the short stop; a sell signal when it crosses below the long stop.',
    params: [
      {
        key: 'p',
        label: 'Lookback Period',
        type: 'number',
        defaultValue: 10,
        min: 2,
        max: 100,
        description: 'High/low lookback period',
      },
      {
        key: 'q',
        label: 'ATR Period',
        type: 'number',
        defaultValue: 15,
        min: 2,
        max: 100,
        description: 'ATR calculation period',
      },
      {
        key: 'x',
        label: 'ATR Multiplier',
        type: 'number',
        defaultValue: 1,
        min: 0.1,
        max: 10,
        step: 0.1,
        description: 'ATR multiplier',
      },
    ],
  },
  defaultOptions: { p: 10, q: 15, x: 1 },
  calculate(bars: BarInput[], options: { p: number; q: number; x: number }): (ChandeKrollPoint | null)[] {
    return chandeKrollStop(bars, options.p, options.q, options.x);
  },
};

indicatorRegistry.register(CHANDE_DEF);