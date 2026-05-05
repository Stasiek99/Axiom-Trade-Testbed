import { Injectable } from '@angular/core';
import { Observable, retry, timer } from 'rxjs';
import { type UTCTimestamp } from 'lightweight-charts';
import { environment } from '../../../environments/environment';
import { Bar } from '../models/bar.model';

export interface WsEvent {
  type: 'bar' | 'trade' | 'connected';
  bar?: Bar;
  price?: number;
  tradeTime?: number; // UTC seconds — used to snap trade to its bar period
}

@Injectable({ providedIn: 'root' })
export class AlpacaWsService {
  private readonly WS_URL = 'wss://stream.data.alpaca.markets/v1beta3/crypto/us';

  streamBars(symbol: string): Observable<WsEvent> {
    return new Observable<WsEvent>(subscriber => {
      const ws = new WebSocket(this.WS_URL);
      let intentionallyClosed = false;

      ws.onmessage = event => {
        try {
          const messages: any[] = JSON.parse(event.data);
          for (const msg of messages) {
            switch (msg.T) {
              case 'success':
                if (msg.msg === 'connected') {
                  ws.send(JSON.stringify({
                    action: 'auth',
                    key: environment.alpaca.apiKey,
                    secret: environment.alpaca.secretKey,
                  }));
                } else if (msg.msg === 'authenticated') {
                  ws.send(JSON.stringify({ action: 'subscribe', bars: [symbol], trades: [symbol], quotes: [symbol] }));
                  subscriber.next({ type: 'connected' });
                }
                break;
              case 'b':
                subscriber.next({
                  type: 'bar',
                  bar: {
                    time: Math.floor(new Date(msg.t).getTime() / 1000) as UTCTimestamp,
                    open: msg.o,
                    high: msg.h,
                    low: msg.l,
                    close: msg.c,
                  },
                });
                break;
              case 't':
                subscriber.next({
                  type: 'trade',
                  price: msg.p,
                  tradeTime: Math.floor(new Date(msg.t).getTime() / 1000),
                });
                break;
              case 'q':
                // ap = ask price, bp = bid price; use midpoint if both available
                if (msg.ap != null || msg.bp != null) {
                  const price = msg.ap != null && msg.bp != null
                    ? (msg.ap + msg.bp) / 2
                    : (msg.ap ?? msg.bp);
                  subscriber.next({
                    type: 'trade',
                    price,
                    tradeTime: Math.floor(new Date(msg.t).getTime() / 1000),
                  });
                }
                break;
              case 'subscription':
                console.log('[WS] subscriptions active:', JSON.stringify(msg));
                break;
              case 'error':
                console.warn('[WS] error from server:', msg.code, msg.msg);
                break;
            }
          }
        } catch (err) {
          subscriber.error(err);
        }
      };

      let hasErrored = false;
      ws.onerror = () => {
        hasErrored = true;
        subscriber.error(new Error('WebSocket error'));
      };
      ws.onclose  = () => {
        if (!intentionallyClosed && !hasErrored) {
          subscriber.error(new Error('WebSocket closed unexpectedly'));
        } else if (intentionallyClosed) {
          subscriber.complete();
        }
      };

      return () => {
        intentionallyClosed = true;
        ws.close();
      };
    }).pipe(
      retry({ count: 10, delay: (_, attempt) => timer(Math.min(1000 * Math.pow(2, attempt), 30_000)) })
    );
  }
}
