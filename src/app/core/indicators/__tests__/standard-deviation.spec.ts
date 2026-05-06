import { describe, it, expect } from 'vitest';
import type { BarInput } from '../types';
import { standardDeviation } from '../volatility/standard-deviation';
import { ARITHMETIC_BARS, VOLATILITY_BARS, COMPUTED_REFERENCE, constantBars } from './fixtures/reference-data';

describe('standardDeviation', () => {
  it('output length equals bars.length', () => {
    expect(standardDeviation(VOLATILITY_BARS, 5).length).toBe(VOLATILITY_BARS.length);
  });

  it('all indices < period-1 are null', () => {
    const period = 5;
    const result = standardDeviation(VOLATILITY_BARS, period);
    for (let i = 0; i < period - 1; i++) expect(result[i]).toBeNull();
    expect(result[period - 1]).not.toBeNull();
  });

  it('StdDev(5, close) on VOLATILITY_BARS at index 4 matches reference', () => {
    const result = standardDeviation(VOLATILITY_BARS, 5, 'close');
    expect(result[4]).toBeCloseTo(COMPUTED_REFERENCE.STDDEV_5_AT_4, 8);
  });

  it('constant close → StdDev = 0', () => {
    const flat = constantBars(15);
    const result = standardDeviation(flat, 5);
    for (let i = 4; i < result.length; i++) {
      expect(result[i]).toBeCloseTo(0, 8);
    }
  });

  it('all-null when bars.length < length', () => {
    const result = standardDeviation(ARITHMETIC_BARS.slice(0, 3), 10);
    expect(result.every(v => v === null)).toBe(true);
    expect(result.length).toBe(3);
  });

  it('StdDev(1) = 0 (single value has no variance)', () => {
    const result = standardDeviation(VOLATILITY_BARS, 1);
    result.forEach(v => {
      if (v !== null) expect(v).toBeCloseTo(0, 8);
    });
  });

  it('selecting high source uses the high price', () => {
    const highs = VOLATILITY_BARS.map(b => b.high);
    const result = standardDeviation(VOLATILITY_BARS, 5, 'high');
    // Manually compute: highs[0..4] = [11, 12, 13, 14, 15]
    // mean = 13, sumSq = 4+1+0+1+4 = 10, stddev = sqrt(2)
    expect(result[4]).toBeCloseTo(Math.sqrt(2), 8);
  });
});
