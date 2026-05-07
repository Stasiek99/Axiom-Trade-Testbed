import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { BacktestStore } from '../../../core/backtest/backtest.store';
import { LangService } from '../../../core/services/lang.service';

@Component({
  selector: 'app-stats-panel',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './stats-panel.component.html',
  styleUrl:    './stats-panel.component.scss',
})
export class StatsPanelComponent {
  protected readonly store = inject(BacktestStore);
  protected readonly lang  = inject(LangService);

  protected fmt(n: number, decimals = 2): string {
    return n.toFixed(decimals);
  }

  protected fmtPf(pf: number): string {
    return isFinite(pf) ? pf.toFixed(2) : '∞';
  }

  protected fmtPnl(n: number): string {
    return (n >= 0 ? '+$' : '-$') + Math.abs(n).toFixed(2);
  }
}
