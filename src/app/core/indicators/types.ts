import type { UTCTimestamp } from 'lightweight-charts';

export interface BarInput {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export type IndicatorCategory =
  | 'moving-averages'
  | 'oscillators'
  | 'momentum'
  | 'trend'
  | 'volatility'
  | 'channels-bands'
  | 'volume'
  | 'patterns';

export interface MACDPoint {
  macd: number;
  signal: number;
  histogram: number;
}

export interface MACrossPoint {
  fast: number;
  slow: number;
  crossover: 1 | -1 | 0; // 1 = bullish cross, -1 = bearish cross, 0 = no cross
}

// Drives the future parameter-editor UI panel for each indicator
export interface OptionParam {
  key: string;
  label: string;
  type: 'number' | 'select' | 'boolean';
  defaultValue: number | string | boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ label: string; value: string }>; // for type:'select'
  description?: string;                              // tooltip in the editor
}

// Drives the future indicator-explanation window
export interface IndicatorMeta {
  id: string;          // unique slug used as registry key, e.g. 'sma'
  name: string;        // 'Simple Moving Average'
  shortName: string;   // 'SMA' — used on chart axis labels
  category: IndicatorCategory;
  description: string; // purpose explanation shown in the info window
  overlay: boolean;    // true → price pane; false → separate sub-pane
  params: OptionParam[];
}

// T = options object shape, O = one element of the output array
export interface IndicatorDef<T = Record<string, unknown>, O = number | null> {
  meta: IndicatorMeta;
  defaultOptions: T;
  calculate: (bars: BarInput[], options: T) => O[];
}
