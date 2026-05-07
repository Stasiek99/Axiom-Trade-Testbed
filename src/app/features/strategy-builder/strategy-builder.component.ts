import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

// Importing the barrel populates the indicator registry via side-effects
import '../../core/indicators';

import { StrategyStore, STRATEGY_PRESETS } from '../../core/strategy/strategy.store';
import { LangService } from '../../core/services/lang.service';
import type { ConditionRule, RiskConfig, StrategyConfig } from '../../core/strategy/strategy.model';
import { ConditionRuleEditorComponent } from './condition-rule-editor/condition-rule-editor.component';
import { BacktestRunnerComponent } from './backtest-runner/backtest-runner.component';
import { BacktestChartComponent } from './backtest-chart/backtest-chart.component';

@Component({
  selector: 'app-strategy-builder',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    ConditionRuleEditorComponent,
    BacktestRunnerComponent,
    BacktestChartComponent,
  ],
  templateUrl: './strategy-builder.component.html',
  styleUrl: './strategy-builder.component.scss',
})
export class StrategyBuilderComponent implements OnInit {
  private readonly store = inject(StrategyStore);
  protected readonly lang = inject(LangService);

  protected readonly nameCtrl  = new FormControl<string>('', { nonNullable: true });
  protected readonly entryRule = signal<ConditionRule>(this.store.config().entry);
  protected readonly exitRule  = signal<ConditionRule>(this.store.config().exit);
  protected readonly risk      = signal<RiskConfig>(this.store.config().risk);

  protected readonly PRESETS = STRATEGY_PRESETS;

  ngOnInit(): void {
    const cfg = this.store.config();
    this.nameCtrl.setValue(cfg.name);
    this.entryRule.set(cfg.entry);
    this.exitRule.set(cfg.exit);
    this.risk.set(cfg.risk);
  }

  protected loadPreset(preset: StrategyConfig): void {
    this.store.set(preset);
    this.nameCtrl.setValue(preset.name);
    this.entryRule.set(preset.entry);
    this.exitRule.set(preset.exit);
    this.risk.set(preset.risk);
  }

  protected onEntryChange(rule: ConditionRule): void {
    this.entryRule.set(rule);
    this.saveToStore();
  }

  protected onExitChange(rule: ConditionRule): void {
    this.exitRule.set(rule);
    this.saveToStore();
  }

  protected onRiskChange(key: keyof RiskConfig, event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    if (!isNaN(val)) {
      this.risk.update(r => ({ ...r, [key]: val }));
      this.saveToStore();
    }
  }

  private saveToStore(): void {
    this.store.set({
      name:  this.nameCtrl.value,
      entry: this.entryRule(),
      exit:  this.exitRule(),
      risk:  this.risk(),
    });
  }
}
