import { Component, computed, inject, signal } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';

import { INDICATORS_CATALOG } from '../../core/data/indicators.catalog';
import { GLOSSARY_GROUPS, type GlossaryTermData } from '../../core/data/glossary.data';
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
    MatTabsModule,
    IndicatorInfoComponent,
  ],
  templateUrl: './learn.component.html',
  styleUrl: './learn.component.scss',
})
export class LearnComponent {
  protected lang = inject(LangService);

  protected readonly CATEGORIES    = CATEGORIES;
  protected readonly GLOSSARY_GROUPS = GLOSSARY_GROUPS;
  protected readonly searchQuery         = signal('');
  protected readonly selectedCategory    = signal<TradingIndicatorCategory | null>(null);
  protected readonly glossarySearchQuery = signal('');

  protected readonly filteredGlossaryGroups = computed(() => {
    const q   = this.glossarySearchQuery().toLowerCase().trim();
    const lng = this.lang.currentLang();
    if (!q) return GLOSSARY_GROUPS;
    return GLOSSARY_GROUPS
      .map(group => ({
        ...group,
        terms: group.terms.filter(t =>
          t.abbr.toLowerCase().includes(q) ||
          (t.name[lng] || t.name['en']).toLowerCase().includes(q) ||
          (t.def[lng]  || t.def['en']).toLowerCase().includes(q)
        ),
      }))
      .filter(group => group.terms.length > 0);
  });

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

  protected groupLabel(groupId: string): string {
    return this.lang.t(`learn.glossary.group.${groupId}`);
  }

  protected termText(term: GlossaryTermData, field: 'name' | 'def'): string {
    const lang = this.lang.currentLang();
    return term[field][lang] || term[field]['en'];
  }
}
