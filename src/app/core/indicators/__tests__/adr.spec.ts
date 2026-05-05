import { describe, it, expect } from 'vitest';
import { adr } from '../volatility/adr';
import { ARITHMETIC_BARS, MIXED_BARS, VOLATILITY_BARS, COMPUTED_REFERENCE, constantBars } from './fixtures/reference-data';

describe('adr', () => {
  it('output length equals bars.length', () => {
    expect(adr(MIXED_BARS, 5).length).toBe(MIXED_BARS.length);
  });

  it('all indices < period-1 are null', () => {
    const period = 5;
    const result = adr(MIXED_BARS, period);
    for (let i = 0; i < period - 1; i++) expect(result[i]).toBeNull();
    expect(result[period - 1]).not.toBeNull();
  });

  it('ADR(5) on VOLATILITY_BARS at index 4 matches reference', () => {
    const result = adr(VOLATILITY_BARS, 5);
    expect(result[4]).toBeCloseTo(COMPUTED_REFERENCE.ADR_5_AT_4, 8);
  });

  it('all valid values = 2.0 on VOLATILITY_BARS (constant range)', () => {
    const result = adr(VOLATILITY_BARS, 3);
    for (let i = 2; i < result.length; i++) {
      expect(result[i]).toBeCloseTo(2.0, 8);
    }
  });

  it('all-null when bars.length < length', () => {
    const result = adr(ARITHMETIC_BARS.slice(0, 3), 10);
    expect(result.every(v => v === null)).toBe(true);
    expect(result.length).toBe(3);
  });

  it('constant price → ADR close to 0 (flat bars have range from open manipulation)', () => {
    const flat = constantBars(15);
    const result = adr(flat, 5);
    for (let i = 4; i < result.length; i++) {
      expect(result[i]).toBeCloseTo(1.0, 5);
    }
  });
});
