import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

/**
 * Net Volume: cumulative sum of volume where up days add, down days subtract.
 *
 *   NetVol[0] = 0
 *   close[i] > close[i-1] → NetVol[i] = NetVol[i-1] + volume[i]
 *   close[i] < close[i-1] → NetVol[i] = NetVol[i-1] - volume[i]
 *   close[i] === close[i-1] → NetVol[i] = NetVol[i-1]
 *
 * Unlike OBV which also accumulates, Net Volume is typically shown as a
 * cumulative line. In practice both are very similar; this variant
 * matches the lightweight-charts-indicators library convention.
 */
export function netVolume(bars: BarInput[]): (number | null)[] {
  const result: (number | null)[] = new Array(bars.length).fill(null);
  if (bars.length === 0) return result;

  result[0] = 0;
  for (let i = 1; i < bars.length; i++) {
    const vol = bars[i].volume ?? 0;
    if (bars[i].close > bars[i - 1].close) {
      result[i] = (result[i - 1] as number) + vol;
    } else if (bars[i].close < bars[i - 1].close) {
      result[i] = (result[i - 1] as number) - vol;
    } else {
      result[i] = result[i - 1] as number;
    }
  }

  return result;
}

const NET_VOLUME_DEF: IndicatorDef<Record<string, never>, number | null> = {
  meta: {
    id: 'net-volume',
    name: 'Net Volume',
    shortName: 'NetVol',
    category: 'volume',
    overlay: false,
    description:
      'Cumulative volume where up-closes add and down-closes subtract. Rising net volume confirms an uptrend; falling net volume confirms a downtrend. Similar to OBV but used as a standalone volume indicator.',
    params: [],
  },
  defaultOptions: {},
  calculate(bars) {
    return netVolume(bars);
  },
};

indicatorRegistry.register(NET_VOLUME_DEF);
