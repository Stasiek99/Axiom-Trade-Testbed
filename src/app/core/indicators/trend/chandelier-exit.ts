import type { BarInput, IndicatorDef, ChandelierPoint } from '../types';
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

export function chandelierExit(
  bars: BarInput[],
  period: number,
  atrMultiplier: number,
): (ChandelierPoint | null)[] {
  const result: (ChandelierPoint | null)[] = new Array(bars.length).fill(null);
  if (bars.length < period + 1) return result;

  const highs = bars.map(b => b.high);
  const lows = bars.map(b => b.low);
  const atrValues = atr(bars, period);

  for (let i = period; i < bars.length; i++) {
    const hh = highest(highs, i, period);
    const ll = lowest(lows, i, period);

    result[i] = {
      longStop: hh - atrMultiplier * atrValues[i],
      shortStop: ll + atrMultiplier * atrValues[i],
    };
  }

  return result;
}

const CHANDELIER_DEF: IndicatorDef<{ period: number; atrMultiplier: number }, ChandelierPoint | null> = {
  meta: {
    id: 'chandelier-exit',
    name: 'Chandelier Exit',
    shortName: 'ChExit',
    category: 'trend',
    overlay: true,
    description:
      'ATR-based trailing stop that sets stops at a multiple of ATR from the highest high (long) or lowest low (short) over the lookback period. Designed to let profits run while protecting against reversals.',
    params: [
      {
        key: 'period',
        label: 'Period',
        type: 'number',
        defaultValue: 22,
        min: 2,
        max: 200,
        description: 'Lookback period for highs/lows and ATR',
      },
      {
        key: 'atrMultiplier',
        label: 'ATR Multiplier',
        type: 'number',
        defaultValue: 3,
        min: 0.5,
        max: 10,
        step: 0.1,
        description: 'Multiplier for ATR',
      },
    ],
  },
  defaultOptions: { period: 22, atrMultiplier: 3 },
  calculate(
    bars: BarInput[],
    options: { period: number; atrMultiplier: number },
  ): (ChandelierPoint | null)[] {
    return chandelierExit(bars, options.period, options.atrMultiplier);
  },
};

indicatorRegistry.register(CHANDELIER_DEF);