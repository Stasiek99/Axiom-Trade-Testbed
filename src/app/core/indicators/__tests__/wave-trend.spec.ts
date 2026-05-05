import { describe, it, expect } from 'vitest';
import type { TwoLinePoint, BarInput } from '../types';
import { waveTrend } from '../oscillators/wave-trend';
import { MIXED_BARS } from './fixtures/reference-data';

describe('waveTrend', () => {
  it('output length equals bars.length', () => {
    expect(waveTrend(MIXED_BARS, 9, 12).length).toBe(MIXED_BARS.length);
  });

  it('early indices are null', () => {
    const result = waveTrend(MIXED_BARS, 10, 5);
    for (let i = 0; i < 10; i++) expect(result[i]).toBeNull();
  });

  it('returns TwoLinePoint with enough bars', () => {
    // MIXED_BARS has 20 bars; need channelLen + avgLen + 3 for WT2
    const result = waveTrend(MIXED_BARS, 5, 3);
    const valid = result.filter((p): p is TwoLinePoint => p !== null);
    expect(valid.length).toBeGreaterThan(0);
    valid.forEach(p => {
      expect(typeof p.line1).toBe('number');
      expect(typeof p.line2).toBe('number');
    });
  });

  it('values are finite', () => {
    const result = waveTrend(MIXED_BARS, 5, 3);
    result.forEach(p => {
      if (p !== null) {
        expect(isFinite(p.line1)).toBe(true);
        expect(isFinite(p.line2)).toBe(true);
      }
    });
  });
});
