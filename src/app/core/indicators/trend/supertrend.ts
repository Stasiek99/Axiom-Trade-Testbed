import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

export function supertrend(bars: BarInput[], period: number, multiplier: number): (number | null)[] {
  const result: (number | null)[] = new Array(bars.length).fill(null);
  if (bars.length < period + 1) return result;

  const atr = calculateATR(bars, period);
  const trend: boolean[] = new Array(bars.length).fill(true);
  const upperBand: number[] = new Array(bars.length).fill(0);
  const lowerBand: number[] = new Array(bars.length).fill(0);

  for (let i = period - 1; i < bars.length; i++) {
    const hl2 = (bars[i].high + bars[i].low) / 2;
    upperBand[i] = hl2 + multiplier * atr[i];
    lowerBand[i] = hl2 - multiplier * atr[i];
  }

  for (let i = period; i < bars.length; i++) {
    if (bars[i].close <= upperBand[i - 1]) {
      trend[i] = false;
    } else {
      trend[i] = true;
    }

    if (trend[i]) {
      upperBand[i] = Math.max(upperBand[i], upperBand[i - 1]);
      lowerBand[i] = lowerBand[i - 1];
    } else {
      lowerBand[i] = Math.min(lowerBand[i], lowerBand[i - 1]);
      upperBand[i] = upperBand[i - 1];
    }

    result[i] = trend[i] ? lowerBand[i] : upperBand[i];
  }

  return result;
}

function calculateATR(bars: BarInput[], period: number): number[] {
  const tr: number[] = new Array(bars.length).fill(0);
  for (let i = 1; i < bars.length; i++) {
    tr[i] = Math.max(
      bars[i].high - bars[i].low,
      Math.abs(bars[i].high - bars[i - 1].close),
      Math.abs(bars[i].low - bars[i - 1].close),
    );
  }

  const atr: number[] = new Array(bars.length).fill(0);
  let sum = 0;
  for (let i = 1; i <= period; i++) sum += tr[i];
  atr[period] = sum / period;

  for (let i = period + 1; i < bars.length; i++) {
    atr[i] = (atr[i - 1] * (period - 1) + tr[i]) / period;
  }

  return atr;
}

const SUPERTREND_DEF: IndicatorDef<{ period: number; multiplier: number }, number | null> = {
  meta: {
    id: 'supertrend',
    name: 'Supertrend',
    shortName: 'Supertrend',
    category: 'trend',
    overlay: true,
    description:
      'ATR-based trailing stop indicator. Plots a line below price during uptrends and above price during downtrends. Changes colour when the trend reverses.',
    params: [
      {
        key: 'period',
        label: 'ATR Period',
        type: 'number',
        defaultValue: 10,
        min: 2,
        max: 100,
        description: 'Period for ATR calculation',
      },
      {
        key: 'multiplier',
        label: 'Multiplier',
        type: 'number',
        defaultValue: 3,
        min: 0.5,
        max: 10,
        step: 0.1,
        description: 'ATR multiplier',
      },
    ],
  },
  defaultOptions: { period: 10, multiplier: 3 },
  calculate(bars: BarInput[], options: { period: number; multiplier: number }): (number | null)[] {
    return supertrend(bars, options.period, options.multiplier);
  },
};

indicatorRegistry.register(SUPERTREND_DEF);
