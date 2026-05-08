import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { type UTCTimestamp } from 'lightweight-charts';
import { Bar } from '../models/bar.model';

export interface WsEvent {
  type: 'bar' | 'trade' | 'connected' | 'reconnecting';
  bar?: Bar;
  price?: number;
  tradeTime?: number;
  attempt?: number;
}

const SYMBOL_MAP: Record<string, string> = {
  'ETH/USD':  'ethusdt',
  'BTC/USD':  'btcusdt',
  'SOL/USD':  'solusdt',
  'DOGE/USD': 'dogeusdt',
  'AVAX/USD': 'avaxusdt',
};

const TIMEFRAME_MAP: Record<string, string> = {
  M1:  '1m',
  M5:  '5m',
  M15: '15m',
  H1:  '1h',
  H4:  '4h',
  D1:  '1d',
};

@Injectable({ providedIn: 'root' })
export class BinanceWsService {
  streamBars(symbol: string, timeframe: string): Observable<WsEvent> {
    const binanceSymbol   = SYMBOL_MAP[symbol]   ?? symbol.toLowerCase().replace('/', '');
    const binanceInterval = TIMEFRAME_MAP[timeframe] ?? timeframe;
    const url = `wss://stream.binance.com:9443/ws/${binanceSymbol}@kline_${binanceInterval}`;

    return new Observable<WsEvent>(subscriber => {
      let disposed = false;
      let attempt = 0;
      let currentWs: WebSocket | null = null;
      let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

      function connect(): void {
        if (disposed) return;
        const ws = new WebSocket(url);
        currentWs = ws;

        ws.onopen = () => {
          attempt = 0;
          subscriber.next({ type: 'connected' });
        };

        ws.onmessage = event => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.e !== 'kline') return;

            const k = msg.k;

            if (k.x === true) {
              subscriber.next({
                type: 'bar',
                bar: {
                  time:   Math.floor(k.t / 1000) as UTCTimestamp,
                  open:   parseFloat(k.o),
                  high:   parseFloat(k.h),
                  low:    parseFloat(k.l),
                  close:  parseFloat(k.c),
                  volume: parseFloat(k.v),
                },
              });
            } else {
              subscriber.next({
                type:      'trade',
                price:     parseFloat(k.c),
                tradeTime: Math.floor(k.t / 1000),
              });
            }
          } catch (err) {
            console.error('[BinanceWsService] Message parse error', err);
          }
        };

        ws.onerror = () => {
          // onclose always fires after onerror — reconnect happens there
          console.error('[BinanceWsService] WebSocket error');
        };

        ws.onclose = () => {
          if (disposed) return;
          attempt++;
          const delay = Math.min(1000 * 2 ** attempt, 30_000);
          subscriber.next({ type: 'reconnecting', attempt });
          reconnectTimer = setTimeout(connect, delay);
        };
      }

      connect();

      return () => {
        disposed = true;
        if (reconnectTimer != null) clearTimeout(reconnectTimer);
        currentWs?.close();
      };
    });
  }
}
