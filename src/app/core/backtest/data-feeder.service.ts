import { Injectable } from '@angular/core';
import { Observable, from, concatMap, delay, of } from 'rxjs';
import type { Bar } from '../models/bar.model';

export interface FeedEvent {
  bar:   Bar;
  index: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class DataFeederService {
  /**
   * Emits one FeedEvent per bar.
   * speedMs = 0 → instant (all events in one microtask tick).
   * speedMs > 0 → animated replay at `speedMs` ms per bar.
   */
  feed(bars: Bar[], speedMs = 0): Observable<FeedEvent> {
    const total  = bars.length;
    const events = bars.map((bar, index) => ({ bar, index, total }));
    return from(events).pipe(
      concatMap(ev => speedMs > 0 ? of(ev).pipe(delay(speedMs)) : of(ev)),
    );
  }
}
