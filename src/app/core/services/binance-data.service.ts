import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, map, catchError, EMPTY } from 'rxjs';
import { type UTCTimestamp } from 'lightweight-charts';
import { Bar } from '../models/bar.model';

const BINANCE_KLINES_URL = 'https://api.binance.com/api/v3/klines';

/** Maps Alpaca-style display symbols to Binance uppercase pairs. */
const SYMBOL_MAP: Record<string, string> = {
  'ETH/USD':  'ETHUSDT',
  'BTC/USD':  'BTCUSDT',
  'SOL/USD':  'SOLUSDT',
  'DOGE/USD': 'DOGEUSDT',
  'AVAX/USD': 'AVAXUSDT',
};

/** Maps app-internal timeframe keys to Binance interval strings. */
const INTERVAL_MAP: Record<string, string> = {
  M1:  '1m',
  M5:  '5m',
  M15: '15m',
  H1:  '1h',
  H4:  '4h',
  D1:  '1d',
};

/** Binance klines response — each element is a fixed-position tuple. */
type BinanceKline = [
  number,  // [0] open time ms
  string,  // [1] open
  string,  // [2] high
  string,  // [3] low
  string,  // [4] close
  string,  // [5] volume
  number,  // [6] close time ms
  ...unknown[]
];

@Injectable({ providedIn: 'root' })
export class BinanceDataService {
  private readonly http = inject(HttpClient);
  private readonly cache = new Map<string, { bars: Bar[]; expiresAt: number }>();

  private getTtl(timeframe: string): number {
    switch (timeframe) {
      case 'M1':
      case 'M5':
        return 30;
      case 'M15':
      case 'H1':
      case 'H4':
        return 120;
      case 'D1':
        return 600;
      default:
        return 60;
    }
  }

  private toBinanceSymbol(symbol: string): string {
    return SYMBOL_MAP[symbol] ?? symbol.replace('/', '').toUpperCase() + 'USDT';
  }

  private toBinanceInterval(timeframe: string): string {
    return INTERVAL_MAP[timeframe] ?? '1h';
  }

  private mapKlines(klines: BinanceKline[]): Bar[] {
    return klines.map(k => ({
      time:   Math.floor(k[0] / 1000) as UTCTimestamp,
      open:   parseFloat(k[1]),
      high:   parseFloat(k[2]),
      low:    parseFloat(k[3]),
      close:  parseFloat(k[4]),
      volume: parseFloat(k[5]),
    }));
  }

  /**
   * Fetch the most recent `limit` bars for the given symbol and timeframe.
   * Results are cached with a TTL that varies by timeframe.
   * Cache key uses the display symbol (before mapping).
   */
  getCryptoBars(symbol: string, timeframe: string, limit = 500): Observable<Bar[]> {
    const cacheKey = `${symbol}:${timeframe}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return of(cached.bars);
    }

    const params = new HttpParams()
      .set('symbol',   this.toBinanceSymbol(symbol))
      .set('interval', this.toBinanceInterval(timeframe))
      .set('limit',    limit.toString());

    return this.http.get<BinanceKline[]>(BINANCE_KLINES_URL, { params }).pipe(
      map(klines => {
        const bars = this.mapKlines(klines);
        this.cache.set(cacheKey, {
          bars,
          expiresAt: Date.now() + this.getTtl(timeframe) * 1000,
        });
        return bars;
      }),
      catchError(error => {
        console.error('[BinanceDataService] Error fetching crypto bars', error);
        return EMPTY;
      })
    );
  }

  /**
   * Fetch `limit` bars ending before `endTimeSec` (Unix seconds).
   * Used for lazy-loading historical data when the user scrolls left past the oldest bar.
   */
  getCryptoBarsEndingAt(
    symbol: string,
    timeframe: string,
    endTimeSec: number,
    limit = 500,
  ): Observable<Bar[]> {
    const params = new HttpParams()
      .set('symbol',  this.toBinanceSymbol(symbol))
      .set('interval', this.toBinanceInterval(timeframe))
      .set('endTime', (endTimeSec * 1000 - 1).toString())
      .set('limit',   limit.toString());

    return this.http.get<BinanceKline[]>(BINANCE_KLINES_URL, { params }).pipe(
      map(klines => this.mapKlines(klines)),
      catchError(error => {
        console.error('[BinanceDataService] Error fetching historical bars', error);
        return EMPTY;
      })
    );
  }

  /**
   * Fetch bars starting from a given ISO 8601 timestamp (gap-fill calls).
   * Not cached — these are point-in-time range queries.
   */
  getCryptoBarsFrom(
    symbol: string,
    timeframe: string,
    start: string,
    limit = 1000,
  ): Observable<Bar[]> {
    const params = new HttpParams()
      .set('symbol',    this.toBinanceSymbol(symbol))
      .set('interval',  this.toBinanceInterval(timeframe))
      .set('startTime', new Date(start).getTime().toString())
      .set('limit',     limit.toString());

    return this.http.get<BinanceKline[]>(BINANCE_KLINES_URL, { params }).pipe(
      map(klines => this.mapKlines(klines)),
      catchError(error => {
        console.error('[BinanceDataService] Error fetching gap bars', error);
        return EMPTY;
      })
    );
  }
}
