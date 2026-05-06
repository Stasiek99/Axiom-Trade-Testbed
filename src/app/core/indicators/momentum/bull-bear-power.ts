import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

function ema(values: number[], period: number): (number | null)[] {
  const result: (number | null)[] = new Array(values.length).fill(null);
  if (values.length < period) return result;
  const k = 2 / (period + 1);
  let sum = 0;
  for (let j = 0; j < period; j++) sum += values[j];
  result[period - 1] = sum / period;
  for (let i = period; i < values.length; i++) {
    result[i] = values[i] * k + (result[i - 1] as number) * (1 - k);
  }
  return result;
}

/**
 * Bull/Bear Power by Dr. Alexander Elder.
 *
 * BullPower = high - EMA(close, length)
 * BearPower = low - EMA(close, length)
 *
 * BullPower > 0 → bulls are in control.
 * BearPower > 0 → bears are in control.
 * When both are < 0 the trend may be weakening.
 *
 * Returns the spread: BullPower - BearPower as a single line.
 */
export function bullBearPower(
  bars: BarInput[],
  length: number,
): (number | null)[] {
  const closes = bars.map(b => b.close);
  const emaLine = ema(closes, length);

  return bars.map((b, i) => {
    const e = emaLine[i];
    if (e === null) return null;
    const bull = b.high - e;
    const bear = b.low - e;
    return bull - bear;
  });
}

const BULL_BEAR_DEF: IndicatorDef<{ length: number }, number | null> = {
  meta: {
    id: 'bull-bear-power',
    name: 'Bull/Bear Power',
    shortName: 'BBP',
    category: 'momentum',
    overlay: false,
    description:
      'Measures the strength of bulls (high − EMA) and bears (low − EMA). The output line represents bull power minus bear power. Positive values suggest bullish dominance; negative values suggest bearish dominance.',
    params: [
      {
        key: 'length',
        label: 'EMA Period',
        type: 'number',
        defaultValue: 13,
        min: 2,
        max: 100,
        description: 'Number of bars for the EMA calculation',
      },
    ],
  },
  defaultOptions: { length: 13 },
  calculate(bars, options) {
    return bullBearPower(bars, options.length);
  },
};

indicatorRegistry.register(BULL_BEAR_DEF);
