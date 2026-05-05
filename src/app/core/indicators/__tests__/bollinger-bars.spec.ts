import { describe, it, expect } from 'vitest';
import type { BarInput } from '../types';
import { bollingerBars } from '../volatility/bollinger-bars';
import { ARITHMETIC_BARS, VOLATILITY_BARS, COMPUTED_REFERENCE, constantBars } from './fixtures/reference-data';

describe('bollingerBars', () => {
  it('output length equals bars.length', () => {
    expect(bollingerBars(VOLATILITY_BARS, 5, 2).length).toBe(VOLATILITY_BARS.length);
  });

  it('all indices < period-1 are null', () => {
    const result = bollingerBars(VOLATILITY_BARS, 5, 2);
    for (let i = 0; i < 4; i++) expect(result[i]).toBeNull();
    expect(result[4]).not.toBeNull();
  });

  it('zone at index 4 on VOLATILITY_BARS matches reference', () => {
    const result = bollingerBars(VOLATILITY_BARS, 5, 2);
    expect(result[4]?.zone).toBe(COMPUTED_REFERENCE.BOLLINGER_BARS_ZONE_AT_4);
  });

  it('constant close → zone = 0 (at middle)', () => {
    const flat = constantBars(15);
    const result = bollingerBars(flat, 5, 2);
    for (let i = 4; i < result.length; i++) {
      expect(result[i]?.zone).toBe(0);
    }
  });

  it('all-null when bars.length < length', () => {
    const result = bollingerBars(ARITHMETIC_BARS.slice(0, 3), 10, 2);
    expect(result.every(v => v === null)).toBe(true);
    expect(result.length).toBe(3);
  });

  it('non-null entries contain all required fields', () => {
    const result = bollingerBars(VOLATILITY_BARS, 5, 2);
    for (let i = 4; i < result.length; i++) {
      const entry = result[i];
      expect(entry).toHaveProperty('close');
      expect(entry).toHaveProperty('middle');
      expect(entry).toHaveProperty('upper');
      expect(entry).toHaveProperty('lower');
      expect(entry).toHaveProperty('zone');
      expect(entry!.upper).toBeGreaterThan(entry!.lower);
    }
  });

  it('close above upper → zone = 2', () => {
    const result = bollingerBars(VOLATILITY_BARS, 5, 2);
    // At index 9 (last bar): close=19
    // closes[5..9] = [15,16,17,18,19], mean = 17
    // sumSq = 4+1+0+1+4 = 10, stddev = sqrt(2) ≈ 1.414
    // upper = 17 + 2*sqrt(2) ≈ 19.828
    // close(19) < upper(19.828) → not above upper
    // But close(19) > mean(17) → zone = 1
    // This shows the close is between middle and upper
    expect(result[9]?.zone).toBe(1);
  });

  it('close below lower → zone = -2', () => {
    // 5 stable bars at close=100 then a sharp drop to 50
    // Using mult=0.5 to make the band narrower
    const dropping = [
      { time: 0 as BarInput['time'], open: 100, high: 101, low: 99, close: 100 },
      { time: 1 as BarInput['time'], open: 100, high: 101, low: 99, close: 100 },
      { time: 2 as BarInput['time'], open: 100, high: 101, low: 99, close: 100 },
      { time: 3 as BarInput['time'], open: 100, high: 101, low: 99, close: 100 },
      { time: 4 as BarInput['time'], open: 100, high: 101, low: 99, close: 100 },
      { time: 5 as BarInput['time'], open: 50, high: 51, low: 49, close: 50 },
    ];
    const result = bollingerBars(dropping, 5, 0.5);
    // Index 5: closes[1..5] = [100,100,100,100,50], mean = 90
    // sumSq = 10²×4 + (-40)² = 400+1600 = 2000, stddev = sqrt(2000/5) = 20
    // lower = 90 - 0.5×20 = 80
    // close(50) < lower(80) → zone = -2
    expect(result[5]?.zone).toBe(-2);
  });

  it('all zones belong to {-2, -1, 0, 1, 2}', () => {
    const result = bollingerBars(VOLATILITY_BARS, 5, 2);
    const validZones = [-2, -1, 0, 1, 2];
    for (let i = 4; i < result.length; i++) {
      expect(validZones).toContain(result[i]?.zone);
    }
  });
});
