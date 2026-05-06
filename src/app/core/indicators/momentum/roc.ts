import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

/**
 * Rate of Change (%): ((close[i] - close[i - length]) / close[i - length]) * 100.
 * Measures the percentage change in price over the lookback period.
 */
export function roc(
  bars: BarInput[],
  length: number,
): (number | null)[] {
  const result: (number | null)[] = new Array(bars.length).fill(null);
  if (bars.length <= length) return result;
  for (let i = length; i < bars.length; i++) {
    const prev = bars[i - length].close;
    if (prev === 0) {
      result[i] = null;
    } else {
      result[i] = ((bars[i].close - prev) / prev) * 100;
    }
  }
  return result;
}

const ROC_DEF: IndicatorDef<{ length: number }, number | null> = {
  meta: {
    id: 'roc',
    name: 'Rate of Change',
    shortName: 'ROC',
    category: 'momentum',
    overlay: false,
    description:
      'Calculates the percentage change in price over a specified lookback period. Values above zero indicate upward momentum, below zero indicate downward momentum.',
    params: [
      {
        key: 'length',
        label: 'Length',
        type: 'number',
        defaultValue: 12,
        min: 1,
        max: 200,
        description: 'Number of bars for the lookback period',
      },
    ],
  },
  defaultOptions: { length: 12 },
  calculate(bars, options) {
    return roc(bars, options.length);
  },
};

indicatorRegistry.register(ROC_DEF);
