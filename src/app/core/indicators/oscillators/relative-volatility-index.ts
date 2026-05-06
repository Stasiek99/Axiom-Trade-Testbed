import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

function rsiOnArr(values: number[], period: number): (number | null)[] {
  const n = values.length;
  const result: (number | null)[] = new Array(n).fill(null);
  if (n < period + 1) return result;
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const ch = values[i] - values[i - 1];
    if (ch > 0) avgGain += ch; else avgLoss -= ch;
  }
  avgGain /= period;
  avgLoss /= period;
  result[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  for (let i = period + 1; i < n; i++) {
    const ch = values[i] - values[i - 1];
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

export function relativeVolatilityIndex(
  bars: BarInput[],
  length: number,
  smoothLen: number,
): (number | null)[] {
  const n = bars.length;
  if (n < length + 2) return new Array(n).fill(null);

  const returns: number[] = new Array(n).fill(0);
  for (let i = 1; i < n; i++) {
    returns[i] = (bars[i].close / bars[i - 1].close - 1);
  }

  const stdVals: number[] = new Array(n).fill(0);
  for (let i = length; i < n; i++) {
    let sum = 0;
    for (let j = i - length + 1; j <= i; j++) sum += returns[j];
    const mean = sum / length;
    let sqSum = 0;
    for (let j = i - length + 1; j <= i; j++) sqSum += (returns[j] - mean) ** 2;
    stdVals[i] = Math.sqrt(sqSum / length);
  }

  const rawRvi = rsiOnArr(stdVals, length);
  if (smoothLen > 1) return smaOfNullable(rawRvi, smoothLen);
  return rawRvi;
}

const DEF: IndicatorDef<
  { length: number; smoothLen: number },
  number | null
> = {
  meta: {
    id: 'relative-volatility-index',
    name: 'Relative Volatility Index',
    shortName: 'RVI',
    category: 'oscillators',
    overlay: false,
    description:
      'Measures the direction of volatility by applying the RSI formula to standard deviation of returns. Values above 70 indicate high volatility; below 30 indicate low volatility.',
    params: [
      { key: 'length', label: 'Period', type: 'number', defaultValue: 14, min: 2, max: 100, description: 'Standard deviation lookback period' },
      { key: 'smoothLen', label: 'Smoothing', type: 'number', defaultValue: 14, min: 1, max: 50, description: 'SMA smoothing period for the RVI line' },
    ],
  },
  defaultOptions: { length: 14, smoothLen: 14 },
  calculate(bars, options) {
    return relativeVolatilityIndex(bars, options.length, options.smoothLen);
  },
};

indicatorRegistry.register(DEF);
export { DEF as relativeVolatilityIndexDef };
