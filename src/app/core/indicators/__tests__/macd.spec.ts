import { describe, it, expect } from 'vitest';
import type { BarInput } from '../types';
import { macd } from '../momentum/macd';
import { ARITHMETIC_BARS } from './fixtures/reference-data';

describe('macd', () => {
  it('output length equals bars.length', () => {
    expect(macd(ARITHMETIC_BARS, 3, 5, 3).length).toBe(ARITHMETIC_BARS.length);
  });

  it('early indices (before slow + signal warmup) are null', () => {
    const result = macd(ARITHMETIC_BARS, 3, 5, 3);
    // slow EMA seeds at index 4; signal EMA needs 3 more → first valid ≥ index 6
    for (let i = 0; i < 6; i++) expect(result[i]).toBeNull();
  });

  it('histogram === macd - signal for all non-null points', () => {
    macd(ARITHMETIC_BARS, 3, 5, 3).forEach(point => {
      if (point !== null) expect(point.histogram).toBeCloseTo(point.macd - point.signal, 10);
    });
  });

  it('first non-null result exists and is at index ≥ slow + signal - 2', () => {
    const result = macd(ARITHMETIC_BARS, 3, 5, 3);
    const firstNonNull = result.findIndex(p => p !== null);
    expect(firstNonNull).toBeGreaterThanOrEqual(5 - 1 + 3 - 1); // 6
    expect(result[firstNonNull]).not.toBeNull();
  });

  it('constant prices → macd=0, signal=0, histogram=0', () => {
    const bars: BarInput[] = Array.from({ length: 30 }, (_, i) => ({
      time: i as BarInput['time'], open: 99.9, high: 100.5, low: 99.5, close: 100,
    }));
    macd(bars, 3, 5, 3).forEach(point => {
      if (point !== null) {
        expect(point.macd).toBeCloseTo(0, 8);
        expect(point.signal).toBeCloseTo(0, 8);
        expect(point.histogram).toBeCloseTo(0, 8);
      }
    });
  });
});
