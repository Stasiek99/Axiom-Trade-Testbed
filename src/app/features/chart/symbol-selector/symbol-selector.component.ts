import { Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-symbol-selector',
  imports: [FormsModule, MatSelectModule, MatFormFieldModule],
  templateUrl: './symbol-selector.component.html',
  styleUrl: './symbol-selector.component.scss',
})
export class SymbolSelectorComponent {
  readonly symbolChange = output<string>();
  selected = 'ETH/USD';
  readonly symbols = ['ETH/USD', 'BTC/USD', 'SOL/USD', 'DOGE/USD', 'AVAX/USD'];

  onSelect(value: string): void {
    this.symbolChange.emit(value);
  }
}
