import type { BarInput, IndicatorDef, PriceOscillatorPoint } from '../types';
import { indicatorRegistry } from '../registry';

function ema(values: number[], period: number): (number | null)[] {
  const result: (number | null)[] = new Array(values.length).fill(null);
  if (values.length < period) return result;
  const k = 2 / (period + 1);
  let sum = 0;
  for (let j = 0; j < period; j++) sum += values[j];
  result[period - 1] = sum / period;
  for (let i = period; i < values.length; i++) {
    result[i] = values[i] * k + (result[i - 1] as number) * (1 - k);
  }
  return result;
}

/**
 * Price Oscillator (PPO – Percentage Price Oscillator):
 *   main = ((fastEMA − slowEMA) / slowEMA) × 100
 *   signal = EMA(main, signalLength)
 *   histogram = main − signal
 *
 * Like MACD but expressed as a percentage, making it comparable across
 * securities with different price levels.
 */
export function priceOscillator(
  bars: BarInput[],
  fastLength: number,
  slowLength: number,
  signalLength: number,
): (PriceOscillatorPoint | null)[] {
  const closes = bars.map(b => b.close);
  const fastEMA = ema(closes, fastLength);
  const slowEMA = ema(closes, slowLength);

  const main: (number | null)[] = new Array(bars.length).fill(null);
  for (let i = 0; i < bars.length; i++) {
    const f = fastEMA[i];
    const s = slowEMA[i];
    if (f !== null && s !== null && s !== 0) {
      main[i] = ((f - s) / s) * 100;
    }
  }

  const signal = emaOfValues(main, signalLength);

  return bars.map((_, i) => {
    const m = main[i];
    const s = signal[i];
    if (m === null || s === null) return null;
    return { main: m, signal: s, histogram: m - s };
  });
}

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

const PPO_DEF: IndicatorDef<
  { fastLength: number; slowLength: number; signalLength: number },
  PriceOscillatorPoint | null
> = {
  meta: {
    id: 'price-oscillator',
    name: 'Price Oscillator (PPO)',
    shortName: 'PPO',
    category: 'momentum',
    overlay: false,
    description:
      'The Percentage Price Oscillator (PPO) is a MACD variant expressed as a percentage. It shows the percentage difference between two EMAs. Useful for comparing momentum across different-priced securities.',
    params: [
      {
        key: 'fastLength',
        label: 'Fast EMA Period',
        type: 'number',
        defaultValue: 12,
        min: 2,
        max: 100,
        description: 'Period for the fast EMA',
      },
      {
        key: 'slowLength',
        label: 'Slow EMA Period',
        type: 'number',
        defaultValue: 26,
        min: 2,
        max: 200,
        description: 'Period for the slow EMA',
      },
      {
        key: 'signalLength',
        label: 'Signal EMA Period',
        type: 'number',
        defaultValue: 9,
        min: 2,
        max: 50,
        description: 'Period for the signal line EMA',
      },
    ],
  },
  defaultOptions: { fastLength: 12, slowLength: 26, signalLength: 9 },
  calculate(bars, options) {
    return priceOscillator(bars, options.fastLength, options.slowLength, options.signalLength);
  },
};

indicatorRegistry.register(PPO_DEF);
