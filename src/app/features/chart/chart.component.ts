import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, switchMap } from 'rxjs';
import { type UTCTimestamp } from 'lightweight-charts';
import { BinanceDataService } from '../../core/services/binance-data.service';
import { BinanceWsService, WsEvent } from '../../core/services/binance-ws.service';
import { ChartService, CrosshairData } from '../../core/services/chart.service';
import { LangService } from '../../core/services/lang.service';
import { Bar } from '../../core/models/bar.model';
import { BacktestStore } from '../../core/backtest/backtest.store';
import type { IndicatorSeries } from '../../core/backtest/backtest.model';
import { BacktestChartComponent } from '../strategy-builder/backtest-chart/backtest-chart.component';
import { SymbolSelectorComponent } from './symbol-selector/symbol-selector.component';

const TIMEFRAME_SECONDS: Record<string, number> = {
  M1: 60, M5: 300, M15: 900, H1: 3600, H4: 14400, D1: 86400,
};

@Component({
  selector: 'app-chart',
  imports: [CommonModule, MatButtonToggleModule, MatProgressSpinnerModule, SymbolSelectorComponent, BacktestChartComponent],
  providers: [ChartService],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss',
})
export class ChartComponent implements AfterViewInit {
  private readonly binanceDataService = inject(BinanceDataService);
  private readonly binanceWs          = inject(BinanceWsService);
  private readonly chartService       = inject(ChartService);
  private readonly destroyRef         = inject(DestroyRef);

  protected readonly backtestStore = inject(BacktestStore);
  protected readonly lang          = inject(LangService);

  @ViewChild('chartContainer') chartContainer!: ElementRef<HTMLDivElement>;

  readonly symbol       = signal<string>('ETH/USD');
  readonly timeframe    = signal<string>('H1');
  readonly currentPrice = signal<number | null>(null);
  readonly priceChange  = signal<number>(0);
  readonly loading      = signal<boolean>(true);
  readonly crosshair    = signal<CrosshairData | null>(null);

  readonly timeframes = ['M1', 'M5', 'M15', 'H1', 'H4', 'D1'];

  private resizeObserver:  ResizeObserver | null = null;
  private currentBar:      Bar | null = null;
  private lastBarTime      = 0;
  private hasConnected     = false;
  private loadGeneration   = 0;
  private readonly stream$ = new Subject<{ symbol: string; timeframe: string }>();

  // Convert BacktestStore result signal to Observable for use in ngAfterViewInit
  private readonly backtestResult$ = toObservable(this.backtestStore.result);

  ngAfterViewInit(): void {
    const container = this.chartContainer.nativeElement;
    this.chartService.init(container);

    // Indicator overlays — react to backtest results after chart is ready
    this.backtestResult$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(result => {
      this.chartService.clearIndicatorSeries();

      if (result && result.indicators.length > 0) {
        const seen = new Set<string>();
        for (const ind of result.indicators) {
          if (seen.has(ind.name)) continue;
          seen.add(ind.name);
          this.chartService.addIndicatorOverlay(ind);
        }
      }
    });

    const unsubCrosshair = this.chartService.subscribeCrosshairMove(data => {
      this.crosshair.set(data);
    });

    // switchMap auto-unsubscribes old stream when stream$ emits a new value
    this.stream$.pipe(
      switchMap(({ symbol, timeframe }) => this.binanceWs.streamBars(symbol, timeframe)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((event: WsEvent) => {
      if (event.type === 'connected') {
        if (this.hasConnected) this.fillGap();
        this.hasConnected = true;
        return;
      }
      if (event.type === 'bar' && event.bar) {
        this.chartService.updateBar(event.bar);
        this.currentPrice.set(event.bar.close);
        this.lastBarTime = event.bar.time as number;
        this.currentBar = null; // trades after this belong to the next bar period
        return;
      }
      if (event.type === 'trade' && event.price != null) {
        this.applyTrade(event.price, event.tradeTime);
      }
    });

    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        this.chartService.resize(width, height);
      }
    });
    this.resizeObserver.observe(container);

    // unsubCrosshair must run before chartService.destroy()
    this.destroyRef.onDestroy(() => {
      this.resizeObserver?.disconnect();
      unsubCrosshair();
      this.chartService.destroy();
    });

    this.loadBars();
    this.stream$.next({ symbol: this.symbol(), timeframe: this.timeframe() });
  }

  private applyTrade(price: number, tradeTime?: number): void {
    this.currentPrice.set(price); // always update displayed price immediately

    const intervalSec = TIMEFRAME_SECONDS[this.timeframe()] ?? 3600;
    const barTime = tradeTime && !isNaN(tradeTime)
      ? (Math.floor(tradeTime / intervalSec) * intervalSec as UTCTimestamp)
      : this.currentBar?.time;

    if (barTime === undefined) return;

    if (!this.currentBar || this.currentBar.time !== barTime) {
      this.currentBar = { time: barTime, open: price, high: price, low: price, close: price };
    } else {
      this.currentBar = {
        ...this.currentBar,
        close: price,
        high: Math.max(this.currentBar.high, price),
        low: Math.min(this.currentBar.low, price),
      };
    }
    this.chartService.updateBar(this.currentBar);
  }

  private loadBars(): void {
    this.loading.set(true);
    const gen = ++this.loadGeneration;

    this.binanceDataService.getCryptoBars(this.symbol(), this.timeframe())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((bars: Bar[]) => {
        if (gen !== this.loadGeneration) return; // discard stale response
        if (bars.length > 0) {
          this.chartService.setData(bars);
          this.chartService.fitContent();
          const last = bars.at(-1)!;
          this.currentPrice.set(last.close);
          this.currentBar = null;
          this.lastBarTime = last.time as number;
          this.priceChange.set(+(last.close - bars[0].open).toFixed(2));
        }
        this.loading.set(false);
      });
  }

  private fillGap(): void {
    if (!this.lastBarTime) return;
    const start = new Date((this.lastBarTime + 1) * 1000).toISOString();

    this.binanceDataService.getCryptoBarsFrom(this.symbol(), this.timeframe(), start)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((bars: Bar[]) => {
        for (const bar of bars) {
          this.chartService.updateBar(bar);
          this.lastBarTime = bar.time as number;
        }
        if (bars.length > 0) {
          this.currentBar = null;
          this.currentPrice.set(bars.at(-1)!.close);
        }
      });
  }

  formatCrosshairTime(ts: number): string {
    const d = new Date(ts * 1000);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
  }

  onSymbolChange(sym: string): void {
    this.symbol.set(sym);
    this.hasConnected = false;
    this.currentBar = null;
    this.chartService.setData([]);
    this.loadBars();
    this.stream$.next({ symbol: sym, timeframe: this.timeframe() });
  }

  onTimeframeChange(tf: string): void {
    this.timeframe.set(tf);
    this.hasConnected = false;
    this.currentBar = null;
    this.loadBars();
    this.stream$.next({ symbol: this.symbol(), timeframe: tf });
  }

  dedupIndicators(indicators: IndicatorSeries[]): IndicatorSeries[] {
    return indicators.filter((ind, i, arr) => arr.findIndex(x => x.name === ind.name) === i);
  }
}
