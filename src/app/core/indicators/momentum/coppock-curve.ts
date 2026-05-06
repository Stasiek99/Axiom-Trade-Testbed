import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

function wmaOfValues(values: (number | null)[], period: number): (number | null)[] {
  const result: (number | null)[] = new Array(values.length).fill(null);
  if (values.length < period) return result;
  const denominator = (period * (period + 1)) / 2;
  for (let i = period - 1; i < values.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      const v = values[i - period + 1 + j];
      if (v === null) { sum = -1; break; }
      sum += v * (j + 1);
    }
    if (sum === -1) continue;
    result[i] = sum / denominator;
  }
  return result;
}

/**
 * Coppock Curve (also known as the "Coppock Guide").
 *
 * 1. Compute ROC(roc1Length) and ROC(roc2Length) on close.
 * 2. Sum the two ROC series.
 * 3. Apply a WMA(wmaLength) to the summed series.
 *
 * Designed to identify long-term buying opportunities in stock indices.
 */
export function coppockCurve(
  bars: BarInput[],
  wmaLength: number,
  roc1Length: number,
  roc2Length: number,
): (number | null)[] {
  const closes = bars.map(b => b.close);
  const roc1: (number | null)[] = new Array(bars.length).fill(null);
  const roc2: (number | null)[] = new Array(bars.length).fill(null);

  for (let i = roc1Length; i < bars.length; i++) {
    const prev1 = closes[i - roc1Length];
    roc1[i] = prev1 !== 0 ? ((closes[i] - prev1) / prev1) * 100 : null;
  }
  for (let i = roc2Length; i < bars.length; i++) {
    const prev2 = closes[i - roc2Length];
    roc2[i] = prev2 !== 0 ? ((closes[i] - prev2) / prev2) * 100 : null;
  }

  const summed: (number | null)[] = bars.map((_, i) => {
    if (roc1[i] === null || roc2[i] === null) return null;
    return roc1[i]! + roc2[i]!;
  });

  return wmaOfValues(summed, wmaLength);
}

const COPPOCK_DEF: IndicatorDef<
  { wmaLength: number; roc1Length: number; roc2Length: number },
  number | null
> = {
  meta: {
    id: 'coppock-curve',
    name: 'Coppock Curve',
    shortName: 'Coppock',
    category: 'momentum',
    overlay: false,
    description:
      'A long-term momentum indicator that sums two ROC values and smooths the result with a WMA. Designed to identify buying opportunities at the end of bear markets.',
    params: [
      {
        key: 'wmaLength',
        label: 'WMA Period',
        type: 'number',
        defaultValue: 10,
        min: 2,
        max: 50,
        description: 'Period for the WMA smoothing',
      },
      {
        key: 'roc1Length',
        label: 'ROC 1 Period',
        type: 'number',
        defaultValue: 14,
        min: 2,
        max: 50,
        description: 'First ROC lookback period',
      },
      {
        key: 'roc2Length',
        label: 'ROC 2 Period',
        type: 'number',
        defaultValue: 11,
        min: 2,
        max: 50,
        description: 'Second ROC lookback period',
      },
    ],
  },
  defaultOptions: { wmaLength: 10, roc1Length: 14, roc2Length: 11 },
  calculate(bars, options) {
    return coppockCurve(bars, options.wmaLength, options.roc1Length, options.roc2Length);
  },
};

indicatorRegistry.register(COPPOCK_DEF);
