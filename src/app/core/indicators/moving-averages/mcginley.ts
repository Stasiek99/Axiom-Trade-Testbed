import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

export function mcginleyDynamic(bars: BarInput[], period: number): (number | null)[] {
  const result: (number | null)[] = new Array(bars.length).fill(null);
  if (bars.length < period) return result;
  let sum = 0;
  for (let j = 0; j < period; j++) sum += bars[j].close;
  result[period - 1] = sum / period;
  const k = 0.6;
  for (let i = period; i < bars.length; i++) {
    const prev = result[i - 1] as number;
    const curr = bars[i].close;
    const denominator = k * period * Math.pow(curr / prev, 4);
    result[i] = denominator === 0 ? prev : prev + (curr - prev) / denominator;
  }
  return result;
}

const MCGINLEY_DEF: IndicatorDef<{ period: number }, number | null> = {
  meta: {
    id: 'mcginley',
    name: 'McGinley Dynamic',
    shortName: 'McGinley',
    category: 'moving-averages',
    overlay: true,
    description:
      'Self-adjusting MA that automatically speeds up or slows down based on price velocity. Uses (close/prev)^4 in the denominator to minimize lag during fast moves and smooth during slow ones.',
    params: [
      { key: 'period', label: 'Period', type: 'number', defaultValue: 14, min: 2, max: 500, description: 'Adaptation period' },
    ],
  },
  defaultOptions: { period: 14 },
  calculate(bars, options) { return mcginleyDynamic(bars, options.period); },
};
indicatorRegistry.register(MCGINLEY_DEF);
