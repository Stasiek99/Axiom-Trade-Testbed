import { describe, it, expect } from 'vitest';
import type { BarInput } from '../types';
import { ultimateOscillator } from '../oscillators/ultimate-oscillator';
import { ARITHMETIC_BARS, MIXED_BARS } from './fixtures/reference-data';

describe('ultimateOscillator', () => {
  it('output length equals bars.length', () => {
    expect(ultimateOscillator(MIXED_BARS, 5, 10, 15).length).toBe(MIXED_BARS.length);
  });

  it('all indices < len3 are null', () => {
    const result = ultimateOscillator(MIXED_BARS, 5, 7, 14);
    for (let i = 0; i < 14; i++) expect(result[i]).toBeNull();
  });

  it('values range in [0, 100]', () => {
    const result = ultimateOscillator(MIXED_BARS, 5, 7, 14);
    result.forEach(v => {
      if (v !== null) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(100);
      }
    });
  });

  it('returns all-null when bars.length <= len3', () => {
    expect(ultimateOscillator(ARITHMETIC_BARS.slice(0, 12), 5, 7, 14).every(v => v === null)).toBe(true);
  });
});
