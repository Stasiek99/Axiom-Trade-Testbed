import type { BarInput, IndicatorDef, VolumeBarPoint } from '../types';
import { indicatorRegistry } from '../registry';

/**
 * Colored Volume: classifies each bar's volume direction for visual display.
 *
 * Returns { volume, color } per bar where:
 *   1  → close > open  (up bar — green)
 *   0  → close === open (flat bar — gray)
 *   -1 → close < open  (down bar — red)
 */
export function coloredVolume(bars: BarInput[]): (VolumeBarPoint | null)[] {
  return bars.map(b => {
    const vol = b.volume ?? 0;
    let color: 1 | -1 | 0;
    if (b.close > b.open) color = 1;
    else if (b.close < b.open) color = -1;
    else color = 0;
    return { volume: vol, color };
  });
}

const COLORED_VOLUME_DEF: IndicatorDef<Record<string, never>, VolumeBarPoint | null> = {
  meta: {
    id: 'colored-volume',
    name: 'Colored Volume',
    shortName: 'ColVol',
    category: 'volume',
    overlay: false,
    description:
      'Displays volume bars colour-coded by price direction. Green bars (close > open) indicate buying pressure; red bars (close < open) indicate selling pressure; grey bars indicate flat closes. Useful for quickly visualising volume trends.',
    params: [],
  },
  defaultOptions: {},
  calculate(bars) {
    return coloredVolume(bars);
  },
};

indicatorRegistry.register(COLORED_VOLUME_DEF);
