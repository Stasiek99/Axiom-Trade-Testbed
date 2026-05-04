import { type UTCTimestamp } from 'lightweight-charts';

export interface Bar {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface AlpacaCryptoBar {
  t: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export interface AlpacaCryptoBarResponse {
  bars: Record<string, AlpacaCryptoBar[]>;
  next_page_token: string | null;
}

export const TIMEFRAME_MAP: Record<string, string> = {
  M1:  '1Min',
  M5:  '5Min',
  M15: '15Min',
  H1:  '1Hour',
  H4:  '4Hour',
  D1:  '1Day',
};
