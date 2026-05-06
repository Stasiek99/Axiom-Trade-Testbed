import { describe, it, expect } from 'vitest';
import type { TwoLinePoint } from '../types';
import { smiErgodic } from '../oscillators/smi-ergodic';
import { ARITHMETIC_BARS, MIXED_BARS } from './fixtures/reference-data';

describe('smiErgodic', () => {
  it('output length equals bars.length', () => {
    expect(smiErgodic(MIXED_BARS, 20, 5, 5).length).toBe(MIXED_BARS.length);
  });

  it('returns TwoLinePoint for valid entries', () => {
    const result = smiErgodic(MIXED_BARS, 5, 3, 3);
    const valid = result.filter((p): p is TwoLinePoint => p !== null);
    expect(valid.length).toBeGreaterThan(0);
    valid.forEach(p => {
      expect(typeof p.line1).toBe('number');
      expect(typeof p.line2).toBe('number');
    });
  });

  it('values are finite', () => {
    const result = smiErgodic(MIXED_BARS, 5, 3, 3);
    result.forEach(p => {
      if (p !== null) {
        expect(isFinite(p.line1)).toBe(true);
        expect(isFinite(p.line2)).toBe(true);
      }
    });
  });

  it('returns null for too-short data', () => {
    expect(smiErgodic(ARITHMETIC_BARS, 20, 5, 5).every(v => v === null)).toBe(true);
  });
});
