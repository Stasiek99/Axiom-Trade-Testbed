import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

interface BBResult {
  upper: number;
  middle: number;
  lower: number;
}

function sma(values: number[], period: number): number[] {
  const result: number[] = new Array(values.length).fill(0);
  for (let i = period - 1; i < values.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += values[j];
    result[i] = sum / period;
  }
  return result;
}

function stddev(values: number[], mean: number, period: number, startIdx: number): number {
  let sumSq = 0;
  for (let i = startIdx; i < startIdx + period; i++) {
    const diff = values[i] - mean;
    sumSq += diff * diff;
  }
  return Math.sqrt(sumSq / period);
}

function calcBB(bars: BarInput[], period: number, mult: number): (BBResult | null)[] {
  const result: (BBResult | null)[] = new Array(bars.length).fill(null);
  const closes = bars.map(b => b.close);

  for (let i = period - 1; i < bars.length; i++) {
    const mean = sma(closes, period)[i];
    const sd = stddev(closes, mean, period, i - period + 1);
    result[i] = {
      upper: mean + mult * sd,
      middle: mean,
      lower: mean - mult * sd,
    };
  }

  return result;
}

function ema(values: number[], period: number): number[] {
  const result: number[] = new Array(values.length);
  const k = 2 / (period + 1);
  let sum = 0;
  for (let j = 0; j < period; j++) sum += values[j];
  result[period - 1] = sum / period;
  for (let i = period; i < values.length; i++) {
    result[i] = values[i] * k + result[i - 1] * (1 - k);
  }
  return result;
}

export function bbTrend(bars: BarInput[], period: number, mult: number, emaPeriod: number): (number | null)[] {
  const result: (number | null)[] = new Array(bars.length).fill(null);
  const bb = calcBB(bars, period, mult);
  const closes = bars.map(b => b.close);

  const bbTrendValues: number[] = [];
  for (let i = 0; i < bars.length; i++) {
    if (bb[i] === null) {
      bbTrendValues.push(0);
    } else {
      const b = bb[i] as BBResult;
      const range = b.upper - b.lower;
      bbTrendValues.push(range !== 0 ? (closes[i] - b.middle) / (range / 2) : 0);
    }
  }

  // Apply EMA smoothing to the BB trend measure
  const smoothed = ema(bbTrendValues, Math.min(emaPeriod, period));

  for (let i = Math.max(period, emaPeriod) - 1; i < bars.length; i++) {
    result[i] = smoothed[i];
  }

  return result;
}

const BBTrend_DEF: IndicatorDef<{ period: number; mult: number; emaPeriod: number }, number | null> = {
  meta: {
    id: 'bb-trend',
    name: 'BB Trend',
    shortName: 'BB Trend',
    category: 'trend',
    overlay: false,
    description:
      'Measures price position within Bollinger Bands as a normalized trend strength oscillator. Values near +1 indicate price at the upper band (strong uptrend); near −1 at the lower band (strong downtrend).',
    params: [
      {
        key: 'period',
        label: 'BB Period',
        type: 'number',
        defaultValue: 20,
        min: 2,
        max: 200,
        description: 'Period for Bollinger Bands',
      },
      {
        key: 'mult',
        label: 'Multiplier',
        type: 'number',
        defaultValue: 2,
        min: 0.5,
        max: 5,
        step: 0.1,
        description: 'Standard deviation multiplier',
      },
      {
        key: 'emaPeriod',
        label: 'EMA Period',
        type: 'number',
        defaultValue: 10,
        min: 2,
        max: 100,
        description: 'Smoothing EMA period',
      },
    ],
  },
  defaultOptions: { period: 20, mult: 2, emaPeriod: 10 },
  calculate(bars: BarInput[], options: { period: number; mult: number; emaPeriod: number }): (number | null)[] {
    return bbTrend(bars, options.period, options.mult, options.emaPeriod);
  },
};

indicatorRegistry.register(BBTrend_DEF);
