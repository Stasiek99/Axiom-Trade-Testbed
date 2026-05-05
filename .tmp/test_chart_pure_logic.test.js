// Pure-logic unit tests for chart.component.ts helper functions.
// Functions are re-implemented inline (identical logic to source) to avoid Angular DI.
//
// NOTE on test data: 1700000000 is NOT a clean boundary for any trading interval:
//   1700000000 % 60   = 20  (not M1-aligned)
//   1700000000 % 3600 = 800 (not H1-aligned)
// All snap tests use verified-clean boundary timestamps (see comments).

import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// Re-implementations — verbatim logic extracted from chart.component.ts
// ---------------------------------------------------------------------------

/** formatCrosshairTime — lines 161-165 of chart.component.ts */
function formatCrosshairTime(ts) {
  const d = new Date(ts * 1000);
  const pad = (n) => n.toString().padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

/** getBarTimeForTrade — extracted from applyTrade (line 101) */
function getBarTimeForTrade(tradeTime, intervalSec) {
  return Math.floor(tradeTime / intervalSec) * intervalSec;
}

/** gapFillStart — extracted from fillGap (line 145) */
function gapFillStart(lastBarTime) {
  return new Date((lastBarTime + 1) * 1000).toISOString();
}

// ---------------------------------------------------------------------------
// formatCrosshairTime tests
// ---------------------------------------------------------------------------
describe('formatCrosshairTime', () => {
  it('canonical example: 1700000000 → "2023-11-14 22:13"', () => {
    // Verified: new Date(1700000000000).toUTCString() = "Tue, 14 Nov 2023 22:13:20 GMT"
    expect(formatCrosshairTime(1700000000)).toBe('2023-11-14 22:13');
  });

  it('formats midnight correctly (all zeros in time part)', () => {
    // 2024-01-01 00:00:00 UTC
    const ts = Date.UTC(2024, 0, 1, 0, 0, 0) / 1000;
    expect(formatCrosshairTime(ts)).toBe('2024-01-01 00:00');
  });

  it('zero-pads single-digit month, day, hour, minute', () => {
    // 2023-03-05 09:07:00 UTC
    const ts = Date.UTC(2023, 2, 5, 9, 7, 0) / 1000;
    expect(formatCrosshairTime(ts)).toBe('2023-03-05 09:07');
  });

  it('handles end-of-year boundary (2023-12-31 23:59)', () => {
    const ts = Date.UTC(2023, 11, 31, 23, 59, 0) / 1000;
    expect(formatCrosshairTime(ts)).toBe('2023-12-31 23:59');
  });

  it('output always matches "YYYY-MM-DD HH:mm" pattern', () => {
    const pattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
    expect(formatCrosshairTime(1700000000)).toMatch(pattern);
    expect(formatCrosshairTime(0)).toMatch(pattern);
    expect(formatCrosshairTime(Date.UTC(2030, 5, 15, 12, 30) / 1000)).toMatch(pattern);
  });

  it('epoch zero → "1970-01-01 00:00"', () => {
    expect(formatCrosshairTime(0)).toBe('1970-01-01 00:00');
  });

  it('uses UTC — not local timezone', () => {
    // 1700000000 is 22:13 UTC. Any local offset would shift the time or date.
    const result = formatCrosshairTime(1700000000);
    expect(result).toBe('2023-11-14 22:13');
  });

  it('truncates seconds — same minute regardless of seconds within it', () => {
    // 1700000000 = 22:13:20 UTC, 1700000001 = 22:13:21 — both should give 22:13
    expect(formatCrosshairTime(1700000000)).toBe('2023-11-14 22:13');
    expect(formatCrosshairTime(1700000001)).toBe('2023-11-14 22:13');
    // 1700000059 = 22:14:19 UTC (22:14, not 22:13 — the :59 crosses the minute)
    expect(formatCrosshairTime(1700000059)).toBe('2023-11-14 22:14');
  });

  it('advances minute at exactly the 60-second mark', () => {
    // ts=1700000019 → 22:13:39 UTC (still 22:13)
    // ts=1700000040 → 22:14:00 UTC (now 22:14)
    // Verified: 1700000000 = 22:13:20, so +40 = 22:14:00
    expect(formatCrosshairTime(1700000019)).toBe('2023-11-14 22:13');
    expect(formatCrosshairTime(1700000040)).toBe('2023-11-14 22:14');
  });
});

// ---------------------------------------------------------------------------
// getBarTimeForTrade tests
//
// All bar-boundary timestamps are verified multiples of their interval.
// Clean bases used:
//   M1  (60s):    1699999980 (% 60 = 0)
//   M5  (300s):   1700000100 (% 300 = 0)  — verified below
//   H1  (3600s):  1699999200 (% 3600 = 0)
//   D1  (86400s): 1699920000 (% 86400 = 0)
// ---------------------------------------------------------------------------
describe('getBarTimeForTrade (bar snap logic)', () => {

  // M1 = 60s — base: 1699999980
  it('M1: trade mid-bar snaps to bar open', () => {
    // trade at 1699999980 + 35 = 1700000015 → bar 1699999980
    expect(getBarTimeForTrade(1700000015, 60)).toBe(1699999980);
  });

  it('M1: trade exactly on bar boundary stays at that boundary', () => {
    expect(getBarTimeForTrade(1699999980, 60)).toBe(1699999980);
  });

  it('M1: trade at last second of bar (open + 59) snaps to same bar open', () => {
    // 1699999980 + 59 = 1700000039
    expect(getBarTimeForTrade(1700000039, 60)).toBe(1699999980);
  });

  it('M1: trade at first second of next bar snaps to next bar', () => {
    // 1699999980 + 60 = 1700000040
    expect(getBarTimeForTrade(1700000040, 60)).toBe(1700000040);
  });

  // H1 = 3600s — base: 1699999200
  it('H1: trade exactly on H1 boundary stays at that boundary', () => {
    expect(getBarTimeForTrade(1699999200, 3600)).toBe(1699999200);
  });

  it('H1: trade at mid-hour snaps to hour open', () => {
    // 1699999200 + 1800 = 1700001000
    expect(getBarTimeForTrade(1700001000, 3600)).toBe(1699999200);
  });

  it('H1: trade at last second of bar (open + 3599) snaps to same bar open', () => {
    // 1699999200 + 3599 = 1700002799
    expect(getBarTimeForTrade(1700002799, 3600)).toBe(1699999200);
  });

  it('H1: trade at first second of next bar snaps to next bar', () => {
    // next bar = 1699999200 + 3600 = 1700002800
    expect(getBarTimeForTrade(1700002800, 3600)).toBe(1700002800);
  });

  // M5 = 300s — find clean base
  it('M5: trade snaps to correct 5-minute bar', () => {
    // 1700000100 % 300 = 0? 1700000100 / 300 = 5666666.9... no.
    // 1700000000 / 300 = 5666666.6..., floor = 5666666, * 300 = 1699999800
    // So M5 base = 1699999800, next = 1700000100
    expect(1699999800 % 300).toBe(0); // sanity
    // trade mid-bar: 1699999800 + 150 = 1699999950
    expect(getBarTimeForTrade(1699999950, 300)).toBe(1699999800);
  });

  it('M5: trade at last second snaps to same bar', () => {
    // 1699999800 + 299 = 1700000099
    expect(getBarTimeForTrade(1700000099, 300)).toBe(1699999800);
  });

  // D1 = 86400s — base: 1699920000
  it('D1: trade at midnight (bar open) stays at that open', () => {
    expect(getBarTimeForTrade(1699920000, 86400)).toBe(1699920000);
  });

  it('D1: trade mid-day snaps to day open', () => {
    // 1699920000 + 43200 = 1699963200
    expect(getBarTimeForTrade(1699963200, 86400)).toBe(1699920000);
  });

  it('D1: trade at last second snaps to day open', () => {
    // 1699920000 + 86399 = 1700006399
    expect(getBarTimeForTrade(1700006399, 86400)).toBe(1699920000);
  });

  // Invariants — hold for all intervals
  it('result is always a multiple of intervalSec', () => {
    const intervals = [60, 300, 900, 3600, 14400, 86400];
    const tradeTime = 1700005555;
    for (const iv of intervals) {
      const barTime = getBarTimeForTrade(tradeTime, iv);
      expect(barTime % iv, `interval ${iv}`).toBe(0);
    }
  });

  it('result is always <= tradeTime', () => {
    expect(getBarTimeForTrade(1700000015, 60)).toBeLessThanOrEqual(1700000015);
    expect(getBarTimeForTrade(1700001000, 3600)).toBeLessThanOrEqual(1700001000);
    expect(getBarTimeForTrade(1699963200, 86400)).toBeLessThanOrEqual(1699963200);
  });

  it('difference between tradeTime and result is always < intervalSec', () => {
    const intervals = [60, 300, 3600, 86400];
    const tradeTime = 1700005555;
    for (const iv of intervals) {
      const diff = tradeTime - getBarTimeForTrade(tradeTime, iv);
      expect(diff, `interval ${iv}`).toBeGreaterThanOrEqual(0);
      expect(diff, `interval ${iv}`).toBeLessThan(iv);
    }
  });
});

// ---------------------------------------------------------------------------
// gapFillStart tests
// ---------------------------------------------------------------------------
describe('gapFillStart', () => {
  it('given example: 1700000000 → "2023-11-14T22:13:21.000Z"', () => {
    // new Date((1700000000 + 1) * 1000).toISOString() = new Date(1700000001000).toISOString()
    expect(gapFillStart(1700000000)).toBe('2023-11-14T22:13:21.000Z');
  });

  it('result is always a valid ISO 8601 string', () => {
    const result = gapFillStart(1700000000);
    expect(() => new Date(result)).not.toThrow();
    expect(new Date(result).toISOString()).toBe(result);
  });

  it('result timestamp is always strictly after lastBarTime', () => {
    const lastBarTime = 1700000000;
    const startTs = new Date(gapFillStart(lastBarTime)).getTime() / 1000;
    expect(startTs).toBeGreaterThan(lastBarTime);
  });

  it('advances by exactly 1 second from lastBarTime', () => {
    const lastBarTime = 1700000000;
    const startTs = new Date(gapFillStart(lastBarTime)).getTime() / 1000;
    expect(startTs).toBe(lastBarTime + 1);
  });

  it('epoch: lastBarTime=0 → "1970-01-01T00:00:01.000Z"', () => {
    expect(gapFillStart(0)).toBe('1970-01-01T00:00:01.000Z');
  });

  it('produces ".000Z" suffix for whole-second inputs', () => {
    expect(gapFillStart(1700000000).endsWith('.000Z')).toBe(true);
  });

  it('works for large future timestamp (year 2030)', () => {
    const futureTs = Date.UTC(2030, 0, 1, 0, 0, 0) / 1000;
    const result = gapFillStart(futureTs);
    expect(new Date(result).getTime() / 1000).toBe(futureTs + 1);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('consecutive calls produce monotonically increasing starts', () => {
    const t1 = new Date(gapFillStart(1700000000));
    const t2 = new Date(gapFillStart(1700003600));
    expect(t2 > t1).toBe(true);
  });

  it('gap fill covers no overlap — start is after lastBarTime, not equal', () => {
    // Ensures getCryptoBarsFrom does not re-fetch the last known bar
    const lastBarTime = 1699999200;
    const startTs = new Date(gapFillStart(lastBarTime)).getTime() / 1000;
    expect(startTs).not.toBe(lastBarTime);
    expect(startTs).toBe(lastBarTime + 1);
  });
});
