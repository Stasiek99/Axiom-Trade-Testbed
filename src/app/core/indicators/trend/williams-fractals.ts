import type { BarInput, IndicatorDef, FractalPoint } from '../types';
import { indicatorRegistry } from '../registry';

export function williamsFractals(bars: BarInput[]): (FractalPoint | null)[] {
  const result: (FractalPoint | null)[] = new Array(bars.length).fill(null);
  if (bars.length < 5) return result;

  for (let i = 2; i < bars.length - 2; i++) {
    const isBearishFractal =
      bars[i].high > bars[i - 1].high &&
      bars[i].high > bars[i + 1].high &&
      bars[i - 1].high > bars[i - 2].high &&
      bars[i + 1].high > bars[i + 2].high;

    const isBullishFractal =
      bars[i].low < bars[i - 1].low &&
      bars[i].low < bars[i + 1].low &&
      bars[i - 1].low < bars[i - 2].low &&
      bars[i + 1].low < bars[i + 2].low;

    if (isBearishFractal || isBullishFractal) {
      result[i] = {
        high: isBearishFractal ? bars[i].high : null,
        low: isBullishFractal ? bars[i].low : null,
      };
    }
  }

  return result;
}

const FRACTALS_DEF: IndicatorDef<Record<string, unknown>, FractalPoint | null> = {
  meta: {
    id: 'williams-fractals',
    name: 'Williams Fractals',
    shortName: 'Fractals',
    category: 'trend',
    overlay: true,
    description:
      'Identifies 5-bar reversal patterns. A bearish fractal forms when the middle bar has the highest high surrounded by two lower highs on each side. A bullish fractal forms with the lowest low surrounded by two higher lows.',
    params: [],
  },
  defaultOptions: {},
  calculate(bars: BarInput[]): (FractalPoint | null)[] {
    return williamsFractals(bars);
  },
};

indicatorRegistry.register(FRACTALS_DEF);