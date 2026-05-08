import type { BacktestResult } from './backtest.model';
import type { StrategyConfig } from '../strategy/strategy.model';

export interface HistoryRecord {
  id: string;
  runAt: number;
  symbol: string;
  timeframe: string;
  strategyConfig: StrategyConfig;
  result: BacktestResult;
}
