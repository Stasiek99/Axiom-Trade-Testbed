import {
  AfterViewInit, Component, DestroyRef, ElementRef, Input, ViewChild, inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { createChart, LineSeries, AreaSeries, createSeriesMarkers } from 'lightweight-charts';
import type { UTCTimestamp } from 'lightweight-charts';

import { BacktestStore } from '../../../core/backtest/backtest.store';
import { LangService } from '../../../core/services/lang.service';
import { ChartService } from '../../../core/services/chart.service';
import type { BacktestResult, IndicatorRole, IndicatorSeries } from '../../../core/backtest/backtest.model';

@Component({
  selector: 'app-backtest-chart',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './backtest-chart.component.html',
  styleUrl: './backtest-chart.component.scss',
})
export class BacktestChartComponent implements AfterViewInit {
  @Input() showViewBtn  = false;
  @Input() showStatsBtn = false;
  @Input() showClearBtn = false;

  protected readonly store     = inject(BacktestStore);
  protected readonly lang      = inject(LangService);
  private  readonly router     = inject(Router);
  private  readonly destroyRef = inject(DestroyRef);
  // Available when rendered inside ChartComponent; null in strategy-builder (standalone mode).
  private  readonly mainChart  = inject(ChartService, { optional: true });

  @ViewChild('container')         containerRef!:        ElementRef<HTMLDivElement>;
  @ViewChild('drawdownContainer') drawdownContainerRef?: ElementRef<HTMLDivElement>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private chart:          any = null;   // indicator lines chart (standalone mode)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private drawdownChart:  any = null;   // drawdown mini-chart (standalone mode)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private series:  any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private markers: any[] = [];

  /** True when rendering into pane 1 of the main chart (inside ChartComponent). */
  protected get paneMode(): boolean { return !!this.mainChart; }

  private readonly result$ = toObservable(this.store.result);

  ngAfterViewInit(): void {
    // Standalone mode: eagerly init own chart so it's ready when a result is already in the store.
    if (!this.mainChart) this.maybeInitChart();

    this.result$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(r => {
      // zone.js flushes toObservable before Angular CD updates the @if block.
      // setTimeout(0) yields to the macrotask queue so #container is in the DOM.
      setTimeout(() => {
        if (!this.mainChart) this.maybeInitChart();
        this.render(r);
      });
    });

    this.destroyRef.onDestroy(() => {
      for (const m of this.markers) { try { m.detach(); } catch { /* detached */ } }
      if (this.mainChart) {
        const ch = this.mainChart.getChart();
        for (const s of this.series) { try { ch?.removeSeries(s); } catch { /* removed */ } }
        this.mainChart.clearTradeMarkers();
        this.mainChart.removeIndicatorPane();
      } else {
        this.drawdownChart?.remove();
        this.drawdownChart = null;
        this.chart?.remove();
        this.chart = null;
      }
    });
  }

  goToChart(): void {
    this.router.navigate(['/']);
  }

  goToStats(): void {
    this.router.navigate(['/statistics']);
  }

  clearStrategy(): void {
    this.store.reset();
  }

  /** Returns indicators deduplicated by name — same name means identical computed values. */
  protected dedup(indicators: IndicatorSeries[]): IndicatorSeries[] {
    return indicators.filter((ind, i, arr) => arr.findIndex(x => x.name === ind.name) === i);
  }

  // Creates the own LWC chart instance — only called in standalone mode.
  private maybeInitChart(): void {
    if (this.chart || !this.containerRef?.nativeElement) return;
    this.chart = createChart(this.containerRef.nativeElement, {
      layout: {
        background:  { color: '#0d1117' },
        textColor:   '#9db2bd',
        fontFamily:  'Courier New, monospace',
      },
      grid: {
        vertLines: { color: '#161b22' },
        horzLines: { color: '#161b22' },
      },
      timeScale: {
        timeVisible:    true,
        secondsVisible: false,
        borderColor:    '#1e2738',
      },
      rightPriceScale: { visible: false },
      leftPriceScale:  { visible: false },
      height: 240,
    });
  }

  private render(result: BacktestResult | null): void {
    // --- CLEANUP ---
    for (const m of this.markers) { try { m.detach(); } catch { /* detached */ } }
    this.markers = [];

    if (this.mainChart) {
      const ch = this.mainChart.getChart();
      for (const s of this.series) { try { ch?.removeSeries(s); } catch { /* removed */ } }
    } else {
      for (const s of this.series) { try { this.chart?.removeSeries(s); } catch { /* removed */ } }
    }
    this.series = [];

    // All indicators go to pane 1 — price chart stays clean (candlesticks only).
    const indicators = result?.indicators ?? [];

    if (!result || !indicators.length) {
      if (this.mainChart) {
        this.mainChart.clearTradeMarkers();
        this.mainChart.removeIndicatorPane();
      } else {
        this.drawdownChart?.remove();
        this.drawdownChart = null;
        this.chart?.remove();
        this.chart = null;
      }
      return;
    }

    // --- RESOLVE CHART + PANE INDEX ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let workChart: any;
    let paneIdx: number;

    if (this.mainChart) {
      this.mainChart.ensureIndicatorPane();
      workChart = this.mainChart.getChart();
      if (!workChart) return;
      paneIdx = 1;
    } else {
      this.maybeInitChart();
      if (!this.chart) return;
      workChart = this.chart;
      paneIdx = 0;
    }

    // --- RENDER SERIES ---
    const entryTimes = new Set(result.trades.map(t => t.entryTime));
    const exitTimes  = new Set(result.trades.map(t => t.exitTime));

    // Collect all roles per name so markers survive deduplication.
    const nameToRoles = new Map<string, Set<IndicatorRole>>();
    for (const ind of indicators) {
      if (!nameToRoles.has(ind.name)) nameToRoles.set(ind.name, new Set());
      nameToRoles.get(ind.name)!.add(ind.role);
    }

    // Overlay-type indicators share one scale so they remain visually comparable;
    // oscillators each get their own scale so they auto-normalize independently.
    let overlayScaleInit = false;
    for (const ind of this.dedup(indicators)) {
      const roles   = nameToRoles.get(ind.name)!;
      const scaleId = ind.overlay ? 'overlay-price' : `mini-${ind.id}`;

      const lws = workChart.addSeries(LineSeries, {
        color:            ind.color,
        lineWidth:        1.5,
        priceScaleId:     scaleId,
        priceLineVisible: false,
        lastValueVisible: false,
      }, paneIdx);

      try {
        if (ind.overlay) {
          if (!overlayScaleInit) {
            workChart.priceScale('overlay-price', paneIdx).applyOptions({
              visible:      false,
              scaleMargins: { top: 0.05, bottom: 0.05 },
            });
            overlayScaleInit = true;
          }
        } else {
          workChart.priceScale(scaleId, paneIdx).applyOptions({
            visible:      false,
            scaleMargins: { top: 0.05, bottom: 0.05 },
          });
        }
      } catch { /* scale may not exist yet */ }

      lws.setData(ind.data as { time: UTCTimestamp; value: number }[]);
      this.series.push(lws);

      if (roles.has('entry-primary') && ind.id.endsWith('-0')) {
        const pts = ind.data
          .filter(p => entryTimes.has(p.time))
          .map(p => ({
            time:     p.time as UTCTimestamp,
            position: 'belowBar' as const,
            color:    '#34d399',
            shape:    'arrowUp' as const,
            size:     1,
          }));
        if (pts.length) this.markers.push(createSeriesMarkers(lws, pts));
      }

      if (roles.has('exit-primary') && ind.id.endsWith('-0')) {
        const pts = ind.data
          .filter(p => exitTimes.has(p.time))
          .map(p => ({
            time:     p.time as UTCTimestamp,
            position: 'aboveBar' as const,
            color:    '#f87171',
            shape:    'arrowDown' as const,
            size:     1,
          }));
        if (pts.length) this.markers.push(createSeriesMarkers(lws, pts));
      }
    }

    // Only fit content in standalone mode; in pane mode the main chart controls the viewport.
    if (paneIdx === 0) {
      workChart.timeScale().fitContent();
    }

    // Pane mode: render ▲/▼ markers directly on the candlestick series.
    if (this.mainChart) {
      this.mainChart.setTradeMarkers(result.trades);
    }

    // Standalone mode: render drawdown mini-chart below indicator lines.
    if (!this.mainChart) {
      this.renderStandaloneDrawdown(result);
    }
  }

  private renderStandaloneDrawdown(result: BacktestResult | null): void {
    this.drawdownChart?.remove();
    this.drawdownChart = null;

    if (!result?.equityCurve.length) return;

    setTimeout(() => {
      if (!this.drawdownContainerRef?.nativeElement) return;

      let peak = result.equityCurve[0].value;
      const ddData = result.equityCurve.map(p => {
        if (p.value > peak) peak = p.value;
        const dd = peak > 0 ? (peak - p.value) / peak * 100 : 0;
        return { time: p.time as UTCTimestamp, value: -dd };
      });

      this.drawdownChart = createChart(this.drawdownContainerRef!.nativeElement, {
        layout: {
          background:  { color: '#0d1117' },
          textColor:   '#9db2bd',
          fontFamily:  'Courier New, monospace',
        },
        grid: {
          vertLines: { color: '#161b22' },
          horzLines: { color: '#161b22' },
        },
        timeScale: { timeVisible: true, secondsVisible: false, borderColor: '#1e2738' },
        rightPriceScale: { visible: false },
        leftPriceScale:  { visible: false },
        height: 90,
        handleScroll: false,
        handleScale:  false,
      });

      const as = this.drawdownChart.addSeries(AreaSeries, {
        topColor:         'rgba(248, 113, 113, 0.22)',
        bottomColor:      'rgba(248, 113, 113, 0.0)',
        lineColor:        '#f87171',
        lineWidth:        1,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      as.setData(ddData as { time: UTCTimestamp; value: number }[]);
      this.drawdownChart.timeScale().fitContent();
    });
  }
}
