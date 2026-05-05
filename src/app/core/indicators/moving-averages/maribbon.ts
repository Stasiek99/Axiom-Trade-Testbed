import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

const RIBBON_PERIODS = [10, 20, 30, 40, 50, 60, 70, 80] as const;

function emaLocal(bars: BarInput[], period: number): (number | null)[] {
  const result: (number | null)[] = new Array(bars.length).fill(null);
  if (bars.length < period) return result;
  const k = 2 / (period + 1);
  let sum = 0;
  for (let j = 0; j < period; j++) sum += bars[j].close;
  result[period - 1] = sum / period;
  for (let i = period; i < bars.length; i++) {
    result[i] = bars[i].close * k + (result[i - 1] as number) * (1 - k);
  }
  return result;
}

export function maribbon(bars: BarInput[]): (number[] | null)[] {
  const result: (number[] | null)[] = new Array(bars.length).fill(null);
  const emas = RIBBON_PERIODS.map(p => emaLocal(bars, p));
  const slowestPeriod = RIBBON_PERIODS[RIBBON_PERIODS.length - 1];
  for (let i = slowestPeriod - 1; i < bars.length; i++) {
    result[i] = emas.map(e => e[i] as number);
  }
  return result;
}

const MARIBBON_DEF: IndicatorDef<Record<string, unknown>, number[] | null> = {
  meta: {
    id: 'maribbon',
    name: 'MA Ribbon',
    shortName: 'MARibbon',
    category: 'moving-averages',
    overlay: true,
    description:
      'Displays eight EMAs with periods [10,20,30,40,50,60,70,80] as a ribbon on the price chart. The spread between bands indicates trend strength; a compressed ribbon signals consolidation.',
    params: [],
  },
  defaultOptions: {},
  calculate(bars) { return maribbon(bars); },
};
indicatorRegistry.register(MARIBBON_DEF);
