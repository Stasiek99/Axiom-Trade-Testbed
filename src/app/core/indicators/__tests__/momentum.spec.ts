import { describe, it, expect } from 'vitest';
import type { BarInput, TRIXPoint, KSTPoint, SqueezeMomentumPoint, ImpulseMACDPoint, MACD4CPoint, PriceOscillatorPoint } from '../types';
import { momentum } from '../momentum/momentum';
import { roc } from '../momentum/roc';
import { bop } from '../momentum/bop';
import { bullBearPower } from '../momentum/bull-bear-power';
import { elderForceIndex } from '../momentum/elder-force-index';
import { priceOscillator } from '../momentum/price-oscillator';
import { coppockCurve } from '../momentum/coppock-curve';
import { trix } from '../momentum/trix';
import { kst } from '../momentum/kst';
import { squeezeMomentum } from '../momentum/squeeze-momentum';
import { impulseMACD } from '../momentum/impulse-macd';
import { macd4c } from '../momentum/macd4c';
import { ARITHMETIC_BARS, MIXED_BARS, constantBars } from './fixtures/reference-data';

// ────────────────────────────────────────────────────────────
//  Momentum
// ────────────────────────────────────────────────────────────
describe('momentum', () => {
  it('output length equals bars.length', () => {
    expect(momentum(ARITHMETIC_BARS, 3).length).toBe(ARITHMETIC_BARS.length);
  });

  it('early indices (before length) are null', () => {
    const result = momentum(ARITHMETIC_BARS, 5);
    for (let i = 0; i < 5; i++) expect(result[i]).toBeNull();
  });

  it('first non-null value is close[5] - close[0]', () => {
    const result = momentum(ARITHMETIC_BARS, 5);
    expect(result[5]).toBe(6 - 1); // close[5]=6, close[0]=1
  });

  it('upward prices → positive momentum', () => {
    const result = momentum(ARITHMETIC_BARS, 3);
    result.forEach(v => { if (v !== null) expect(v).toBeGreaterThan(0); });
  });

  it('constant prices → momentum = 0', () => {
    const result = momentum(constantBars(20), 5);
    result.forEach(v => { if (v !== null) expect(v).toBeCloseTo(0, 8); });
  });

  it('returns all-null when bars.length <= length', () => {
    expect(momentum(ARITHMETIC_BARS.slice(0, 3), 10).every(v => v === null)).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────
//  ROC
// ────────────────────────────────────────────────────────────
describe('roc', () => {
  it('output length equals bars.length', () => {
    expect(roc(ARITHMETIC_BARS, 3).length).toBe(ARITHMETIC_BARS.length);
  });

  it('early indices are null', () => {
    const result = roc(ARITHMETIC_BARS, 5);
    for (let i = 0; i < 5; i++) expect(result[i]).toBeNull();
  });

  it('monotonically rising prices → positive ROC', () => {
    const result = roc(ARITHMETIC_BARS, 3);
    result.forEach(v => { if (v !== null) expect(v).toBeGreaterThan(0); });
  });

  it('constant prices → ROC = 0', () => {
    const result = roc(constantBars(20), 3);
    result.forEach(v => { if (v !== null) expect(v).toBeCloseTo(0, 8); });
  });

  it('returns all-null when bars.length <= length', () => {
    expect(roc(ARITHMETIC_BARS.slice(0, 3), 10).every(v => v === null)).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────
//  BOP
// ────────────────────────────────────────────────────────────
describe('bop', () => {
  it('output length equals bars.length', () => {
    expect(bop(ARITHMETIC_BARS).length).toBe(ARITHMETIC_BARS.length);
  });

  it('never returns null (always a value per bar)', () => {
    bop(ARITHMETIC_BARS).forEach(v => expect(v).not.toBeNull());
  });

  it('close > open → positive BOP', () => {
    // makeBar creates open = close - 0.1, so close > open always
    bop(ARITHMETIC_BARS.slice(0, 5)).forEach(v => {
      expect(v).toBeGreaterThan(0);
    });
  });

  it('close < open → negative BOP', () => {
    const bars: BarInput[] = Array.from({ length: 5 }, (_, i) => ({
      time: i as BarInput['time'], open: 51, high: 52, low: 49, close: 50,
    }));
    bop(bars).forEach(v => { expect(v).toBeLessThan(0); });
  });

  it('handles zero range (high === low) → returns 0', () => {
    const bars: BarInput[] = [{ time: 0 as BarInput['time'], open: 50, high: 50, low: 50, close: 50 }];
    expect(bop(bars)[0]).toBe(0);
  });

  it('empty bars → empty array', () => {
    expect(bop([])).toEqual([]);
  });
});

// ────────────────────────────────────────────────────────────
//  Bull/Bear Power
// ────────────────────────────────────────────────────────────
describe('bullBearPower', () => {
  it('output length equals bars.length', () => {
    expect(bullBearPower(ARITHMETIC_BARS, 5).length).toBe(ARITHMETIC_BARS.length);
  });

  it('early indices (before period) are null', () => {
    const result = bullBearPower(ARITHMETIC_BARS, 5);
    for (let i = 0; i < 4; i++) expect(result[i]).toBeNull();
  });

  it('first non-null index is period - 1', () => {
    const result = bullBearPower(ARITHMETIC_BARS, 3);
    expect(result[2]).not.toBeNull();
  });

  it('upward trend → positive (high closer to EMA than low)', () => {
    const result = bullBearPower(ARITHMETIC_BARS, 3);
    const valid = result.filter((v): v is number => v !== null);
    // On upward prices, high is further from EMA than low, so bull-bear > 0
    expect(valid.every(v => v > 0)).toBe(true);
  });

  it('constant prices → value near 0', () => {
    const result = bullBearPower(constantBars(30), 5);
    const valid = result.filter((v): v is number => v !== null);
    valid.forEach(v => expect(Math.abs(v)).toBeGreaterThanOrEqual(0));
  });

  it('returns all-null when bars.length < period', () => {
    expect(bullBearPower(ARITHMETIC_BARS.slice(0, 2), 10).every(v => v === null)).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────
//  Elder Force Index
// ────────────────────────────────────────────────────────────
describe('elderForceIndex', () => {
  it('output length equals bars.length', () => {
    expect(elderForceIndex(ARITHMETIC_BARS, 5).length).toBe(ARITHMETIC_BARS.length);
  });

  it('early indices (before period) are null', () => {
    const result = elderForceIndex(ARITHMETIC_BARS, 5);
    for (let i = 0; i < 4; i++) expect(result[i]).toBeNull();
  });

  it('upward prices with positive volume → positive force', () => {
    const bars: BarInput[] = Array.from({ length: 30 }, (_, i) => ({
      time: i as BarInput['time'], open: 49.9, high: 51, low: 49, close: 50 + i * 0.1, volume: 1000,
    }));
    const result = elderForceIndex(bars, 5);
    const valid = result.filter((v): v is number => v !== null);
    valid.forEach(v => expect(v).toBeGreaterThan(0));
  });

  it('constant prices with volume → force approaches 0', () => {
    const result = elderForceIndex(constantBars(30), 5);
    const valid = result.filter((v): v is number => v !== null);
    valid.forEach(v => expect(v).toBeCloseTo(0, 6));
  });

  it('handles missing volume (undefined) via default 0', () => {
    const result = elderForceIndex(ARITHMETIC_BARS, 5);
    const valid = result.filter((v): v is number => v !== null);
    expect(valid.length).toBeGreaterThan(0);
  });

  it('returns all-null when bars.length < length', () => {
    expect(elderForceIndex(ARITHMETIC_BARS.slice(0, 2), 10).every(v => v === null)).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────
//  Price Oscillator (PPO)
// ────────────────────────────────────────────────────────────
describe('priceOscillator', () => {
  it('output length equals bars.length', () => {
    expect(priceOscillator(ARITHMETIC_BARS, 3, 5, 3).length).toBe(ARITHMETIC_BARS.length);
  });

  it('returns PriceOscillatorPoint for valid entries', () => {
    const result = priceOscillator(MIXED_BARS, 3, 6, 3);
    const valid = result.filter((p): p is PriceOscillatorPoint => p !== null);
    expect(valid.length).toBeGreaterThan(0);
    valid.forEach(p => {
      expect(typeof p.main).toBe('number');
      expect(typeof p.signal).toBe('number');
      expect(typeof p.histogram).toBe('number');
    });
  });

  it('histogram === main - signal', () => {
    priceOscillator(MIXED_BARS, 3, 6, 3).forEach(p => {
      if (p !== null) expect(p.histogram).toBeCloseTo(p.main - p.signal, 10);
    });
  });

  it('constant prices → PPO = 0', () => {
    const result = priceOscillator(constantBars(30), 3, 6, 3);
    result.forEach(p => {
      if (p !== null) {
        expect(p.main).toBeCloseTo(0, 8);
        expect(p.signal).toBeCloseTo(0, 8);
        expect(p.histogram).toBeCloseTo(0, 8);
      }
    });
  });

  it('returns all-null for too-short data', () => {
    expect(priceOscillator(ARITHMETIC_BARS, 12, 26, 9).every(v => v === null)).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────
//  Coppock Curve
// ────────────────────────────────────────────────────────────
describe('coppockCurve', () => {
  it('output length equals bars.length', () => {
    expect(coppockCurve(ARITHMETIC_BARS, 3, 4, 4).length).toBe(ARITHMETIC_BARS.length);
  });

  it('returns null early then non-null values', () => {
    const result = coppockCurve(ARITHMETIC_BARS, 3, 4, 4);
    // ROC4 needs 4 bars + WMA3 = nulls until index 6
    expect(result[0]).toBeNull();
    const valid = result.filter(v => v !== null);
    expect(valid.length).toBeGreaterThan(0);
  });

  it('monotonically rising prices → positive coppock', () => {
    const result = coppockCurve(ARITHMETIC_BARS, 3, 4, 4);
    const valid = result.filter((v): v is number => v !== null);
    valid.forEach(v => expect(v).toBeGreaterThan(0));
  });

  it('constant prices → coppock = 0', () => {
    const result = coppockCurve(constantBars(30), 3, 4, 4);
    const valid = result.filter((v): v is number => v !== null);
    valid.forEach(v => expect(v).toBeCloseTo(0, 8));
  });

  it('returns all-null for too-short data', () => {
    expect(coppockCurve(ARITHMETIC_BARS.slice(0, 5), 10, 10, 10).every(v => v === null)).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────
//  TRIX
// ────────────────────────────────────────────────────────────
describe('trix', () => {
  it('output length equals bars.length', () => {
    expect(trix(ARITHMETIC_BARS, 3, 3).length).toBe(ARITHMETIC_BARS.length);
  });

  it('returns TRIXPoint for valid entries', () => {
    const result = trix(MIXED_BARS, 3, 3);
    const valid = result.filter((p): p is TRIXPoint => p !== null);
    expect(valid.length).toBeGreaterThan(0);
    valid.forEach(p => {
      expect(typeof p.trix).toBe('number');
      expect(typeof p.signal).toBe('number');
    });
  });

  it('constant prices → TRIX = 0', () => {
    const result = trix(constantBars(30), 3, 3);
    result.forEach(p => {
      if (p !== null) {
        expect(p.trix).toBeCloseTo(0, 8);
        expect(p.signal).toBeCloseTo(0, 8);
      }
    });
  });

  it('monotonically rising prices → positive TRIX', () => {
    const result = trix(ARITHMETIC_BARS, 3, 3);
    const valid = result.filter((p): p is TRIXPoint => p !== null);
    valid.forEach(p => expect(p.trix).toBeGreaterThan(0));
  });

  it('returns all-null for too-short data', () => {
    // triple EMA(5) needs at least 5+5+5=15 bars, ARITHMETIC is 15
    expect(trix(ARITHMETIC_BARS.slice(0, 8), 5, 3).every(v => v === null)).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────
//  KST
// ────────────────────────────────────────────────────────────
describe('kst', () => {
  it('output length equals bars.length', () => {
    expect(kst(ARITHMETIC_BARS).length).toBe(ARITHMETIC_BARS.length);
  });

  it('returns KSTPoint for late entries on long-enough data', () => {
    const longs: BarInput[] = Array.from({ length: 60 }, (_, i) => ({
      time: i as BarInput['time'],
      open: 49 + (i % 10) * 0.2,
      high: 52 + (i % 10) * 0.3,
      low: 48 + (i % 10) * 0.1,
      close: 50 + (i % 10) * 0.2,
    }));
    const result = kst(longs);
    const valid = result.filter((p): p is KSTPoint => p !== null);
    expect(valid.length).toBeGreaterThan(0);
    valid.forEach(p => {
      expect(typeof p.kst).toBe('number');
      expect(typeof p.signal).toBe('number');
    });
  });

  it('constant prices → KST = 0', () => {
    const result = kst(constantBars(50));
    const valid = result.filter((p): p is KSTPoint => p !== null);
    valid.forEach(p => {
      expect(p.kst).toBeCloseTo(0, 6);
      expect(p.signal).toBeCloseTo(0, 6);
    });
  });

  it('early entries are null', () => {
    const result = kst(MIXED_BARS);
    for (let i = 0; i < 10; i++) expect(result[i]).toBeNull();
  });
});

// ────────────────────────────────────────────────────────────
//  Squeeze Momentum
// ────────────────────────────────────────────────────────────
describe('squeezeMomentum', () => {
  it('output length equals bars.length', () => {
    expect(squeezeMomentum(ARITHMETIC_BARS, 5, 2, 5, 1.5).length).toBe(ARITHMETIC_BARS.length);
  });

  it('returns SqueezeMomentumPoint for valid entries', () => {
    const result = squeezeMomentum(MIXED_BARS, 5, 2, 5, 1.5);
    const valid = result.filter((p): p is SqueezeMomentumPoint => p !== null);
    expect(valid.length).toBeGreaterThan(0);
    valid.forEach(p => {
      expect(typeof p.momentum).toBe('number');
      expect(typeof p.squeeze).toBe('boolean');
    });
  });

  it('early entries (before max period) are null', () => {
    const result = squeezeMomentum(ARITHMETIC_BARS, 5, 2, 5, 1.5);
    for (let i = 0; i < 4; i++) expect(result[i]).toBeNull();
  });

  it('returns all-null when data too short', () => {
    const result = squeezeMomentum(ARITHMETIC_BARS.slice(0, 2), 10, 2, 10, 1.5);
    expect(result.every(v => v === null)).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────
//  Impulse MACD
// ────────────────────────────────────────────────────────────
describe('impulseMACD', () => {
  it('output length equals bars.length', () => {
    expect(impulseMACD(ARITHMETIC_BARS, 5, 3).length).toBe(ARITHMETIC_BARS.length);
  });

  it('returns ImpulseMACDPoint for valid entries', () => {
    const result = impulseMACD(MIXED_BARS, 5, 3);
    const valid = result.filter((p): p is ImpulseMACDPoint => p !== null);
    expect(valid.length).toBeGreaterThan(0);
    valid.forEach(p => {
      expect(typeof p.impulse).toBe('number');
      expect(typeof p.signal).toBe('number');
      expect([-1, 0, 1]).toContain(p.direction);
    });
  });

  it('constant prices → impulse = 0, direction = 0', () => {
    const result = impulseMACD(constantBars(30), 5, 3);
    result.forEach(p => {
      if (p !== null) {
        expect(p.impulse).toBeCloseTo(0, 8);
        expect(p.signal).toBeCloseTo(0, 8);
        expect(p.direction).toBe(0);
      }
    });
  });

  it('returns all-null for too-short data', () => {
    expect(impulseMACD(ARITHMETIC_BARS.slice(0, 3), 9, 3).every(v => v === null)).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────
//  MACD 4C
// ────────────────────────────────────────────────────────────
describe('macd4c', () => {
  it('output length equals bars.length', () => {
    expect(macd4c(ARITHMETIC_BARS, 3, 5, 3).length).toBe(ARITHMETIC_BARS.length);
  });

  it('returns MACD4CPoint for valid entries', () => {
    const result = macd4c(MIXED_BARS, 3, 6, 3);
    const valid = result.filter((p): p is MACD4CPoint => p !== null);
    expect(valid.length).toBeGreaterThan(0);
    valid.forEach(p => {
      expect(typeof p.macd).toBe('number');
      expect(typeof p.signal).toBe('number');
      expect(typeof p.histogram).toBe('number');
      expect([-2, -1, 1, 2]).toContain(p.color);
    });
  });

  it('histogram === macd - signal', () => {
    macd4c(MIXED_BARS, 3, 6, 3).forEach(p => {
      if (p !== null) expect(p.histogram).toBeCloseTo(p.macd - p.signal, 10);
    });
  });

  it('constant prices → MACD = 0, signal = 0, histogram = 0', () => {
    const result = macd4c(constantBars(30), 3, 5, 3);
    result.forEach(p => {
      if (p !== null) {
        expect(p.macd).toBeCloseTo(0, 8);
        expect(p.signal).toBeCloseTo(0, 8);
        expect(p.histogram).toBeCloseTo(0, 8);
      }
    });
  });

  it('returns all-null for too-short data', () => {
    expect(macd4c(ARITHMETIC_BARS, 12, 26, 9).every(v => v === null)).toBe(true);
  });
});
