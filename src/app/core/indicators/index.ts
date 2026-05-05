export * from './types';
export * from './registry';
export * from './utils';

// Indicator implementations live in category sub-folders.
// Each file self-registers on import. Import the ones you need:
//
//   import { sma, SMA_DEF } from './moving-averages/sma';
//   import { ema, EMA_DEF } from './moving-averages/ema';
//   import { rsi, RSI_DEF } from './oscillators/rsi';
//   import { macd, MACD_DEF } from './momentum/macd';
