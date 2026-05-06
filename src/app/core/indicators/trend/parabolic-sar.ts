import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

export function parabolicSar(bars: BarInput[], step: number, max: number): (number | null)[] {
  const result: (number | null)[] = new Array(bars.length).fill(null);
  if (bars.length < 2) return result;

  let isUp = bars[1].high > bars[0].high && bars[1].close > bars[0].close;
  let extremePoint = isUp ? Math.max(bars[0].high, bars[1].high) : Math.min(bars[0].low, bars[1].low);
  let sar: number;
  let af = step;

  if (isUp) {
    sar = bars[0].low;
  } else {
    sar = bars[0].high;
  }

  for (let i = 1; i < bars.length; i++) {
    if (isUp) {
      sar = sar + af * (extremePoint - sar);
      // SAR cannot be above the prior two lows for up-trend
      const priorLow = i >= 2 ? bars[i - 1].low : -Infinity;
      const priorPriorLow = i >= 3 ? bars[i - 2].low : -Infinity;
      sar = Math.min(sar, Math.min(priorLow, priorPriorLow) - 0.0001);
      sar = Math.min(sar, bars[i - 1].low - 0.0001);

      if (bars[i].low <= sar) {
        // Reverse to downtrend
        result[i] = extremePoint;
        isUp = false;
        extremePoint = bars[i].low;
        af = step;
        sar = extremePoint;
        continue;
      }

      if (bars[i].high > extremePoint) {
        extremePoint = bars[i].high;
        af = Math.min(af + step, max);
      }
    } else {
      sar = sar - af * (sar - extremePoint);
      // SAR cannot be below the prior two highs for down-trend
      const priorHigh = i >= 2 ? bars[i - 1].high : Infinity;
      const priorPriorHigh = i >= 3 ? bars[i - 2].high : Infinity;
      sar = Math.max(sar, Math.max(priorHigh, priorPriorHigh) + 0.0001);
      sar = Math.max(sar, bars[i - 1].high + 0.0001);

      if (bars[i].high >= sar) {
        // Reverse to uptrend
        result[i] = extremePoint;
        isUp = true;
        extremePoint = bars[i].high;
        af = step;
        sar = extremePoint;
        continue;
      }

      if (bars[i].low < extremePoint) {
        extremePoint = bars[i].low;
        af = Math.min(af + step, max);
      }
    }

    result[i] = sar;
  }

  return result;
}

const PSAR_DEF: IndicatorDef<{ step: number; max: number }, number | null> = {
  meta: {
    id: 'parabolic-sar',
    name: 'Parabolic SAR',
    shortName: 'ParSAR',
    category: 'trend',
    overlay: true,
    description:
      'Creates a trailing stop-loss parabola. Dots below price indicate an uptrend; dots above indicate a downtrend. The acceleration factor increases as the trend persists, tightening the stop.',
    params: [
      {
        key: 'step',
        label: 'Step',
        type: 'number',
        defaultValue: 0.02,
        min: 0.001,
        max: 0.5,
        step: 0.001,
        description: 'Acceleration factor increment',
      },
      {
        key: 'max',
        label: 'Max AF',
        type: 'number',
        defaultValue: 0.2,
        min: 0.01,
        max: 1,
        step: 0.01,
        description: 'Maximum acceleration factor',
      },
    ],
  },
  defaultOptions: { step: 0.02, max: 0.2 },
  calculate(bars: BarInput[], options: { step: number; max: number }): (number | null)[] {
    return parabolicSar(bars, options.step, options.max);
  },
};

indicatorRegistry.register(PSAR_DEF);
