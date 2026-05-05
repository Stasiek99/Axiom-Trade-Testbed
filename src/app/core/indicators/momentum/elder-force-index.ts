import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

/**
 * Elder Force Index: EMA( (close − close[-1]) × volume, length ).
 * Combines price change with volume to measure the power behind a move.
 * Positive → buying pressure, Negative → selling pressure.
 */
export function elderForceIndex(
  bars: BarInput[],
  length: number,
): (number | null)[] {
  const raw: number[] = new Array(bars.length);
  raw[0] = 0;
  for (let i = 1; i < bars.length; i++) {
    raw[i] = (bars[i].close - bars[i - 1].close) * (bars[i].volume ?? 0);
  }

  // EMA of raw force values
  const result: (number | null)[] = new Array(bars.length).fill(null);
  if (bars.length < length) return result;
  const k = 2 / (length + 1);
  let sum = 0;
  for (let j = 0; j < length; j++) sum += raw[j];
  result[length - 1] = sum / length;
  for (let i = length; i < bars.length; i++) {
    result[i] = raw[i] * k + (result[i - 1] as number) * (1 - k);
  }
  return result;
}

const ELDER_FORCE_DEF: IndicatorDef<{ length: number }, number | null> = {
  meta: {
    id: 'elder-force-index',
    name: 'Elder Force Index',
    shortName: 'EFI',
    category: 'momentum',
    overlay: false,
    description:
      'Combines price change with volume to gauge the power behind price movements. Uses an EMA smoothing of (price change × volume). Rising values confirm trend strength; divergences may signal reversals.',
    params: [
      {
        key: 'length',
        label: 'Smoothing Period',
        type: 'number',
        defaultValue: 13,
        min: 2,
        max: 100,
        description: 'Number of bars for EMA smoothing',
      },
    ],
  },
  defaultOptions: { length: 13 },
  calculate(bars, options) {
    return elderForceIndex(bars, options.length);
  },
};

indicatorRegistry.register(ELDER_FORCE_DEF);
