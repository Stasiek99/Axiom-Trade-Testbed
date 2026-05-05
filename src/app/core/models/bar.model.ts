import { type UTCTimestamp } from 'lightweight-charts';

export interface Bar {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
}
