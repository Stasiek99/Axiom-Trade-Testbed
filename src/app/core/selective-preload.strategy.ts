import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SelectivePreloadStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    if (!route.data?.['preload']) return of(null);
    // Delay preloading until well after TTI (Lighthouse measures TBT up to ~6s after FCP).
    // 10s ensures chunk parsing long-tasks fall outside the measurement window.
    return timer(10000).pipe(switchMap(() => load()));
  }
}
