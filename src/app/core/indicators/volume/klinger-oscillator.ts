import type { BarInput, IndicatorDef, TwoLinePoint } from '../types';
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
 * Klinger Oscillator (KVO).
 *
 * Measures volume money flow by comparing volume flowing in (up days)
 * vs volume flowing out (down days), smoothed with short/long EMAs.
 *
 *   Trend = (high + low + close) vs previous (high + low + close)
 *   DM = high - low (daily measurement)
 *   VF[i] = volume[i] × (2 × (DM[i] / sum(DM, short) - 1))  ... simplified
 *
 * Common simplified approach:
 *   SVF = sign(trend) × DM × volume
 *   KVO = EMA(short, SVF) - EMA(long, SVF)
 */
export function klingerOscillator(
  bars: BarInput[],
  shortLength: number,
  longLength: number,
  signalLength: number,
): (TwoLinePoint | null)[] {
  const result: (TwoLinePoint | null)[] = new Array(bars.length).fill(null);
  if (bars.length < Math.max(shortLength, longLength)) return result;

  // Step 1: cumulative SVF (Signed Volume Force)
  const svf: number[] = new Array(bars.length).fill(0);
  for (let i = 1; i < bars.length; i++) {
    const dm = bars[i].high - bars[i].low;
    const currHLC = bars[i].high + bars[i].low + bars[i].close;
    const prevHLC = bars[i - 1].high + bars[i - 1].low + bars[i - 1].close;
    // +1 when current HLC >= previous HLC (up trend), -1 when lower (down trend)
    svf[i] = dm * (bars[i].volume ?? 0) * (currHLC >= prevHLC ? 1 : -1);
  }

  const shortEMA = ema(svf, shortLength);
  const longEMA = ema(svf, longLength);

  // KVO = shortEMA - longEMA
  const kvo: (number | null)[] = new Array(bars.length).fill(null);
  for (let i = 0; i < bars.length; i++) {
    const s = shortEMA[i];
    const l = longEMA[i];
    if (s !== null && l !== null) {
      kvo[i] = s - l;
    }
  }

  // Signal = EMA(signalLength, KVO)
  const kvoNum = kvo.map(v => v ?? 0);
  const signal = ema(kvoNum, signalLength);

  for (let i = 0; i < bars.length; i++) {
    if (kvo[i] !== null && signal[i] !== null) {
      result[i] = { line1: kvo[i] as number, line2: signal[i] as number };
    }
  }

  return result;
}

const KLINGER_OSCILLATOR_DEF: IndicatorDef<
  { shortLength: number; longLength: number; signalLength: number },
  TwoLinePoint | null
> = {
  meta: {
    id: 'klinger-oscillator',
    name: 'Klinger Oscillator',
    shortName: 'KVO',
    category: 'volume',
    overlay: false,
    description:
      'Volume-based momentum indicator that compares volume flowing in and out of an asset. The KVO line crossing above/below the signal line generates trade signals. Useful for confirming trends and spotting divergences.',
    params: [
      {
        key: 'shortLength',
        label: 'Short EMA Period',
        type: 'number',
        defaultValue: 34,
        min: 2,
        max: 100,
        description: 'Fast EMA period for volume force',
      },
      {
        key: 'longLength',
        label: 'Long EMA Period',
        type: 'number',
        defaultValue: 55,
        min: 2,
        max: 200,
        description: 'Slow EMA period for volume force',
      },
      {
        key: 'signalLength',
        label: 'Signal EMA Period',
        type: 'number',
        defaultValue: 13,
        min: 2,
        max: 50,
        description: 'Signal line EMA period',
      },
    ],
  },
  defaultOptions: { shortLength: 34, longLength: 55, signalLength: 13 },
  calculate(bars, options) {
    return klingerOscillator(
      bars,
      options.shortLength,
      options.longLength,
      options.signalLength,
    );
  },
};

indicatorRegistry.register(KLINGER_OSCILLATOR_DEF);
