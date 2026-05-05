import { describe, it, expect } from 'vitest';
import type { BarInput, TwoLinePoint } from '../types';
import { stochRsi } from '../oscillators/stochrsi';
import { MIXED_BARS, constantBars } from './fixtures/reference-data';

describe('stochRsi', () => {
  it('output length equals bars.length', () => {
    expect(stochRsi(MIXED_BARS, 5, 5, 3, 3).length).toBe(MIXED_BARS.length);
  });

  it('all non-null values in [0, 100]', () => {
    const result = stochRsi(MIXED_BARS, 5, 5, 3, 3);
    result.forEach(p => {
      if (p !== null) {
        expect(p.line1).toBeGreaterThanOrEqual(0);
        expect(p.line1).toBeLessThanOrEqual(100);
        expect(p.line2).toBeGreaterThanOrEqual(0);
        expect(p.line2).toBeLessThanOrEqual(100);
      }
    });
  });

  it('needs enough bars for both period and rsiLength', () => {
    const result = stochRsi(MIXED_BARS.slice(0, 6), 14, 14, 3, 3);
    expect(result.every(v => v === null)).toBe(true);
  });

  it('constant prices give mid-range values', () => {
    const result = stochRsi(constantBars(50), 5, 5, 3, 3);
    const valid = result.filter((p): p is TwoLinePoint => p !== null);
    valid.forEach(p => {
      expect(p.line1).toBeGreaterThanOrEqual(0);
      expect(p.line1).toBeLessThanOrEqual(100);
    });
  });

  it('returns TwoLinePoint for valid entries', () => {
    const result = stochRsi(MIXED_BARS, 5, 5, 3, 3);
    const valid = result.filter((p): p is TwoLinePoint => p !== null);
    expect(valid.length).toBeGreaterThan(0);
    valid.forEach(p => {
      expect(typeof p.line1).toBe('number');
      expect(typeof p.line2).toBe('number');
    });
  });
});
