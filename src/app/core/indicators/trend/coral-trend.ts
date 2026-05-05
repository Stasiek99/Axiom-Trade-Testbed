import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

function emaArray(values: number[], period: number): number[] {
  const result: number[] = new Array(values.length).fill(0);
  if (values.length < period) return result;
  const k = 2 / (period + 1);
  let sum = 0;
  for (let j = 0; j < period; j++) sum += values[j];
  result[period - 1] = sum / period;
  for (let i = period; i < values.length; i++) {
    result[i] = values[i] * k + result[i - 1] * (1 - k);
  }
  return result;
}

export function coralTrend(bars: BarInput[], period: number, cd: number): (number | null)[] {
  const result: (number | null)[] = new Array(bars.length).fill(null);
  if (bars.length < period * 4) return result;

  const closes = bars.map(b => b.close);

  const i1 = emaArray(closes, period);
  const i2 = emaArray(i1, period);
  const i3 = emaArray(i2, period);
  const i4 = emaArray(i3, period);

  for (let i = period * 4 - 4; i < bars.length; i++) {
    const v1 = 2 * i1[i] - i2[i];
    const v2 = 2 * i2[i] - i3[i];
    const v3 = 2 * i3[i] - i4[i];

    result[i] = v1 + cd * (v1 - v2) + cd * cd * (v2 - v3);
  }

  return result;
}

const CORAL_DEF: IndicatorDef<{ period: number; cd: number }, number | null> = {
  meta: {
    id: 'coral-trend',
    name: 'Coral Trend',
    shortName: 'Coral',
    category: 'trend',
    overlay: true,
    description:
      'A cascaded EMA filter that produces a smooth trend line with reduced lag. The cd parameter controls the smoothing cascade depth. Changes colour when trend direction reverses.',
    params: [
      {
        key: 'period',
        label: 'Period',
        type: 'number',
        defaultValue: 21,
        min: 2,
        max: 200,
        description: 'EMA period for the cascade',
      },
      {
        key: 'cd',
        label: 'Smoothing Factor',
        type: 'number',
        defaultValue: 0.4,
        min: 0.01,
        max: 1,
        step: 0.01,
        description: 'Cascade depth factor',
      },
    ],
  },
  defaultOptions: { period: 21, cd: 0.4 },
  calculate(bars: BarInput[], options: { period: number; cd: number }): (number | null)[] {
    return coralTrend(bars, options.period, options.cd);
  },
};

indicatorRegistry.register(CORAL_DEF);