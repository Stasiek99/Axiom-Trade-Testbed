import { describe, it, expect } from 'vitest';
import { bbBandWidth } from '../volatility/bb-bandwidth';
import { ARITHMETIC_BARS, VOLATILITY_BARS, COMPUTED_REFERENCE, constantBars } from './fixtures/reference-data';

describe('bbBandWidth', () => {
  it('output length equals bars.length', () => {
    expect(bbBandWidth(VOLATILITY_BARS, 5, 2).length).toBe(VOLATILITY_BARS.length);
  });

  it('all indices < period-1 are null', () => {
    const result = bbBandWidth(VOLATILITY_BARS, 5, 2);
    for (let i = 0; i < 4; i++) expect(result[i]).toBeNull();
    expect(result[4]).not.toBeNull();
  });

  it('BBBandWidth(5,2) on VOLATILITY_BARS at index 4 matches reference', () => {
    const result = bbBandWidth(VOLATILITY_BARS, 5, 2);
    expect(result[4]).toBeCloseTo(COMPUTED_REFERENCE.BB_BANDWIDTH_5_2_AT_4, 8);
  });

  it('constant close → bandwidth = 0', () => {
    const flat = constantBars(15);
    const result = bbBandWidth(flat, 5, 2);
    for (let i = 4; i < result.length; i++) {
      expect(result[i]).toBeCloseTo(0, 8);
    }
  });

  it('all-null when bars.length < length', () => {
    const result = bbBandWidth(ARITHMETIC_BARS.slice(0, 3), 10, 2);
    expect(result.every(v => v === null)).toBe(true);
    expect(result.length).toBe(3);
  });

  it('all non-null bandwidth values are non-negative', () => {
    const result = bbBandWidth(VOLATILITY_BARS, 5, 2);
    result.forEach(v => {
      if (v !== null) expect(v).toBeGreaterThanOrEqual(0);
    });
  });

  it('higher multiplier increases bandwidth', () => {
    const result2 = bbBandWidth(VOLATILITY_BARS, 5, 2);
    const result3 = bbBandWidth(VOLATILITY_BARS, 5, 3);
    for (let i = 4; i < result2.length; i++) {
      expect(result3[i]).toBeGreaterThan(result2[i] as number);
    }
  });
});
