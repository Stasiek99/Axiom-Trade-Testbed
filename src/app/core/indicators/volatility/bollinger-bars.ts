import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

/** Zone classification for BollingerBars */
export interface BollingerBarPoint {
  /** Raw close price */
  close: number;
  /** Bollinger Band middle (SMA) */
  middle: number;
  /** Bollinger Band upper */
  upper: number;
  /** Bollinger Band lower */
  lower: number;
  /**
   * Zone the close falls in:
   *   2  = above upper band
   *   1  = between middle and upper
   *   0  = at middle (±0.01%)
   *  -1  = between middle and lower
   *  -2  = below lower band
   */
  zone: -2 | -1 | 0 | 1 | 2;
}

export function bollingerBars(
  bars: BarInput[],
  length: number,
  mult: number,
): (BollingerBarPoint | null)[] {
  const result: (BollingerBarPoint | null)[] = new Array(bars.length).fill(null);
  if (bars.length < length) return result;

  for (let i = length - 1; i < bars.length; i++) {
    // SMA
    let sum = 0;
    for (let j = i - length + 1; j <= i; j++) sum += bars[j].close;
    const mean = sum / length;

    // Standard deviation
    let sumSq = 0;
    for (let j = i - length + 1; j <= i; j++) {
      const diff = bars[j].close - mean;
      sumSq += diff * diff;
    }
    const stdDev = Math.sqrt(sumSq / length);

    const upper = mean + mult * stdDev;
    const lower = mean - mult * stdDev;
    const close = bars[i].close;

    let zone: -2 | -1 | 0 | 1 | 2;
    if (close > upper) zone = 2;
    else if (close < lower) zone = -2;
    else if (close > mean) zone = 1;
    else if (close < mean) zone = -1;
    else zone = 0;

    result[i] = { close, middle: mean, upper, lower, zone };
  }

  return result;
}

const BOLLINGERBARS_DEF: IndicatorDef<{ length: number; mult: number }, BollingerBarPoint | null> = {
  meta: {
    id: 'bollinger-bars',
    name: 'Bollinger Bars',
    shortName: 'BBars',
    category: 'volatility',
    overlay: true,
    description:
      'Colour-codes each candle by its position within Bollinger Bands. Zone 2 = above upper (overbought), 1 = upper half, 0 = at middle, -1 = lower half, -2 = below lower (oversold).',
    params: [
      { key: 'length', label: 'Length', type: 'number', defaultValue: 20, min: 2, max: 200, description: 'SMA period' },
      { key: 'mult', label: 'Multiplier', type: 'number', defaultValue: 2, min: 0.5, max: 5, step: 0.1, description: 'Standard deviation multiplier' },
    ],
  },
  defaultOptions: { length: 20, mult: 2 },
  calculate(bars, options) { return bollingerBars(bars, options.length, options.mult); },
};

indicatorRegistry.register(BOLLINGERBARS_DEF);
