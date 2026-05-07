import { Injectable, computed, signal } from '@angular/core';
import type { BacktestResult, BacktestStatus, IndicatorSeries } from './backtest.model';

@Injectable({ providedIn: 'root' })
export class BacktestStore {
  private readonly _status   = signal<BacktestStatus>('idle');
  private readonly _result   = signal<BacktestResult | null>(null);
  private readonly _progress = signal<number>(0);

  readonly status    = this._status.asReadonly();
  readonly result    = this._result.asReadonly();
  readonly progress  = this._progress.asReadonly();
  readonly isRunning = computed(() => this._status() === 'running');

  setRunning(): void {
    this._status.set('running');
    this._result.set(null);
    this._progress.set(0);
  }

  setProgress(pct: number): void {
    this._progress.set(Math.min(100, Math.round(pct)));
  }

  setResult(result: BacktestResult): void {
    this._result.set(result);
    this._status.set('done');
    this._progress.set(100);
  }

  setError(): void {
    this._status.set('error');
    this._progress.set(0);
  }

  updateIndicators(indicators: IndicatorSeries[]): void {
    const current = this._result();
    if (!current) return;
    this._result.set({ ...current, indicators });
  }

  reset(): void {
    this._status.set('idle');
    this._result.set(null);
    this._progress.set(0);
  }
}
