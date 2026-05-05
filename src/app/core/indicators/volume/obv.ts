import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

/**
 * On Balance Volume: cumulative total where volume is added on up-closes
 * and subtracted on down-closes.
 *   OBV[0] = 0
 *   close[i] > close[i-1] → OBV[i] = OBV[i-1] + volume[i]
 *   close[i] < close[i-1] → OBV[i] = OBV[i-1] - volume[i]
 *   close[i] === close[i-1] → OBV[i] = OBV[i-1]
 */
export function obv(bars: BarInput[]): (number | null)[] {
  const result: (number | null)[] = new Array(bars.length).fill(null);
  if (bars.length === 0) return result;

  result[0] = 0;
  for (let i = 1; i < bars.length; i++) {
    const prev = result[i - 1] as number;
    const vol = bars[i].volume ?? 0;
    if (bars[i].close > bars[i - 1].close) {
      result[i] = prev + vol;
    } else if (bars[i].close < bars[i - 1].close) {
      result[i] = prev - vol;
    } else {
      result[i] = prev;
    }
  }

  return result;
}

const OBV_DEF: IndicatorDef<Record<string, never>, number | null> = {
  meta: {
    id: 'obv',
    name: 'On Balance Volume',
    shortName: 'OBV',
    category: 'volume',
    overlay: false,
    description:
      'Cumulative volume total adjusted by price direction. Rising OBV confirms uptrend; falling OBV confirms downtrend. Divergence between OBV and price may signal reversals.',
    params: [],
  },
  defaultOptions: {},
  calculate(bars) {
    return obv(bars);
  },
};

indicatorRegistry.register(OBV_DEF);
