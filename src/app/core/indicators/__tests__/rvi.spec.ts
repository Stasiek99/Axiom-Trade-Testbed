import { describe, it, expect } from 'vitest';
import type { TwoLinePoint, BarInput } from '../types';
import { rvi } from '../oscillators/rvi';
import { MIXED_BARS, constantBars } from './fixtures/reference-data';

describe('rvi', () => {
  it('output length equals bars.length', () => {
    expect(rvi(MIXED_BARS, 5).length).toBe(MIXED_BARS.length);
  });

  it('returns TwoLinePoint for valid entries', () => {
    const result = rvi(MIXED_BARS, 5);
    const valid = result.filter((p): p is TwoLinePoint => p !== null);
    expect(valid.length).toBeGreaterThan(0);
    valid.forEach(p => {
      expect(typeof p.line1).toBe('number');
      expect(typeof p.line2).toBe('number');
    });
  });

  it('early indices are null', () => {
    const result = rvi(MIXED_BARS, 10);
    for (let i = 0; i < 10; i++) expect(result[i]).toBeNull();
  });

  it('constant prices yield zero (no range)', () => {
    // When all open=close=high=low, RVI numerator = 0
    const bars: BarInput[] = Array.from({ length: 30 }, (_, i) => ({
      time: i as BarInput['time'], open: 50, high: 50, low: 50, close: 50,
    }));
    const result = rvi(bars, 5);
    const valid = result.filter((p): p is TwoLinePoint => p !== null);
    valid.forEach(p => {
      expect(p.line1).toBeCloseTo(0, 1);
      expect(p.line2).toBeCloseTo(0, 1);
    });
  });
});
