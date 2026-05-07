import { Injectable, signal } from '@angular/core';
import type { StrategyConfig } from './strategy.model';

const EMA_CROSS: StrategyConfig = {
  name: 'EMA Cross',
  entry: {
    primarySlot:   { indicatorId: 'ema', category: 'moving-averages', params: { period: 10 } },
    conditionKey:  'line_crosses_above',
    secondarySlot: { indicatorId: 'ema', category: 'moving-averages', params: { period: 30 } },
  },
  exit: {
    primarySlot:   { indicatorId: 'ema', category: 'moving-averages', params: { period: 10 } },
    conditionKey:  'line_crosses_below',
    secondarySlot: { indicatorId: 'ema', category: 'moving-averages', params: { period: 30 } },
  },
  risk: { positionSizePct: 10, commissionBps: 5, slippageBps: 2 },
};

const RSI_REVERSION: StrategyConfig = {
  name: 'RSI Overbought / Oversold',
  entry: {
    primarySlot:  { indicatorId: 'rsi', category: 'oscillators', params: { period: 14 } },
    conditionKey: 'crosses_above_threshold',
    threshold:    30,
  },
  exit: {
    primarySlot:  { indicatorId: 'rsi', category: 'oscillators', params: { period: 14 } },
    conditionKey: 'crosses_above_threshold',
    threshold:    70,
  },
  risk: { positionSizePct: 5, commissionBps: 5, slippageBps: 2 },
};

const MACD_CROSS: StrategyConfig = {
  name: 'MACD Signal Cross',
  entry: {
    primarySlot:  { indicatorId: 'macd', category: 'momentum', params: { fast: 12, slow: 26, signal: 9 } },
    conditionKey: 'macd_bullish',
  },
  exit: {
    primarySlot:  { indicatorId: 'macd', category: 'momentum', params: { fast: 12, slow: 26, signal: 9 } },
    conditionKey: 'macd_bearish',
  },
  risk: { positionSizePct: 10, commissionBps: 5, slippageBps: 2 },
};

// ── Bollinger Band Mean Reversion ──────────────────────────────────────────
const BB_MEAN_REVERSION: StrategyConfig = {
  name: 'BB Mean Reversion',
  entry: {
    primarySlot:  { indicatorId: 'bollinger-bands', category: 'channels-bands', params: { length: 20, mult: 2 } },
    conditionKey: 'price_crosses_lower',
  },
  exit: {
    primarySlot:  { indicatorId: 'bollinger-bands', category: 'channels-bands', params: { length: 20, mult: 2 } },
    conditionKey: 'price_crosses_upper',
  },
  risk: { positionSizePct: 5, commissionBps: 5, slippageBps: 2 },
};

// ── Supertrend Trend Follow ─────────────────────────────────────────────────
const SUPERTREND_FOLLOW: StrategyConfig = {
  name: 'Supertrend',
  entry: {
    primarySlot:  { indicatorId: 'supertrend', category: 'trend', params: { period: 10, multiplier: 3 } },
    conditionKey: 'price_crosses_above',
  },
  exit: {
    primarySlot:  { indicatorId: 'supertrend', category: 'trend', params: { period: 10, multiplier: 3 } },
    conditionKey: 'price_crosses_below',
  },
  risk: { positionSizePct: 10, commissionBps: 5, slippageBps: 2 },
};

// ── Ichimoku TK Cross ───────────────────────────────────────────────────────
const ICHIMOKU_TK_CROSS: StrategyConfig = {
  name: 'Ichimoku TK Cross',
  entry: {
    primarySlot:  { indicatorId: 'ichimoku', category: 'trend', params: { tenkanLength: 9, kijunLength: 26, chikouLength: 52 } },
    conditionKey: 'fast_crosses_above_slow',
  },
  exit: {
    primarySlot:  { indicatorId: 'ichimoku', category: 'trend', params: { tenkanLength: 9, kijunLength: 26, chikouLength: 52 } },
    conditionKey: 'fast_crosses_below_slow',
  },
  risk: { positionSizePct: 10, commissionBps: 5, slippageBps: 2 },
};

// ── Stochastic %K/%D Cross ──────────────────────────────────────────────────
const STOCHASTIC_CROSS: StrategyConfig = {
  name: 'Stochastic %K/%D',
  entry: {
    primarySlot:  { indicatorId: 'stochastic', category: 'oscillators', params: { period: 14, kSmoothing: 3, dSmoothing: 3 } },
    conditionKey: 'fast_crosses_above_slow',
  },
  exit: {
    primarySlot:  { indicatorId: 'stochastic', category: 'oscillators', params: { period: 14, kSmoothing: 3, dSmoothing: 3 } },
    conditionKey: 'fast_crosses_below_slow',
  },
  risk: { positionSizePct: 5, commissionBps: 5, slippageBps: 2 },
};

// ── WaveTrend Cross ─────────────────────────────────────────────────────────
const WAVETREND_CROSS: StrategyConfig = {
  name: 'WaveTrend Cross',
  entry: {
    primarySlot:  { indicatorId: 'wave-trend', category: 'oscillators', params: { channelLen: 9, avgLen: 12 } },
    conditionKey: 'fast_crosses_above_slow',
  },
  exit: {
    primarySlot:  { indicatorId: 'wave-trend', category: 'oscillators', params: { channelLen: 9, avgLen: 12 } },
    conditionKey: 'fast_crosses_below_slow',
  },
  risk: { positionSizePct: 8, commissionBps: 5, slippageBps: 2 },
};

// ── Donchian Turtle Breakout ────────────────────────────────────────────────
// Entry on 20-bar high breakout; exit on 10-bar low breakdown (classic Turtle rules)
const DONCHIAN_TURTLE: StrategyConfig = {
  name: 'Donchian Turtle',
  entry: {
    primarySlot:  { indicatorId: 'donchian-channels', category: 'channels-bands', params: { length: 20 } },
    conditionKey: 'price_crosses_upper',
  },
  exit: {
    primarySlot:  { indicatorId: 'donchian-channels', category: 'channels-bands', params: { length: 10 } },
    conditionKey: 'price_crosses_lower',
  },
  risk: { positionSizePct: 5, commissionBps: 5, slippageBps: 2 },
};

// ── CCI Mean Reversion ──────────────────────────────────────────────────────
// Buy recovery from oversold (−100), sell arrival at overbought (+100)
const CCI_MEAN_REVERSION: StrategyConfig = {
  name: 'CCI Mean Reversion',
  entry: {
    primarySlot:  { indicatorId: 'cci', category: 'oscillators', params: { period: 20 } },
    conditionKey: 'crosses_above_threshold',
    threshold:    -100,
  },
  exit: {
    primarySlot:  { indicatorId: 'cci', category: 'oscillators', params: { period: 20 } },
    conditionKey: 'crosses_above_threshold',
    threshold:    100,
  },
  risk: { positionSizePct: 5, commissionBps: 5, slippageBps: 2 },
};

export const STRATEGY_PRESETS: StrategyConfig[] = [
  EMA_CROSS,
  RSI_REVERSION,
  MACD_CROSS,
  BB_MEAN_REVERSION,
  SUPERTREND_FOLLOW,
  ICHIMOKU_TK_CROSS,
  STOCHASTIC_CROSS,
  WAVETREND_CROSS,
  DONCHIAN_TURTLE,
  CCI_MEAN_REVERSION,
];

@Injectable({ providedIn: 'root' })
export class StrategyStore {
  private readonly _config = signal<StrategyConfig>(EMA_CROSS);
  readonly config = this._config.asReadonly();

  set(config: StrategyConfig): void {
    this._config.set(config);
  }

  patch(partial: Partial<StrategyConfig>): void {
    this._config.update(c => ({ ...c, ...partial }));
  }
}
