import { describe, it, expect } from 'vitest';
import type { BarInput } from '../types';
import { keltnerChannels } from '../channels-bands/keltner-channels';
import { ARITHMETIC_BARS, VOLATILITY_BARS, constantBars } from './fixtures/reference-data';

describe('keltnerChannels', () => {
  it('output length equals bars.length', () => {
    expect(keltnerChannels(ARITHMETIC_BARS, 5, 2).length).toBe(ARITHMETIC_BARS.length);
  });

  it('early indices (before EMA + ATR warmup) are null', () => {
    const result = keltnerChannels(ARITHMETIC_BARS, 5, 2);
    // EMA seeds at len-1 = 4, ATR seeds at len = 5 → first valid >= 5
    for (let i = 0; i < 5; i++) expect(result[i]).toBeNull();
    expect(result[5]).not.toBeNull();
  });

  it('all-null when bars.length < length + 1', () => {
    const result = keltnerChannels(ARITHMETIC_BARS.slice(0, 5), 5, 2);
    expect(result.every(v => v === null)).toBe(true);
  });

  it('upper > middle > lower for all non-null points', () => {
    keltnerChannels(VOLATILITY_BARS, 5, 2).forEach(p => {
      if (p !== null) {
        expect(p.upper).toBeGreaterThan(p.middle);
        expect(p.middle).toBeGreaterThan(p.lower);
      }
    });
  });

  it('constant prices → middle = constant, bands = const ± mult*TR', () => {
    // With constant bars, TR = high-low = 2, ATR converges to 2
    // EMA converges to the constant close
    const bars: BarInput[] = Array.from({ length: 30 }, (_, i) => ({
      time: i as BarInput['time'], open: 100, high: 101, low: 99, close: 100,
    }));
    const result = keltnerChannels(bars, 5, 2);
    // After warmup: middle ≈ 100, upper ≈ 100 + 2*2 = 104, lower ≈ 100 - 2*2 = 96
    const last = result[result.length - 1]!;
    expect(last.middle).toBeCloseTo(100, 2);
    expect(last.upper).toBeGreaterThan(last.middle);
    expect(last.lower).toBeLessThan(last.middle);
  });

  it('wider multiplier expands the bands', () => {
    const r1 = keltnerChannels(VOLATILITY_BARS, 5, 1);
    const r2 = keltnerChannels(VOLATILITY_BARS, 5, 2);
    const last = r1.length - 1;
    expect(r2[last]!.upper).toBeGreaterThan(r1[last]!.upper);
    expect(r2[last]!.lower).toBeLessThan(r1[last]!.lower);
  });
});
