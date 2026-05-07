import { Injectable } from '@angular/core';
import { createChart, CandlestickSeries, LineSeries, CrosshairMode, MouseEventParams, Time, LogicalRange, createSeriesMarkers } from 'lightweight-charts';
import type { UTCTimestamp } from 'lightweight-charts';
import { Bar } from '../models/bar.model';
import type { ChartPoint } from '../indicators';
import type { IndicatorSeries, TradeResult } from '../backtest/backtest.model';

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
  private bars: Bar[] = [];
  private totalHeight = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private tradeMarkersHandle: any = null;

  init(container: HTMLElement): void {
    this.totalHeight = container.clientHeight;
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
    this.clearTradeMarkers();
    this.chart?.remove();
    this.chart = null;
    this.candleSeries = null;
    this.bars = [];
  }

  setTradeMarkers(trades: TradeResult[]): void {
    this.clearTradeMarkers();
    if (!this.candleSeries || !trades.length) return;

    const pts = [
      ...trades.map(t => ({
        time:     t.entryTime as UTCTimestamp,
        position: 'belowBar' as const,
        color:    '#34d399',
        shape:    'arrowUp' as const,
        size:     1,
      })),
      ...trades.map(t => ({
        time:     t.exitTime as UTCTimestamp,
        position: 'aboveBar' as const,
        color:    '#f87171',
        shape:    'arrowDown' as const,
        size:     1,
      })),
    ].sort((a, b) => (a.time as number) - (b.time as number));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.tradeMarkersHandle = createSeriesMarkers(this.candleSeries as any, pts);
  }

  clearTradeMarkers(): void {
    if (this.tradeMarkersHandle) {
      try { this.tradeMarkersHandle.detach(); } catch { /* already detached */ }
      this.tradeMarkersHandle = null;
    }
  }

  resize(width: number, height: number): void {
    this.totalHeight = height;
    this.chart?.applyOptions({ width, height });
    this.syncIndicatorPaneHeight();
  }

  private syncIndicatorPaneHeight(): void {
    if (!this.chart || this.chart.panes().length < 2) return;
    const indHeight = Math.max(60, Math.round(this.totalHeight * 0.25));
    this.chart.panes()[1].setHeight(indHeight);
  }

  setData(bars: Bar[]): void {
    this.bars = bars;
    this.candleSeries?.setData(bars);
  }

  /** Prepend older bars and keep the viewport anchored to the current view. */
  prependBars(newBars: Bar[]): void {
    if (!this.candleSeries || !this.chart) return;
    const range = this.chart.timeScale().getVisibleLogicalRange();
    this.bars = [...newBars, ...this.bars];
    this.candleSeries.setData(this.bars as Parameters<typeof this.candleSeries.setData>[0]);
    if (range) {
      this.chart.timeScale().setVisibleLogicalRange({
        from: range.from + newBars.length,
        to:   range.to  + newBars.length,
      });
    }
  }

  getOldestBarTime(): number | null {
    return this.bars.length > 0 ? (this.bars[0].time as number) : null;
  }

  getBars(): Bar[] {
    return this.bars;
  }

  subscribeVisibleLogicalRangeChange(handler: (range: LogicalRange | null) => void): () => void {
    if (!this.chart) return () => {};
    this.chart.timeScale().subscribeVisibleLogicalRangeChange(handler);
    return () => this.chart?.timeScale().unsubscribeVisibleLogicalRangeChange(handler);
  }

  getVisibleLogicalRange(): LogicalRange | null {
    return this.chart?.timeScale().getVisibleLogicalRange() ?? null;
  }

  /** Expose raw chart for use by BacktestChartComponent (pane mode). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getChart(): any {
    return this.chart;
  }

  /** Lazily creates pane 1 for indicator series; no-op if it already exists. */
  ensureIndicatorPane(): void {
    if (!this.chart) return;
    if (this.chart.panes().length < 2) {
      const indHeight = Math.max(60, Math.round(this.totalHeight * 0.25));
      this.chart.addPane().setHeight(indHeight);
    }
  }

  /** Removes pane 1 (indicator pane) if present. */
  removeIndicatorPane(): void {
    if (!this.chart) return;
    if (this.chart.panes().length > 1) {
      this.chart.removePane(1);
    }
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
