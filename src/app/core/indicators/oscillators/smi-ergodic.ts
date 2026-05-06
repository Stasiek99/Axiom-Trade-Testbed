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

function emaOnEma(values: number[], firstPeriod: number, secondPeriod: number): (number | null)[] {
  const first = emaArray(values, firstPeriod);
  const flattened: number[] = [];
  for (let i = 0; i < first.length; i++) {
    flattened.push(first[i] !== null ? first[i]! : 0);
  }
  return emaArray(flattened, secondPeriod);
}

function emaOfNullable(values: (number | null)[], period: number): (number | null)[] {
  const n = values.length;
  const r: (number | null)[] = new Array(n).fill(null);
  let start = -1;
  for (let i = 0; i <= n - period; i++) {
    let all = true;
    for (let j = i; j < i + period; j++) { if (values[j] === null) { all = false; break; } }
    if (all) { start = i; break; }
  }
  if (start === -1) return r;
  let sum = 0;
  for (let j = start; j < start + period; j++) sum += values[j]!;
  r[start + period - 1] = sum / period;
  const k = 2 / (period + 1);
  for (let i = start + period; i < n; i++) {
    r[i] = values[i] !== null ? values[i]! * k + r[i - 1]! * (1 - k) : null;
  }
  return r;
}

export function smiErgodic(
  bars: BarInput[],
  longLength: number,
  shortLength: number,
  signalLength: number,
): (TwoLinePoint | null)[] {
  const n = bars.length;
  const result: (TwoLinePoint | null)[] = new Array(n).fill(null);
  if (n < longLength + shortLength + 1) return result;

  const pc: number[] = [0];
  const absPc: number[] = [0];
  for (let i = 1; i < n; i++) {
    const ch = bars[i].close - bars[i - 1].close;
    pc.push(ch);
    absPc.push(Math.abs(ch));
  }

  const doublePc = emaOnEma(pc, longLength, shortLength);
  const doubleAbsPc = emaOnEma(absPc, longLength, shortLength);

  const smiLine: (number | null)[] = new Array(n).fill(null);
  for (let i = 0; i < n; i++) {
    if (doublePc[i] !== null && doubleAbsPc[i] !== null && doubleAbsPc[i] !== 0) {
      // Half absolute for the denominator (ergodic scaling)
      smiLine[i] = 100 * doublePc[i]! / (doubleAbsPc[i]! * 0.5);
    }
  }

  const signalLine = emaOfNullable(smiLine, signalLength);

  for (let i = 0; i < n; i++) {
    if (smiLine[i] !== null && signalLine[i] !== null) {
      result[i] = { line1: smiLine[i]!, line2: signalLine[i]! };
    }
  }
  return result;
}

const DEF: IndicatorDef<
  { longLength: number; shortLength: number; signalLength: number },
  TwoLinePoint | null
> = {
  meta: {
    id: 'smi-ergodic',
    name: 'SMI Ergodic Oscillator',
    shortName: 'SMI',
    category: 'oscillators',
    overlay: false,
    description:
      'A TSI-based ergodic oscillator that double-smooths price changes and scales by half the absolute changes. Used to identify trend direction and momentum through signal line crossovers.',
    params: [
      { key: 'longLength', label: 'Long Period', type: 'number', defaultValue: 20, min: 2, max: 100, description: 'First (long) EMA period' },
      { key: 'shortLength', label: 'Short Period', type: 'number', defaultValue: 5, min: 2, max: 50, description: 'Second (short) EMA period' },
      { key: 'signalLength', label: 'Signal Period', type: 'number', defaultValue: 5, min: 2, max: 50, description: 'Signal line EMA period' },
    ],
  },
  defaultOptions: { longLength: 20, shortLength: 5, signalLength: 5 },
  calculate(bars, options) {
    return smiErgodic(bars, options.longLength, options.shortLength, options.signalLength);
  },
};

indicatorRegistry.register(DEF);
export { DEF as smiErgodicDef };
