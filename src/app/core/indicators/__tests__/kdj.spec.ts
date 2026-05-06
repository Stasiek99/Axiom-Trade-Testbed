import { describe, it, expect } from 'vitest';
import type { KDJPoint, BarInput } from '../types';
import { kdj } from '../oscillators/kdj';
import { ARITHMETIC_BARS, MIXED_BARS, constantBars } from './fixtures/reference-data';

describe('kdj', () => {
  it('output length equals bars.length', () => {
    expect(kdj(MIXED_BARS, 5, 3).length).toBe(MIXED_BARS.length);
  });

  it('all indices < period - 1 are null', () => {
    const result = kdj(MIXED_BARS, 5, 3);
    for (let i = 0; i < 4; i++) expect(result[i]).toBeNull();
  });

  it('returns KDJPoint for valid entries', () => {
    const result = kdj(MIXED_BARS, 5, 3);
    const valid = result.filter((p): p is KDJPoint => p !== null);
    expect(valid.length).toBeGreaterThan(0);
    valid.forEach(p => {
      expect(typeof p.k).toBe('number');
      expect(typeof p.d).toBe('number');
      expect(typeof p.j).toBe('number');
    });
  });

  it('k values in [0, 100]', () => {
    const result = kdj(MIXED_BARS, 5, 3);
    result.forEach(p => {
      if (p !== null) {
        expect(p.k).toBeGreaterThanOrEqual(0);
        expect(p.k).toBeLessThanOrEqual(100);
        expect(p.d).toBeGreaterThanOrEqual(0);
        expect(p.d).toBeLessThanOrEqual(100);
      }
    });
  });

  it('monotonically rising prices converge toward high values', () => {
    const bars: BarInput[] = Array.from({ length: 60 }, (_, i) => ({
      time: i as BarInput['time'],
      open: 50 + i - 0.1, high: 50 + i + 0.5, low: 50 + i - 0.5, close: 50 + i,
    }));
    const result = kdj(bars, 5, 3);
    const valid = result.filter((p): p is KDJPoint => p !== null);
    const last = valid[valid.length - 1];
    expect(last.k).toBeGreaterThan(89.99);
  });

  it('constant prices converge to 50', () => {
    const result = kdj(constantBars(60), 5, 3);
    const valid = result.filter((p): p is KDJPoint => p !== null);
    const last = valid[valid.length - 1];
    expect(last.k).toBeGreaterThanOrEqual(48);
    expect(last.k).toBeLessThanOrEqual(52);
  });

  it('returns all-null when bars.length < period', () => {
    expect(kdj(ARITHMETIC_BARS.slice(0, 3), 9, 3).every(v => v === null)).toBe(true);
  });
});
