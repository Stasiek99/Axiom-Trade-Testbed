import {
  AfterViewInit, Component, DestroyRef, ElementRef, Input, ViewChild, inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { createChart, LineSeries, createSeriesMarkers } from 'lightweight-charts';
import type { UTCTimestamp } from 'lightweight-charts';

import { BacktestStore } from '../../../core/backtest/backtest.store';
import { LangService } from '../../../core/services/lang.service';
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
  @Input() showClearBtn = false;

  protected readonly store     = inject(BacktestStore);
  protected readonly lang      = inject(LangService);
  private  readonly router     = inject(Router);
  private  readonly destroyRef = inject(DestroyRef);

  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private chart:   any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private series:  any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private markers: any[] = [];

  private readonly result$ = toObservable(this.store.result);

  ngAfterViewInit(): void {
    // Eager init: works when navigating back to the page with a result already in the store.
    this.maybeInitChart();

    this.result$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(r => {
      // zone.js flushes the toObservable effect as a microtask, *before* Angular's
      // change-detection updates the @if(result) block and sets the ViewChild.
      // setTimeout(0) yields to the macrotask queue, by which time zone.js CD has
      // run and #container is in the DOM.
      setTimeout(() => {
        this.maybeInitChart();
        this.render(r);
      });
    });

    this.destroyRef.onDestroy(() => {
      this.chart?.remove();
      this.chart = null;
    });
  }

  goToChart(): void {
    this.router.navigate(['/']);
  }

  clearStrategy(): void {
    this.store.reset();
  }

  /** Returns indicators deduplicated by name — same name means identical computed values. */
  protected dedup(indicators: IndicatorSeries[]): IndicatorSeries[] {
    return indicators.filter((ind, i, arr) => arr.findIndex(x => x.name === ind.name) === i);
  }

  // Creates the LWC chart instance only once, guarded by container availability.
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
    for (const m of this.markers) { try { m.detach(); } catch { /* already detached */ } }
    this.markers = [];
    for (const s of this.series) { try { this.chart?.removeSeries(s); } catch { /* removed */ } }
    this.series = [];

    if (!result || !result.indicators.length) {
      this.chart?.remove();
      this.chart = null;
      return;
    }

    this.maybeInitChart();
    if (!this.chart) return;

    const entryTimes = new Set(result.trades.map(t => t.entryTime));
    const exitTimes  = new Set(result.trades.map(t => t.exitTime));

    // Collect all roles for each unique indicator name so markers survive deduplication.
    const nameToRoles = new Map<string, Set<IndicatorRole>>();
    for (const ind of result.indicators) {
      if (!nameToRoles.has(ind.name)) nameToRoles.set(ind.name, new Set());
      nameToRoles.get(ind.name)!.add(ind.role);
    }

    // Render only one series per unique name — entry and exit slots sharing the
    // same indicator (e.g. EMA(10)) produce identical data, so one line suffices.

    // Overlay indicators (EMA, SMA, …) share one price scale so their visual
    // crossing matches their numerical crossing. Oscillators each get their own
    // scale to avoid range interference.
    let overlayScaleInit = false;
    for (const ind of this.dedup(result.indicators)) {
      const roles       = nameToRoles.get(ind.name)!;
      const scaleId     = ind.overlay ? 'overlay-price' : `mini-${ind.id}`;
      const lws = this.chart.addSeries(LineSeries, {
        color:            ind.color,
        lineWidth:        1.5,
        priceScaleId:     scaleId,
        priceLineVisible: false,
        lastValueVisible: false,
      });

      try {
        if (ind.overlay) {
          if (!overlayScaleInit) {
            this.chart.priceScale('overlay-price').applyOptions({
              visible:      false,
              scaleMargins: { top: 0.05, bottom: 0.05 },
            });
            overlayScaleInit = true;
          }
        } else {
          this.chart.priceScale(scaleId).applyOptions({
            visible:      false,
            scaleMargins: { top: 0.05, bottom: 0.05 },
          });
        }
      } catch { /* scale may not exist yet */ }

      lws.setData(ind.data as { time: UTCTimestamp; value: number }[]);
      this.series.push(lws);

      // Place entry markers on the primary output line of whichever deduplicated
      // series carries the entry-primary role (index 0 = first output of indicator).
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

    this.chart.timeScale().fitContent();
  }
}
