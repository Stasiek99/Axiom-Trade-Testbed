import { describe, it, expect } from 'vitest';
import type { BarInput } from '../types';
import { cci } from '../oscillators/cci';
import { ARITHMETIC_BARS, MIXED_BARS, constantBars } from './fixtures/reference-data';

describe('cci', () => {
  it('output length equals bars.length', () => {
    expect(cci(MIXED_BARS, 5).length).toBe(MIXED_BARS.length);
  });

  it('all indices < period - 1 are null', () => {
    const result = cci(ARITHMETIC_BARS, 5);
    for (let i = 0; i < 4; i++) expect(result[i]).toBeNull();
  });

  it('constant prices yield CCI = 0', () => {
    const result = cci(constantBars(30), 5);
    result.forEach(v => {
      if (v !== null) expect(v).toBeCloseTo(0, 1);
    });
  });

  it('monotonically rising prices give positive CCI', () => {
    const bars: BarInput[] = Array.from({ length: 30 }, (_, i) => ({
      time: i as BarInput['time'],
      open: 50 + 0.5 * i, high: 50 + 0.5 * i + 1, low: 50 + 0.5 * i - 1, close: 50 + 0.5 * i,
    }));
    const result = cci(bars, 5);
    const valid = result.filter(v => v !== null);
    valid.forEach(v => { expect(v!).toBeGreaterThan(0); });
  });

  it('returns all-null when bars.length < period', () => {
    expect(cci(ARITHMETIC_BARS.slice(0, 3), 5).every(v => v === null)).toBe(true);
  });
});
