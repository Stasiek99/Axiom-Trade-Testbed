import type { BarInput, IndicatorDef, ThreeBandPoint } from '../types';
import { indicatorRegistry } from '../registry';

export function donchianChannels(
  bars: BarInput[],
  length: number,
): (ThreeBandPoint | null)[] {
  const result: (ThreeBandPoint | null)[] = new Array(bars.length).fill(null);
  if (bars.length < length) return result;

  for (let i = length - 1; i < bars.length; i++) {
    let highest = -Infinity;
    let lowest = Infinity;
    for (let j = i - length + 1; j <= i; j++) {
      if (bars[j].high > highest) highest = bars[j].high;
      if (bars[j].low < lowest) lowest = bars[j].low;
    }
    result[i] = {
      upper: highest,
      middle: (highest + lowest) / 2,
      lower: lowest,
    };
  }

  return result;
}

const DONCHIAN_DEF: IndicatorDef<{ length: number }, ThreeBandPoint | null> = {
  meta: {
    id: 'donchian-channels',
    name: 'Donchian Channels',
    shortName: 'DC',
    category: 'channels-bands',
    overlay: true,
    description:
      'Channel formed by the highest high and lowest low over a lookback period. The centreline is the midpoint between the two extremes. Breakouts above the upper channel suggest bullish momentum; breaks below indicate bearish momentum.',
    params: [
      { key: 'length', label: 'Length', type: 'number', defaultValue: 20, min: 2, max: 200, description: 'Lookback period' },
    ],
  },
  defaultOptions: { length: 20 },
  calculate(bars, options) { return donchianChannels(bars, options.length); },
};

indicatorRegistry.register(DONCHIAN_DEF);
