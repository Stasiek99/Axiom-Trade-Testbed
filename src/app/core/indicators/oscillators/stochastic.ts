import type { BarInput, IndicatorDef, TwoLinePoint } from '../types';
import { indicatorRegistry } from '../registry';

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

export function stochastic(
  bars: BarInput[],
  period: number,
  kSmoothing: number,
  dSmoothing: number,
): (TwoLinePoint | null)[] {
  const n = bars.length;
  const result: (TwoLinePoint | null)[] = new Array(n).fill(null);
  if (n < period) return result;

  const rawK: (number | null)[] = new Array(n).fill(null);
  for (let i = period - 1; i < n; i++) {
    let hh = bars[i - period + 1].high;
    let ll = bars[i - period + 1].low;
    for (let j = i - period + 2; j <= i; j++) {
      if (bars[j].high > hh) hh = bars[j].high;
      if (bars[j].low < ll) ll = bars[j].low;
    }
    const rng = hh - ll;
    rawK[i] = rng === 0 ? 50 : 100 * (bars[i].close - ll) / rng;
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
  { period: number; kSmoothing: number; dSmoothing: number },
  TwoLinePoint | null
> = {
  meta: {
    id: 'stochastic',
    name: 'Stochastic Oscillator',
    shortName: 'Stoch',
    category: 'oscillators',
    overlay: false,
    description:
      'Compares a closing price to its price range over a given period. %K and %D lines oscillate between 0 and 100. Readings above 80 indicate overbought; below 20 indicate oversold.',
    params: [
      { key: 'period', label: 'Period', type: 'number', defaultValue: 14, min: 2, max: 100, description: 'Lookback period for highest high / lowest low' },
      { key: 'kSmoothing', label: '%K Smoothing', type: 'number', defaultValue: 3, min: 1, max: 20, description: 'SMA periods for %K line smoothing' },
      { key: 'dSmoothing', label: '%D Smoothing', type: 'number', defaultValue: 3, min: 1, max: 20, description: 'SMA periods for %D line smoothing' },
    ],
  },
  defaultOptions: { period: 14, kSmoothing: 3, dSmoothing: 3 },
  calculate(bars, options) {
    return stochastic(bars, options.period, options.kSmoothing, options.dSmoothing);
  },
};

indicatorRegistry.register(DEF);
export { DEF as stochasticDef };
