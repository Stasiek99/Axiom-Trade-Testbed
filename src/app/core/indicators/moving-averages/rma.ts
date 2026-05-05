import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

export function rma(bars: BarInput[], period: number): (number | null)[] {
  const result: (number | null)[] = new Array(bars.length).fill(null);
  if (bars.length < period) return result;
  const alpha = 1 / period;
  let sum = 0;
  for (let j = 0; j < period; j++) sum += bars[j].close;
  result[period - 1] = sum / period;
  for (let i = period; i < bars.length; i++) {
    result[i] = bars[i].close * alpha + (result[i - 1] as number) * (1 - alpha);
  }
  return result;
}

const RMA_DEF: IndicatorDef<{ period: number }, number | null> = {
  meta: {
    id: 'rma',
    name: "Wilder's Smoothed Moving Average",
    shortName: 'RMA',
    category: 'moving-averages',
    overlay: true,
    description:
      "Uses Wilder's smoothing constant (alpha = 1/period), producing a slower, smoother line than EMA. Foundation for RSI, ATR, and other Wilder indicators.",
    params: [
      {
        key: 'period',
        label: 'Period',
        type: 'number',
        defaultValue: 14,
        min: 2,
        max: 500,
        description: 'Number of bars to include in the average',
      },
    ],
  },
  defaultOptions: { period: 14 },
  calculate(bars, options) {
    return rma(bars, options.period);
  },
};
indicatorRegistry.register(RMA_DEF);
