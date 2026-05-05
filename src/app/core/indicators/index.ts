export * from './types';
export * from './registry';
export * from './utils';

// Indicator implementations live in category sub-folders.
// Each file self-registers on import. Import the ones you need:
//
// Moving Averages (15):
//   import { sma } from './moving-averages/sma';
//   import { ema } from './moving-averages/ema';
//   import { wma } from './moving-averages/wma';
//   import { rma } from './moving-averages/rma';
//   import { smma } from './moving-averages/smma';
//   import { dema } from './moving-averages/dema';
//   import { tema } from './moving-averages/tema';
//   import { hma } from './moving-averages/hma';
//   import { lsma } from './moving-averages/lsma';
//   import { zlsma } from './moving-averages/zlsma';
//   import { alma } from './moving-averages/alma';
//   import { vwma } from './moving-averages/vwma';
//   import { mcginleyDynamic } from './moving-averages/mcginley';
//   import { macross } from './moving-averages/macross';
//   import { maribbon } from './moving-averages/maribbon';
//
// Oscillators / Momentum:
//   import { rsi } from './oscillators/rsi';
//   import { macd } from './momentum/macd';
