import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

export function ema(bars: BarInput[], period: number): (number | null)[] {
  const result: (number | null)[] = new Array(bars.length).fill(null);
  if (bars.length < period) return result;

  const k = 2 / (period + 1);
  let sum = 0;
  for (let j = 0; j < period; j++) {
    sum += bars[j].close;
  }
  result[period - 1] = sum / period;

  for (let i = period; i < bars.length; i++) {
    result[i] = bars[i].close * k + (result[i - 1] as number) * (1 - k);
  }
  return result;
}

const EMA_DEF: IndicatorDef<{ period: number }, number | null> = {
  meta: {
    id: 'ema',
    name: 'Exponential Moving Average',
    shortName: 'EMA',
    category: 'moving-averages',
    overlay: true,
    description:
      'Weights recent prices more heavily than older ones using an exponential multiplier. Reacts faster to price changes than SMA, making it better for short-term trend following.',
    params: [
      {
        key: 'period',
        label: 'Period',
        type: 'number',
        defaultValue: 14,
        min: 2,
        max: 500,
        description: 'Number of bars used in the exponential smoothing',
      },
    ],
  },
  defaultOptions: { period: 14 },
  calculate(bars: BarInput[], options: { period: number }): (number | null)[] {
    return ema(bars, options.period);
  },
};

indicatorRegistry.register(EMA_DEF);
