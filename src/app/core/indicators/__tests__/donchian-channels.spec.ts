import { describe, it, expect } from 'vitest';
import type { BarInput } from '../types';
import { donchianChannels } from '../channels-bands/donchian-channels';
import { ARITHMETIC_BARS, COMPUTED_REFERENCE, constantBars } from './fixtures/reference-data';

describe('donchianChannels', () => {
  it('output length equals bars.length', () => {
    expect(donchianChannels(ARITHMETIC_BARS, 5).length).toBe(ARITHMETIC_BARS.length);
  });

  it('first (length-1) indices are null', () => {
    const result = donchianChannels(ARITHMETIC_BARS, 5);
    for (let i = 0; i < 4; i++) expect(result[i]).toBeNull();
    expect(result[4]).not.toBeNull();
  });

  it('all-null when bars.length < length', () => {
    const result = donchianChannels(ARITHMETIC_BARS.slice(0, 3), 5);
    expect(result.every(v => v === null)).toBe(true);
  });

  it('upper > middle > lower for all non-null points', () => {
    donchianChannels(ARITHMETIC_BARS, 5).forEach(p => {
      if (p !== null) {
        expect(p.upper).toBeGreaterThan(p.middle);
        expect(p.middle).toBeGreaterThan(p.lower);
      }
    });
  });

  it('DonchianChannels(5) on ARITHMETIC_BARS at index 4 matches reference', () => {
    const result = donchianChannels(ARITHMETIC_BARS, 5);
    const p = result[4]!;
    expect(p.upper).toBeCloseTo(COMPUTED_REFERENCE.DONCHIAN_UPPER_5_AT_4, 8);
    expect(p.middle).toBeCloseTo(COMPUTED_REFERENCE.DONCHIAN_MIDDLE_5_AT_4, 8);
    expect(p.lower).toBeCloseTo(COMPUTED_REFERENCE.DONCHIAN_LOWER_5_AT_4, 8);
  });

  it('upper = highest high, lower = lowest low of the window', () => {
    // MIXED_BARS covers a peak and trough
    const bars: BarInput[] = [
      { time: 0 as BarInput['time'], open: 10, high: 11, low: 9, close: 10 },
      { time: 1 as BarInput['time'], open: 11, high: 14, low: 10, close: 12 },
      { time: 2 as BarInput['time'], open: 12, high: 13, low: 8, close: 11 },
      { time: 3 as BarInput['time'], open: 11, high: 12, low: 10, close: 11 },
    ];
    const result = donchianChannels(bars, 3);
    // index 2 window = bars[0..2]: high=14, low=8
    expect(result[2]!.upper).toBe(14);
    expect(result[2]!.lower).toBe(8);
  });

  it('constant prices → all bands = constant', () => {
    const result = donchianChannels(constantBars(15), 5);
    result.forEach(p => {
      if (p !== null) {
        expect(p.upper).toBe(42.5); // high = 42 + 0.5
        expect(p.middle).toBe(42);  // (42.5 + 41.5) / 2
        expect(p.lower).toBe(41.5); // low = 42 - 0.5
      }
    });
  });
});
