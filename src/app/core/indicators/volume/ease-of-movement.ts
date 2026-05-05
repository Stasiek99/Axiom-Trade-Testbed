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
 * Ease of Movement (EOM): relates price change to volume.
 *
 *   Distance = (high + low) / 2 - (prevHigh + prevLow) / 2
 *   BoxRatio = volume / (high - low)
 *   EOM = Distance / BoxRatio  (simplified: Distance × (high - low) / volume)
 *
 * Positive → price moving up easily (low volume resistance).
 * Negative → price moving down easily.
 */
export function easeOfMovement(
  bars: BarInput[],
  length: number,
): (number | null)[] {
  const raw: (number | null)[] = new Array(bars.length).fill(null);
  for (let i = 1; i < bars.length; i++) {
    const midpoint = (bars[i].high + bars[i].low) / 2;
    const prevMid = (bars[i - 1].high + bars[i - 1].low) / 2;
    const distance = midpoint - prevMid;
    const range = bars[i].high - bars[i].low;
    const vol = bars[i].volume ?? 0;
    // BoxRatio = vol / range.  EOM = distance / BoxRatio = distance * range / vol
    if (vol === 0 || range === 0) {
      raw[i] = 0;
    } else {
      raw[i] = (distance * range) / vol;
    }
  }

  // Smooth with EMA
  const result: (number | null)[] = new Array(bars.length).fill(null);
  if (bars.length < length) return result;

  // Extract non-null raw values for EMA
  const rawValues = raw.map((v, i) => v ?? 0);
  const smoothed = ema(rawValues, length);
  for (let i = 0; i < bars.length; i++) {
    result[i] = smoothed[i];
  }

  return result;
}

const EASE_OF_MOVEMENT_DEF: IndicatorDef<{ length: number }, number | null> = {
  meta: {
    id: 'ease-of-movement',
    name: 'Ease of Movement',
    shortName: 'EOM',
    category: 'volume',
    overlay: false,
    description:
      'Relates price change to volume to show how easily prices are moving. A positive value indicates price is moving upward with low volume resistance; negative indicates downward movement with ease. Higher absolute values suggest less resistance.',
    params: [
      {
        key: 'length',
        label: 'Smoothing Period',
        type: 'number',
        defaultValue: 14,
        min: 2,
        max: 100,
        description: 'EMA smoothing period',
      },
    ],
  },
  defaultOptions: { length: 14 },
  calculate(bars, options) {
    return easeOfMovement(bars, options.length);
  },
};

indicatorRegistry.register(EASE_OF_MOVEMENT_DEF);
