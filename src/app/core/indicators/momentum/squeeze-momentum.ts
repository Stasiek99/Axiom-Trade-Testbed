import type { BarInput, IndicatorDef, SqueezeMomentumPoint } from '../types';
import { indicatorRegistry } from '../registry';

/**
 * Squeeze Momentum (LazyBear-style).
 *
 * Detects Bollinger Bands inside Keltner Channels — a "squeeze" indicating
 * low volatility that often precedes explosive moves.
 *
 * Momentum:
 *   — BB middle subtracted from a linear regression of close.
 *   — Positive → upward momentum, negative → downward.
 *   — The squeeze flag (true/false) indicates BB is inside KC.
 *
 * References:
 *   - LazyBear Squeeze Momentum Indicator for TradingView
 *   - Bollinger Bands and Keltner Channels
 */
export function squeezeMomentum(
  bars: BarInput[],
  length: number,
  mult: number,
  lengthKC: number,
  multKC: number,
): (SqueezeMomentumPoint | null)[] {
  const result: (SqueezeMomentumPoint | null)[] = new Array(bars.length).fill(null);
  if (bars.length < Math.max(length, lengthKC)) return result;

  // Helper EMA
  function emaVals(values: number[], period: number): (number | null)[] {
    const r: (number | null)[] = new Array(values.length).fill(null);
    if (values.length < period) return r;
    const k = 2 / (period + 1);
    let sum = 0;
    for (let j = 0; j < period; j++) sum += values[j];
    r[period - 1] = sum / period;
    for (let i = period; i < values.length; i++) {
      r[i] = values[i] * k + (r[i - 1] as number) * (1 - k);
    }
    return r;
  }

  const highs = bars.map(b => b.high);
  const lows = bars.map(b => b.low);
  const closes = bars.map(b => b.close);
  const typical = bars.map(b => (b.high + b.low + b.close) / 3);

  // BB
  const bbMiddle = emaVals(closes, length);
  // Linear regression squeeze calc
  const momentum: (number | null)[] = new Array(bars.length).fill(null);

  for (let i = length - 1; i < bars.length; i++) {
    // Linear regression slope on close
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let j = 0; j < length; j++) {
      sumX += j;
      sumY += closes[i - length + 1 + j];
      sumXY += j * closes[i - length + 1 + j];
      sumX2 += j * j;
    }
    const n = length;
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    const linReg = slope * (length - 1) + intercept;

    momentum[i] = bbMiddle[i] !== null ? closes[i] - linReg : null;
  }

  // KC — using standard deviation for upper/lower
  for (let i = lengthKC - 1; i < bars.length; i++) {
    // KC middle = EMA of typical price
    const kcMiddle = emaVals(typical.map((v, idx) => idx <= i ? v : 0), lengthKC)[i];
    if (kcMiddle === null) continue;

    // True range
    let sumTR = 0;
    for (let j = i - lengthKC + 1; j <= i; j++) {
      const tr = j > 0
        ? Math.max(highs[j] - lows[j], Math.abs(highs[j] - closes[j - 1]), Math.abs(lows[j] - closes[j - 1]))
        : highs[j] - lows[j];
      sumTR += tr;
    }
    const avgTR = sumTR / lengthKC;

    const kcUpper = kcMiddle + avgTR * multKC;
    const kcLower = kcMiddle - avgTR * multKC;

    // BB bands
    const bbMid = bbMiddle[i];
    if (bbMid === null) continue;

    let sumSq = 0;
    for (let j = i - length + 1; j <= i; j++) {
      sumSq += (closes[j] - bbMid) ** 2;
    }
    const stdDev = Math.sqrt(sumSq / length);
    const bbUpper = bbMid + stdDev * mult;
    const bbLower = bbMid - stdDev * mult;

    const squeezed = bbUpper <= kcUpper && bbLower >= kcLower;

    const m = momentum[i];
    result[i] = {
      momentum: m ?? 0,
      squeeze: squeezed,
    };
  }

  return result;
}

const SQUEEZE_MOMENTUM_DEF: IndicatorDef<
  { length: number; mult: number; lengthKC: number; multKC: number },
  SqueezeMomentumPoint | null
> = {
  meta: {
    id: 'squeeze-momentum',
    name: 'Squeeze Momentum',
    shortName: 'SqzMom',
    category: 'momentum',
    overlay: false,
    description:
      'Detects when Bollinger Bands contract within Keltner Channels, indicating a volatility squeeze. The histogram shows momentum direction; dots signal when a squeeze is active, often preceding explosive moves.',
    params: [
      {
        key: 'length',
        label: 'BB Length',
        type: 'number',
        defaultValue: 20,
        min: 5,
        max: 100,
        description: 'Period for Bollinger Bands',
      },
      {
        key: 'mult',
        label: 'BB Multiplier',
        type: 'number',
        defaultValue: 2,
        min: 0.5,
        max: 5,
        step: 0.1,
        description: 'Standard deviation multiplier for Bollinger Bands',
      },
      {
        key: 'lengthKC',
        label: 'KC Length',
        type: 'number',
        defaultValue: 20,
        min: 5,
        max: 100,
        description: 'Period for Keltner Channels',
      },
      {
        key: 'multKC',
        label: 'KC Multiplier',
        type: 'number',
        defaultValue: 1.5,
        min: 0.5,
        max: 5,
        step: 0.1,
        description: 'ATR multiplier for Keltner Channels',
      },
    ],
  },
  defaultOptions: { length: 20, mult: 2, lengthKC: 20, multKC: 1.5 },
  calculate(bars, options) {
    return squeezeMomentum(bars, options.length, options.mult, options.lengthKC, options.multKC);
  },
};

indicatorRegistry.register(SQUEEZE_MOMENTUM_DEF);
