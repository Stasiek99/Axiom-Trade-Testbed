export interface TradeResult {
  entryTime:  number;
  exitTime:   number;
  entryPrice: number;
  exitPrice:  number;
  pnl:        number;         // absolute $ P&L after costs
  pnlPct:     number;         // % P&L relative to position cost
  barsHeld:   number;         // number of bars the position was open
  exitReason: 'signal' | 'forced';  // forced = end-of-data close
}

export interface EquityPoint {
  time:  number;   // UTCTimestamp (seconds)
  value: number;   // portfolio mark-to-market in $
}

export type IndicatorRole = 'entry-primary' | 'entry-secondary' | 'exit-primary' | 'exit-secondary';

export interface IndicatorSeries {
  id:      string;          // unique slug e.g. "rsi-entry-primary-0"
  scaleId: string;          // shared scale for lines from same slot
  name:    string;          // display name e.g. "RSI(14)" or "Signal"
  color:   string;          // hex
  overlay: boolean;         // true → price scale, false → oscillator
  role:    IndicatorRole;
  data:    { time: number; value: number }[];
}

export interface BacktestResult {
  trades:           TradeResult[];
  equityCurve:      EquityPoint[];
  indicators:       IndicatorSeries[];
  totalReturn:      number;   // % return from initialCapital
  maxDrawdown:      number;   // % max peak-to-trough drawdown
  winRate:          number;   // % of closed trades that were profitable
  totalTrades:      number;
  initialCapital:   number;
  finalCapital:     number;
  netPnl:           number;   // finalCapital − initialCapital
  profitFactor:     number;   // grossProfit / grossLoss (Infinity when no losses)
  sharpeRatio:      number;   // annualised bar-by-bar Sharpe (√252 convention)
  avgTradeDuration: number;   // mean bars held per trade
}

export type BacktestStatus = 'idle' | 'running' | 'done' | 'error';
