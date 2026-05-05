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
 * Volume Oscillator: ((shortEMA(volume) - longEMA(volume)) / longEMA(volume)) × 100.
 * Shows whether volume is expanding or contracting as a percentage.
 */
export function volumeOscillator(
  bars: BarInput[],
  shortLength: number,
  longLength: number,
): (number | null)[] {
  const volumes = bars.map(b => b.volume ?? 0);
  const shortEMA = ema(volumes, shortLength);
  const longEMA = ema(volumes, longLength);

  const result: (number | null)[] = new Array(bars.length).fill(null);
  for (let i = 0; i < bars.length; i++) {
    const s = shortEMA[i];
    const l = longEMA[i];
    if (s !== null && l !== null && l !== 0) {
      result[i] = ((s - l) / l) * 100;
    }
  }
  return result;
}

const VOLUME_OSCILLATOR_DEF: IndicatorDef<
  { shortLength: number; longLength: number },
  number | null
> = {
  meta: {
    id: 'volume-oscillator',
    name: 'Volume Oscillator',
    shortName: 'VolOsc',
    category: 'volume',
    overlay: false,
    description:
      'Measures the difference between a short and long exponential moving average of volume, expressed as a percentage. Positive values indicate volume expansion; negative values indicate contraction.',
    params: [
      {
        key: 'shortLength',
        label: 'Short EMA Period',
        type: 'number',
        defaultValue: 5,
        min: 2,
        max: 50,
        description: 'Short-term EMA period for volume',
      },
      {
        key: 'longLength',
        label: 'Long EMA Period',
        type: 'number',
        defaultValue: 10,
        min: 2,
        max: 100,
        description: 'Long-term EMA period for volume',
      },
    ],
  },
  defaultOptions: { shortLength: 5, longLength: 10 },
  calculate(bars, options) {
    return volumeOscillator(bars, options.shortLength, options.longLength);
  },
};

indicatorRegistry.register(VOLUME_OSCILLATOR_DEF);
