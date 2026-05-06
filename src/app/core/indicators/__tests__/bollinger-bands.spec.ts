import { describe, it, expect } from 'vitest';
import type { BarInput } from '../types';
import { bollingerBands } from '../channels-bands/bollinger-bands';
import { ARITHMETIC_BARS, VOLATILITY_BARS, COMPUTED_REFERENCE, constantBars } from './fixtures/reference-data';

describe('bollingerBands', () => {
  it('output length equals bars.length', () => {
    expect(bollingerBands(ARITHMETIC_BARS, 5, 2).length).toBe(ARITHMETIC_BARS.length);
  });

  it('first (length-1) indices are null', () => {
    const result = bollingerBands(ARITHMETIC_BARS, 5, 2);
    for (let i = 0; i < 4; i++) expect(result[i]).toBeNull();
    expect(result[4]).not.toBeNull();
  });

  it('all-null when bars.length < length', () => {
    const result = bollingerBands(ARITHMETIC_BARS.slice(0, 3), 5, 2);
    expect(result.every(v => v === null)).toBe(true);
  });

  it('upper > middle > lower for all non-null points', () => {
    bollingerBands(ARITHMETIC_BARS, 5, 2).forEach(p => {
      if (p !== null) {
        expect(p.upper).toBeGreaterThan(p.middle);
        expect(p.middle).toBeGreaterThan(p.lower);
      }
    });
  });

  it('constant prices → all bands converge at the constant', () => {
    const result = bollingerBands(constantBars(20), 5, 2);
    result.forEach(p => {
      if (p !== null) {
        expect(p.upper).toBe(42);
        expect(p.middle).toBe(42);
        expect(p.lower).toBe(42);
      }
    });
  });

  it('BollingerBands(5,2) on ARITHMETIC_BARS at index 4 matches reference', () => {
    const result = bollingerBands(ARITHMETIC_BARS, 5, 2);
    const p = result[4]!;
    expect(p.upper).toBeCloseTo(COMPUTED_REFERENCE.BB_UPPER_5_2_AT_4, 8);
    expect(p.middle).toBeCloseTo(COMPUTED_REFERENCE.BB_MIDDLE_5_2_AT_4, 8);
    expect(p.lower).toBeCloseTo(COMPUTED_REFERENCE.BB_LOWER_5_2_AT_4, 8);
  });

  it('wider multiplier expands the bands', () => {
    const r1 = bollingerBands(VOLATILITY_BARS, 5, 1);
    const r2 = bollingerBands(VOLATILITY_BARS, 5, 2);
    const lastIdx = r1.length - 1;
    expect(r2[lastIdx]!.upper).toBeGreaterThan(r1[lastIdx]!.upper);
    expect(r2[lastIdx]!.lower).toBeLessThan(r1[lastIdx]!.lower);
  });
});
