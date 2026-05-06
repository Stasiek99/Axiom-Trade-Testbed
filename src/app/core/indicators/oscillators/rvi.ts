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

export function rvi(bars: BarInput[], period: number): (TwoLinePoint | null)[] {
  const n = bars.length;
  const result: (TwoLinePoint | null)[] = new Array(n).fill(null);
  if (n < period + 1) return result;

  const rawRvi: (number | null)[] = new Array(n).fill(null);
  for (let i = 0; i < n; i++) {
    const num = bars[i].close - bars[i].open;
    const den = bars[i].high - bars[i].low;
    rawRvi[i] = den === 0 ? 0 : num / den;
  }

  const rviLine = smaOfNullable(rawRvi, period);
  const signalLine = smaOfNullable(rviLine, 4);

  for (let i = 0; i < n; i++) {
    if (rviLine[i] !== null && signalLine[i] !== null) {
      result[i] = { line1: rviLine[i]!, line2: signalLine[i]! };
    }
  }
  return result;
}

const DEF: IndicatorDef<
  { period: number },
  TwoLinePoint | null
> = {
  meta: {
    id: 'rvi',
    name: 'Relative Vigor Index',
    shortName: 'RVI',
    category: 'oscillators',
    overlay: false,
    description:
      'Measures the strength of a trend by comparing closing prices to opening prices within the trading range. The signal line (SMA-4) generates buy/sell signals on crossovers.',
    params: [
      { key: 'period', label: 'Period', type: 'number', defaultValue: 10, min: 2, max: 100, description: 'SMA period for RVI line' },
    ],
  },
  defaultOptions: { period: 10 },
  calculate(bars, options) {
    return rvi(bars, options.period);
  },
};

indicatorRegistry.register(DEF);
export { DEF as rviDef };
