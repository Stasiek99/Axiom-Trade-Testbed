import { describe, it, expect } from 'vitest';
import type { BarInput } from '../types';
import { sma } from '../moving-averages/sma';
import { ARITHMETIC_BARS, COMPUTED_REFERENCE } from './fixtures/reference-data';

describe('sma', () => {
  it('output length equals bars.length', () => {
    expect(sma(ARITHMETIC_BARS, 5).length).toBe(ARITHMETIC_BARS.length);
  });

  it('all indices < period-1 are null', () => {
    const period = 5;
    const result = sma(ARITHMETIC_BARS, period);
    for (let i = 0; i < period - 1; i++) expect(result[i]).toBeNull();
  });

  it('index period-1 is non-null', () => {
    const result = sma(ARITHMETIC_BARS, 5);
    expect(result[4]).not.toBeNull();
  });

  it('SMA(5) on ARITHMETIC_BARS matches reference exactly', () => {
    expect(sma(ARITHMETIC_BARS, 5)).toEqual(COMPUTED_REFERENCE.SMA_5_ON_ARITHMETIC);
  });

  it('SMA(1) equals close at every bar', () => {
    const result = sma(ARITHMETIC_BARS, 1);
    result.forEach((val, i) => expect(val).toBe(ARITHMETIC_BARS[i].close));
  });

  it('returns all-null when bars.length < period', () => {
    const result = sma(ARITHMETIC_BARS.slice(0, 3), 10);
    expect(result.every(v => v === null)).toBe(true);
    expect(result.length).toBe(3);
  });

  it('SMA of constant close = that constant', () => {
    const bars: BarInput[] = Array.from({ length: 10 }, (_, i) => ({
      time: i as BarInput['time'], open: 42.4, high: 43, low: 42, close: 42.5,
    }));
    sma(bars, 5).forEach(val => {
      if (val !== null) expect(val).toBeCloseTo(42.5, 8);
    });
  });
});
