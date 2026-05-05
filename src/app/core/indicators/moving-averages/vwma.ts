import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

export function vwma(bars: BarInput[], period: number): (number | null)[] {
  const result: (number | null)[] = new Array(bars.length).fill(null);
  if (bars.length < period) return result;
  for (let i = period - 1; i < bars.length; i++) {
    let sumPV = 0;
    let sumV = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const vol = bars[j].volume ?? 1;
      sumPV += bars[j].close * vol;
      sumV += vol;
    }
    if (sumV !== 0) result[i] = sumPV / sumV;
  }
  return result;
}

const VWMA_DEF: IndicatorDef<{ period: number }, number | null> = {
  meta: {
    id: 'vwma',
    name: 'Volume Weighted Moving Average',
    shortName: 'VWMA',
    category: 'moving-averages',
    overlay: true,
    description:
      'Weights each bar by its trading volume before averaging. Gives higher influence to bars with large volume, making the MA more responsive to high-conviction price moves. Falls back to unit volume when volume data is absent.',
    params: [
      { key: 'period', label: 'Period', type: 'number', defaultValue: 20, min: 2, max: 500, description: 'Lookback period' },
    ],
  },
  defaultOptions: { period: 20 },
  calculate(bars, options) { return vwma(bars, options.period); },
};
indicatorRegistry.register(VWMA_DEF);
