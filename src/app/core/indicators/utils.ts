import type { UTCTimestamp } from 'lightweight-charts';
import type { Bar } from '../models/bar.model';

export interface ChartPoint {
  time: UTCTimestamp;
  value: number;
}

/** Zip bars with indicator values, dropping null slots → chart-ready array */
export function toChartData(bars: Bar[], values: (number | null)[]): ChartPoint[] {
  return bars.reduce<ChartPoint[]>((acc, bar, i) => {
    const v = values[i];
    if (v !== null && v !== undefined) acc.push({ time: bar.time, value: v });
    return acc;
  }, []);
}
