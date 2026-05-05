import type { BarInput, IndicatorDef } from '../types';
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
 * Chaikin Oscillator: EMA(fastLength, ADL) - EMA(slowLength, ADL).
 *
 * The Accumulation Distribution Line (ADL) is a cumulative sum of
 * Money Flow Volume, where:
 *   MFM = ((close - low) - (high - close)) / (high - low)
 *   MFV = MFM × volume
 */
export function chaikinOscillator(
  bars: BarInput[],
  fastLength: number,
  slowLength: number,
): (number | null)[] {
  // Build ADL
  const adl: number[] = new Array(bars.length);
  let cumulative = 0;
  for (let i = 0; i < bars.length; i++) {
    const range = bars[i].high - bars[i].low;
    const mfm = range === 0 ? 0 : ((bars[i].close - bars[i].low) - (bars[i].high - bars[i].close)) / range;
    cumulative += mfm * (bars[i].volume ?? 0);
    adl[i] = cumulative;
  }

  const fastEMA = ema(adl, fastLength);
  const slowEMA = ema(adl, slowLength);

  const result: (number | null)[] = new Array(bars.length).fill(null);
  for (let i = 0; i < bars.length; i++) {
    const f = fastEMA[i];
    const s = slowEMA[i];
    if (f !== null && s !== null) {
      result[i] = f - s;
    }
  }
  return result;
}

const CHAIKIN_OSCILLATOR_DEF: IndicatorDef<
  { fastLength: number; slowLength: number },
  number | null
> = {
  meta: {
    id: 'chaikin-oscillator',
    name: 'Chaikin Oscillator',
    shortName: 'Chaikin',
    category: 'volume',
    overlay: false,
    description:
      'Momentum indicator for the Accumulation Distribution Line. Calculated as the difference between a fast and slow EMA of the ADL. Positive values signal accumulation; negative values signal distribution.',
    params: [
      {
        key: 'fastLength',
        label: 'Fast EMA Period',
        type: 'number',
        defaultValue: 3,
        min: 2,
        max: 50,
        description: 'Fast EMA period for ADL',
      },
      {
        key: 'slowLength',
        label: 'Slow EMA Period',
        type: 'number',
        defaultValue: 10,
        min: 2,
        max: 100,
        description: 'Slow EMA period for ADL',
      },
    ],
  },
  defaultOptions: { fastLength: 3, slowLength: 10 },
  calculate(bars, options) {
    return chaikinOscillator(bars, options.fastLength, options.slowLength);
  },
};

indicatorRegistry.register(CHAIKIN_OSCILLATOR_DEF);
