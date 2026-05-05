import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

export function historicalVolatility(bars: BarInput[], length: number): (number | null)[] {
  const result: (number | null)[] = new Array(bars.length).fill(null);
  if (bars.length < length + 1) return result;

  // Log returns
  const returns: (number | null)[] = new Array(bars.length).fill(null);
  for (let i = 1; i < bars.length; i++) {
    returns[i] = Math.log(bars[i].close / bars[i - 1].close);
  }

  // Annualisation factor assuming daily bars (252 trading days)
  const annualisationFactor = Math.sqrt(252);

  for (let i = length; i < bars.length; i++) {
    let sum = 0;
    let count = 0;
    for (let j = i - length + 1; j <= i; j++) {
      if (returns[j] !== null) {
        sum += returns[j] as number;
        count++;
      }
    }
    const mean = sum / count;

    let sumSq = 0;
    for (let j = i - length + 1; j <= i; j++) {
      if (returns[j] !== null) {
        const diff = (returns[j] as number) - mean;
        sumSq += diff * diff;
      }
    }
    const stdDev = Math.sqrt(sumSq / count);
    result[i] = stdDev * annualisationFactor;
  }

  return result;
}

const HV_DEF: IndicatorDef<{ length: number }, number | null> = {
  meta: {
    id: 'historical-volatility',
    name: 'Historical Volatility',
    shortName: 'HV',
    category: 'volatility',
    overlay: false,
    description:
      'Annualised standard deviation of log returns. Measures the magnitude of price variability over time, expressed as a percentage. Uses 252-day annualisation factor (daily bars).',
    params: [
      { key: 'length', label: 'Length', type: 'number', defaultValue: 20, min: 2, max: 200, description: 'Lookback period for log returns' },
    ],
  },
  defaultOptions: { length: 20 },
  calculate(bars, options) { return historicalVolatility(bars, options.length); },
};

indicatorRegistry.register(HV_DEF);
