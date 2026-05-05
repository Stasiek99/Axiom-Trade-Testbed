import type { BarInput, IndicatorDef, ImpulseMACDPoint } from '../types';
import { indicatorRegistry } from '../registry';

function zlema(values: number[], period: number): (number | null)[] {
  // Zero-Lag EMA: applies EMA to (close + (close - close[lag]), where lag = (period - 1) / 2
  const result: (number | null)[] = new Array(values.length).fill(null);
  if (values.length < period) return result;
  const lag = Math.floor((period - 1) / 2);
  const k = 2 / (period + 1);

  // Build ZLEMA source
  const zlSrc: number[] = new Array(values.length);
  for (let i = 0; i < values.length; i++) {
    const prevIdx = i - lag;
    zlSrc[i] = prevIdx >= 0
      ? values[i] + (values[i] - values[prevIdx])
      : values[i];
  }

  let sum = 0;
  for (let j = 0; j < period; j++) sum += zlSrc[j];
  result[period - 1] = sum / period;
  for (let i = period; i < values.length; i++) {
    result[i] = zlSrc[i] * k + (result[i - 1] as number) * (1 - k);
  }
  return result;
}

function smma(values: number[], period: number): (number | null)[] {
  // Smoothed Moving Average (same as RMA / Wilder's)
  const result: (number | null)[] = new Array(values.length).fill(null);
  if (values.length < period) return result;
  let sum = 0;
  for (let j = 0; j < period; j++) sum += values[j];
  result[period - 1] = sum / period;
  for (let i = period; i < values.length; i++) {
    result[i] = (result[i - 1] as number * (period - 1) + values[i]) / period;
  }
  return result;
}

function smmaOfValues(
  values: (number | null)[],
  period: number,
): (number | null)[] {
  const result: (number | null)[] = new Array(values.length).fill(null);
  let startIdx = -1;
  for (let i = 0; i <= values.length - period; i++) {
    let allNonNull = true;
    for (let j = i; j < i + period; j++) {
      if (values[j] === null) { allNonNull = false; break; }
    }
    if (allNonNull) { startIdx = i; break; }
  }
  if (startIdx === -1) return result;
  let sum = 0;
  for (let j = startIdx; j < startIdx + period; j++) sum += values[j] as number;
  result[startIdx + period - 1] = sum / period;
  for (let i = startIdx + period; i < values.length; i++) {
    result[i] = values[i] !== null
      ? ((result[i - 1] as number) * (period - 1) + (values[i] as number)) / period
      : null;
  }
  return result;
}

/**
 * Impulse MACD — uses ZLEMA as the fast line and SMMA as the slow line.
 *
 * Impulse = ZLEMA(close, lengthMA) − SMMA(close, lengthMA)
 * Signal  = SMMA(impulse, lengthSignal)
 *
 * Direction determines histogram colour:
 *   1  = impulse above signal AND impulse above 0  (strong bull)
 *   0  = neutral / no clear direction
 *  -1  = impulse below signal AND impulse below 0 (strong bear)
 */
export function impulseMACD(
  bars: BarInput[],
  lengthMA: number,
  lengthSignal: number,
): (ImpulseMACDPoint | null)[] {
  const closes = bars.map(b => b.close);
  const zlemaLine = zlema(closes, lengthMA);
  const smmaLine = smma(closes, lengthMA);

  const impulse: (number | null)[] = bars.map((_, i) => {
    const z = zlemaLine[i];
    const s = smmaLine[i];
    if (z === null || s === null) return null;
    return z - s;
  });

  const signal = smmaOfValues(impulse, lengthSignal);

  return bars.map((_, i) => {
    const imp = impulse[i];
    const sig = signal[i];
    if (imp === null || sig === null) return null;
    let direction: 1 | -1 | 0 = 0;
    if (imp > sig && imp > 0) direction = 1;
    else if (imp < sig && imp < 0) direction = -1;
    return { impulse: imp, signal: sig, direction };
  });
}

const IMPULSE_MACD_DEF: IndicatorDef<
  { lengthMA: number; lengthSignal: number },
  ImpulseMACDPoint | null
> = {
  meta: {
    id: 'impulse-macd',
    name: 'Impulse MACD',
    shortName: 'ImpMACD',
    category: 'momentum',
    overlay: false,
    description:
      'Uses Zero-Lag EMA (ZLEMA) minus Smoothed MA (SMMA) to create an impulse line with reduced lag. The signal line is an SMMA of the impulse. Direction identifies bullish/bearish momentum.',
    params: [
      {
        key: 'lengthMA',
        label: 'MA Period',
        type: 'number',
        defaultValue: 34,
        min: 2,
        max: 100,
        description: 'Period for both ZLEMA and SMMA',
      },
      {
        key: 'lengthSignal',
        label: 'Signal Period',
        type: 'number',
        defaultValue: 9,
        min: 2,
        max: 50,
        description: 'Period for the signal line SMMA',
      },
    ],
  },
  defaultOptions: { lengthMA: 34, lengthSignal: 9 },
  calculate(bars, options) {
    return impulseMACD(bars, options.lengthMA, options.lengthSignal);
  },
};

indicatorRegistry.register(IMPULSE_MACD_DEF);
