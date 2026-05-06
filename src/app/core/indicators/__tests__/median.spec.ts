import { describe, it, expect } from 'vitest';
import type { BarInput } from '../types';
import { calcMedian } from '../channels-bands/median';
import { makeBarEx, constantBars } from './fixtures/reference-data';

describe('calcMedian', () => {
  it('output length equals bars.length', () => {
    const bars = Array.from({ length: 20 }, (_, i) => makeBarEx(i, i + 1, i + 2, i, i + 1));
    expect(calcMedian(bars, 3, 14, 2).length).toBe(bars.length);
  });

  it('early indices (before warmup) are null', () => {
    const bars = Array.from({ length: 20 }, (_, i) => makeBarEx(i, i + 1, i + 2, i, i + 1));
    const result = calcMedian(bars, 3, 14, 2);
    // ATR needs atrLength+1 = 15 bars for first valid → median window of 3 is ready earlier
    // First non-null is at atrLength = 14
    for (let i = 0; i < 14; i++) expect(result[i]).toBeNull();
    expect(result[14]).not.toBeNull();
  });

  it('all-null when bars.length < max(length, atrLength + 1)', () => {
    const bars = Array.from({ length: 5 }, (_, i) => makeBarEx(i, i + 1, i + 2, i, i + 1));
    const result = calcMedian(bars, 3, 14, 2);
    expect(result.every(v => v === null)).toBe(true);
  });

  it('upper > median > lower for all non-null points', () => {
    const bars = Array.from({ length: 30 }, (_, i) => makeBarEx(i, i, i + 3, i - 3, i));
    const result = calcMedian(bars, 3, 14, 2);
    result.forEach(p => {
      if (p !== null) {
        expect(p.upper).toBeGreaterThan(p.median);
        expect(p.median).toBeGreaterThan(p.lower);
      }
    });
  });

  it('has ema field for all non-null points', () => {
    const bars = Array.from({ length: 30 }, (_, i) => makeBarEx(i, i, i + 3, i - 3, i));
    const result = calcMedian(bars, 3, 14, 2);
    result.forEach(p => {
      if (p !== null) {
        expect(typeof p.ema).toBe('number');
      }
    });
  });

  it('constant bars → median = mid, ema = mid, bands = mid ± mult*TR', () => {
    // high=101, low=99 → mid=100, TR=2
    const bars: BarInput[] = Array.from({ length: 30 }, (_, i) => ({
      time: i as BarInput['time'], open: 100, high: 101, low: 99, close: 100,
    }));
    const result = calcMedian(bars, 3, 14, 2);
    const last = result[result.length - 1]!;
    expect(last.median).toBeCloseTo(100, 5);
    expect(last.ema).toBeCloseTo(100, 1);
    expect(last.upper).toBeCloseTo(100 + 2 * 2, 3);
    expect(last.lower).toBeCloseTo(100 - 2 * 2, 3);
  });

  it('wider ATR multiplier expands the bands', () => {
    const bars = Array.from({ length: 30 }, (_, i) => makeBarEx(i, i, i + 5, i - 5, i));
    const r1 = calcMedian(bars, 3, 14, 1);
    const r2 = calcMedian(bars, 3, 14, 3);
    const last = r1.length - 1;
    expect(r2[last]!.upper).toBeGreaterThan(r1[last]!.upper);
    expect(r2[last]!.lower).toBeLessThan(r1[last]!.lower);
  });
});
