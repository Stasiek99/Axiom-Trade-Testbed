import type { BarInput, IndicatorDef, IchimokuPoint } from '../types';
import { indicatorRegistry } from '../registry';

function midpoint(high: number, low: number): number {
  return (high + low) / 2;
}

function highest(values: number[], from: number, length: number): number {
  let max = -Infinity;
  const end = Math.min(from + 1, values.length);
  const start = Math.max(0, from - length + 1);
  for (let i = start; i < end; i++) {
    if (values[i] > max) max = values[i];
  }
  return max;
}

function lowest(values: number[], from: number, length: number): number {
  let min = Infinity;
  const end = Math.min(from + 1, values.length);
  const start = Math.max(0, from - length + 1);
  for (let i = start; i < end; i++) {
    if (values[i] < min) min = values[i];
  }
  return min;
}

export function ichimoku(
  bars: BarInput[],
  tenkanLength: number,
  kijunLength: number,
  chikouLength: number,
): (IchimokuPoint | null)[] {
  const result: (IchimokuPoint | null)[] = new Array(bars.length).fill(null);
  const highs = bars.map(b => b.high);
  const lows = bars.map(b => b.low);
  const displacement = kijunLength;

  for (let i = 0; i < bars.length; i++) {
    if (i < kijunLength - 1) continue;

    // Tenkan-sen / Conversion line
    const tenkan = midpoint(highest(highs, i, tenkanLength), lowest(lows, i, tenkanLength));

    // Kijun-sen / Base line
    const kijun = midpoint(highest(highs, i, kijunLength), lowest(lows, i, kijunLength));

    // Store base values at current bar
    result[i] = { tenkan, kijun, spanA: 0, spanB: 0, chikou: 0 };

    // Senkou Span A: midpoint of Tenkan and Kijun, displaced forward by kijunLength
    const spanAIdx = i + displacement;
    if (spanAIdx < bars.length) {
      const spanA = midpoint(tenkan, kijun);
      if (result[spanAIdx] === null) {
        result[spanAIdx] = { tenkan: 0, kijun: 0, spanA, spanB: 0, chikou: 0 };
      } else {
        (result[spanAIdx] as IchimokuPoint).spanA = spanA;
      }
    }

    // Senkou Span B: midpoint of HH(chikouLength) and LL(chikouLength), displaced forward
    if (i >= chikouLength - 1) {
      const spanBIdx = i + displacement;
      if (spanBIdx < bars.length) {
        const spanB = midpoint(highest(highs, i, chikouLength), lowest(lows, i, chikouLength));
        if (result[spanBIdx] === null) {
          result[spanBIdx] = { tenkan: 0, kijun: 0, spanA: 0, spanB, chikou: 0 };
        } else {
          (result[spanBIdx] as IchimokuPoint).spanB = spanB;
        }
      }
    }

    // Chikou Span: current close plotted displacement bars in the past
    if (i >= displacement) {
      const chikouIdx = i - displacement;
      if (result[chikouIdx] === null) {
        result[chikouIdx] = { tenkan: 0, kijun: 0, spanA: 0, spanB: 0, chikou: bars[i].close };
      } else {
        (result[chikouIdx] as IchimokuPoint).chikou = bars[i].close;
      }
    }
  }

  return result;
}

const ICHIMOKU_DEF: IndicatorDef<
  { tenkanLength: number; kijunLength: number; chikouLength: number },
  IchimokuPoint | null
> = {
  meta: {
    id: 'ichimoku',
    name: 'Ichimoku Cloud',
    shortName: 'Ichimoku',
    category: 'trend',
    overlay: true,
    description:
      'A comprehensive indicator defining support/resistance, trend direction, and momentum. Tenkan (conversion) and Kijun (base) lines, Senkou Span A/B form the cloud (future projected), and Chikou (lagging) line shows the current price relative to past action.',
    params: [
      {
        key: 'tenkanLength',
        label: 'Tenkan Period',
        type: 'number',
        defaultValue: 9,
        min: 2,
        max: 100,
        description: 'Period for the conversion line',
      },
      {
        key: 'kijunLength',
        label: 'Kijun Period',
        type: 'number',
        defaultValue: 26,
        min: 2,
        max: 200,
        description: 'Period for the base line',
      },
      {
        key: 'chikouLength',
        label: 'Chikou Period',
        type: 'number',
        defaultValue: 52,
        min: 2,
        max: 200,
        description: 'Lookback period for the lagging line',
      },
    ],
  },
  defaultOptions: { tenkanLength: 9, kijunLength: 26, chikouLength: 52 },
  calculate(
    bars: BarInput[],
    options: { tenkanLength: number; kijunLength: number; chikouLength: number },
  ): (IchimokuPoint | null)[] {
    return ichimoku(bars, options.tenkanLength, options.kijunLength, options.chikouLength);
  },
};

indicatorRegistry.register(ICHIMOKU_DEF);
