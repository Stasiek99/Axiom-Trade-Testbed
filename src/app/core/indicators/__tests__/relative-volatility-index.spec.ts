import { describe, it, expect } from 'vitest';
import { relativeVolatilityIndex } from '../oscillators/relative-volatility-index';
import { MIXED_BARS, constantBars } from './fixtures/reference-data';

describe('relativeVolatilityIndex', () => {
  it('output length equals bars.length', () => {
    expect(relativeVolatilityIndex(MIXED_BARS, 5, 3).length).toBe(MIXED_BARS.length);
  });

  it('all non-null values in [0, 100]', () => {
    const result = relativeVolatilityIndex(MIXED_BARS, 5, 3);
    result.forEach(v => {
      if (v !== null) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(100);
      }
    });
  });

  it('constant prices give RVI near 100 (no volatility variation)', () => {
    const result = relativeVolatilityIndex(constantBars(50), 5, 3);
    const valid = result.filter(v => v !== null);
    valid.forEach(v => expect(v!).toBeGreaterThan(90));
  });
});
