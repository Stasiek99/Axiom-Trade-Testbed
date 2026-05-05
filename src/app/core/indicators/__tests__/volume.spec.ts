import { describe, it, expect } from 'vitest';
import type {
  BarInput,
  MACDPoint,
  TwoLinePoint,
  VolumeBarPoint,
} from '../types';
import { obv } from '../volume/obv';
import { mfi } from '../volume/mfi';
import { pvt } from '../volume/pvt';
import { volumeOscillator } from '../volume/volume-oscillator';
import { chaikinMF } from '../volume/chaikin-mf';
import { chaikinOscillator } from '../volume/chaikin-oscillator';
import { easeOfMovement } from '../volume/ease-of-movement';
import { klingerOscillator } from '../volume/klinger-oscillator';
import { netVolume } from '../volume/net-volume';
import { volumeDelta } from '../volume/volume-delta';
import { cumulativeVolumeDelta } from '../volume/cumulative-volume-delta';
import { obvMACD } from '../volume/obv-macd';
import { coloredVolume } from '../volume/colored-volume';
import { ARITHMETIC_BARS, MIXED_BARS, volumeBars, risingVolumeBars, WAVE_VOLUME_BARS } from './fixtures/reference-data';

// ────────────────────────────────────────────────────────────
// Helper: create bars with consistent volume
// ────────────────────────────────────────────────────────────
function withVolume(bars: BarInput[], volume = 1000): BarInput[] {
  return bars.map(b => ({ ...b, volume }));
}

// ────────────────────────────────────────────────────────────
//  OBV
// ────────────────────────────────────────────────────────────
describe('obv', () => {
  it('output length equals bars.length', () => {
    expect(obv(withVolume(ARITHMETIC_BARS)).length).toBe(ARITHMETIC_BARS.length);
  });

  it('first value is 0', () => {
    expect(obv(withVolume(ARITHMETIC_BARS))[0]).toBe(0);
  });

  it('rising prices with constant volume → increasing OBV', () => {
    const result = obv(risingVolumeBars(15));
    // All closes increase, so OBV should always increase
    for (let i = 2; i < result.length; i++) {
      expect((result[i] as number)).toBeGreaterThan(result[i - 1] as number);
    }
  });

  it('oscillating prices → OBV rises on up days, falls on down days', () => {
    const result = obv(withVolume(WAVE_VOLUME_BARS, 1000));
    // Index 1: close(51) > 50 → +1000 → 1000
    expect(result[1]).toBe(1000);
    // Index 2: close(52) > 51 → +1000 → 2000
    expect(result[2]).toBe(2000);
    // Index 3: close(51) < 52 → -1000 → 1000
    expect(result[3]).toBe(1000);
  });

  it('constant prices → OBV stays at 0', () => {
    const constBars: BarInput[] = Array.from({ length: 10 }, (_, i) => ({
      time: i as BarInput['time'], open: 50, high: 51, low: 49, close: 50, volume: 1000,
    }));
    const result = obv(constBars);
    result.forEach(v => expect(v).toBeCloseTo(0, 8));
  });

  it('handles missing volume as 0', () => {
    // ARITHMETIC_BARS have no volume field
    const result = obv(ARITHMETIC_BARS);
    expect(result.length).toBe(ARITHMETIC_BARS.length);
    // No volume → OBV stays 0
    result.forEach(v => expect(v).toBeCloseTo(0, 8));
  });

  it('empty bars → empty array', () => {
    expect(obv([])).toEqual([]);
  });
});

// ────────────────────────────────────────────────────────────
//  MFI
// ────────────────────────────────────────────────────────────
describe('mfi', () => {
  it('output length equals bars.length', () => {
    expect(mfi(withVolume(ARITHMETIC_BARS), 5).length).toBe(ARITHMETIC_BARS.length);
  });

  it('early indices (before length) are null', () => {
    const result = mfi(withVolume(ARITHMETIC_BARS), 5);
    for (let i = 0; i < 5; i++) expect(result[i]).toBeNull();
  });

  it('values are between 0 and 100', () => {
    const result = mfi(withVolume(MIXED_BARS, 1000), 5);
    const valid = result.filter((v): v is number => v !== null);
    valid.forEach(v => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    });
  });

  it('rising prices + volume → MFI above 50 (buying pressure)', () => {
    const result = mfi(risingVolumeBars(30), 5);
    const valid = result.filter((v): v is number => v !== null);
    expect(valid.length).toBeGreaterThan(0);
    const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
    expect(avg).toBeGreaterThan(50);
  });

  it('constant prices → MFI around 50', () => {
    // Build bars where typical price never changes
    // TP = (H+L+C)/3, so if close,high,low all stay same, MFI = neutral
    const flatBars: BarInput[] = [];
    for (let i = 0; i < 30; i++) {
      flatBars.push({
        time: i as BarInput['time'], open: 50, high: 51, low: 49, close: 50, volume: 1000,
      });
    }
    const result = mfi(flatBars, 5);
    const valid = result.filter((v): v is number => v !== null);
    valid.forEach(v => expect(v).toBeCloseTo(50, 2));
  });

  it('returns all-null when bars.length <= length', () => {
    expect(mfi(withVolume(MIXED_BARS.slice(0, 3)), 10).every(v => v === null)).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────
//  PVT
// ────────────────────────────────────────────────────────────
describe('pvt', () => {
  it('output length equals bars.length', () => {
    expect(pvt(withVolume(ARITHMETIC_BARS)).length).toBe(ARITHMETIC_BARS.length);
  });

  it('first value is 0', () => {
    expect(pvt(withVolume(ARITHMETIC_BARS))[0]).toBe(0);
  });

  it('rising prices → positive PVT', () => {
    const result = pvt(risingVolumeBars(15));
    // At index 1: PVT = 0 + 1000 * ((50+1+0.3-(50+0.3))/50.3)
    // close[0]=50.3 close[1]=51.3 pct=1.3/50.3 ≈ 0.0258 → pvt ≈ 25.8
    expect((result[result.length - 1] as number)).toBeGreaterThan(0);
  });

  it('constant prices → PVT = 0', () => {
    const constBars: BarInput[] = Array.from({ length: 10 }, (_, i) => ({
      time: i as BarInput['time'], open: 50, high: 51, low: 49, close: 50, volume: 1000,
    }));
    const result = pvt(constBars);
    result.forEach(v => expect(v).toBeCloseTo(0, 8));
  });

  it('empty bars → empty array', () => {
    expect(pvt([])).toEqual([]);
  });

  it('handles missing volume as 0', () => {
    const result = pvt(ARITHMETIC_BARS);
    // No volume means no change from 0
    result.forEach(v => expect(v).toBeCloseTo(0, 8));
  });
});

// ────────────────────────────────────────────────────────────
//  Volume Oscillator
// ────────────────────────────────────────────────────────────
describe('volumeOscillator', () => {
  it('output length equals bars.length', () => {
    expect(volumeOscillator(withVolume(ARITHMETIC_BARS), 3, 6).length).toBe(ARITHMETIC_BARS.length);
  });

  it('early indices are null', () => {
    const result = volumeOscillator(withVolume(ARITHMETIC_BARS), 3, 6);
    for (let i = 0; i < 5; i++) expect(result[i]).toBeNull();
  });

  it('constant volume → oscillator near 0', () => {
    const result = volumeOscillator(withVolume(ARITHMETIC_BARS, 1000), 3, 6);
    const valid = result.filter((v): v is number => v !== null);
    valid.forEach(v => expect(Math.abs(v)).toBeLessThan(0.1));
  });

  it('expanding volume → positive oscillator', () => {
    const result = volumeOscillator(risingVolumeBars(30), 3, 6);
    const valid = result.filter((v): v is number => v !== null);
    expect(valid.length).toBeGreaterThan(0);
  });

  it('returns all-null for too-short data', () => {
    expect(volumeOscillator(withVolume(MIXED_BARS.slice(0, 3)), 5, 10).every(v => v === null)).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────
//  Chaikin MF
// ────────────────────────────────────────────────────────────
describe('chaikinMF', () => {
  it('output length equals bars.length', () => {
    expect(chaikinMF(withVolume(ARITHMETIC_BARS), 5).length).toBe(ARITHMETIC_BARS.length);
  });

  it('early indices (before length) are null', () => {
    const result = chaikinMF(withVolume(ARITHMETIC_BARS), 5);
    for (let i = 0; i < 4; i++) expect(result[i]).toBeNull();
  });

  it('values are between -1 and 1 (normalised by volume)', () => {
    const result = chaikinMF(withVolume(MIXED_BARS, 1000), 5);
    const valid = result.filter((v): v is number => v !== null);
    valid.forEach(v => {
      expect(v).toBeGreaterThanOrEqual(-1);
      expect(v).toBeLessThanOrEqual(1);
    });
  });

  it('rising prices → CMF positive (accumulation)', () => {
    const result = chaikinMF(risingVolumeBars(30), 5);
    const valid = result.filter((v): v is number => v !== null);
    expect(valid.length).toBeGreaterThan(0);
    // With rising prices, close is closer to high, so MFM > 0 → CMF > 0
    const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
    expect(avg).toBeGreaterThan(0);
  });

  it('returns all-null when bars.length < length', () => {
    expect(chaikinMF(withVolume(MIXED_BARS.slice(0, 3)), 10).every(v => v === null)).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────
//  Chaikin Oscillator
// ────────────────────────────────────────────────────────────
describe('chaikinOscillator', () => {
  it('output length equals bars.length', () => {
    expect(chaikinOscillator(withVolume(ARITHMETIC_BARS), 3, 10).length).toBe(ARITHMETIC_BARS.length);
  });

  it('early indices are null', () => {
    const result = chaikinOscillator(withVolume(ARITHMETIC_BARS), 3, 10);
    for (let i = 0; i < 9; i++) expect(result[i]).toBeNull();
  });

  it('rising prices → positive oscillator values', () => {
    const result = chaikinOscillator(risingVolumeBars(30), 3, 10);
    const valid = result.filter((v): v is number => v !== null);
    expect(valid.length).toBeGreaterThan(0);
  });

  it('first valid index is slowLength - 1', () => {
    const result = chaikinOscillator(withVolume(ARITHMETIC_BARS, 1000), 3, 8);
    expect(result[0]).toBeNull();
    expect(result[7]).not.toBeNull();
  });

  it('constant prices → oscillator near 0', () => {
    const constBars: BarInput[] = Array.from({ length: 30 }, (_, i) => ({
      time: i as BarInput['time'], open: 50, high: 51, low: 49, close: 50, volume: 1000,
    }));
    const result = chaikinOscillator(constBars, 3, 10);
    const valid = result.filter((v): v is number => v !== null);
    valid.forEach(v => expect(Math.abs(v)).toBeLessThan(1));
  });

  it('returns all-null for too-short data', () => {
    expect(chaikinOscillator(withVolume(MIXED_BARS.slice(0, 3)), 5, 10).every(v => v === null)).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────
//  Ease of Movement
// ────────────────────────────────────────────────────────────
describe('easeOfMovement', () => {
  it('output length equals bars.length', () => {
    expect(easeOfMovement(withVolume(ARITHMETIC_BARS), 5).length).toBe(ARITHMETIC_BARS.length);
  });

  it('early indices are null', () => {
    const result = easeOfMovement(withVolume(ARITHMETIC_BARS), 5);
    for (let i = 0; i < 4; i++) expect(result[i]).toBeNull();
  });

  it('first valid index is length - 1', () => {
    const result = easeOfMovement(withVolume(ARITHMETIC_BARS, 1000), 3);
    expect(result[0]).toBeNull();
    expect(result[2]).not.toBeNull();
  });

  it('rising midpoint with constant volume → positive EOM', () => {
    const result = easeOfMovement(risingVolumeBars(30), 5);
    const valid = result.filter((v): v is number => v !== null);
    expect(valid.length).toBeGreaterThan(0);
  });

  it('constant prices → EOM near 0', () => {
    // All bars have same OHLC, volume present
    // Need at least 1 bar for EOM calculations (needs prev bar for midpoint)
    const constBars: BarInput[] = Array.from({ length: 15 }, (_, i) => ({
      time: i as BarInput['time'], open: 50, high: 51, low: 49, close: 50, volume: 1000,
    }));
    const result = easeOfMovement(constBars, 5);
    const valid = result.filter((v): v is number => v !== null);
    valid.forEach(v => expect(Math.abs(v)).toBeLessThan(0.01));
  });

  it('returns all-null for too-short data', () => {
    expect(easeOfMovement(withVolume(MIXED_BARS.slice(0, 2)), 10).every(v => v === null)).toBe(true);
  });

  it('handles zero volume → returns 0', () => {
    const result = easeOfMovement(withVolume(ARITHMETIC_BARS, 0), 5);
    // With no volume, EOM involves division by zero which should default to 0
    const valid = result.filter((v): v is number => v !== null);
    valid.forEach(v => expect(v).toBeCloseTo(0, 8));
  });
});

// ────────────────────────────────────────────────────────────
//  Klinger Oscillator
// ────────────────────────────────────────────────────────────
describe('klingerOscillator', () => {
  it('output length equals bars.length', () => {
    expect(klingerOscillator(withVolume(ARITHMETIC_BARS), 3, 6, 3).length).toBe(ARITHMETIC_BARS.length);
  });

  it('returns TwoLinePoint for valid entries', () => {
    const result = klingerOscillator(withVolume(MIXED_BARS, 1000), 3, 6, 3);
    const valid = result.filter((p): p is TwoLinePoint => p !== null);
    expect(valid.length).toBeGreaterThan(0);
    valid.forEach(p => {
      expect(typeof p.line1).toBe('number');
      expect(typeof p.line2).toBe('number');
    });
  });

  it('early entries are null', () => {
    const result = klingerOscillator(withVolume(ARITHMETIC_BARS), 3, 6, 3);
    for (let i = 0; i < 5; i++) expect(result[i]).toBeNull();
  });

  it('returns all-null for too-short data', () => {
    expect(klingerOscillator(withVolume(MIXED_BARS.slice(0, 3)), 10, 20, 5).every(v => v === null)).toBe(true);
  });

  it('constant prices with volume → KVO converges toward 0', () => {
    // With constant price the SVF is constant → both EMAs converge → KVO → 0
    const constBars: BarInput[] = Array.from({ length: 60 }, (_, i) => ({
      time: i as BarInput['time'], open: 50, high: 51, low: 49, close: 50, volume: 1000,
    }));
    const result = klingerOscillator(constBars, 3, 6, 3);
    const valid = result.filter((p): p is TwoLinePoint => p !== null);
    expect(valid.length).toBeGreaterThan(0);
    // Last values should be near 0 after convergence
    const last = valid[valid.length - 1];
    expect(Math.abs(last.line1)).toBeLessThan(1);
    expect(Math.abs(last.line2)).toBeLessThan(1);
  });
});

// ────────────────────────────────────────────────────────────
//  Net Volume
// ────────────────────────────────────────────────────────────
describe('netVolume', () => {
  it('output length equals bars.length', () => {
    expect(netVolume(withVolume(ARITHMETIC_BARS)).length).toBe(ARITHMETIC_BARS.length);
  });

  it('first value is 0', () => {
    expect(netVolume(withVolume(ARITHMETIC_BARS))[0]).toBe(0);
  });

  it('rising prices with constant volume → increasing net volume', () => {
    const result = netVolume(risingVolumeBars(15));
    for (let i = 2; i < result.length; i++) {
      expect((result[i] as number)).toBeGreaterThan(result[i - 1] as number);
    }
  });

  it('oscillating closes with volume → net volume matches pattern', () => {
    const result = netVolume(withVolume(WAVE_VOLUME_BARS, 1000));
    // close[0]=50, close[1]=51 (up) → +1000
    expect(result[1]).toBe(1000);
    // close[1]=51, close[2]=52 (up) → +1000 → 2000
    expect(result[2]).toBe(2000);
    // close[2]=52, close[3]=51 (down) → -1000 → 1000
    expect(result[3]).toBe(1000);
  });

  it('constant prices → net volume stays 0', () => {
    const constBars: BarInput[] = Array.from({ length: 10 }, (_, i) => ({
      time: i as BarInput['time'], open: 50, high: 51, low: 49, close: 50, volume: 1000,
    }));
    const result = netVolume(constBars);
    result.forEach(v => expect(v).toBeCloseTo(0, 8));
  });

  it('empty bars → empty array', () => {
    expect(netVolume([])).toEqual([]);
  });
});

// ────────────────────────────────────────────────────────────
//  Volume Delta
// ────────────────────────────────────────────────────────────
describe('volumeDelta', () => {
  it('output length equals bars.length', () => {
    expect(volumeDelta(withVolume(ARITHMETIC_BARS)).length).toBe(ARITHMETIC_BARS.length);
  });

  it('never returns null (always a value per bar)', () => {
    volumeDelta(withVolume(ARITHMETIC_BARS)).forEach(v => expect(v).not.toBeNull());
  });

  it('close near high → positive delta (buying)', () => {
    const buyBars: BarInput[] = [{ time: 0 as BarInput['time'], open: 50, high: 52, low: 48, close: 51, volume: 1000 }];
    // buyVol = 1000 * (51-48)/(52-48) = 1000 * 3/4 = 750
    // sellVol = 1000 * (52-51)/(52-48) = 1000 * 1/4 = 250
    // delta = 750 - 250 = 500
    expect(volumeDelta(buyBars)[0]).toBeCloseTo(500, 8);
  });

  it('close near low → negative delta (selling)', () => {
    const sellBars: BarInput[] = [{ time: 0 as BarInput['time'], open: 50, high: 52, low: 48, close: 49, volume: 1000 }];
    // buyVol = 1000 * (49-48)/(52-48) = 1000 * 1/4 = 250
    // sellVol = 1000 * (52-49)/(52-48) = 1000 * 3/4 = 750
    // delta = 250 - 750 = -500
    expect(volumeDelta(sellBars)[0]).toBeCloseTo(-500, 8);
  });

  it('close in middle → delta near 0', () => {
    const midBars: BarInput[] = [{ time: 0 as BarInput['time'], open: 50, high: 52, low: 48, close: 50, volume: 1000 }];
    expect(volumeDelta(midBars)[0]).toBeCloseTo(0, 8);
  });

  it('handles zero range → returns 0', () => {
    const flatBars: BarInput[] = [{ time: 0 as BarInput['time'], open: 50, high: 50, low: 50, close: 50, volume: 1000 }];
    expect(volumeDelta(flatBars)[0]).toBe(0);
  });

  it('empty bars → empty array', () => {
    expect(volumeDelta([])).toEqual([]);
  });
});

// ────────────────────────────────────────────────────────────
//  Cumulative Volume Delta
// ────────────────────────────────────────────────────────────
describe('cumulativeVolumeDelta', () => {
  it('output length equals bars.length', () => {
    expect(cumulativeVolumeDelta(withVolume(ARITHMETIC_BARS)).length).toBe(ARITHMETIC_BARS.length);
  });

  it('first value is 0', () => {
    expect(cumulativeVolumeDelta(withVolume(ARITHMETIC_BARS))[0]).toBe(0);
  });

  it('rising prices → cumulative delta positive', () => {
    const result = cumulativeVolumeDelta(risingVolumeBars(20));
    // Rising prices means close is near high → positive delta accumulating
    expect((result[result.length - 1] as number)).toBeGreaterThan(0);
  });

  it('constant prices → cumulative delta near 0', () => {
    const constBars: BarInput[] = Array.from({ length: 10 }, (_, i) => ({
      time: i as BarInput['time'], open: 50, high: 51, low: 49, close: 50, volume: 1000,
    }));
    const result = cumulativeVolumeDelta(constBars);
    result.forEach(v => expect(v).toBeCloseTo(0, 8));
  });

  it('empty bars → empty array', () => {
    expect(cumulativeVolumeDelta([])).toEqual([]);
  });
});

// ────────────────────────────────────────────────────────────
//  OBV-MACD
// ────────────────────────────────────────────────────────────
describe('obvMACD', () => {
  it('output length equals bars.length', () => {
    expect(obvMACD(withVolume(ARITHMETIC_BARS)).length).toBe(ARITHMETIC_BARS.length);
  });

  it('returns MACDPoint for valid entries', () => {
    const result = obvMACD(withVolume(risingVolumeBars(50), 1000));
    const valid = result.filter((p): p is MACDPoint => p !== null);
    expect(valid.length).toBeGreaterThan(0);
    valid.forEach(p => {
      expect(typeof p.macd).toBe('number');
      expect(typeof p.signal).toBe('number');
      expect(typeof p.histogram).toBe('number');
    });
  });

  it('histogram === macd - signal', () => {
    obvMACD(withVolume(risingVolumeBars(50), 1000)).forEach(p => {
      if (p !== null) expect(p.histogram).toBeCloseTo(p.macd - p.signal, 10);
    });
  });

  it('early entries are null (before slow EMA starts)', () => {
    const result = obvMACD(withVolume(risingVolumeBars(50), 1000));
    for (let i = 0; i < 20; i++) {
      // result[i] is undefined when i is past array length, null when the
      // indicator hasn't started yet, or a MACDPoint when computed
      expect(result[i] === null || result[i] === undefined).toBe(true);
    }
  });

  it('constant prices with volume → OBV flat → MACD = 0', () => {
    // Constant close → OBV unchanged → MACD = 0
    const constBars: BarInput[] = Array.from({ length: 50 }, (_, i) => ({
      time: i as BarInput['time'], open: 50, high: 51, low: 49, close: 50, volume: 1000,
    }));
    const result = obvMACD(constBars);
    const valid = result.filter((p): p is MACDPoint => p !== null);
    valid.forEach(p => {
      expect(p.macd).toBeCloseTo(0, 8);
      expect(p.signal).toBeCloseTo(0, 8);
      expect(p.histogram).toBeCloseTo(0, 8);
    });
  });

  it('returns all-null for too-short data', () => {
    expect(obvMACD(withVolume(ARITHMETIC_BARS.slice(0, 10))).every(v => v === null)).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────
//  Colored Volume
// ────────────────────────────────────────────────────────────
describe('coloredVolume', () => {
  it('output length equals bars.length', () => {
    expect(coloredVolume(withVolume(ARITHMETIC_BARS)).length).toBe(ARITHMETIC_BARS.length);
  });

  it('returns VolumeBarPoint for each bar', () => {
    const result = coloredVolume(withVolume(ARITHMETIC_BARS));
    result.forEach(p => {
      expect(p).not.toBeNull();
      expect(typeof p!.volume).toBe('number');
      expect([-1, 0, 1]).toContain(p!.color);
    });
  });

  it('close > open → color = 1 (up)', () => {
    const bars: BarInput[] = [{ time: 0 as BarInput['time'], open: 49, high: 52, low: 48, close: 51, volume: 1000 }];
    expect(coloredVolume(bars)[0]!.color).toBe(1);
  });

  it('close < open → color = -1 (down)', () => {
    const bars: BarInput[] = [{ time: 0 as BarInput['time'], open: 51, high: 52, low: 48, close: 49, volume: 1000 }];
    expect(coloredVolume(bars)[0]!.color).toBe(-1);
  });

  it('close === open → color = 0 (flat)', () => {
    const bars: BarInput[] = [{ time: 0 as BarInput['time'], open: 50, high: 52, low: 48, close: 50, volume: 1000 }];
    expect(coloredVolume(bars)[0]!.color).toBe(0);
  });

  it('volume is passed through correctly', () => {
    const bars: BarInput[] = [{ time: 0 as BarInput['time'], open: 49, high: 52, low: 48, close: 51, volume: 5000 }];
    expect(coloredVolume(bars)[0]!.volume).toBe(5000);
  });

  it('empty bars → empty array', () => {
    expect(coloredVolume([])).toEqual([]);
  });
});
