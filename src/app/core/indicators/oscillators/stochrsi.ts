import type { BarInput, IndicatorDef, TwoLinePoint } from '../types';
import { indicatorRegistry } from '../registry';

export function rsiSeries(closes: number[], period: number): (number | null)[] {
  const n = closes.length;
  const result: (number | null)[] = new Array(n).fill(null);
  if (n < period + 1) return result;

  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const ch = closes[i] - closes[i - 1];
    if (ch > 0) avgGain += ch; else avgLoss -= ch;
  }
  avgGain /= period;
  avgLoss /= period;
  result[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

  for (let i = period + 1; i < n; i++) {
    const ch = closes[i] - closes[i - 1];
    const g = Math.max(ch, 0);
    const l = Math.max(-ch, 0);
    avgGain = (avgGain * (period - 1) + g) / period;
    avgLoss = (avgLoss * (period - 1) + l) / period;
    result[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }
  return result;
}

function smaOfNullable(values: (number | null)[], period: number): (number | null)[] {
  const n = values.length;
  const r: (number | null)[] = new Array(n).fill(null);
  for (let i = period - 1; i < n; i++) {
    let s = 0;
    let ok = true;
    for (let j = i - period + 1; j <= i; j++) {
      if (values[j] === null) { ok = false; break; }
      s += values[j]!;
    }
    if (ok) r[i] = s / period;
  }
  return r;
}

export function stochRsi(
  bars: BarInput[],
  length: number,
  rsiLength: number,
  kSmoothing: number,
  dSmoothing: number,
): (TwoLinePoint | null)[] {
  const n = bars.length;
  const result: (TwoLinePoint | null)[] = new Array(n).fill(null);
  if (n < Math.max(length, rsiLength) + 1) return result;

  const closes = bars.map(b => b.close);
  const rsiVals = rsiSeries(closes, rsiLength);

  const rawK: (number | null)[] = new Array(n).fill(null);
  for (let i = length + rsiLength; i < n; i++) {
    let minRsi = rsiVals[i - length + 1]!;
    let maxRsi = rsiVals[i - length + 1]!;
    let allValid = true;
    for (let j = i - length + 1; j <= i; j++) {
      if (rsiVals[j] === null) { allValid = false; break; }
      if (rsiVals[j]! < minRsi) minRsi = rsiVals[j]!;
      if (rsiVals[j]! > maxRsi) maxRsi = rsiVals[j]!;
    }
    if (!allValid) continue;
    const rng = maxRsi - minRsi;
    rawK[i] = rng === 0 ? 50 : 100 * (rsiVals[i]! - minRsi) / rng;
  }

  const kLine = smaOfNullable(rawK, kSmoothing);
  const dLine = smaOfNullable(kLine, dSmoothing);

  for (let i = 0; i < n; i++) {
    if (kLine[i] !== null && dLine[i] !== null) {
      result[i] = { line1: kLine[i]!, line2: dLine[i]! };
    }
  }
  return result;
}

const DEF: IndicatorDef<
  { length: number; rsiLength: number; kSmoothing: number; dSmoothing: number },
  TwoLinePoint | null
> = {
  meta: {
    id: 'stochrsi',
    name: 'Stochastic RSI',
    shortName: 'StochRSI',
    category: 'oscillators',
    overlay: false,
    description:
      'Applies the stochastic formula to RSI values instead of price. Provides earlier signals than standard RSI. Values range from 0 to 1 (or 0 to 100).',
    params: [
      { key: 'length', label: 'Stoch Length', type: 'number', defaultValue: 14, min: 2, max: 100, description: 'Stochastic lookback period for RSI values' },
      { key: 'rsiLength', label: 'RSI Length', type: 'number', defaultValue: 14, min: 2, max: 100, description: 'Period for initial RSI calculation' },
      { key: 'kSmoothing', label: '%K Smoothing', type: 'number', defaultValue: 3, min: 1, max: 20, description: 'SMA periods for %K line' },
      { key: 'dSmoothing', label: '%D Smoothing', type: 'number', defaultValue: 3, min: 1, max: 20, description: 'SMA periods for %D line' },
    ],
  },
  defaultOptions: { length: 14, rsiLength: 14, kSmoothing: 3, dSmoothing: 3 },
  calculate(bars, options) {
    return stochRsi(bars, options.length, options.rsiLength, options.kSmoothing, options.dSmoothing);
  },
};

indicatorRegistry.register(DEF);
export { DEF as stochRsiDef };
