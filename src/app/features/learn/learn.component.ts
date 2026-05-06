import { Component, computed, inject, signal } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { INDICATORS_CATALOG } from '../../core/data/indicators.catalog';
import { LangService } from '../../core/services/lang.service';
import { IndicatorInfoComponent } from '../../shared/indicator-info/indicator-info.component';
import type { TradingIndicatorCategory } from '../../core/indicators';

const CATEGORIES: Array<TradingIndicatorCategory> = [
  'Moving Average', 'Oscillator', 'Momentum', 'Trend',
  'Volatility', 'Channels & Bands', 'Volume',
];

@Component({
  selector: 'app-learn',
  standalone: true,
  imports: [
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    IndicatorInfoComponent,
  ],
  templateUrl: './learn.component.html',
  styleUrl: './learn.component.scss',
})
export class LearnComponent {
  protected lang = inject(LangService);

  protected readonly CATEGORIES = CATEGORIES;
  protected readonly searchQuery = signal('');
  protected readonly selectedCategory = signal<TradingIndicatorCategory | null>(null);

  protected readonly filtered = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedCategory();
    return INDICATORS_CATALOG.filter(entry => {
      const matchesCat = !cat || entry.category === cat;
      const matchesSearch = !q
        || entry.title.toLowerCase().includes(q)
        || entry.id.toLowerCase().includes(q)
        || entry.shortDescription.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  });

  protected catLabel(cat: TradingIndicatorCategory | null): string {
    if (!cat) return this.lang.t('learn.allCategories');
    const key = 'learn.cat.' + cat.toLowerCase().replace(/[\s&]+/g, '_').replace(/_+/g, '_');
    return this.lang.t(key);
  }
}
