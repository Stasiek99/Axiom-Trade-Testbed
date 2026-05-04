import { Injectable } from '@angular/core';
import { Observable, retry, timer } from 'rxjs';
import { type UTCTimestamp } from 'lightweight-charts';
import { environment } from '../../../environments/environment';
import { Bar } from '../models/bar.model';

export interface WsEvent {
  type: 'bar' | 'trade';
  bar?: Bar;
  price?: number;
}

@Injectable({ providedIn: 'root' })
export class AlpacaWsService {
  private readonly WS_URL = 'wss://stream.data.alpaca.markets/v1beta3/crypto/us';

  streamBars(symbol: string): Observable<WsEvent> {
    return new Observable<WsEvent>(subscriber => {
      const ws = new WebSocket(this.WS_URL);

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
                  ws.send(JSON.stringify({ action: 'subscribe', bars: [symbol] }));
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
                subscriber.next({ type: 'trade', price: msg.p });
                break;
            }
          }
        } catch (err) {
          subscriber.error(err);
        }
      };

      ws.onerror = () => subscriber.error(new Error('WebSocket error'));
      ws.onclose  = () => subscriber.complete();

      return () => ws.close();
    }).pipe(
      retry({ count: 10, delay: (_, attempt) => timer(Math.min(1000 * Math.pow(2, attempt), 30_000)) })
    );
  }
}
