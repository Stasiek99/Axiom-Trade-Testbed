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

export const STRATEGY_PRESETS: StrategyConfig[] = [EMA_CROSS, RSI_REVERSION, MACD_CROSS];

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
