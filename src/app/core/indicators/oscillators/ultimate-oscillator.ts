import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

export function ultimateOscillator(
  bars: BarInput[],
  len1: number,
  len2: number,
  len3: number,
): (number | null)[] {
  const n = bars.length;
  const result: (number | null)[] = new Array(n).fill(null);
  if (n < len3 + 1) return result;

  const bp: number[] = [];
  const tr: number[] = [];

  for (let i = 0; i < n; i++) {
    const prevClose = i > 0 ? bars[i - 1].close : bars[i].close;
    const tl = Math.min(bars[i].low, prevClose);
    const th = Math.max(bars[i].high, prevClose);
    bp.push(bars[i].close - tl);
    tr.push(th - tl);
  }

  for (let i = len3; i < n; i++) {
    const sum = (arr: number[], from: number, to: number) => {
      let s = 0;
      for (let k = from; k <= to; k++) s += arr[k];
      return s;
    };

    const bp1 = sum(bp, i - len1 + 1, i);
    const tr1 = sum(tr, i - len1 + 1, i);
    const bp2 = sum(bp, i - len2 + 1, i);
    const tr2 = sum(tr, i - len2 + 1, i);
    const bp3 = sum(bp, i - len3 + 1, i);
    const tr3 = sum(tr, i - len3 + 1, i);

    const avg1 = tr1 === 0 ? 0 : bp1 / tr1;
    const avg2 = tr2 === 0 ? 0 : bp2 / tr2;
    const avg3 = tr3 === 0 ? 0 : bp3 / tr3;

    result[i] = 100 * (4 * avg1 + 2 * avg2 + avg3) / 7;
  }
  return result;
}

const DEF: IndicatorDef<{ len1: number; len2: number; len3: number }, number | null> = {
  meta: {
    id: 'ultimate-oscillator',
    name: 'Ultimate Oscillator',
    shortName: 'UO',
    category: 'oscillators',
    overlay: false,
    description:
      'A multi-timeframe momentum oscillator that combines short (7), medium (14), and long (28) period weighted averages of buying pressure over true range. Values above 70 overbought; below 30 oversold.',
    params: [
      { key: 'len1', label: 'Period 1', type: 'number', defaultValue: 7, min: 2, max: 50, description: 'Short period (weight 4)' },
      { key: 'len2', label: 'Period 2', type: 'number', defaultValue: 14, min: 2, max: 100, description: 'Medium period (weight 2)' },
      { key: 'len3', label: 'Period 3', type: 'number', defaultValue: 28, min: 2, max: 200, description: 'Long period (weight 1)' },
    ],
  },
  defaultOptions: { len1: 7, len2: 14, len3: 28 },
  calculate(bars, options) {
    return ultimateOscillator(bars, options.len1, options.len2, options.len3);
  },
};

indicatorRegistry.register(DEF);
export { DEF as ultimateOscillatorDef };
