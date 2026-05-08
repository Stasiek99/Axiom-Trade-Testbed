import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { BacktestStore } from '../../../core/backtest/backtest.store';
import { LangService } from '../../../core/services/lang.service';
import type { HistoryRecord } from '../../../core/backtest/backtest-history.model';

@Component({
  selector: 'app-history-sidebar',
  standalone: true,
  imports: [DatePipe, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './history-sidebar.component.html',
  styleUrl: './history-sidebar.component.scss',
})
export class HistorySidebarComponent {
  protected readonly store = inject(BacktestStore);
  protected readonly lang  = inject(LangService);

  protected load(record: HistoryRecord): void {
    this.store.loadHistoryRun(record);
  }

  protected deleteRun(id: string, event: MouseEvent): void {
    event.stopPropagation();
    void this.store.deleteHistoryRun(id);
  }

  protected clearAll(): void {
    void this.store.clearHistory();
  }

  protected fmtPnl(n: number): string {
    return (n >= 0 ? '+' : '') + n.toFixed(2);
  }
}
