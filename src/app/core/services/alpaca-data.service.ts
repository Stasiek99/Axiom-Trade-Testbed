import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, map, catchError, EMPTY } from 'rxjs';
import { type UTCTimestamp } from 'lightweight-charts';
import { environment } from '../../../environments/environment';
import { Bar } from '../models/bar.model';

/** Maps app timeframe keys to Alpaca bar timeframe strings. */
const INTERVAL_MAP: Record<string, string> = {
  M1:  '1Min',
  M5:  '5Min',
  M15: '15Min',
  H1:  '1Hour',
  H4:  '4Hour',
  D1:  '1Day',
};

/** Display symbol → Alpaca ticker overrides (used when display name differs from ticker). */
export const ALPACA_SYMBOL_MAP: Record<string, string> = {};

/**
 * Calendar-day lookback used to set a `start` anchor for each timeframe.
 * Alpaca returns null bars when no `start` is provided — this ensures we
 * always pass one that's generous enough to cover `limit` trading bars.
 */
const LOOKBACK_DAYS: Record<string, number> = {
  M1:  5,
  M5:  14,
  M15: 30,
  H1:  90,
  H4:  365,
  D1:  1500,
};

interface AlpacaBar { t: string; o: number; h: number; l: number; c: number; v: number; }
interface AlpacaBarsResponse { bars: AlpacaBar[] | null; symbol: string; next_page_token: string | null; }

@Injectable({ providedIn: 'root' })
export class AlpacaDataService {
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

  private toTicker(symbol: string): string {
    return ALPACA_SYMBOL_MAP[symbol] ?? symbol;
  }

  private toInterval(timeframe: string): string {
    return INTERVAL_MAP[timeframe] ?? '1Day';
  }

  private mapBars(bars: AlpacaBar[]): Bar[] {
    return bars.map(b => ({
      time:   Math.floor(new Date(b.t).getTime() / 1000) as UTCTimestamp,
      open:   b.o,
      high:   b.h,
      low:    b.l,
      close:  b.c,
      volume: b.v,
    }));
  }

  private url(symbol: string): string {
    return `${environment.alpaca.dataUrl}/v2/stocks/${this.toTicker(symbol)}/bars`;
  }

  /**
   * Compute an ISO date string `days` before `baseMs` (or today).
   * Alpaca requires a `start` parameter to return any data — without it,
   * the API returns `{ bars: null }` regardless of other params.
   */
  private startDate(timeframe: string, baseMs = Date.now()): string {
    const days = LOOKBACK_DAYS[timeframe] ?? 365;
    const d = new Date(baseMs);
    d.setDate(d.getDate() - days);
    return d.toISOString().slice(0, 10);
  }

  /**
   * Fetch the most recent `limit` bars.
   * Uses sort=desc + start anchor so Alpaca returns data, then reverses to
   * ascending for lightweight-charts. Results are cached by symbol+timeframe.
   */
  getStockBars(symbol: string, timeframe: string, limit = 500): Observable<Bar[]> {
    const cacheKey = `${symbol}:${timeframe}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return of(cached.bars);

    const params = new HttpParams()
      .set('timeframe', this.toInterval(timeframe))
      .set('start',     this.startDate(timeframe))
      .set('limit',     limit.toString())
      .set('sort',      'desc');

    return this.http.get<AlpacaBarsResponse>(this.url(symbol), { params }).pipe(
      map(r => {
        const bars = this.mapBars(r.bars ?? []).reverse();
        this.cache.set(cacheKey, { bars, expiresAt: Date.now() + this.getTtl(timeframe) * 1000 });
        return bars;
      }),
      catchError(error => {
        console.error('[AlpacaDataService] Error fetching bars', error);
        return EMPTY;
      }),
    );
  }

  /**
   * Fetch `limit` bars ending before `endTimeSec` (Unix seconds).
   * Used for lazy history load on scroll-left. Returns ascending-sorted bars.
   */
  getStockBarsEndingAt(symbol: string, timeframe: string, endTimeSec: number, limit = 500): Observable<Bar[]> {
    const endMs = endTimeSec * 1000;
    const params = new HttpParams()
      .set('timeframe', this.toInterval(timeframe))
      .set('start',     this.startDate(timeframe, endMs))
      .set('end',       new Date(endMs - 1).toISOString())
      .set('limit',     limit.toString())
      .set('sort',      'desc');

    return this.http.get<AlpacaBarsResponse>(this.url(symbol), { params }).pipe(
      map(r => this.mapBars(r.bars ?? []).reverse()),
      catchError(error => {
        console.error('[AlpacaDataService] Error fetching historical bars', error);
        return EMPTY;
      }),
    );
  }

  /** Fetch bars starting from an ISO 8601 timestamp. Used for gap-fill on reconnect. */
  getStockBarsFrom(symbol: string, timeframe: string, start: string, limit = 1000): Observable<Bar[]> {
    const params = new HttpParams()
      .set('timeframe', this.toInterval(timeframe))
      .set('start',     start)
      .set('limit',     limit.toString())
      .set('sort',      'asc');

    return this.http.get<AlpacaBarsResponse>(this.url(symbol), { params }).pipe(
      map(r => this.mapBars(r.bars ?? [])),
      catchError(error => {
        console.error('[AlpacaDataService] Error fetching gap bars', error);
        return EMPTY;
      }),
    );
  }
}
