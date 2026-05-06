import { describe, it, expect } from 'vitest';
import { awesomeOscillator } from '../oscillators/awesome-oscillator';
import { MIXED_BARS } from './fixtures/reference-data';

describe('awesomeOscillator', () => {
  it('output length equals bars.length', () => {
    expect(awesomeOscillator(MIXED_BARS, 5, 10).length).toBe(MIXED_BARS.length);
  });

  it('all indices < longLen - 1 are null', () => {
    const result = awesomeOscillator(MIXED_BARS, 5, 10);
    for (let i = 0; i < 9; i++) expect(result[i]).toBeNull();
  });

  it('non-null values are finite numbers', () => {
    const result = awesomeOscillator(MIXED_BARS, 5, 10);
    result.forEach(v => {
      if (v !== null) expect(isFinite(v)).toBe(true);
    });
  });

  it('returns null when bars too short', () => {
    const result = awesomeOscillator(MIXED_BARS.slice(0, 3), 5, 34);
    expect(result.every(v => v === null)).toBe(true);
  });
});
