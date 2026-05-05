import type { BarInput, IndicatorDef, ThreeBandPoint } from '../types';
import { indicatorRegistry } from '../registry';

export function keltnerChannels(
  bars: BarInput[],
  length: number,
  mult: number,
): (ThreeBandPoint | null)[] {
  const result: (ThreeBandPoint | null)[] = new Array(bars.length).fill(null);
  if (bars.length < length + 1) return result;

  // EMA
  const k = 2 / (length + 1);
  const ema: (number | null)[] = new Array(bars.length).fill(null);
  {
    let sum = 0;
    for (let j = 0; j < length; j++) sum += bars[j].close;
    ema[length - 1] = sum / length;
    for (let i = length; i < bars.length; i++) {
      ema[i] = bars[i].close * k + (ema[i - 1] as number) * (1 - k);
    }
  }

  // ATR (Wilder's smoothing)
  const atr: (number | null)[] = new Array(bars.length).fill(null);
  {
    const tr: number[] = new Array(bars.length);
    for (let i = 1; i < bars.length; i++) {
      tr[i] = Math.max(
        bars[i].high - bars[i].low,
        Math.abs(bars[i].high - bars[i - 1].close),
        Math.abs(bars[i].low - bars[i - 1].close),
      );
    }
    let sumTr = 0;
    for (let j = 1; j <= length; j++) sumTr += tr[j];
    atr[length] = sumTr / length;
    const r = 1 / length;
    for (let i = length + 1; i < bars.length; i++) {
      atr[i] = tr[i] * r + (atr[i - 1] as number) * (1 - r);
    }
  }

  for (let i = 0; i < bars.length; i++) {
    if (ema[i] !== null && atr[i] !== null) {
      const e = ema[i] as number;
      const a = atr[i] as number;
      result[i] = { upper: e + mult * a, middle: e, lower: e - mult * a };
    }
  }

  return result;
}

const KELTNER_DEF: IndicatorDef<{ length: number; mult: number }, ThreeBandPoint | null> = {
  meta: {
    id: 'keltner-channels',
    name: 'Keltner Channels',
    shortName: 'KC',
    category: 'channels-bands',
    overlay: true,
    description:
      'Volatility-based envelope using EMA as the centreline and ATR to determine band width. Bands expand during high volatility and contract during low volatility. Often used with Bollinger Bands to detect squeezes.',
    params: [
      { key: 'length', label: 'Length', type: 'number', defaultValue: 20, min: 2, max: 200, description: 'EMA and ATR period' },
      { key: 'mult', label: 'Multiplier', type: 'number', defaultValue: 2, min: 0.5, max: 5, step: 0.1, description: 'ATR multiplier' },
    ],
  },
  defaultOptions: { length: 20, mult: 2 },
  calculate(bars, options) { return keltnerChannels(bars, options.length, options.mult); },
};

indicatorRegistry.register(KELTNER_DEF);
