import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

/**
 * Volume Delta: buy volume minus sell volume per bar.
 *
 * Estimates buying volume as volume × (close - low) / (high - low)
 * and selling volume as volume × (high - close) / (high - low).
 *
 * Delta = buyVol - sellVol = volume × ((close - low) - (high - close)) / (high - low)
 *
 * This is essentially the Money Flow Multiplier × volume per bar.
 */
export function volumeDelta(bars: BarInput[]): (number | null)[] {
  return bars.map(b => {
    const range = b.high - b.low;
    if (range === 0) return 0;
    const vol = b.volume ?? 0;
    const buyVol = vol * ((b.close - b.low) / range);
    const sellVol = vol * ((b.high - b.close) / range);
    return buyVol - sellVol;
  });
}

const VOLUME_DELTA_DEF: IndicatorDef<Record<string, never>, number | null> = {
  meta: {
    id: 'volume-delta',
    name: 'Volume Delta',
    shortName: 'VolDelta',
    category: 'volume',
    overlay: false,
    description:
      'Estimates the difference between buying and selling volume within each bar using the close position relative to the high-low range. Positive values indicate net buying pressure; negative values indicate net selling pressure.',
    params: [],
  },
  defaultOptions: {},
  calculate(bars) {
    return volumeDelta(bars);
  },
};

indicatorRegistry.register(VOLUME_DELTA_DEF);
