import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

function typicalPrice(b: BarInput): number {
  return (b.high + b.low + b.close) / 3;
}

/**
 * Money Flow Index (0-100): measures buying/selling pressure over a period.
 *   Raw Money Flow = typicalPrice * volume
 *   Positive MF = sum of raw MF on up days (typical price > previous)
 *   Negative MF = sum of raw MF on down days
 *   Money Ratio = Positive MF / Negative MF
 *   MFI = 100 - (100 / (1 + Money Ratio))
 */
export function mfi(bars: BarInput[], length: number): (number | null)[] {
  const result: (number | null)[] = new Array(bars.length).fill(null);
  if (bars.length <= length) return result;

  for (let i = length; i < bars.length; i++) {
    let posFlow = 0;
    let negFlow = 0;
    for (let j = i - length + 1; j <= i; j++) {
      const tp = typicalPrice(bars[j]);
      const raw = tp * (bars[j].volume ?? 0);
      if (j > i - length + 1 && tp > typicalPrice(bars[j - 1])) {
        posFlow += raw;
      } else if (j > i - length + 1 && tp < typicalPrice(bars[j - 1])) {
        negFlow += raw;
      }
    }
    if (negFlow === 0) {
      result[i] = posFlow > 0 ? 100 : 50;
    } else {
      const ratio = posFlow / negFlow;
      result[i] = 100 - 100 / (1 + ratio);
    }
  }

  return result;
}

const MFI_DEF: IndicatorDef<{ length: number }, number | null> = {
  meta: {
    id: 'mfi',
    name: 'Money Flow Index',
    shortName: 'MFI',
    category: 'volume',
    overlay: false,
    description:
      'Measures buying and selling pressure using both price and volume. Ranges from 0 to 100. Values above 80 are considered overbought; values below 20 are considered oversold. Can be viewed as a volume-weighted RSI.',
    params: [
      {
        key: 'length',
        label: 'Length',
        type: 'number',
        defaultValue: 14,
        min: 2,
        max: 100,
        description: 'Number of bars for the lookback period',
      },
    ],
  },
  defaultOptions: { length: 14 },
  calculate(bars, options) {
    return mfi(bars, options.length);
  },
};

indicatorRegistry.register(MFI_DEF);
