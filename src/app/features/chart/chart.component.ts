import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CandlestickSeries, CrosshairMode, createChart } from 'lightweight-charts';
import { AlpacaService } from '../../core/services/alpaca.service';
import { AlpacaWsService } from '../../core/services/alpaca-ws.service';
import { Bar, TIMEFRAME_MAP } from '../../core/models/bar.model';
import { SymbolSelectorComponent } from './symbol-selector/symbol-selector.component';

@Component({
  selector: 'app-chart',
  imports: [CommonModule, MatButtonToggleModule, MatProgressSpinnerModule, SymbolSelectorComponent],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss',
})
export class ChartComponent implements AfterViewInit {
  private readonly alpacaService = inject(AlpacaService);
  private readonly alpacaWs     = inject(AlpacaWsService);
  private readonly destroyRef    = inject(DestroyRef);

  @ViewChild('chartContainer') chartContainer!: ElementRef<HTMLDivElement>;

  readonly symbol      = signal<string>('ETH/USD');
  readonly timeframe   = signal<string>('H1');
  readonly currentPrice = signal<number | null>(null);
  readonly priceChange  = signal<number>(0);
  readonly loading      = signal<boolean>(true);

  readonly timeframes = ['M1', 'M5', 'M15', 'H1', 'H4', 'D1'];

  private chart: ReturnType<typeof createChart> | null = null;
  private series: ReturnType<ReturnType<typeof createChart>['addSeries']> | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private currentBarClose: number | null = null;

  ngAfterViewInit(): void {
    const container = this.chartContainer.nativeElement;

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
        fixLeftEdge: false,
        fixRightEdge: false,
      },
      rightPriceScale: { borderColor: '#1e2738' },
      crosshair: { mode: CrosshairMode.Normal },
      width: container.clientWidth,
      height: container.clientHeight,
    });

    this.series = this.chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    this.loadBars();
    this.connectWebSocket();

    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        this.chart?.applyOptions({ width, height });
      }
    });
    this.resizeObserver.observe(container);

    this.destroyRef.onDestroy(() => {
      this.resizeObserver?.disconnect();
      this.chart?.remove();
    });
  }

  private loadBars(): void {
    this.loading.set(true);
    const alpacaTf = TIMEFRAME_MAP[this.timeframe()] ?? '1Hour';

    this.alpacaService.getCryptoBars(this.symbol(), alpacaTf)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((bars: Bar[]) => {
        if (bars.length > 0) {
          this.series?.setData(bars);
          this.chart?.timeScale().fitContent();
          const last = bars.at(-1)!;
          this.currentPrice.set(last.close);
          this.currentBarClose = last.close;
          this.priceChange.set(+(last.close - bars[0].open).toFixed(2));
        }
        this.loading.set(false);
      });
  }

  private connectWebSocket(): void {
    this.alpacaWs.streamBars(this.symbol())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if (event.type === 'bar' && event.bar) {
          this.series?.update(event.bar);
          this.currentPrice.set(event.bar.close);
          this.currentBarClose = event.bar.close;
        }
        if (event.type === 'trade' && event.price != null) {
          this.currentPrice.set(event.price);
        }
      });
  }

  onSymbolChange(sym: string): void {
    this.symbol.set(sym);
    this.series?.setData([]);
    this.loadBars();
  }

  onTimeframeChange(tf: string): void {
    this.timeframe.set(tf);
    this.loadBars();
  }
}
