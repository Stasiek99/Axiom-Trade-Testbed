import { describe, it, expect } from 'vitest';
import type { BarInput } from '../types';
import { rsi } from '../oscillators/rsi';
import { ARITHMETIC_BARS, MIXED_BARS, COMPUTED_REFERENCE } from './fixtures/reference-data';

describe('rsi', () => {
  it('output length equals bars.length', () => {
    expect(rsi(MIXED_BARS, 5).length).toBe(MIXED_BARS.length);
  });

  it('all indices < period are null (first valid = index period)', () => {
    const result = rsi(MIXED_BARS, 5);
    for (let i = 0; i < 5; i++) expect(result[i]).toBeNull();
    expect(result[5]).not.toBeNull();
  });

  it('all non-null values are in [0, 100]', () => {
    rsi(MIXED_BARS, 5).forEach(val => {
      if (val !== null) {
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(100);
      }
    });
  });

  it('RSI(5) at index 5 on MIXED_BARS matches reference value 40', () => {
    const result = rsi(MIXED_BARS, 5);
    expect(result[5]).toBeCloseTo(COMPUTED_REFERENCE.RSI_5_IDX5, 5);
  });

  it('monotonically rising prices → RSI = 100 (no losses)', () => {
    const bars: BarInput[] = Array.from({ length: 30 }, (_, i) => ({
      time: i as BarInput['time'], open: 50 + i - 0.1, high: 50 + i + 0.5, low: 50 + i - 0.5, close: 50 + i,
    }));
    const result = rsi(bars, 5);
    result.forEach(val => {
      if (val !== null) expect(val).toBeCloseTo(100, 0);
    });
  });

  it('monotonically falling prices → RSI = 0 (no gains)', () => {
    const bars: BarInput[] = Array.from({ length: 30 }, (_, i) => ({
      time: i as BarInput['time'], open: 100 - i - 0.1, high: 100 - i + 0.5, low: 100 - i - 0.5, close: 100 - i,
    }));
    const result = rsi(bars, 5);
    result.forEach(val => {
      if (val !== null) expect(val).toBeCloseTo(0, 0);
    });
  });

  it('returns all-null when bars.length < period + 1', () => {
    const result = rsi(ARITHMETIC_BARS.slice(0, 3), 5);
    expect(result.every(v => v === null)).toBe(true);
    expect(result.length).toBe(3);
  });
});
