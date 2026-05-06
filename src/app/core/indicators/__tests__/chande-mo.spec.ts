import { describe, it, expect } from 'vitest';
import { chandeMO } from '../oscillators/chande-mo';
import { ARITHMETIC_BARS, MIXED_BARS, constantBars } from './fixtures/reference-data';

describe('chandeMO', () => {
  it('output length equals bars.length', () => {
    expect(chandeMO(MIXED_BARS, 5).length).toBe(MIXED_BARS.length);
  });

  it('all indices < period are null', () => {
    const result = chandeMO(MIXED_BARS, 5);
    for (let i = 0; i < 5; i++) expect(result[i]).toBeNull();
  });

  it('values in [-100, 100]', () => {
    const result = chandeMO(MIXED_BARS, 5);
    result.forEach(v => {
      if (v !== null) {
        expect(v).toBeGreaterThanOrEqual(-100);
        expect(v).toBeLessThanOrEqual(100);
      }
    });
  });

  it('constant prices give CMO = 0', () => {
    const result = chandeMO(constantBars(30), 5);
    result.forEach(v => {
      if (v !== null) expect(v).toBeCloseTo(0, 0);
    });
  });

  it('monotonically rising prices give CMO = 100', () => {
    const result = chandeMO(ARITHMETIC_BARS, 5);
    result.forEach(v => {
      if (v !== null) expect(v).toBeCloseTo(100, 0);
    });
  });

  it('returns all-null when bars.length < period + 1', () => {
    expect(chandeMO(ARITHMETIC_BARS.slice(0, 3), 5).every(v => v === null)).toBe(true);
  });
});
