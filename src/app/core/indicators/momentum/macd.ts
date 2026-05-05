import type { BarInput, IndicatorDef, MACDPoint } from '../types';
import { indicatorRegistry } from '../registry';

function emaArray(values: number[], period: number): number[] {
  const result: number[] = new Array(values.length);
  const k = 2 / (period + 1);
  let sum = 0;
  for (let j = 0; j < period; j++) sum += values[j];
  result[period - 1] = sum / period;
  for (let i = period; i < values.length; i++) {
    result[i] = values[i] * k + result[i - 1] * (1 - k);
  }
  return result;
}

function emaOfValues(values: (number | null)[], period: number): (number | null)[] {
  const result: (number | null)[] = new Array(values.length).fill(null);
  let startIdx = -1;
  for (let i = 0; i <= values.length - period; i++) {
    let allNonNull = true;
    for (let j = i; j < i + period; j++) {
      if (values[j] === null) { allNonNull = false; break; }
    }
    if (allNonNull) { startIdx = i; break; }
  }
  if (startIdx === -1) return result;

  let sum = 0;
  for (let j = startIdx; j < startIdx + period; j++) sum += values[j] as number;
  result[startIdx + period - 1] = sum / period;

  const k = 2 / (period + 1);
  for (let i = startIdx + period; i < values.length; i++) {
    result[i] = values[i] !== null
      ? (values[i] as number) * k + (result[i - 1] as number) * (1 - k)
      : null;
  }
  return result;
}

export function macd(
  bars: BarInput[],
  fast: number,
  slow: number,
  signal: number,
): (MACDPoint | null)[] {
  const closes = bars.map(b => b.close);
  const fastEMA = emaArray(closes, fast);
  const slowEMA = emaArray(closes, slow);

  const macdLine: (number | null)[] = new Array(bars.length).fill(null);
  for (let i = 0; i < bars.length; i++) {
    if (i >= fast - 1 && i >= slow - 1) macdLine[i] = fastEMA[i] - slowEMA[i];
  }

  const signalLine = emaOfValues(macdLine, signal);

  return bars.map((_, i) => {
    const m = macdLine[i];
    const s = signalLine[i];
    if (m === null || s === null) return null;
    return { macd: m, signal: s, histogram: m - s };
  });
}

const MACD_DEF: IndicatorDef<{ fast: number; slow: number; signal: number }, MACDPoint | null> = {
  meta: {
    id: 'macd',
    name: 'MACD',
    shortName: 'MACD',
    category: 'momentum',
    overlay: false,
    description:
      'Moving Average Convergence Divergence. Calculates the difference between two EMAs (MACD line) and a signal line (EMA of MACD). The histogram shows divergence between them. Used to identify trend changes and momentum.',
    params: [
      { key: 'fast',   label: 'Fast Period',   type: 'number', defaultValue: 12, min: 2,  max: 100, description: 'Bars for fast EMA' },
      { key: 'slow',   label: 'Slow Period',   type: 'number', defaultValue: 26, min: 2,  max: 200, description: 'Bars for slow EMA' },
      { key: 'signal', label: 'Signal Period', type: 'number', defaultValue: 9,  min: 2,  max: 50,  description: 'Bars for signal line EMA' },
    ],
  },
  defaultOptions: { fast: 12, slow: 26, signal: 9 },
  calculate(bars: BarInput[], options: { fast: number; slow: number; signal: number }): (MACDPoint | null)[] {
    return macd(bars, options.fast, options.slow, options.signal);
  },
};

indicatorRegistry.register(MACD_DEF);
