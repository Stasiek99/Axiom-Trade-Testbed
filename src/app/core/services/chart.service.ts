import { Injectable } from '@angular/core';
import { createChart, CandlestickSeries, LineSeries, CrosshairMode, MouseEventParams, Time } from 'lightweight-charts';
import { Bar } from '../models/bar.model';
import type { ChartPoint } from '../indicators';
import type { IndicatorSeries } from '../backtest/backtest.model';

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private indSeries: any[] = [];

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addLineSeries(data: ChartPoint[], options?: Record<string, any>): any {
    const series = this.chart!.addSeries(LineSeries, {
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
      ...options,
    });
    series.setData(data);
    return series;
  }

  /**
   * Equity-curve overlay on the left price axis.
   * Data values should be percent-return (0 = break-even, positive = profit).
   * Rendered in the bottom 25 % of the chart to avoid overlapping candles.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addEquitySeries(data: ChartPoint[]): any {
    const series = this.chart!.addSeries(LineSeries, {
      color:                  '#22d3ee',
      lineWidth:              2,
      priceScaleId:           'left',
      priceLineVisible:       false,
      lastValueVisible:       false,
      crosshairMarkerVisible: false,
    });
    this.chart!.applyOptions({
      leftPriceScale: {
        visible:      true,
        scaleMargins: { top: 0.75, bottom: 0 },
        borderColor:  '#1e2738',
      },
    });
    series.setData(data);
    return series;
  }

  hideEquityScale(): void {
    this.chart?.applyOptions({ leftPriceScale: { visible: false } });
  }

  addIndicatorOverlay(ind: IndicatorSeries): void {
    if (!this.chart) return;
    const lws = this.chart.addSeries(LineSeries, {
      color:                  ind.color,
      lineWidth:              1,
      priceScaleId:           ind.overlay ? 'right' : ind.scaleId,
      priceLineVisible:       false,
      lastValueVisible:       false,
      crosshairMarkerVisible: false,
    });
    if (!ind.overlay) {
      try {
        this.chart.priceScale(ind.scaleId).applyOptions({
          visible:      false,
          scaleMargins: { top: 0.55, bottom: 0.22 },
        });
      } catch { /* scale may not exist yet */ }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lws.setData(ind.data as any);
    this.indSeries.push(lws);
  }

  clearIndicatorSeries(): void {
    for (const s of this.indSeries) {
      this.chart?.removeSeries(s);
    }
    this.indSeries = [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  removeSeries(series: any): void {
    this.chart?.removeSeries(series);
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
