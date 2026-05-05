import { describe, it, expect } from 'vitest';
import type { BarInput } from '../types';
import { williamsR } from '../oscillators/williams-r';
import { ARITHMETIC_BARS, MIXED_BARS, constantBars } from './fixtures/reference-data';

describe('williamsR', () => {
  it('output length equals bars.length', () => {
    expect(williamsR(MIXED_BARS, 5).length).toBe(MIXED_BARS.length);
  });

  it('all indices < period - 1 are null', () => {
    const result = williamsR(MIXED_BARS, 5);
    for (let i = 0; i < 4; i++) expect(result[i]).toBeNull();
  });

  it('all non-null values are in [-100, 0]', () => {
    const result = williamsR(MIXED_BARS, 5);
    result.forEach(v => {
      if (v !== null) {
        expect(v).toBeLessThanOrEqual(0);
        expect(v).toBeGreaterThanOrEqual(-100);
      }
    });
  });

  it('constant prices give -50', () => {
    const result = williamsR(constantBars(30), 5);
    result.forEach(v => {
      if (v !== null) expect(v).toBeCloseTo(-50, 1);
    });
  });

  it('returns all-null when bars.length < period', () => {
    expect(williamsR(ARITHMETIC_BARS.slice(0, 3), 5).every(v => v === null)).toBe(true);
  });
});
