import { Component, Input, inject, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { LangService } from '../../../core/services/lang.service';

export interface SymbolGroup { label: string; labelKey: string; symbols: string[]; }

export const SYMBOL_GROUPS: SymbolGroup[] = [
  {
    label:    'Crypto',
    labelKey: 'symbol.group.crypto',
    symbols:  ['ETH/USD', 'BTC/USD', 'SOL/USD', 'DOGE/USD', 'AVAX/USD'],
  },
  {
    label:    'Stocks',
    labelKey: 'symbol.group.stocks',
    symbols:  ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'GOOGL', 'META', 'SPY', 'QQQ'],
  },
];

/** All symbols that are served by AlpacaDataService (everything except crypto). */
export const ALPACA_SYMBOLS = new Set(
  SYMBOL_GROUPS
    .filter(g => g.labelKey !== 'symbol.group.crypto')
    .flatMap(g => g.symbols),
);

@Component({
  selector: 'app-symbol-selector',
  standalone: true,
  imports: [MatButtonModule, MatMenuModule, MatIconModule],
  templateUrl: './symbol-selector.component.html',
  styleUrl: './symbol-selector.component.scss',
})
export class SymbolSelectorComponent {
  readonly symbolChange = output<string>();
  protected readonly lang = inject(LangService);

  selected = 'ETH/USD';
  readonly groups = SYMBOL_GROUPS;

  @Input() set initialSymbol(v: string) {
    if (v) this.selected = v;
  }

  onSelect(value: string): void {
    this.symbolChange.emit(value);
  }
}
