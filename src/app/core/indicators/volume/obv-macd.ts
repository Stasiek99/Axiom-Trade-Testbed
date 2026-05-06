import type { BarInput, IndicatorDef, MACDPoint } from '../types';
import { indicatorRegistry } from '../registry';

/**
 * OBV-MACD: MACD applied to On Balance Volume.
 *
 * First calculates OBV, then computes MACD(12, 26, 9) on the OBV series.
 * Returns MACD line, Signal line, and Histogram.
 */
export function obvMACD(bars: BarInput[]): (MACDPoint | null)[] {
  // Step 1: calculate OBV
  const obvValues: (number | null)[] = new Array(bars.length).fill(null);
  if (bars.length === 0) return [];
  obvValues[0] = 0;
  for (let i = 1; i < bars.length; i++) {
    const vol = bars[i].volume ?? 0;
    const prev = obvValues[i - 1] as number;
    if (bars[i].close > bars[i - 1].close) obvValues[i] = prev + vol;
    else if (bars[i].close < bars[i - 1].close) obvValues[i] = prev - vol;
    else obvValues[i] = prev;
  }

  // Step 2: MACD on OBV
  const fastLength = 12;
  const slowLength = 26;
  const signalLength = 9;

  const result: (MACDPoint | null)[] = new Array(bars.length).fill(null);
  if (bars.length < slowLength) return result;

  // Helper EMA
  function emaSeries(values: number[], period: number): (number | null)[] {
    const r: (number | null)[] = new Array(values.length).fill(null);
    if (values.length < period) return r;
    const k = 2 / (period + 1);
    let sum = 0;
    for (let j = 0; j < period; j++) sum += values[j];
    r[period - 1] = sum / period;
    for (let i = period; i < values.length; i++) {
      r[i] = values[i] * k + (r[i - 1] as number) * (1 - k);
    }
    return r;
  }

  const obvClean = obvValues.map(v => v ?? 0);
  const fastEMA = emaSeries(obvClean, fastLength);
  const slowEMA = emaSeries(obvClean, slowLength);

  // MACD line = fastEMA - slowEMA
  const macdLine: (number | null)[] = new Array(bars.length).fill(null);
  for (let i = 0; i < bars.length; i++) {
    if (fastEMA[i] !== null && slowEMA[i] !== null) {
      macdLine[i] = fastEMA[i]! - slowEMA[i]!;
    }
  }

  // Signal line = EMA of MACD line
  const macdClean = macdLine.map(v => v ?? 0);
  const signalLine = emaSeries(macdClean, signalLength);

  for (let i = 0; i < bars.length; i++) {
    if (macdLine[i] !== null && signalLine[i] !== null) {
      const macd = macdLine[i] as number;
      const signal = signalLine[i] as number;
      result[i] = {
        macd,
        signal,
        histogram: macd - signal,
      };
    }
  }

  return result;
}

const OBV_MACD_DEF: IndicatorDef<Record<string, never>, MACDPoint | null> = {
  meta: {
    id: 'obv-macd',
    name: 'OBV-MACD',
    shortName: 'OBVMACD',
    category: 'volume',
    overlay: false,
    description:
      'Applies MACD (12, 26, 9) to the On Balance Volume (OBV) line. Combines the volume accumulation insights of OBV with the signal-generation power of MACD. Useful for identifying volume-driven momentum shifts.',
    params: [],
  },
  defaultOptions: {},
  calculate(bars) {
    return obvMACD(bars);
  },
};

indicatorRegistry.register(OBV_MACD_DEF);
