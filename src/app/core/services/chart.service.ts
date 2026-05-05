import { Injectable } from '@angular/core';
import { createChart, CandlestickSeries, CrosshairMode, MouseEventParams, Time } from 'lightweight-charts';
import { Bar } from '../models/bar.model';

export interface CrosshairData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

@Injectable()
export class ChartService {
  private chart: ReturnType<typeof createChart> | null = null;
  private candleSeries: ReturnType<ReturnType<typeof createChart>['addSeries']> | null = null;

  init(container: HTMLElement): void {
    this.chart = createChart(container, {
      layout: {
        background: { color: '#131722' },
        textColor: '#9db2bd',
        fontFamily: 'Courier New, monospace',
      },
      grid: {
        vertLines: { color: '#1e2738' },
        horzLines: { color: '#1e2738' },
      },
      localization: { dateFormat: 'MMM dd' },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#1e2738',
      },
      rightPriceScale: { borderColor: '#1e2738' },
      crosshair: { mode: CrosshairMode.Normal },
      width: container.clientWidth,
      height: container.clientHeight,
    });

    this.candleSeries = this.chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });
  }

  destroy(): void {
    this.chart?.remove();
    this.chart = null;
    this.candleSeries = null;
  }

  resize(width: number, height: number): void {
    this.chart?.applyOptions({ width, height });
  }

  setData(bars: Bar[]): void {
    this.candleSeries?.setData(bars);
  }

  updateBar(bar: Bar): void {
    this.candleSeries?.update(bar);
  }

  fitContent(): void {
    this.chart?.timeScale().fitContent();
  }

  subscribeCrosshairMove(handler: (data: CrosshairData | null) => void): () => void {
    if (!this.chart) return () => {};

    const wrappedHandler = (params: MouseEventParams<Time>) => {
      if (!params.time || !this.candleSeries) {
        handler(null);
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = params.seriesData.get(this.candleSeries as any) as any;
      if (data && 'open' in data) {
        handler({
          time: params.time as unknown as number,
          open: data.open,
          high: data.high,
          low: data.low,
          close: data.close,
        });
      } else {
        handler(null);
      }
    };

    this.chart.subscribeCrosshairMove(wrappedHandler);
    return () => this.chart?.unsubscribeCrosshairMove(wrappedHandler);
  }
}