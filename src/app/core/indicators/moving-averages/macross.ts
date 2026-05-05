import type { BarInput, IndicatorDef, MACrossPoint } from '../types';
import { indicatorRegistry } from '../registry';

function emaLocal(bars: BarInput[], period: number): (number | null)[] {
  const result: (number | null)[] = new Array(bars.length).fill(null);
  if (bars.length < period) return result;
  const k = 2 / (period + 1);
  let sum = 0;
  for (let j = 0; j < period; j++) sum += bars[j].close;
  result[period - 1] = sum / period;
  for (let i = period; i < bars.length; i++) {
    result[i] = bars[i].close * k + (result[i - 1] as number) * (1 - k);
  }
  return result;
}

export function macross(bars: BarInput[], fastLen: number, slowLen: number): (MACrossPoint | null)[] {
  const result: (MACrossPoint | null)[] = new Array(bars.length).fill(null);
  const fastEMA = emaLocal(bars, fastLen);
  const slowEMA = emaLocal(bars, slowLen);
  const start = slowLen - 1;
  for (let i = start; i < bars.length; i++) {
    const fast = fastEMA[i] as number;
    const slow = slowEMA[i] as number;
    const prevFast = i === start ? null : fastEMA[i - 1];
    const prevSlow = i === start ? null : slowEMA[i - 1];
    let crossover: 1 | -1 | 0 = 0;
    if (prevFast !== null && prevSlow !== null) {
      if ((prevFast as number) <= (prevSlow as number) && fast > slow) crossover = 1;
      else if ((prevFast as number) >= (prevSlow as number) && fast < slow) crossover = -1;
    }
    result[i] = { fast, slow, crossover };
  }
  return result;
}

const MACROSS_DEF: IndicatorDef<{ fastLen: number; slowLen: number }, MACrossPoint | null> = {
  meta: {
    id: 'macross',
    name: 'MA Cross',
    shortName: 'MACross',
    category: 'moving-averages',
    overlay: true,
    description:
      'Plots two EMAs of different periods and signals when they cross. A bullish cross (fast crosses above slow) generates crossover=1; bearish generates crossover=-1.',
    params: [
      { key: 'fastLen', label: 'Fast EMA Period', type: 'number', defaultValue: 10, min: 2, max: 200, description: 'Fast EMA period' },
      { key: 'slowLen', label: 'Slow EMA Period', type: 'number', defaultValue: 30, min: 3, max: 500, description: 'Slow EMA period' },
    ],
  },
  defaultOptions: { fastLen: 10, slowLen: 30 },
  calculate(bars, options) { return macross(bars, options.fastLen, options.slowLen); },
};
indicatorRegistry.register(MACROSS_DEF);
