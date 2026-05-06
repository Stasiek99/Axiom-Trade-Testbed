import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

/**
 * Cumulative Volume Delta: running total of volume delta.
 *
 *   CVD[i] = CVD[i-1] + volumeDelta[i]
 *   CVD[0] = 0
 *
 * Where volume delta = volume × ((close - low) - (high - close)) / (high - low).
 */
export function cumulativeVolumeDelta(bars: BarInput[]): (number | null)[] {
  const result: (number | null)[] = new Array(bars.length).fill(null);
  if (bars.length === 0) return result;

  result[0] = 0;
  let runningTotal = 0;
  for (let i = 1; i < bars.length; i++) {
    const range = bars[i].high - bars[i].low;
    const vol = bars[i].volume ?? 0;
    const delta = range === 0
      ? 0
      : vol * ((bars[i].close - bars[i].low) - (bars[i].high - bars[i].close)) / range;
    runningTotal += delta;
    result[i] = runningTotal;
  }

  return result;
}

const CUMULATIVE_VOLUME_DELTA_DEF: IndicatorDef<Record<string, never>, number | null> = {
  meta: {
    id: 'cumulative-volume-delta',
    name: 'Cumulative Volume Delta',
    shortName: 'CVD',
    category: 'volume',
    overlay: false,
    description:
      'Running total of Volume Delta over time. Shows the cumulative net buying or selling pressure. Rising CVD confirms bullish sentiment; falling CVD confirms bearish sentiment. Divergences may signal reversals.',
    params: [],
  },
  defaultOptions: {},
  calculate(bars) {
    return cumulativeVolumeDelta(bars);
  },
};

indicatorRegistry.register(CUMULATIVE_VOLUME_DELTA_DEF);
