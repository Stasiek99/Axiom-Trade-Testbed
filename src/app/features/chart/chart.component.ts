import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, switchMap, finalize, EMPTY, catchError } from 'rxjs';
import { type UTCTimestamp } from 'lightweight-charts';
import { BinanceDataService } from '../../core/services/binance-data.service';
import { BinanceWsService, WsEvent } from '../../core/services/binance-ws.service';
import { AlpacaDataService } from '../../core/services/alpaca-data.service';
import { ChartService, CrosshairData } from '../../core/services/chart.service';
import { LangService } from '../../core/services/lang.service';
import { Bar } from '../../core/models/bar.model';
import { BacktestStore } from '../../core/backtest/backtest.store';
import { BacktestEngineService } from '../../core/backtest/backtest-engine.service';
import type { IndicatorSeries } from '../../core/backtest/backtest.model';
import { StrategyStore } from '../../core/strategy/strategy.store';
import { BacktestChartComponent } from '../strategy-builder/backtest-chart/backtest-chart.component';
import { SymbolSelectorComponent, ALPACA_SYMBOLS } from './symbol-selector/symbol-selector.component';

const TIMEFRAME_SECONDS: Record<string, number> = {
  M1: 60, M5: 300, M15: 900, H1: 3600, H4: 14400, D1: 86400,
};
const INITIAL_CAPITAL = 10_000;

@Component({
  selector: 'app-chart',
  imports: [CommonModule, MatButtonModule, MatButtonToggleModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule, SymbolSelectorComponent, BacktestChartComponent],
  providers: [ChartService],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss',
})
export class ChartComponent implements AfterViewInit {
  private readonly binanceData  = inject(BinanceDataService);
  private readonly alpacaData   = inject(AlpacaDataService);
  private readonly binanceWs    = inject(BinanceWsService);
  private readonly chartService = inject(ChartService);
  private readonly destroyRef   = inject(DestroyRef);

  protected readonly backtestStore = inject(BacktestStore);
  protected readonly lang          = inject(LangService);
  private  readonly strategyStore  = inject(StrategyStore);
  private  readonly engine         = inject(BacktestEngineService);

  @ViewChild('chartContainer') chartContainer!: ElementRef<HTMLDivElement>;

  readonly symbol       = signal<string>(this.backtestStore.symbol());
  readonly timeframe    = signal<string>(this.backtestStore.timeframe());
  readonly currentPrice = signal<number | null>(null);
  readonly priceChange  = signal<number>(0);
  readonly loading      = signal<boolean>(true);
  readonly crosshair    = signal<CrosshairData | null>(null);
  readonly wsStatus     = signal<'connecting' | 'live' | 'reconnecting'>('connecting');
  readonly apiError     = signal<'down' | 'rate-limit' | null>(null);
  readonly liveStream   = computed(() => !ALPACA_SYMBOLS.has(this.symbol()));

  readonly timeframes = ['M1', 'M5', 'M15', 'H1', 'H4', 'D1'];

  private resizeObserver:   ResizeObserver | null = null;
  private currentBar:       Bar | null = null;
  private lastBarTime       = 0;
  private hasConnected      = false;
  private loadGeneration    = 0;
  private isFetchingHistory = false;
  private historyExhausted  = false;
  private readonly stream$ = new Subject<{ symbol: string; timeframe: string }>();

  private readonly backtestResult$ = toObservable(this.backtestStore.result);

  private isAlpaca(sym: string): boolean {
    return ALPACA_SYMBOLS.has(sym);
  }

  ngAfterViewInit(): void {
    const container = this.chartContainer.nativeElement;
    this.chartService.init(container);

    const unsubRange = this.chartService.subscribeVisibleLogicalRangeChange(range => {
      if (!range || this.loading() || this.isFetchingHistory || this.historyExhausted) return;
      if (range.from < 10) this.loadHistoricalBars();
    });

    this.backtestResult$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.chartService.clearIndicatorSeries();
    });

    const unsubCrosshair = this.chartService.subscribeCrosshairMove(data => {
      this.crosshair.set(data);
    });

    // Live WebSocket stream — skipped for Alpaca symbols (REST-only).
    this.stream$.pipe(
      switchMap(({ symbol, timeframe }) =>
        this.isAlpaca(symbol) ? EMPTY : this.binanceWs.streamBars(symbol, timeframe),
      ),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((event: WsEvent) => {
      if (event.type === 'reconnecting') {
        this.wsStatus.set('reconnecting');
        return;
      }
      if (event.type === 'connected') {
        this.wsStatus.set('live');
        if (this.hasConnected) this.fillGap();
        this.hasConnected = true;
        return;
      }
      if (event.type === 'bar' && event.bar) {
        this.chartService.updateBar(event.bar);
        this.currentPrice.set(event.bar.close);
        this.lastBarTime = event.bar.time as number;
        this.currentBar = null;
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

    this.destroyRef.onDestroy(() => {
      this.resizeObserver?.disconnect();
      unsubCrosshair();
      unsubRange();
      this.chartService.destroy();
    });

    this.loadBars();
    this.stream$.next({ symbol: this.symbol(), timeframe: this.timeframe() });
  }

  private applyTrade(price: number, tradeTime?: number): void {
    this.currentPrice.set(price);

    const intervalSec = TIMEFRAME_SECONDS[this.timeframe()] ?? 3600;
    const barTime = tradeTime && !isNaN(tradeTime)
      ? (Math.floor(tradeTime / intervalSec) * intervalSec as UTCTimestamp)
      : this.currentBar?.time;

    if (barTime === undefined) return;

    if (!this.currentBar || this.currentBar.time !== barTime) {
      this.currentBar = { time: barTime, open: price, high: price, low: price, close: price, volume: 0 };
    } else {
      this.currentBar = {
        ...this.currentBar,
        close: price,
        high: Math.max(this.currentBar.high, price),
        low:  Math.min(this.currentBar.low,  price),
      };
    }
    this.chartService.updateBar(this.currentBar);
  }

  private loadHistoricalBars(): void {
    const oldestTime = this.chartService.getOldestBarTime();
    if (!oldestTime) return;
    this.isFetchingHistory = true;
    let barsReceived = false;

    const obs$ = this.isAlpaca(this.symbol())
      ? this.alpacaData.getStockBarsEndingAt(this.symbol(), this.timeframe(), oldestTime)
      : this.binanceData.getCryptoBarsEndingAt(this.symbol(), this.timeframe(), oldestTime);

    obs$.pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => {
        this.historyExhausted = true;
        return EMPTY;
      }),
      finalize(() => {
        this.isFetchingHistory = false;
        if (barsReceived && !this.historyExhausted) {
          const range = this.chartService.getVisibleLogicalRange();
          if (range && range.from < 10) this.loadHistoricalBars();
        }
      }),
    ).subscribe((bars: Bar[]) => {
      barsReceived = true;
      if (bars.length === 0) {
        this.historyExhausted = true;
      } else {
        this.chartService.prependBars(bars);
        this.refreshBacktestIndicators();
      }
    });
  }

  private loadBars(): void {
    this.loading.set(true);
    const gen = ++this.loadGeneration;

    const obs$ = this.isAlpaca(this.symbol())
      ? this.alpacaData.getStockBars(this.symbol(), this.timeframe())
      : this.binanceData.getCryptoBars(this.symbol(), this.timeframe());

    obs$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (bars: Bar[]) => {
        if (gen !== this.loadGeneration) return;
        this.apiError.set(null);
        if (bars.length > 0) {
          this.chartService.setData(bars);
          this.chartService.fitContent();
          const last = bars.at(-1)!;
          this.currentPrice.set(last.close);
          this.currentBar  = null;
          this.lastBarTime = last.time as number;
          const prev = bars.at(-2);
          this.priceChange.set(prev ? +(last.close - prev.close).toFixed(2) : 0);
        }
        this.loading.set(false);
      },
      error: (err) => {
        if (gen !== this.loadGeneration) return;
        this.loading.set(false);
        this.apiError.set(err?.status === 429 ? 'rate-limit' : 'down');
      },
    });
  }

  private refreshBacktestIndicators(): void {
    if (!this.backtestStore.result()) return;
    try {
      const result = this.engine.run(
        this.chartService.getBars(),
        this.strategyStore.config(),
        INITIAL_CAPITAL,
      );
      this.backtestStore.setResult(result);
    } catch { /* ignore recompute errors — keep existing result */ }
  }

  private fillGap(): void {
    if (!this.lastBarTime) return;
    const start = new Date((this.lastBarTime + 1) * 1000).toISOString();

    this.binanceData.getCryptoBarsFrom(this.symbol(), this.timeframe(), start)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => EMPTY),
      )
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

  retryLoad(): void {
    this.apiError.set(null);
    this.loadBars();
  }

  onSymbolChange(sym: string): void {
    this.symbol.set(sym);
    this.backtestStore.setContext(sym, this.timeframe());
    this.hasConnected      = false;
    this.currentBar        = null;
    this.isFetchingHistory = false;
    this.historyExhausted  = false;
    this.wsStatus.set('connecting');
    this.apiError.set(null);
    this.chartService.setData([]);
    this.loadBars();
    this.stream$.next({ symbol: sym, timeframe: this.timeframe() });
  }

  onTimeframeChange(tf: string): void {
    this.timeframe.set(tf);
    this.backtestStore.setContext(this.symbol(), tf);
    this.hasConnected      = false;
    this.currentBar        = null;
    this.isFetchingHistory = false;
    this.historyExhausted  = false;
    this.wsStatus.set('connecting');
    this.apiError.set(null);
    this.loadBars();
    this.stream$.next({ symbol: this.symbol(), timeframe: tf });
  }

  dedupIndicators(indicators: IndicatorSeries[]): IndicatorSeries[] {
    return indicators.filter((ind, i, arr) => arr.findIndex(x => x.name === ind.name) === i);
  }
}
