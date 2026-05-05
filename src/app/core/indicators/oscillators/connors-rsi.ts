import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

function rsiOfValues(values: number[], period: number): (number | null)[] {
  const n = values.length;
  const result: (number | null)[] = new Array(n).fill(null);
  if (n < period + 1) return result;

  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const ch = values[i] - values[i - 1];
    if (ch > 0) avgGain += ch; else avgLoss -= ch;
  }
  avgGain /= period;
  avgLoss /= period;
  result[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

  for (let i = period + 1; i < n; i++) {
    const ch = values[i] - values[i - 1];
    const g = Math.max(ch, 0);
    const l = Math.max(-ch, 0);
    avgGain = (avgGain * (period - 1) + g) / period;
    avgLoss = (avgLoss * (period - 1) + l) / period;
    result[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }
  return result;
}

function streakValues(closes: number[]): number[] {
  const result: number[] = [0];
  for (let i = 1; i < closes.length; i++) {
    if (closes[i] > closes[i - 1]) result.push(result[i - 1] > 0 ? result[i - 1] + 1 : 1);
    else if (closes[i] < closes[i - 1]) result.push(result[i - 1] < 0 ? result[i - 1] - 1 : -1);
    else result.push(0);
  }
  return result;
}

export function connorsRsi(
  bars: BarInput[],
  rsiLen: number,
  streakLen: number,
  rankLen: number,
): (number | null)[] {
  const n = bars.length;
  const result: (number | null)[] = new Array(n).fill(null);
  if (n < Math.max(rsiLen, streakLen, rankLen) + 1) return result;

  const closes = bars.map(b => b.close);

  // 1. RSI of close prices
  const rsiClose = rsiOfValues(closes, rsiLen);

  // 2. RSI of consecutive streak
  const streaks = streakValues(closes);
  const rsiStreak = rsiOfValues(streaks, streakLen);

  // 3. Percent rank of current close
  const rsiRank: (number | null)[] = new Array(n).fill(null);
  for (let i = rankLen; i < n; i++) {
    let count = 0;
    for (let j = i - rankLen + 1; j <= i; j++) {
      if (closes[j] <= closes[i]) count++;
    }
    rsiRank[i] = (count / rankLen) * 100;
  }
  const rankRsi = rsiOfValues(
    rsiRank.filter((v): v is number => v !== null),
    rankLen,
  );

  // Align rankRsi back to original indices
  let rankIdx = 0;
  const rankRsiAligned: (number | null)[] = new Array(n).fill(null);
  for (let i = 0; i < n; i++) {
    if (rsiRank[i] !== null) {
      rankRsiAligned[i] = rankRsi[rankIdx] !== null ? rankRsi[rankIdx] : null;
      rankIdx++;
    }
  }

  // 4. Composite
  const needed = Math.max(rsiLen, streakLen, rankLen * 2);
  for (let i = needed; i < n; i++) {
    if (rsiClose[i] !== null && rsiStreak[i] !== null && rankRsiAligned[i] !== null) {
      result[i] = (rsiClose[i]! + rsiStreak[i]! + rankRsiAligned[i]!) / 3;
    }
  }
  return result;
}

const DEF: IndicatorDef<
  { rsiLen: number; streakLen: number; rankLen: number },
  number | null
> = {
  meta: {
    id: 'connors-rsi',
    name: "Connors RSI",
    shortName: 'CRSI',
    category: 'oscillators',
    overlay: false,
    description:
      'A composite RSI combining three components: standard RSI of price, RSI of consecutive up/down streak length, and percentile rank of price change. Provides a more responsive RSI variant.',
    params: [
      { key: 'rsiLen', label: 'RSI Period', type: 'number', defaultValue: 3, min: 2, max: 50, description: 'Period for price RSI component' },
      { key: 'streakLen', label: 'Streak Period', type: 'number', defaultValue: 2, min: 2, max: 50, description: 'Period for streak RSI component' },
      { key: 'rankLen', label: 'Rank Period', type: 'number', defaultValue: 100, min: 10, max: 500, description: 'Lookback for percent rank component' },
    ],
  },
  defaultOptions: { rsiLen: 3, streakLen: 2, rankLen: 100 },
  calculate(bars, options) {
    return connorsRsi(bars, options.rsiLen, options.streakLen, options.rankLen);
  },
};

indicatorRegistry.register(DEF);
export { DEF as connorsRsiDef };
