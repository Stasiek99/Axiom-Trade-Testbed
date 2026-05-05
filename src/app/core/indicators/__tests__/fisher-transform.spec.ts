import { describe, it, expect } from 'vitest';
import type { TwoLinePoint } from '../types';
import { fisherTransform } from '../oscillators/fisher-transform';
import { MIXED_BARS } from './fixtures/reference-data';

describe('fisherTransform', () => {
  it('output length equals bars.length', () => {
    expect(fisherTransform(MIXED_BARS, 5).length).toBe(MIXED_BARS.length);
  });

  it('first period indices are null', () => {
    const result = fisherTransform(MIXED_BARS, 5);
    for (let i = 0; i < 5; i++) expect(result[i]).toBeNull();
  });

  it('returns TwoLinePoint for valid entries', () => {
    const result = fisherTransform(MIXED_BARS, 5);
    const valid = result.filter((p): p is TwoLinePoint => p !== null);
    expect(valid.length).toBeGreaterThan(0);
    valid.forEach(p => {
      expect(typeof p.line1).toBe('number');
      expect(typeof p.line2).toBe('number');
    });
  });

  it('values are finite', () => {
    const result = fisherTransform(MIXED_BARS, 5);
    result.forEach(p => {
      if (p !== null) {
        expect(isFinite(p.line1)).toBe(true);
        expect(isFinite(p.line2)).toBe(true);
      }
    });
  });
});
