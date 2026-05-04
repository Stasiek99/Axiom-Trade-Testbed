import { Component, OnInit, ElementRef, DestroyRef, inject } from '@angular/core';
import { createChart, CandlestickSeries } from 'lightweight-charts';

interface Bar {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

const DUMMY_BARS: Bar[] = [
  { time: '2024-01-02', open: 42000, high: 43500, low: 41800, close: 43200 },
  { time: '2024-01-03', open: 43200, high: 44100, low: 42500, close: 43800 },
  { time: '2024-01-04', open: 43800, high: 45000, low: 43500, close: 44700 },
  { time: '2024-01-05', open: 44700, high: 45200, low: 43800, close: 44100 },
  { time: '2024-01-06', open: 44100, high: 44500, low: 42800, close: 43000 },
  { time: '2024-01-07', open: 43000, high: 43200, low: 41500, close: 41800 },
  { time: '2024-01-08', open: 41800, high: 42500, low: 41200, close: 42300 },
  { time: '2024-01-09', open: 42300, high: 43800, low: 42000, close: 43500 },
  { time: '2024-01-10', open: 43500, high: 44200, low: 43000, close: 43900 },
  { time: '2024-01-11', open: 43900, high: 44800, low: 43500, close: 44500 },
];

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss'
})
export class ChartComponent implements OnInit {
  private elementRef = inject(ElementRef);
  private destroyRef = inject(DestroyRef);
  private chart: ReturnType<typeof createChart> | null = null;
  private resizeObserver: ResizeObserver | null = null;

  ngOnInit(): void {
    const container = this.elementRef.nativeElement as HTMLElement;

    this.chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,
      layout: {
        background: { color: '#1a1a2e' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#2a2a3e' },
        horzLines: { color: '#2a2a3e' },
      },
    });

    const series = this.chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    series.setData(DUMMY_BARS);
    this.chart.timeScale().fitContent();

    this.resizeObserver = new ResizeObserver(() => {
      if (this.chart) {
        this.chart.applyOptions({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    });
    this.resizeObserver.observe(container);

    this.destroyRef.onDestroy(() => {
      this.resizeObserver?.disconnect();
      this.chart?.remove();
    });
  }
}
