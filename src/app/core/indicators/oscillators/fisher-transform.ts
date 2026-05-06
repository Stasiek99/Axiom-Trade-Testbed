import type { BarInput, IndicatorDef, TwoLinePoint } from '../types';
import { indicatorRegistry } from '../registry';

export function fisherTransform(bars: BarInput[], period: number): (TwoLinePoint | null)[] {
  const n = bars.length;
  const result: (TwoLinePoint | null)[] = new Array(n).fill(null);
  if (n < period) return result;

  const fish: (number | null)[] = new Array(n).fill(null);
  let prevValue = 0;

  for (let i = period - 1; i < n; i++) {
    let hh = bars[i - period + 1].high;
    let ll = bars[i - period + 1].low;
    for (let j = i - period + 2; j <= i; j++) {
      if (bars[j].high > hh) hh = bars[j].high;
      if (bars[j].low < ll) ll = bars[j].low;
    }

    const mid = (bars[i].high + bars[i].low) / 2;
    const rng = hh - ll;
    let norm = rng === 0 ? 0 : 2 * (mid - ll) / rng - 1;
    norm = Math.max(-0.999, Math.min(0.999, norm + 0.5 * prevValue));
    prevValue = norm;

    fish[i] = 0.5 * Math.log((1 + norm) / (1 - norm));
  }

  for (let i = period; i < n; i++) {
    if (fish[i] !== null && fish[i - 1] !== null) {
      result[i] = { line1: fish[i]!, line2: fish[i - 1]! };
    }
  }
  return result;
}

const DEF: IndicatorDef<
  { period: number },
  TwoLinePoint | null
> = {
  meta: {
    id: 'fisher-transform',
    name: 'Fisher Transform',
    shortName: 'Fisher',
    category: 'oscillators',
    overlay: false,
    description:
      'Normalizes prices near a Gaussian distribution, turning price action into a normally distributed oscillator. The signal line is a 1-bar lagged Fisher line. Crossovers indicate trend reversals.',
    params: [
      { key: 'period', label: 'Period', type: 'number', defaultValue: 9, min: 2, max: 100, description: 'Lookback period for min/max price' },
    ],
  },
  defaultOptions: { period: 9 },
  calculate(bars, options) {
    return fisherTransform(bars, options.period);
  },
};

indicatorRegistry.register(DEF);
export { DEF as fisherTransformDef };
