import type { BarInput, IndicatorDef, KDJPoint } from '../types';
import { indicatorRegistry } from '../registry';

export function kdj(
  bars: BarInput[],
  period: number,
  signalLength: number,
): (KDJPoint | null)[] {
  const n = bars.length;
  const result: (KDJPoint | null)[] = new Array(n).fill(null);
  if (n < period) return result;

  const rsv: (number | null)[] = new Array(n).fill(null);
  for (let i = period - 1; i < n; i++) {
    let hh = bars[i - period + 1].high;
    let ll = bars[i - period + 1].low;
    for (let j = i - period + 2; j <= i; j++) {
      if (bars[j].high > hh) hh = bars[j].high;
      if (bars[j].low < ll) ll = bars[j].low;
    }
    const rng = hh - ll;
    rsv[i] = rng === 0 ? 50 : 100 * (bars[i].close - ll) / rng;
  }

  const k: (number | null)[] = new Array(n).fill(null);
  const d: (number | null)[] = new Array(n).fill(null);
  const j: (number | null)[] = new Array(n).fill(null);

  for (let i = 0; i < n; i++) {
    if (rsv[i] === null && i === 0) continue;
    if (i === 0) {
      k[i] = 50;
      d[i] = 50;
    } else {
      k[i] = rsv[i] !== null ? (2 * k[i - 1]! + rsv[i]!) / 3 : k[i - 1]!;
      d[i] = (2 * d[i - 1]! + k[i]!) / 3;
    }
    j[i] = 3 * k[i]! - 2 * d[i]!;
  }

  // Only emit after RSV becomes valid
  for (let i = period - 1; i < n; i++) {
    result[i] = { k: k[i]!, d: d[i]!, j: j[i]! };
  }
  return result;
}

const DEF: IndicatorDef<
  { period: number; signalLength: number },
  KDJPoint | null
> = {
  meta: {
    id: 'kdj',
    name: 'KDJ Indicator',
    shortName: 'KDJ',
    category: 'oscillators',
    overlay: false,
    description:
      'An extension of the Stochastic indicator adding the J line for extra sensitivity. K and D are smoothed versions of raw stochastic values; J = 3K − 2D. Divergences on J signal reversals.',
    params: [
      { key: 'period', label: 'Period', type: 'number', defaultValue: 9, min: 2, max: 100, description: 'Lookback period for RSV calculation' },
      { key: 'signalLength', label: 'Signal Smoothing', type: 'number', defaultValue: 3, min: 1, max: 20, description: 'K/D smoothing factor' },
    ],
  },
  defaultOptions: { period: 9, signalLength: 3 },
  calculate(bars, options) {
    return kdj(bars, options.period, options.signalLength);
  },
};

indicatorRegistry.register(DEF);
export { DEF as kdjDef };
