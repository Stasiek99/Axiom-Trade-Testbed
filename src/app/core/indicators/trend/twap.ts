import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

export function twap(bars: BarInput[]): (number | null)[] {
  const result: (number | null)[] = new Array(bars.length).fill(null);
  if (bars.length === 0) return result;

  let cumulativeSum = 0;
  for (let i = 0; i < bars.length; i++) {
    const typicalPrice = (bars[i].high + bars[i].low + bars[i].close) / 3;
    cumulativeSum += typicalPrice;
    result[i] = cumulativeSum / (i + 1);
  }

  return result;
}

const TWAP_DEF: IndicatorDef<Record<string, unknown>, number | null> = {
  meta: {
    id: 'twap',
    name: 'Time-Weighted Average Price',
    shortName: 'TWAP',
    category: 'trend',
    overlay: true,
    description:
      'Time-weighted average price using the typical price (H+L+C)/3. Each bar contributes equally regardless of volume, providing a simple average price level over the chart period.',
    params: [],
  },
  defaultOptions: {},
  calculate(bars: BarInput[]): (number | null)[] {
    return twap(bars);
  },
};

indicatorRegistry.register(TWAP_DEF);