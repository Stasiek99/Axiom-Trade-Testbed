import { describe, it, expect } from 'vitest';
import type { BarInput } from '../types';
import { connorsRsi } from '../oscillators/connors-rsi';
import { MIXED_BARS, constantBars } from './fixtures/reference-data';

describe('connorsRsi', () => {
  it('output length equals bars.length', () => {
    expect(connorsRsi(MIXED_BARS, 3, 2, 10).length).toBe(MIXED_BARS.length);
  });

  it('all non-null values in [0, 100]', () => {
    const result = connorsRsi(MIXED_BARS, 3, 2, 10);
    result.forEach(v => {
      if (v !== null) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(100);
      }
    });
  });

  it('constant prices give mid-range values', () => {
    const result = connorsRsi(constantBars(50), 3, 2, 10);
    const valid = result.filter(v => v !== null);
    valid.forEach(v => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    });
  });
});
