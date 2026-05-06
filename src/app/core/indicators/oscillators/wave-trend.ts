import type { BarInput, IndicatorDef, TwoLinePoint } from '../types';
import { indicatorRegistry } from '../registry';

function emaArray(values: number[], period: number): (number | null)[] {
  const n = values.length;
  const r: (number | null)[] = new Array(n).fill(null);
  let sum = 0;
  for (let i = 0; i < period && i < n; i++) sum += values[i];
  r[Math.min(period, n) - 1] = sum / Math.min(period, n);
  const k = 2 / (period + 1);
  for (let i = Math.min(period, n); i < n; i++) {
    r[i] = values[i] * k + r[i - 1]! * (1 - k);
  }
  return r;
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

export function waveTrend(
  bars: BarInput[],
  channelLen: number,
  avgLen: number,
): (TwoLinePoint | null)[] {
  const n = bars.length;
  const result: (TwoLinePoint | null)[] = new Array(n).fill(null);
  if (n < channelLen) return result;

  const hlc3 = bars.map(b => (b.high + b.low + b.close) / 3);

  const esa = emaArray(hlc3, channelLen);
  const absDev: number[] = [];
  for (let i = 0; i < n; i++) {
    absDev.push(esa[i] !== null ? Math.abs(hlc3[i] - esa[i]!) : 0);
  }
  const d = emaArray(absDev, channelLen);

  const ci: (number | null)[] = new Array(n).fill(null);
  for (let i = 0; i < n; i++) {
    if (esa[i] !== null && d[i] !== null && d[i]! > 0) {
      ci[i] = (hlc3[i] - esa[i]!) / (0.015 * d[i]!);
    }
  }

  const wt1 = smaOfNullable(ci, avgLen);
  const wt2 = smaOfNullable(wt1, 3);

  for (let i = 0; i < n; i++) {
    if (wt1[i] !== null && wt2[i] !== null) {
      result[i] = { line1: wt1[i]!, line2: wt2[i]! };
    }
  }
  return result;
}

const DEF: IndicatorDef<
  { channelLen: number; avgLen: number },
  TwoLinePoint | null
> = {
  meta: {
    id: 'wave-trend',
    name: 'WaveTrend',
    shortName: 'WT',
    category: 'oscillators',
    overlay: false,
    description:
      'A channel-based oscillator that measures the distance of price from its EMA, normalized by the EMA of absolute deviations. WT1 and WT2 crossovers generate buy/sell signals. Extreme values indicate reversal zones.',
    params: [
      { key: 'channelLen', label: 'Channel Length', type: 'number', defaultValue: 9, min: 2, max: 100, description: 'EMA period for channel calculation' },
      { key: 'avgLen', label: 'Average Length', type: 'number', defaultValue: 12, min: 2, max: 100, description: 'SMA period for WT1 smoothing' },
    ],
  },
  defaultOptions: { channelLen: 9, avgLen: 12 },
  calculate(bars, options) {
    return waveTrend(bars, options.channelLen, options.avgLen);
  },
};

indicatorRegistry.register(DEF);
export { DEF as waveTrendDef };
