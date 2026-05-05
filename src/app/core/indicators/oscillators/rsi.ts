import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

export function rsi(bars: BarInput[], period: number): (number | null)[] {
  const result: (number | null)[] = new Array(bars.length).fill(null);
  if (bars.length < period + 1) return result;

  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const change = bars[i].close - bars[i - 1].close;
    if (change > 0) avgGain += change;
    else avgLoss -= change;
  }
  avgGain /= period;
  avgLoss /= period;
  result[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

  for (let i = period + 1; i < bars.length; i++) {
    const change = bars[i].close - bars[i - 1].close;
    const gain = Math.max(change, 0);
    const loss = Math.max(-change, 0);
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    result[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }

  return result;
}

const RSI_DEF: IndicatorDef<{ period: number }, number | null> = {
  meta: {
    id: 'rsi',
    name: 'Relative Strength Index',
    shortName: 'RSI',
    category: 'oscillators',
    overlay: false,
    description:
      'Measures momentum by comparing the magnitude of recent gains to losses. Oscillates between 0 and 100. Readings above 70 indicate overbought conditions; below 30 indicate oversold.',
    params: [
      {
        key: 'period',
        label: 'Period',
        type: 'number',
        defaultValue: 14,
        min: 2,
        max: 100,
        description: 'Number of bars used in the calculation',
      },
    ],
  },
  defaultOptions: { period: 14 },
  calculate(bars: BarInput[], options: { period: number }): (number | null)[] {
    return rsi(bars, options.period);
  },
};

indicatorRegistry.register(RSI_DEF);
