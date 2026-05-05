import { describe, it, expect } from 'vitest';
import type { BarInput } from '../types';
import { bbPercentB } from '../oscillators/bb-percentb';
import { ARITHMETIC_BARS, MIXED_BARS, constantBars } from './fixtures/reference-data';

describe('bbPercentB', () => {
  it('output length equals bars.length', () => {
    expect(bbPercentB(MIXED_BARS, 5, 2).length).toBe(MIXED_BARS.length);
  });

  it('all indices < period - 1 are null', () => {
    const result = bbPercentB(MIXED_BARS, 5, 2);
    for (let i = 0; i < 4; i++) expect(result[i]).toBeNull();
  });

  it('constant prices give %B = 0.5 (price at middle)', () => {
    const result = bbPercentB(constantBars(30), 5, 2);
    result.forEach(v => {
      if (v !== null) expect(v).toBeCloseTo(0.5, 1);
    });
  });

  it('returns all-null when bars.length < period', () => {
    expect(bbPercentB(ARITHMETIC_BARS.slice(0, 3), 5, 2).every(v => v === null)).toBe(true);
  });
});
