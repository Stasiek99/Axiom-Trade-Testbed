import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

/**
 * Simple Momentum: close[i] - close[i - length].
 * Positive values indicate upward momentum, negative values indicate downward.
 */
export function momentum(
  bars: BarInput[],
  length: number,
): (number | null)[] {
  const result: (number | null)[] = new Array(bars.length).fill(null);
  if (bars.length <= length) return result;
  for (let i = length; i < bars.length; i++) {
    result[i] = bars[i].close - bars[i - length].close;
  }
  return result;
}

const MOMENTUM_DEF: IndicatorDef<{ length: number }, number | null> = {
  meta: {
    id: 'momentum',
    name: 'Momentum',
    shortName: 'Mom',
    category: 'momentum',
    overlay: false,
    description:
      'Measures the rate of price change by subtracting the close N bars ago from the current close. Positive values indicate upward momentum, negative values indicate downward momentum.',
    params: [
      {
        key: 'length',
        label: 'Length',
        type: 'number',
        defaultValue: 10,
        min: 1,
        max: 200,
        description: 'Number of bars for the lookback period',
      },
    ],
  },
  defaultOptions: { length: 10 },
  calculate(bars, options) {
    return momentum(bars, options.length);
  },
};

indicatorRegistry.register(MOMENTUM_DEF);
