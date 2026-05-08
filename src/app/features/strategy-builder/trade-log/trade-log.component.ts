import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { BacktestStore } from '../../../core/backtest/backtest.store';
import { LangService } from '../../../core/services/lang.service';
import type { TradeResult } from '../../../core/backtest/backtest.model';

@Component({
  selector: 'app-trade-log',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './trade-log.component.html',
  styleUrl:    './trade-log.component.scss',
})
export class TradeLogComponent {
  protected readonly store = inject(BacktestStore);
  protected readonly lang  = inject(LangService);

  protected formatTime(ts: number): string {
    const d   = new Date(ts * 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
  }

  protected exitLabel(t: TradeResult): string {
    return this.lang.t(`backtest.exitReason.${t.exitReason}`);
  }

  protected exportTradeCsv(): void {
    const result = this.store.result();
    if (!result) return;

    const header = ['#', 'Entry Time', 'Entry Price', 'Exit Time', 'Exit Price', 'PnL ($)', 'PnL (%)', 'Bars Held', 'Exit Reason'];
    const rows   = result.trades.map((t, i) => [
      i + 1,
      this.formatTime(t.entryTime),
      t.entryPrice.toFixed(4),
      this.formatTime(t.exitTime),
      t.exitPrice.toFixed(4),
      t.pnl.toFixed(2),
      t.pnlPct.toFixed(2),
      t.barsHeld,
      t.exitReason,
    ]);

    this.downloadCsv([header, ...rows], 'trade_log.csv');
  }

  private downloadCsv(rows: (string | number)[][], filename: string): void {
    const csv  = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
