import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import '../../core/indicators';

import { BacktestStore } from '../../core/backtest/backtest.store';
import { LangService } from '../../core/services/lang.service';
import { StatsPanelComponent } from '../strategy-builder/stats-panel/stats-panel.component';
import { TradeLogComponent } from '../strategy-builder/trade-log/trade-log.component';
import { BacktestChartComponent } from '../strategy-builder/backtest-chart/backtest-chart.component';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, StatsPanelComponent, TradeLogComponent, BacktestChartComponent],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss',
})
export class StatisticsComponent {
  protected readonly store = inject(BacktestStore);
  protected readonly lang  = inject(LangService);
}
