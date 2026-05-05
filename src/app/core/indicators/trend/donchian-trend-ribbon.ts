import type { BarInput, IndicatorDef, DonchianRibbonPoint } from '../types';
import { indicatorRegistry } from '../registry';

function highest(values: number[], from: number, length: number): number {
  let max = -Infinity;
  for (let i = from - length + 1; i <= from; i++) {
    if (i >= 0 && i < values.length && values[i] > max) max = values[i];
  }
  return max;
}

function lowest(values: number[], from: number, length: number): number {
  let min = Infinity;
  for (let i = from - length + 1; i <= from; i++) {
    if (i >= 0 && i < values.length && values[i] < min) min = values[i];
  }
  return min;
}

export function donchianTrendRibbon(bars: BarInput[]): (DonchianRibbonPoint | null)[] {
  const result: (DonchianRibbonPoint | null)[] = new Array(bars.length).fill(null);
  if (bars.length < 2) return result;

  const lengths = [5, 10, 15, 20, 25, 30, 40, 50];
  const highs = bars.map(b => b.high);
  const lows = bars.map(b => b.low);

  for (let i = 0; i < bars.length; i++) {
    const values: number[] = [];
    let allReady = true;

    for (const len of lengths) {
      if (i < len - 1) {
        allReady = false;
        break;
      }
      const hh = highest(highs, i, len);
      const ll = lowest(lows, i, len);
      values.push((hh + ll) / 2);
    }

    if (allReady) {
      result[i] = { values };
    }
  }

  return result;
}

const RIBBON_DEF: IndicatorDef<Record<string, unknown>, DonchianRibbonPoint | null> = {
  meta: {
    id: 'donchian-trend-ribbon',
    name: "Donchian Trend Ribbon",
    shortName: 'D Ribbon',
    category: 'trend',
    overlay: true,
    description:
      'A multi-layer composite of Donchian channel midpoints at various periods (5, 10, 15, 20, 25, 30, 40, 50). When all lines align in ascending order, a strong uptrend is present; descending indicates a downtrend.',
    params: [],
  },
  defaultOptions: {},
  calculate(bars: BarInput[]): (DonchianRibbonPoint | null)[] {
    return donchianTrendRibbon(bars);
  },
};

indicatorRegistry.register(RIBBON_DEF);