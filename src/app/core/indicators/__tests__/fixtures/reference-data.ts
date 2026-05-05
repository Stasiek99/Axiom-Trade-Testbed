import type { BarInput } from '../../types';

export function makeBar(time: number, close: number): BarInput {
  return { time: time as BarInput['time'], open: close - 0.1, high: close + 0.5, low: close - 0.5, close };
}

export const ARITHMETIC_BARS: BarInput[] = Array.from({ length: 15 }, (_, i) =>
  makeBar(i, i + 1)
);

export const MIXED_BARS: BarInput[] = [
  10, 11, 12, 11, 10, 9, 10, 11, 12, 13, 12, 11, 10, 9, 8, 9, 10, 11, 12, 13,
].map((close, i) => makeBar(i, close));

export const COMPUTED_REFERENCE = {
  // SMA(5) on closes [1..15]: null*4, then 3,4,5,...,13
  SMA_5_ON_ARITHMETIC: [null, null, null, null, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as (number | null)[],
  // EMA(3) on closes [1..15], k=0.5, seed=2 at index 2: EMA[i]=i (0-indexed)
  EMA_3_ON_ARITHMETIC: [null, null, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] as (number | null)[],
  // RSI(5) at index 5 on MIXED_BARS closes [10,11,12,11,10,9,...]:
  // changes i=1..5: +1,+1,-1,-1,-1 → avgGain=0.4, avgLoss=0.6 → RSI=40
  RSI_5_IDX5: 40,
} as const;
