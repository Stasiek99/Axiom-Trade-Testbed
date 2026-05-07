import { Injectable, computed, effect, inject, signal } from '@angular/core';
import type { BacktestResult, BacktestStatus, IndicatorSeries } from './backtest.model';
import type { HistoryRecord } from './backtest-history.model';
import { BacktestHistoryService } from './backtest-history.service';
import type { StrategyConfig } from '../strategy/strategy.model';

@Injectable({ providedIn: 'root' })
export class BacktestStore {
  private readonly historyService = inject(BacktestHistoryService);

  private readonly _status    = signal<BacktestStatus>('idle');
  private readonly _result    = signal<BacktestResult | null>(null);
  private readonly _progress  = signal<number>(0);
  private readonly _history   = signal<HistoryRecord[]>([]);
  private readonly _symbol    = signal<string>('ETH/USD');
  private readonly _timeframe = signal<string>('D1');

  readonly status    = this._status.asReadonly();
  readonly result    = this._result.asReadonly();
  readonly progress  = this._progress.asReadonly();
  readonly isRunning = computed(() => this._status() === 'running');
  readonly history   = this._history.asReadonly();
  readonly symbol    = this._symbol.asReadonly();
  readonly timeframe = this._timeframe.asReadonly();

  private static readonly SESSION_KEY = 'axiom:backtest';

  constructor() {
    this.historyService.getAllRuns().then(runs => this._history.set(runs));
    this.restoreSession();
    effect(() => sessionStorage.setItem(BacktestStore.SESSION_KEY, JSON.stringify({
      result:    this._result(),
      symbol:    this._symbol(),
      timeframe: this._timeframe(),
    })));
  }

  private restoreSession(): void {
    try {
      const raw = sessionStorage.getItem(BacktestStore.SESSION_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { result?: BacktestResult; symbol?: string; timeframe?: string };
      if (saved.result)    { this._result.set(saved.result); this._status.set('done'); this._progress.set(100); }
      if (saved.symbol)    this._symbol.set(saved.symbol);
      if (saved.timeframe) this._timeframe.set(saved.timeframe);
    } catch { /* corrupt data — ignore */ }
  }

  setContext(symbol: string, timeframe: string): void {
    this._symbol.set(symbol);
    this._timeframe.set(timeframe);
  }

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

  async saveRun(
    symbol: string,
    timeframe: string,
    strategyConfig: StrategyConfig,
    result: BacktestResult,
  ): Promise<void> {
    const record: HistoryRecord = {
      id: crypto.randomUUID(),
      runAt: Date.now(),
      symbol,
      timeframe,
      strategyConfig,
      result,
    };
    await this.historyService.saveRun(record);
    this._history.update(prev => [record, ...prev]);
  }

  async deleteHistoryRun(id: string): Promise<void> {
    await this.historyService.deleteRun(id);
    this._history.update(runs => runs.filter(r => r.id !== id));
  }

  async clearHistory(): Promise<void> {
    await this.historyService.clearAll();
    this._history.set([]);
  }

  loadHistoryRun(record: HistoryRecord): void {
    this._symbol.set(record.symbol);
    this._timeframe.set(record.timeframe);
    this._result.set(record.result);
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
    sessionStorage.removeItem(BacktestStore.SESSION_KEY);
    this._status.set('idle');
    this._result.set(null);
    this._progress.set(0);
  }
}
