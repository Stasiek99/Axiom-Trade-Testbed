import { describe, it, expect } from 'vitest';
import { historicalVolatility } from '../volatility/historical-volatility';
import { ARITHMETIC_BARS, constantBars } from './fixtures/reference-data';

describe('historicalVolatility', () => {
  it('output length equals bars.length', () => {
    const result = historicalVolatility(ARITHMETIC_BARS, 5);
    expect(result.length).toBe(ARITHMETIC_BARS.length);
  });

  it('all indices < length are null, first valid at index length', () => {
    const period = 5;
    const result = historicalVolatility(ARITHMETIC_BARS, period);
    for (let i = 0; i < period; i++) expect(result[i]).toBeNull();
    expect(result[period]).not.toBeNull();
  });

  it('constant close → HV = 0 (no volatility)', () => {
    const flat = constantBars(20);
    const result = historicalVolatility(flat, 5);
    for (let i = 5; i < result.length; i++) {
      expect(result[i]).toBeCloseTo(0, 8);
    }
  });

  it('all-null when bars.length < length + 1', () => {
    const result = historicalVolatility(ARITHMETIC_BARS.slice(0, 3), 10);
    expect(result.every(v => v === null)).toBe(true);
    expect(result.length).toBe(3);
  });

  it('all non-null HV values are non-negative', () => {
    const result = historicalVolatility(ARITHMETIC_BARS, 5);
    result.forEach(v => {
      if (v !== null) expect(v).toBeGreaterThanOrEqual(0);
    });
  });

  it('upward trending price has positive HV', () => {
    const result = historicalVolatility(ARITHMETIC_BARS, 5);
    // ARITHMETIC_BARS has close incrementing by 1 each bar
    // This produces positive log returns, should yield positive HV
    expect(result[6]).toBeGreaterThan(0);
  });
});
