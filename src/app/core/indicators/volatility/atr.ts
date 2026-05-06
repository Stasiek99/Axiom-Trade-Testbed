import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

export function atr(bars: BarInput[], length: number): (number | null)[] {
  const result: (number | null)[] = new Array(bars.length).fill(null);
  if (bars.length < length + 1) return result;

  // First TR
  const trValues: number[] = new Array(bars.length);
  for (let i = 1; i < bars.length; i++) {
    const high = bars[i].high;
    const low = bars[i].low;
    const prevClose = bars[i - 1].close;
    trValues[i] = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose),
    );
  }

  // First ATR = SMA of first `length` TR values
  let sum = 0;
  for (let j = 1; j <= length; j++) sum += trValues[j];
  result[length] = sum / length;

  // Wilder's smoothing thereafter
  const k = 1 / length;
  for (let i = length + 1; i < bars.length; i++) {
    result[i] = trValues[i] * k + (result[i - 1] as number) * (1 - k);
  }

  return result;
}

const ATR_DEF: IndicatorDef<{ length: number }, number | null> = {
  meta: {
    id: 'atr',
    name: 'Average True Range',
    shortName: 'ATR',
    category: 'volatility',
    overlay: true,
    description:
      'Measures market volatility by decomposing the entire range of a bar. Uses Wilder\'s smoothing (RMA) of True Range values. Higher values indicate higher volatility.',
    params: [
      { key: 'length', label: 'Length', type: 'number', defaultValue: 14, min: 2, max: 200, description: 'Smoothing period' },
    ],
  },
  defaultOptions: { length: 14 },
  calculate(bars, options) { return atr(bars, options.length); },
};

indicatorRegistry.register(ATR_DEF);
