import { describe, it, expect } from 'vitest';
import type { BarInput, TwoLinePoint } from '../types';
import { stochastic } from '../oscillators/stochastic';
import { ARITHMETIC_BARS, MIXED_BARS, constantBars } from './fixtures/reference-data';

describe('stochastic', () => {
  it('output length equals bars.length', () => {
    expect(stochastic(MIXED_BARS, 5, 3, 3).length).toBe(MIXED_BARS.length);
  });

  it('all indices < period - 1 are null', () => {
    const result = stochastic(MIXED_BARS, 5, 3, 3);
    for (let i = 0; i < 4; i++) expect(result[i]).toBeNull();
  });

  it('all non-null values have k,d in [0, 100]', () => {
    const result = stochastic(MIXED_BARS, 5, 3, 3);
    result.forEach(p => {
      if (p !== null) {
        expect(p.line1).toBeGreaterThanOrEqual(0);
        expect(p.line1).toBeLessThanOrEqual(100);
        expect(p.line2).toBeGreaterThanOrEqual(0);
        expect(p.line2).toBeLessThanOrEqual(100);
      }
    });
  });

  it('%K and %D are present at valid indices', () => {
    const result = stochastic(MIXED_BARS, 5, 3, 3);
    const valid = result.filter((p): p is TwoLinePoint => p !== null);
    expect(valid.length).toBeGreaterThan(0);
    valid.forEach(p => {
      expect(typeof p.line1).toBe('number');
      expect(typeof p.line2).toBe('number');
    });
  });

  it('returns all-null when bars.length < period', () => {
    const result = stochastic(ARITHMETIC_BARS.slice(0, 3), 5, 3, 3);
    expect(result.every(v => v === null)).toBe(true);
  });

  it('handles constant prices (flat range)', () => {
    const result = stochastic(constantBars(30), 5, 3, 3);
    result.forEach(p => {
      if (p !== null) {
        expect(p.line1).toBeGreaterThanOrEqual(0);
        expect(p.line1).toBeLessThanOrEqual(100);
      }
    });
  });

  it('monotonically rising prices converge to high values', () => {
    const bars: BarInput[] = Array.from({ length: 60 }, (_, i) => ({
      time: i as BarInput['time'],
      open: 50 + i - 0.1,
      high: 50 + i + 0.5,
      low: 50 + i - 0.5,
      close: 50 + i,
    }));
    const result = stochastic(bars, 5, 3, 3);
    const valid = result.filter((p): p is TwoLinePoint => p !== null);
    const last = valid[valid.length - 1];
    expect(last.line1).toBeGreaterThanOrEqual(90);
  });
});
