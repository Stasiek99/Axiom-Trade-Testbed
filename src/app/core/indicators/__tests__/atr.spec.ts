import { describe, it, expect } from 'vitest';
import type { BarInput } from '../types';
import { atr } from '../volatility/atr';
import { ARITHMETIC_BARS, MIXED_BARS, VOLATILITY_BARS, COMPUTED_REFERENCE, constantBars } from './fixtures/reference-data';

describe('atr', () => {
  it('output length equals bars.length', () => {
    expect(atr(MIXED_BARS, 5).length).toBe(MIXED_BARS.length);
  });

  it('all indices < length are null, first valid at index length', () => {
    const period = 5;
    const result = atr(MIXED_BARS, period);
    for (let i = 0; i < period; i++) expect(result[i]).toBeNull();
    expect(result[period]).not.toBeNull();
  });

  it('ATR(5) on VOLATILITY_BARS at index 5 matches reference', () => {
    const result = atr(VOLATILITY_BARS, 5);
    expect(result[5]).toBeCloseTo(COMPUTED_REFERENCE.ATR_5_AT_5, 8);
  });

  it('constant price range → constant ATR', () => {
    const result = atr(VOLATILITY_BARS, 5);
    for (let i = 6; i < result.length; i++) {
      expect(result[i]).toBeCloseTo(2.0, 5);
    }
  });

  it('all-null when bars.length < length + 1', () => {
    const result = atr(ARITHMETIC_BARS.slice(0, 5), 10);
    expect(result.every(v => v === null)).toBe(true);
    expect(result.length).toBe(5);
  });

  it('all non-null values are positive', () => {
    const result = atr(MIXED_BARS, 5);
    result.forEach(v => {
      if (v !== null) expect(v).toBeGreaterThan(0);
    });
  });

  it('no TR with constant close + high = low + equal prev close', () => {
    // If all bars are identical, TR = high-low for bar 0, then 0 for subsequent
    const flat: BarInput[] = Array.from({ length: 15 }, (_, i) => ({
      time: i as BarInput['time'], open: 100, high: 101, low: 99, close: 100,
    }));
    const result = atr(flat, 5);
    // TR[1..] = max(101-99=2, |101-100|=1, |99-100|=1) = 2
    // ATR[5] = SMA(2*5) = 2, ATR[6+] converges toward 2 via Wilder's
    expect(result[5]).toBeCloseTo(2.0, 5);
  });
});
