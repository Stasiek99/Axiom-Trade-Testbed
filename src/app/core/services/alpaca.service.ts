import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, map, catchError, EMPTY } from 'rxjs';
import { type UTCTimestamp } from 'lightweight-charts';
import { environment } from '../../../environments/environment';
import { Bar, AlpacaCryptoBarResponse } from '../models/bar.model';

@Injectable({ providedIn: 'root' })
export class AlpacaService {
  private http = inject(HttpClient);
  private readonly cache = new Map<string, { bars: Bar[]; expiresAt: number }>();

  private getTtl(timeframe: string): number {
    switch (timeframe) {
      case 'M1': case 'M5':           return 30;
      case 'M15': case 'H1': case 'H4': return 120;
      case 'D1':                       return 600;
      default:                         return 60;
    }
  }

  getCryptoBars(symbol: string, timeframe: string, limit = 500): Observable<Bar[]> {
    const cacheKey = `${symbol}:${timeframe}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return of(cached.bars);
    }

    const params = new HttpParams()
      .set('symbols', symbol)
      .set('timeframe', timeframe)
      .set('limit', limit.toString());

    return this.http.get<AlpacaCryptoBarResponse>(
      `${environment.alpaca.dataUrl}/v1beta3/crypto/us/bars`,
      { params }
    ).pipe(
      map(response => {
        const bars = response.bars?.[symbol];
        if (!bars) return [];
        const mapped = bars
          .map(bar => ({
            time: Math.floor(new Date(bar.t).getTime() / 1000) as UTCTimestamp,
            open: bar.o,
            high: bar.h,
            low: bar.l,
            close: bar.c,
          }))
          .sort((a, b) => a.time - b.time);
        this.cache.set(cacheKey, { bars: mapped, expiresAt: Date.now() + this.getTtl(timeframe) * 1000 });
        return mapped;
      }),
      catchError(error => {
        console.error('Error fetching crypto bars', error);
        return EMPTY;
      })
    );
  }
}
