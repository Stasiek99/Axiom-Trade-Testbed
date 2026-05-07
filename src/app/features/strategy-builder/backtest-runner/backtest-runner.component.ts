import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';

// Side-effect import ensures all indicators are registered before engine runs
import '../../../core/indicators';

import { BinanceDataService } from '../../../core/services/binance-data.service';
import { StrategyStore } from '../../../core/strategy/strategy.store';
import { BacktestEngineService } from '../../../core/backtest/backtest-engine.service';
import { BacktestStore } from '../../../core/backtest/backtest.store';
import { LangService } from '../../../core/services/lang.service';
import type { StrategyConfig } from '../../../core/strategy/strategy.model';

const SYMBOLS    = ['ETH/USD', 'BTC/USD', 'SOL/USD', 'DOGE/USD'];
const TIMEFRAMES = ['M15', 'H1', 'H4', 'D1'];
const INITIAL_CAPITAL = 10_000;
const BASE_BARS       = 500;

function maxIndicatorPeriod(cfg: StrategyConfig): number {
  const slots = [
    cfg.entry.primarySlot,
    cfg.entry.secondarySlot,
    cfg.exit.primarySlot,
    cfg.exit.secondarySlot,
  ].filter(Boolean);

  const periods = slots.flatMap(s =>
    Object.values(s!.params).filter((v): v is number => typeof v === 'number'),
  );
  return Math.max(50, ...periods);
}

@Component({
  selector: 'app-backtest-runner',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatProgressBarModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './backtest-runner.component.html',
  styleUrl:    './backtest-runner.component.scss',
})
export class BacktestRunnerComponent {
  private readonly binanceData   = inject(BinanceDataService);
  private readonly strategyStore = inject(StrategyStore);
  private readonly engine        = inject(BacktestEngineService);
  private readonly destroyRef    = inject(DestroyRef);

  private  readonly router   = inject(Router);
  protected readonly store   = inject(BacktestStore);
  protected readonly lang    = inject(LangService);

  protected readonly SYMBOLS    = SYMBOLS;
  protected readonly TIMEFRAMES = TIMEFRAMES;

  protected symbol    = 'ETH/USD';
  protected timeframe = 'D1';

  private runSub: Subscription | null = null;

  protected run(): void {
    if (this.store.isRunning()) return;

    // Snapshot config at start — never read reactively mid-run
    const strategy = this.strategyStore.config();
    const limit    = BASE_BARS + maxIndicatorPeriod(strategy);

    this.store.setRunning();

    this.runSub = this.binanceData
      .getCryptoBars(this.symbol, this.timeframe, limit)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: bars => {
          try {
            const result = this.engine.run(bars, strategy, INITIAL_CAPITAL);
            this.store.setResult(result);
            if (result.totalTrades > 0) {
              this.router.navigate(['/statistics']);
            }
          } catch {
            this.store.setError();
          }
        },
        error: () => this.store.setError(),
      });
  }

  protected stop(): void {
    this.runSub?.unsubscribe();
    this.runSub = null;
    this.store.reset();
  }

  protected reset(): void {
    this.store.reset();
  }

  protected fmt(n: number, decimals = 2): string {
    return n.toFixed(decimals);
  }
}
