import { Injectable } from '@angular/core';

import { indicatorRegistry } from '../indicators';
import { evaluateCondition } from './condition-evaluator';
import type { Bar } from '../models/bar.model';
import type { BarInput } from '../indicators';
import type { ConditionRule, IndicatorSlot, StrategyConfig } from '../strategy/strategy.model';
import type { BacktestResult, EquityPoint, IndicatorRole, IndicatorSeries, TradeResult } from './backtest.model';

const ROLE_COLORS: Record<IndicatorRole, string[]> = {
  'entry-primary':   ['#22d3ee', '#7dd3fc', '#bae6fd'],
  'entry-secondary': ['#fb923c', '#fcd34d', '#fde68a'],
  'exit-primary':    ['#a78bfa', '#c4b5fd', '#ddd6fe'],
  'exit-secondary':  ['#34d399', '#6ee7b7', '#a7f3d0'],
};

const BPS = 0.0001; // 1 basis point = 0.01 %

@Injectable({ providedIn: 'root' })
export class BacktestEngineService {

  run(bars: Bar[], strategy: StrategyConfig, initialCapital = 10_000): BacktestResult {
    // BarInput is a superset of Bar (volume is optional) — safe cast
    const barInputs = bars as unknown as BarInput[];

    // Pre-compute indicator series for all slots up front
    const entryPrimary   = this.computeSlot(barInputs, strategy.entry.primarySlot);
    const entrySecondary = strategy.entry.secondarySlot
      ? this.computeSlot(barInputs, strategy.entry.secondarySlot)
      : [] as unknown[];

    const exitPrimary   = this.computeSlot(barInputs, strategy.exit.primarySlot);
    const exitSecondary = strategy.exit.secondarySlot
      ? this.computeSlot(barInputs, strategy.exit.secondarySlot)
      : [] as unknown[];

    const { commissionBps, slippageBps, positionSizePct } = strategy.risk;
    const commissionRate = commissionBps * BPS;
    const slippageRate   = slippageBps   * BPS;

    let cash            = initialCapital;
    let position        = 0;    // units held
    let entryPrice      = 0;
    let entryTime       = 0;
    let entryCommission = 0;

    const trades:      TradeResult[]  = [];
    const equityCurve: EquityPoint[]  = [];

    for (let i = 1; i < bars.length; i++) {
      const bar   = bars[i];
      const close = bar.close;
      const isLong = position > 0;

      // ── Exit check (before entry — avoid same-bar round-trip) ────────────
      if (isLong) {
        const shouldExit = evaluateCondition(
          strategy.exit.conditionKey, i, barInputs,
          exitPrimary, exitSecondary,
          strategy.exit.threshold ?? 0,
        );

        if (shouldExit) {
          const fillPrice     = close * (1 - slippageRate);
          const exitCommission = position * fillPrice * commissionRate;
          const proceeds       = position * fillPrice - exitCommission;
          const cost           = entryPrice * position + entryCommission;
          const pnl            = proceeds - cost;

          trades.push({
            entryTime,
            exitTime:   bar.time as number,
            entryPrice,
            exitPrice:  fillPrice,
            pnl,
            pnlPct:     pnl / cost * 100,
          });

          cash    += proceeds;
          position = 0;
        }
      }

      // ── Entry check ───────────────────────────────────────────────────────
      if (position === 0) {
        const shouldEnter = evaluateCondition(
          strategy.entry.conditionKey, i, barInputs,
          entryPrimary, entrySecondary,
          strategy.entry.threshold ?? 0,
        );

        if (shouldEnter) {
          const tradeCapital = cash * (positionSizePct / 100);
          const fillPrice    = close * (1 + slippageRate);
          entryCommission    = tradeCapital * commissionRate;
          position           = tradeCapital / fillPrice;
          entryPrice         = fillPrice;
          entryTime          = bar.time as number;
          cash              -= tradeCapital + entryCommission;
        }
      }

      // Mark-to-market equity at every bar
      equityCurve.push({ time: bar.time as number, value: cash + position * close });
    }

    // Force-close any open position at the last bar
    if (position > 0 && bars.length > 0) {
      const lastBar        = bars.at(-1)!;
      const fillPrice      = lastBar.close;
      const exitCommission = position * fillPrice * commissionRate;
      const proceeds       = position * fillPrice - exitCommission;
      const cost           = entryPrice * position + entryCommission;
      const pnl            = proceeds - cost;

      trades.push({
        entryTime,
        exitTime:  lastBar.time as number,
        entryPrice,
        exitPrice: fillPrice,
        pnl,
        pnlPct:    pnl / cost * 100,
      });
    }

    const finalCapital = equityCurve.at(-1)?.value ?? initialCapital;
    const winners      = trades.filter(t => t.pnl > 0).length;

    const indicators: IndicatorSeries[] = [
      ...this.buildSeriesLines(bars, entryPrimary,   strategy.entry.primarySlot,   'entry-primary'),
      ...(strategy.entry.secondarySlot ? this.buildSeriesLines(bars, entrySecondary, strategy.entry.secondarySlot, 'entry-secondary') : []),
      ...this.buildSeriesLines(bars, exitPrimary,    strategy.exit.primarySlot,    'exit-primary'),
      ...(strategy.exit.secondarySlot  ? this.buildSeriesLines(bars, exitSecondary,  strategy.exit.secondarySlot,  'exit-secondary')  : []),
    ];

    return {
      trades,
      equityCurve,
      indicators,
      totalReturn:    (finalCapital - initialCapital) / initialCapital * 100,
      maxDrawdown:    this.maxDrawdown(equityCurve, initialCapital),
      winRate:        trades.length > 0 ? winners / trades.length * 100 : 0,
      totalTrades:    trades.length,
      initialCapital,
      finalCapital,
    };
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private buildSeriesLines(
    bars:    Bar[],
    rawVals: unknown[],
    slot:    IndicatorSlot,
    role:    IndicatorRole,
  ): IndicatorSeries[] {
    const def     = indicatorRegistry.get(slot.indicatorId);
    if (!def) return [];

    const overlay  = def.meta.overlay;
    const short    = def.meta.shortName;
    const scaleId  = overlay ? 'right' : `osc-${slot.indicatorId}-${role}`;
    const colors   = ROLE_COLORS[role];

    // Build display suffix from first numeric param
    const firstNum = Object.values(slot.params).find((v): v is number => typeof v === 'number');
    const suffix   = firstNum != null ? `(${firstNum})` : '';

    const first = rawVals.find(v => v != null);
    if (first === undefined) return [];

    const toData = (vals: (number | null)[]): { time: number; value: number }[] =>
      bars
        .map((b, i) => (vals[i] != null ? { time: b.time as number, value: vals[i]! } : null))
        .filter((p): p is { time: number; value: number } => p !== null);

    const col = (i: number) => colors[Math.min(i, colors.length - 1)];

    const make = (vals: (number | null)[], name: string, idx: number): IndicatorSeries => ({
      id:      `${slot.indicatorId}-${role}-${idx}`,
      scaleId,
      name,
      color:   col(idx),
      overlay,
      role,
      data:    toData(vals),
    });

    const ext = (key: string): (number | null)[] =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rawVals.map(v => (v != null ? ((v as any)[key] as number | null) ?? null : null));

    if (typeof first === 'number') {
      return [make(rawVals as (number | null)[], `${short}${suffix}`, 0)];
    }

    const o = first as Record<string, unknown>;

    // MACD-family (macd/signal, impulse/signal, main/signal)
    if ('macd'    in o) return [make(ext('macd'),    `${short}${suffix}`, 0), make(ext('signal'), 'Signal', 1)];
    if ('impulse' in o) return [make(ext('impulse'), `${short}${suffix}`, 0), make(ext('signal'), 'Signal', 1)];
    if ('main'    in o) return [make(ext('main'),    `${short}${suffix}`, 0), make(ext('signal'), 'Signal', 1)];

    // Two-line variants
    if ('line1'    in o) return [make(ext('line1'),     `${short} L1`, 0), make(ext('line2'),   `${short} L2`,  1)];
    if ('fast'     in o) return [make(ext('fast'),      `${short} Fast`, 0), make(ext('slow'),  `${short} Slow`, 1)];
    if ('trix'     in o) return [make(ext('trix'),      'TRIX',    0), make(ext('signal'), 'Signal',  1)];
    if ('kst'      in o) return [make(ext('kst'),       'KST',     0), make(ext('signal'), 'Signal',  1)];
    if ('shortStop' in o) return [make(ext('shortStop'), 'Stop↑',  0), make(ext('longStop'), 'Stop↓', 1)];
    if ('k'        in o) return [make(ext('k'),         '%K',      0), make(ext('d'),      '%D',      1)];

    // Three-line
    if ('adx'    in o) return [make(ext('adx'),    'ADX',   0), make(ext('plusDI'),  '+DI', 1), make(ext('minusDI'), '-DI', 2)];
    if ('tenkan' in o) return [make(ext('tenkan'), 'Tenkan',0), make(ext('kijun'),   'Kijun', 1)];
    if ('jaw'    in o) return [make(ext('jaw'),    'Jaw',   0), make(ext('teeth'),   'Teeth', 1), make(ext('lips'), 'Lips', 2)];
    if ('viPlus' in o) return [make(ext('viPlus'), 'VI+',   0), make(ext('viMinus'), 'VI−',  1)];
    if ('up'     in o && 'down' in o) return [make(ext('up'), 'Aroon↑', 0), make(ext('down'), 'Aroon↓', 1)];

    // Bands
    if ('upper' in o) {
      const mid = 'middle' in o ? ext('middle') : ext('median');
      return [make(ext('upper'), 'Upper', 0), make(mid, 'Mid', 1), make(ext('lower'), 'Lower', 2)];
    }

    // Scalars embedded in objects
    if ('momentum' in o) return [make(ext('momentum'), short, 0)];
    if ('volume'   in o) return [make(ext('volume'),   short, 0)];

    // Skip pattern/fractal/donchian-ribbon (no meaningful scalar)
    return [];
  }

  private computeSlot(bars: BarInput[], slot: IndicatorSlot): unknown[] {
    const def = indicatorRegistry.get(slot.indicatorId);
    if (!def) return new Array(bars.length).fill(null);
    return def.calculate(bars, { ...def.defaultOptions, ...slot.params });
  }

  /** Derive conditionRule primary values — kept for external callers. */
  computeRule(bars: BarInput[], rule: ConditionRule): unknown[] {
    return this.computeSlot(bars, rule.primarySlot);
  }

  private maxDrawdown(curve: EquityPoint[], initialCapital: number): number {
    let peak = initialCapital;
    let dd   = 0;
    for (const p of curve) {
      if (p.value > peak) peak = p.value;
      const d = (peak - p.value) / peak * 100;
      if (d > dd) dd = d;
    }
    return dd;
  }
}
