import { describe, it, expect } from 'vitest';
import { dpo } from '../oscillators/dpo';
import { ARITHMETIC_BARS, MIXED_BARS } from './fixtures/reference-data';

describe('dpo', () => {
  it('output length equals bars.length', () => {
    expect(dpo(MIXED_BARS, 5).length).toBe(MIXED_BARS.length);
  });

  it('early indices are null', () => {
    const result = dpo(MIXED_BARS, 5);
    expect(result[0]).toBeNull();
    expect(result[3]).toBeNull();
  });

  it('non-null values are finite numbers', () => {
    const result = dpo(MIXED_BARS, 5);
    result.forEach(v => {
      if (v !== null) expect(isFinite(v)).toBe(true);
    });
  });

  it('DPO(5) on ARITHMETIC_BARS closing prices: SMA shifted by floor(5/2)+1=3', () => {
    const result = dpo(ARITHMETIC_BARS, 5);
    // Index 7: close=8, SMA at idx 7-3=4 is (1+2+3+4+5)/5=3 → 8-3=5
    // Index 8: close=9, SMA at idx 8-3=5 is (2+3+4+5+6)/5=4 → 9-4=5
    // ... each bar goes up by 1, SMA goes up by 1, so DPO = 5 for all valid
    result.forEach(v => {
      if (v !== null) {
        expect(v).toBeCloseTo(5, 5);
      }
    });
  });
});
