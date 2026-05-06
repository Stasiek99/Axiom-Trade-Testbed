import type { BarInput, IndicatorDef, KSTPoint } from '../types';
import { indicatorRegistry } from '../registry';

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

function smaOfValues(
  values: (number | null)[],
  period: number,
): (number | null)[] {
  const result: (number | null)[] = new Array(values.length).fill(null);
  for (let i = period - 1; i < values.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      if (values[j] === null) { sum = -1; break; }
      sum += values[j] as number;
    }
    if (sum === -1) continue;
    result[i] = sum / period;
  }
  return result;
}

/**
 * Know Sure Thing (KST) — a multi-ROC composite oscillator.
 *
 * Combines four smoothed ROC series with different periods:
 *   ROC(10) × 1 SMA(10)
 *   ROC(15) × 2 SMA(10)
 *   ROC(20) × 3 SMA(10)
 *   ROC(30) × 4 SMA(15)
 *
 * The signal line is an SMA(9) of the KST.
 */
export function kst(bars: BarInput[]): (KSTPoint | null)[] {
  const closes = bars.map(b => b.close);

  const roc = (period: number): (number | null)[] => {
    const r: (number | null)[] = new Array(bars.length).fill(null);
    for (let i = period; i < bars.length; i++) {
      const prev = closes[i - period];
      r[i] = prev !== 0 ? ((closes[i] - prev) / prev) * 100 : null;
    }
    return r;
  };

  const roc10 = smaOfValues(roc(10), 10);
  const roc15 = smaOfValues(roc(15), 10);
  const roc20 = smaOfValues(roc(20), 10);
  const roc30 = smaOfValues(roc(30), 15);

  const kstLine: (number | null)[] = bars.map((_, i) => {
    const a = roc10[i]; if (a === null) return null;
    const b = roc15[i]; if (b === null) return null;
    const c = roc20[i]; if (c === null) return null;
    const d = roc30[i]; if (d === null) return null;
    return a * 1 + b * 2 + c * 3 + d * 4;
  });

  const signal = emaOfValues(kstLine, 9);

  return bars.map((_, i) => {
    const k = kstLine[i];
    const s = signal[i];
    if (k === null || s === null) return null;
    return { kst: k, signal: s };
  });
}

const KST_DEF: IndicatorDef<Record<string, never>, KSTPoint | null> = {
  meta: {
    id: 'kst',
    name: 'Know Sure Thing',
    shortName: 'KST',
    category: 'momentum',
    overlay: false,
    description:
      'A momentum oscillator that combines four different ROC periods with SMA smoothing and weighting. The signal line is an EMA of the KST. Crossovers and divergences identify trend changes.',
    params: [],
  },
  defaultOptions: {},
  calculate(bars) {
    return kst(bars);
  },
};

indicatorRegistry.register(KST_DEF);
