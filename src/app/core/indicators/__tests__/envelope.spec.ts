import { describe, it, expect } from 'vitest';
import type { BarInput } from '../types';
import { envelope } from '../channels-bands/envelope';
import { ARITHMETIC_BARS, COMPUTED_REFERENCE, constantBars } from './fixtures/reference-data';

describe('envelope', () => {
  it('output length equals bars.length', () => {
    expect(envelope(ARITHMETIC_BARS, 5, 0.1).length).toBe(ARITHMETIC_BARS.length);
  });

  it('first (length-1) indices are null', () => {
    const result = envelope(ARITHMETIC_BARS, 5, 0.1);
    for (let i = 0; i < 4; i++) expect(result[i]).toBeNull();
    expect(result[4]).not.toBeNull();
  });

  it('all-null when bars.length < length', () => {
    const result = envelope(ARITHMETIC_BARS.slice(0, 3), 5, 0.1);
    expect(result.every(v => v === null)).toBe(true);
  });

  it('upper > middle > lower for all non-null points', () => {
    envelope(ARITHMETIC_BARS, 5, 0.1).forEach(p => {
      if (p !== null) {
        expect(p.upper).toBeGreaterThan(p.middle);
        expect(p.middle).toBeGreaterThan(p.lower);
      }
    });
  });

  it('Envelope(5, 0.1) on ARITHMETIC_BARS at index 4 matches reference', () => {
    const result = envelope(ARITHMETIC_BARS, 5, 0.1);
    const p = result[4]!;
    expect(p.upper).toBeCloseTo(COMPUTED_REFERENCE.ENV_UPPER_5_01_AT_4, 8);
    expect(p.middle).toBeCloseTo(COMPUTED_REFERENCE.ENV_MIDDLE_5_01_AT_4, 8);
    expect(p.lower).toBeCloseTo(COMPUTED_REFERENCE.ENV_LOWER_5_01_AT_4, 8);
  });

  it('wider percent widens the bands', () => {
    const r1 = envelope(ARITHMETIC_BARS, 5, 0.05);
    const r2 = envelope(ARITHMETIC_BARS, 5, 0.2);
    const last = r1.length - 1;
    expect(r2[last]!.upper).toBeGreaterThan(r1[last]!.upper);
    expect(r2[last]!.lower).toBeLessThan(r1[last]!.lower);
  });

  it('zero percent → all bands equal middle', () => {
    const result = envelope(ARITHMETIC_BARS, 5, 0);
    result.forEach(p => {
      if (p !== null) {
        expect(p.upper).toBe(p.middle);
        expect(p.lower).toBe(p.middle);
      }
    });
  });

  it('constant prices → bands = constant × (1 ± percent)', () => {
    const result = envelope(constantBars(15), 5, 0.1);
    result.forEach(p => {
      if (p !== null) {
        expect(p.middle).toBe(42);
        expect(p.upper).toBe(42 * 1.1);
        expect(p.lower).toBe(42 * 0.9);
      }
    });
  });
});
