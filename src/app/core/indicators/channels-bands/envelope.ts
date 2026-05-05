import type { BarInput, IndicatorDef, ThreeBandPoint } from '../types';
import { indicatorRegistry } from '../registry';

export function envelope(
  bars: BarInput[],
  length: number,
  percent: number,
): (ThreeBandPoint | null)[] {
  const result: (ThreeBandPoint | null)[] = new Array(bars.length).fill(null);
  if (bars.length < length) return result;

  for (let i = length - 1; i < bars.length; i++) {
    let sum = 0;
    for (let j = i - length + 1; j <= i; j++) sum += bars[j].close;
    const mean = sum / length;

    result[i] = {
      upper: mean * (1 + percent),
      middle: mean,
      lower: mean * (1 - percent),
    };
  }

  return result;
}

const ENVELOPE_DEF: IndicatorDef<{ length: number; percent: number }, ThreeBandPoint | null> = {
  meta: {
    id: 'envelope',
    name: 'Envelope',
    shortName: 'Env',
    category: 'channels-bands',
    overlay: true,
    description:
      'Percentage-based channel formed by a moving average shifted up and down by a fixed percentage. Useful for identifying overbought and oversold levels in trending markets.',
    params: [
      { key: 'length', label: 'Length', type: 'number', defaultValue: 20, min: 2, max: 200, description: 'MA period' },
      { key: 'percent', label: 'Percentage', type: 'number', defaultValue: 0.1, min: 0, max: 1, step: 0.01, description: 'Band offset as decimal (0.1 = ±10%)' },
    ],
  },
  defaultOptions: { length: 20, percent: 0.1 },
  calculate(bars, options) { return envelope(bars, options.length, options.percent); },
};

indicatorRegistry.register(ENVELOPE_DEF);
