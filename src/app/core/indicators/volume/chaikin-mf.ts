import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

/**
 * Chaikin Money Flow (CMF): sum of Money Flow Volume over N periods
 * divided by total volume over N periods.
 *
 * Money Flow Multiplier = ((close - low) - (high - close)) / (high - low)
 * Money Flow Volume = MFM × volume
 * CMF = sum(MFV, N) / sum(volume, N)
 */
export function chaikinMF(bars: BarInput[], length: number): (number | null)[] {
  const result: (number | null)[] = new Array(bars.length).fill(null);
  if (bars.length < length) return result;

  for (let i = length - 1; i < bars.length; i++) {
    let mfvSum = 0;
    let volSum = 0;
    for (let j = i - length + 1; j <= i; j++) {
      const range = bars[j].high - bars[j].low;
      const mfm = range === 0 ? 0 : ((bars[j].close - bars[j].low) - (bars[j].high - bars[j].close)) / range;
      const vol = bars[j].volume ?? 0;
      mfvSum += mfm * vol;
      volSum += vol;
    }
    result[i] = volSum === 0 ? 0 : mfvSum / volSum;
  }

  return result;
}

const CHAIKIN_MF_DEF: IndicatorDef<{ length: number }, number | null> = {
  meta: {
    id: 'chaikin-mf',
    name: 'Chaikin Money Flow',
    shortName: 'CMF',
    category: 'volume',
    overlay: false,
    description:
      'Measures the amount of money flowing into or out of an asset over a specified period. Values above zero indicate accumulation (buying pressure); below zero indicate distribution (selling pressure).',
    params: [
      {
        key: 'length',
        label: 'Length',
        type: 'number',
        defaultValue: 20,
        min: 2,
        max: 100,
        description: 'Number of bars for the lookback period',
      },
    ],
  },
  defaultOptions: { length: 20 },
  calculate(bars, options) {
    return chaikinMF(bars, options.length);
  },
};

indicatorRegistry.register(CHAIKIN_MF_DEF);
