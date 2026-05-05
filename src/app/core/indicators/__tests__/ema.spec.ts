import { describe, it, expect } from 'vitest';
import type { BarInput } from '../types';
import { ema } from '../moving-averages/ema';
import { ARITHMETIC_BARS, COMPUTED_REFERENCE } from './fixtures/reference-data';

describe('ema', () => {
  it('output length equals bars.length', () => {
    expect(ema(ARITHMETIC_BARS, 3).length).toBe(ARITHMETIC_BARS.length);
  });

  it('all indices < period-1 are null', () => {
    const result = ema(ARITHMETIC_BARS, 3);
    expect(result[0]).toBeNull();
    expect(result[1]).toBeNull();
  });

  it('seed at period-1 equals SMA of first period closes', () => {
    const result = ema(ARITHMETIC_BARS, 3);
    expect(result[2]).toBeCloseTo((1 + 2 + 3) / 3, 8);
  });

  it('EMA(3) on ARITHMETIC_BARS matches reference values', () => {
    const result = ema(ARITHMETIC_BARS, 3);
    COMPUTED_REFERENCE.EMA_3_ON_ARITHMETIC.forEach((expected, i) => {
      if (expected === null) {
        expect(result[i]).toBeNull();
      } else {
        expect(result[i]).toBeCloseTo(expected, 8);
      }
    });
  });

  it('returns all-null when bars.length < period', () => {
    const result = ema(ARITHMETIC_BARS.slice(0, 2), 5);
    expect(result.every(v => v === null)).toBe(true);
    expect(result.length).toBe(2);
  });

  it('EMA of constant close = that constant', () => {
    const bars: BarInput[] = Array.from({ length: 20 }, (_, i) => ({
      time: i as BarInput['time'], open: 99.9, high: 100.5, low: 99.5, close: 100,
    }));
    ema(bars, 5).forEach(val => {
      if (val !== null) expect(val).toBeCloseTo(100, 8);
    });
  });
});
