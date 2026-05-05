import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

/**
 * Price Volume Trend: cumulative sum of volume × percentage price change.
 *   PVT[0] = 0
 *   PVT[i] = PVT[i-1] + volume[i] × (close[i] - close[i-1]) / close[i-1]
 */
export function pvt(bars: BarInput[]): (number | null)[] {
  const result: (number | null)[] = new Array(bars.length).fill(null);
  if (bars.length === 0) return result;

  result[0] = 0;
  for (let i = 1; i < bars.length; i++) {
    const prevClose = bars[i - 1].close;
    if (prevClose === 0) {
      result[i] = result[i - 1] as number;
      continue;
    }
    const pctChange = (bars[i].close - prevClose) / prevClose;
    result[i] = (result[i - 1] as number) + (bars[i].volume ?? 0) * pctChange;
  }

  return result;
}

const PVT_DEF: IndicatorDef<Record<string, never>, number | null> = {
  meta: {
    id: 'pvt',
    name: 'Price Volume Trend',
    shortName: 'PVT',
    category: 'volume',
    overlay: false,
    description:
      'Cumulative indicator that combines percentage price change with volume. Unlike OBV (which only uses sign), PVT weights volume by the magnitude of price change, making it more sensitive to significant moves.',
    params: [],
  },
  defaultOptions: {},
  calculate(bars) {
    return pvt(bars);
  },
};

indicatorRegistry.register(PVT_DEF);
