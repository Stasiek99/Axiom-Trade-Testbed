import type { ConditionKey } from '../strategy/strategy.model';
import type { BarInput } from '../indicators';

// ── Scalar extractors for complex indicator output shapes ─────────────────────

function twoLines(v: unknown): [number, number] {
  const o = v as Record<string, number>;
  if ('line1'    in o) return [o['line1'],    o['line2']];
  if ('fast'     in o) return [o['fast'],     o['slow']];
  if ('k'        in o) return [o['k'],        o['d']];
  if ('trix'     in o) return [o['trix'],     o['signal']];
  if ('kst'      in o) return [o['kst'],      o['signal']];
  if ('viPlus'   in o) return [o['viPlus'],   o['viMinus']];
  if ('up'       in o) return [o['up'],       o['down']];
  if ('shortStop' in o) return [o['shortStop'], o['longStop']];
  return [0, 0];
}

function macdScalars(v: unknown): { m: number; s: number; h: number } {
  const o = v as Record<string, number>;
  return {
    m: o['macd']    ?? o['impulse'] ?? o['main'] ?? 0,
    s: o['signal']  ?? 0,
    h: o['histogram'] ?? 0,
  };
}

function bandScalars(v: unknown): { upper: number; middle: number; lower: number } {
  const o = v as Record<string, number>;
  return {
    upper:  o['upper']  ?? 0,
    middle: o['middle'] ?? o['median'] ?? 0,
    lower:  o['lower']  ?? 0,
  };
}

// ── Main evaluator ────────────────────────────────────────────────────────────

/**
 * Returns true when the condition fires at bar index `i`.
 * Requires i >= 1 (prev bar for cross detection).
 * Returns false for any null values — indicator warm-up period.
 */
export function evaluateCondition(
  key:           ConditionKey,
  i:             number,
  bars:          BarInput[],
  primaryVals:   unknown[],
  secondaryVals: unknown[],
  threshold:     number,
): boolean {
  if (i < 1) return false;

  const p  = primaryVals[i];
  const pp = primaryVals[i - 1];
  if (p == null || pp == null) return false;

  const close     = bars[i].close;
  const prevClose = bars[i - 1].close;

  switch (key) {
    // ── overlay-line: price vs indicator line ─────────────────────────────
    case 'price_crosses_above': {
      const l = p as number, pl = pp as number;
      return close > l && prevClose <= pl;
    }
    case 'price_crosses_below': {
      const l = p as number, pl = pp as number;
      return close < l && prevClose >= pl;
    }
    case 'price_above': return close > (p as number);
    case 'price_below': return close < (p as number);

    // ── line vs secondary line ────────────────────────────────────────────
    case 'line_crosses_above': {
      const s = secondaryVals[i], ps = secondaryVals[i - 1];
      if (s == null || ps == null) return false;
      return (p as number) > (s as number) && (pp as number) <= (ps as number);
    }
    case 'line_crosses_below': {
      const s = secondaryVals[i], ps = secondaryVals[i - 1];
      if (s == null || ps == null) return false;
      return (p as number) < (s as number) && (pp as number) >= (ps as number);
    }

    // ── oscillator threshold ──────────────────────────────────────────────
    case 'above_threshold':          return (p as number) > threshold;
    case 'below_threshold':          return (p as number) < threshold;
    case 'crosses_above_threshold':  return (p as number) > threshold && (pp as number) <= threshold;
    case 'crosses_below_threshold':  return (p as number) < threshold && (pp as number) >= threshold;

    // ── macd ──────────────────────────────────────────────────────────────
    case 'macd_bullish': {
      const cur = macdScalars(p), prev = macdScalars(pp);
      return cur.m > cur.s && prev.m <= prev.s;
    }
    case 'macd_bearish': {
      const cur = macdScalars(p), prev = macdScalars(pp);
      return cur.m < cur.s && prev.m >= prev.s;
    }
    case 'histogram_positive': {
      const cur = macdScalars(p), prev = macdScalars(pp);
      return cur.h > 0 && prev.h <= 0;
    }
    case 'histogram_negative': {
      const cur = macdScalars(p), prev = macdScalars(pp);
      return cur.h < 0 && prev.h >= 0;
    }

    // ── two-line ──────────────────────────────────────────────────────────
    case 'fast_crosses_above_slow': {
      const [f, s] = twoLines(p), [pf, ps] = twoLines(pp);
      return f > s && pf <= ps;
    }
    case 'fast_crosses_below_slow': {
      const [f, s] = twoLines(p), [pf, ps] = twoLines(pp);
      return f < s && pf >= ps;
    }
    case 'fast_above_slow': { const [f, s] = twoLines(p); return f > s; }
    case 'fast_below_slow': { const [f, s] = twoLines(p); return f < s; }

    // ── band ──────────────────────────────────────────────────────────────
    case 'price_crosses_upper': {
      const b = bandScalars(p), pb = bandScalars(pp);
      return close > b.upper && prevClose <= pb.upper;
    }
    case 'price_crosses_lower': {
      const b = bandScalars(p), pb = bandScalars(pp);
      return close < b.lower && prevClose >= pb.lower;
    }
    case 'price_above_upper':  return close > bandScalars(p).upper;
    case 'price_below_lower':  return close < bandScalars(p).lower;
    case 'price_above_middle': return close > bandScalars(p).middle;
    case 'price_below_middle': return close < bandScalars(p).middle;

    default: return false;
  }
}
