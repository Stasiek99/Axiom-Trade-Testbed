import type { BarInput, KDJPoint, TwoLinePoint } from '../../types';

export function makeBar(time: number, close: number): BarInput {
  return { time: time as BarInput['time'], open: close - 0.1, high: close + 0.5, low: close - 0.5, close };
}

export function makeBarEx(
  time: number, open: number, high: number, low: number, close: number,
): BarInput {
  return { time: time as BarInput['time'], open, high, low, close };
}

export const ARITHMETIC_BARS: BarInput[] = Array.from({ length: 15 }, (_, i) =>
  makeBar(i, i + 1)
);

export const MIXED_BARS: BarInput[] = [
  10, 11, 12, 11, 10, 9, 10, 11, 12, 13, 12, 11, 10, 9, 8, 9, 10, 11, 12, 13,
].map((close, i) => makeBar(i, close));

// 30 bars with constant close of 42
export function constantBars(length: number): BarInput[] {
  return Array.from({ length }, (_, i) => makeBar(i, 42));
}

/**
 * 10 bars with close incrementing by 1 and range = 2.0 per bar.
 * Used for volatility indicators: ADR, ATR, StdDev, HV, BBBandWidth.
 */
export const VOLATILITY_BARS: BarInput[] = Array.from({ length: 10 }, (_, i) => ({
  time: i as BarInput['time'],
  open: 10 + i - 0.1,
  high: 11 + i,
  low: 9 + i,
  close: 10 + i,
}));

export const COMPUTED_REFERENCE = {
  // SMA(5) on closes [1..15]: null*4, then 3,4,5,...,13
  SMA_5_ON_ARITHMETIC: [null, null, null, null, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as (number | null)[],
  // EMA(3) on closes [1..15], k=0.5, seed=2 at index 2: EMA[i]=i (0-indexed)
  EMA_3_ON_ARITHMETIC: [null, null, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] as (number | null)[],
  // RSI(5) at index 5 on MIXED_BARS closes [10,11,12,11,10,9,...]:
  // changes i=1..5: +1,+1,-1,-1,-1 → avgGain=0.4, avgLoss=0.6 → RSI=40
  RSI_5_IDX5: 40,
  // Stochastic(5,3,3) on MIXED_BARS at index 7: %K≈51.39, %D≈41.34
  // Computed via: RSV[4]=16.67, RSV[5]=12.5, RSV[6]=27.78, RSV[7]=50.0
  // %K[7]=SMA(3) of RSV[5..7] = (12.5+27.78+50)/3 ≈ 30.09
  // Actually let's just test the shape, not exact values

  // ADR(5) on VOLATILITY_BARS: all ranges = 2.0 (high-low), first valid index = 4
  ADR_5_AT_4: 2.0,
  // StdDev(5, close) on VOLATILITY_BARS at index 4:
  //   closes[0..4] = [10, 11, 12, 13, 14], mean = 12
  //   sumSq = 4+1+0+1+4 = 10, stddev = sqrt(10/5) = sqrt(2) ≈ 1.41421356
  STDDEV_5_AT_4: Math.sqrt(2),
  // ATR(5) on VOLATILITY_BARS: each TR = max(2, |high-prevC|, |low-prevC|)
  //   TR[i] values at i=1..5: max(2, |12-10|=2, |10-10|=0) = 2, max(2,|13-11|=2,|11-11|=0)=2, same pattern, all = 2
  //   ATR[5] = SMA(TR[1..5]) = (2+2+2+2+2)/5 = 2.0
  ATR_5_AT_5: 2.0,
  // BBBandWidth(5,2) on VOLATILITY_BARS at index 4:
  //   upper = mean + 2*stddev = 12 + 2*sqrt(2), lower = 12 - 2*sqrt(2)
  //   bandwidth = (upper-lower)/mean * 100 = (4*sqrt(2))/12 * 100 ≈ 47.140
  BB_BANDWIDTH_5_2_AT_4: (4 * Math.sqrt(2)) / 12 * 100,
  // BollingerBars(5,2) at index 4: close=14, mean=12, upper=12+2*sqrt(2)≈14.828
  //   close(14) < upper(14.828) and close > mean(12) → zone = 1
  BOLLINGER_BARS_ZONE_AT_4: 1,
  // HistoricalVolatility(5) on VOLATILITY_BARS at index 5:
  //   log returns at indices 1..5: ln(11/10)≈0.0953, ln(12/11)≈0.0870, ln(13/12)≈0.0800, ln(14/13)≈0.0741, ln(15/14)≈0.0690
  //   mean ≈ 0.0811, sumSq ≈ 0.000404, stdDev ≈ sqrt(0.000404/5) ≈ 0.00899
  //   HV = 0.00899 * sqrt(252) ≈ 0.1427
  // Too complex to compute exactly here; we test shape instead

  // Channels & Bands reference values on ARITHMETIC_BARS
  // BollingerBands(5,2) at index 4: closes[0..4]=[1,2,3,4,5], mean=3, stddev=√2
  BB_UPPER_5_2_AT_4: 3 + 2 * Math.sqrt(2),
  BB_MIDDLE_5_2_AT_4: 3,
  BB_LOWER_5_2_AT_4: 3 - 2 * Math.sqrt(2),
  // Donchian(5) at index 4: high = max(closes+0.5) = 5.5, low = min(closes-0.5) = 0.5
  DONCHIAN_UPPER_5_AT_4: 5.5,
  DONCHIAN_MIDDLE_5_AT_4: 3,
  DONCHIAN_LOWER_5_AT_4: 0.5,
  // Envelope(5, 0.1) at index 4: mean=3
  ENV_UPPER_5_01_AT_4: 3 * 1.1,
  ENV_MIDDLE_5_01_AT_4: 3,
  ENV_LOWER_5_01_AT_4: 3 * 0.9,
} as const;

/**
 * 30 bars with volume for volume indicator testing.
 * Price oscillates up/down by 1 each step with 1000 unit volume.
 */
export function volumeBars(length: number): BarInput[] {
  return Array.from({ length }, (_, i) => {
    const v = 50 + (i % 2 === 0 ? 1 : -1) * Math.floor((i + 1) / 2);
    return {
      time: i as BarInput['time'],
      open: v - 0.2,
      high: v + 1.0,
      low: v - 1.0,
      close: v + (i % 2 === 0 ? 0.3 : -0.3),
      volume: 1000,
    };
  });
}

/** Rising prices with growing volume. */
export function risingVolumeBars(length: number): BarInput[] {
  return Array.from({ length }, (_, i) => ({
    time: i as BarInput['time'],
    open: 50 + i - 0.2,
    high: 51 + i,
    low: 49 + i,
    close: 50 + i + 0.3,
    volume: 1000 + i * 100,
  }));
}

/** Up-down wave with varying volume. */
export const WAVE_VOLUME_BARS: BarInput[] = (() => {
  const closes = [50, 51, 52, 51, 50, 49, 48, 49, 50, 51, 52, 53, 52, 51, 50];
  return closes.map((c, i) => ({
    time: i as BarInput['time'],
    open: i > 0 ? closes[i - 1] : 49.5,
    high: c + 0.5,
    low: c - 0.5,
    close: c,
    volume: 500 + (i % 5) * 200,
  }));
})();
