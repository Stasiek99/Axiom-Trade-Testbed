import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';

// Side-effect import ensures all indicators are registered before engine runs
import '../../../core/indicators';

import { BinanceDataService } from '../../../core/services/binance-data.service';
import { AlpacaDataService } from '../../../core/services/alpaca-data.service';
import { StrategyStore } from '../../../core/strategy/strategy.store';
import { BacktestEngineService } from '../../../core/backtest/backtest-engine.service';
import { BacktestStore } from '../../../core/backtest/backtest.store';
import { LangService } from '../../../core/services/lang.service';
import { SYMBOL_GROUPS, ALPACA_SYMBOLS } from '../../chart/symbol-selector/symbol-selector.component';
import type { StrategyConfig } from '../../../core/strategy/strategy.model';

const TIMEFRAMES = ['M1', 'M5', 'M15', 'H1', 'H4', 'D1'];
const BASE_BARS  = 500;

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
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './backtest-runner.component.html',
  styleUrl:    './backtest-runner.component.scss',
})
export class BacktestRunnerComponent {
  private readonly binanceData   = inject(BinanceDataService);
  private readonly alpacaData    = inject(AlpacaDataService);
  private readonly strategyStore = inject(StrategyStore);
  private readonly engine        = inject(BacktestEngineService);
  private readonly destroyRef    = inject(DestroyRef);

  private  readonly router   = inject(Router);
  protected readonly store   = inject(BacktestStore);
  protected readonly lang    = inject(LangService);

  protected readonly SYMBOL_GROUPS = SYMBOL_GROUPS;
  protected readonly TIMEFRAMES    = TIMEFRAMES;

  protected onSymbolChange(value: string): void {
    this.store.setContext(value, this.store.timeframe());
  }

  protected onTimeframeChange(value: string): void {
    this.store.setContext(this.store.symbol(), value);
  }

  protected onCapitalChange(event: Event): void {
    const v = parseFloat((event.target as HTMLInputElement).value);
    if (v > 0) this.store.setCapital(v);
  }

  private runSub: Subscription | null = null;

  protected run(): void {
    if (this.store.isRunning()) return;

    const symbol    = this.store.symbol();
    const timeframe = this.store.timeframe();
    const strategy  = this.strategyStore.config();
    const limit     = BASE_BARS + maxIndicatorPeriod(strategy);

    this.store.setRunning();

    const bars$ = ALPACA_SYMBOLS.has(symbol)
      ? this.alpacaData.getStockBars(symbol, timeframe, limit)
      : this.binanceData.getCryptoBars(symbol, timeframe, limit);

    this.runSub = bars$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: bars => {
          try {
            const result = this.engine.run(bars, strategy, this.store.capital());
            this.store.setResult(result);
            if (result.totalTrades > 0) {
              void this.store.saveRun(symbol, timeframe, this.store.capital(), this.store.endDate(), strategy, result);
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
