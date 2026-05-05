import type { BarInput, IndicatorDef, AroonPoint } from '../types';
import { indicatorRegistry } from '../registry';

export function aroon(bars: BarInput[], length: number): (AroonPoint | null)[] {
  const result: (AroonPoint | null)[] = new Array(bars.length).fill(null);
  if (bars.length < length + 1) return result;

  for (let i = length; i < bars.length; i++) {
    let highestIdx = i;
    let lowestIdx = i;

    for (let j = i - length + 1; j <= i; j++) {
      if (bars[j].high >= bars[highestIdx].high) highestIdx = j;
      if (bars[j].low <= bars[lowestIdx].low) lowestIdx = j;
    }

    const barsSinceHigh = i - highestIdx;
    const barsSinceLow = i - lowestIdx;

    const up = ((length - barsSinceHigh) / length) * 100;
    const down = ((length - barsSinceLow) / length) * 100;

    result[i] = {
      up,
      down,
      oscillator: up - down,
    };
  }

  return result;
}

const AROON_DEF: IndicatorDef<{ length: number }, AroonPoint | null> = {
  meta: {
    id: 'aroon',
    name: 'Aroon',
    shortName: 'Aroon',
    category: 'trend',
    overlay: false,
    description:
      'Measures trend strength by tracking how recently new highs/lows occurred within a lookback period. Aroon Up above 70 = bullish trend; Aroon Down above 70 = bearish trend. The oscillator shows directional bias.',
    params: [
      {
        key: 'length',
        label: 'Period',
        type: 'number',
        defaultValue: 14,
        min: 2,
        max: 200,
        description: 'Lookback period in bars',
      },
    ],
  },
  defaultOptions: { length: 14 },
  calculate(bars: BarInput[], options: { length: number }): (AroonPoint | null)[] {
    return aroon(bars, options.length);
  },
};

indicatorRegistry.register(AROON_DEF);
