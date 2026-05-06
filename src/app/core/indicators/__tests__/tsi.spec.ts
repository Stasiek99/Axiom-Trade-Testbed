import { describe, it, expect } from 'vitest';
import type { TwoLinePoint, BarInput } from '../types';
import { tsi } from '../oscillators/tsi';
import { ARITHMETIC_BARS, MIXED_BARS } from './fixtures/reference-data';

describe('tsi', () => {
  it('output length equals bars.length', () => {
    expect(tsi(MIXED_BARS, 25, 13, 13).length).toBe(MIXED_BARS.length);
  });

  it('returns TwoLinePoint for valid entries', () => {
    const result = tsi(MIXED_BARS, 5, 3, 3);
    const valid = result.filter((p): p is TwoLinePoint => p !== null);
    expect(valid.length).toBeGreaterThan(0);
    valid.forEach(p => {
      expect(typeof p.line1).toBe('number');
      expect(typeof p.line2).toBe('number');
    });
  });

  it('monotonically rising prices give positive TSI', () => {
    const bars: BarInput[] = Array.from({ length: 60 }, (_, i) => ({
      time: i as BarInput['time'],
      open: 50 + i - 0.1, high: 50 + i + 0.5, low: 50 + i - 0.5, close: 50 + i,
    }));
    const result = tsi(bars, 5, 3, 3);
    const valid = result.filter((p): p is TwoLinePoint => p !== null);
    valid.forEach(p => {
      expect(p.line1).toBeGreaterThan(0);
    });
  });

  it('returns null for too-short data', () => {
    expect(tsi(ARITHMETIC_BARS, 25, 13, 13).every(v => v === null)).toBe(true);
  });
});
