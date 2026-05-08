import { Component, computed, inject, signal } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';

import { INDICATORS_CATALOG } from '../../core/data/indicators.catalog';
import { LangService } from '../../core/services/lang.service';
import { IndicatorInfoComponent } from '../../shared/indicator-info/indicator-info.component';
import type { TradingIndicatorCategory } from '../../core/indicators';

const CATEGORIES: Array<TradingIndicatorCategory> = [
  'Moving Average', 'Oscillator', 'Momentum', 'Trend',
  'Volatility', 'Channels & Bands', 'Volume',
];

interface GlossaryTerm { id: string; abbr: string; group: string; }
interface GlossaryGroup { id: string; terms: GlossaryTerm[]; }

const TERM_GROUPS: GlossaryGroup[] = [
  { id: 'timeframe', terms: [
    { id: 'tf_m1', abbr: 'M1',      group: 'timeframe' },
    { id: 'tf_m5', abbr: 'M5',      group: 'timeframe' },
    { id: 'tf_h1', abbr: 'H1',      group: 'timeframe' },
    { id: 'tf_d1', abbr: 'D1',      group: 'timeframe' },
  ]},
  { id: 'order', terms: [
    { id: 'ord_market', abbr: 'MKT', group: 'order' },
    { id: 'ord_limit',  abbr: 'LMT', group: 'order' },
    { id: 'ord_stop',   abbr: 'STP', group: 'order' },
    { id: 'ord_sl',     abbr: 'S/L', group: 'order' },
  ]},
  { id: 'cost', terms: [
    { id: 'cost_spread',      abbr: 'BID/ASK', group: 'cost' },
    { id: 'cost_commission',  abbr: 'COM',     group: 'cost' },
    { id: 'cost_slippage',    abbr: 'SLP',     group: 'cost' },
    { id: 'cost_swap',        abbr: 'SWP',     group: 'cost' },
  ]},
  { id: 'risk', terms: [
    { id: 'risk_sl',  abbr: 'SL',  group: 'risk' },
    { id: 'risk_tp',  abbr: 'TP',  group: 'risk' },
    { id: 'risk_rr',  abbr: 'R:R', group: 'risk' },
    { id: 'risk_dd',  abbr: 'DD',  group: 'risk' },
    { id: 'risk_pos', abbr: 'LOT', group: 'risk' },
  ]},
  { id: 'market', terms: [
    { id: 'mkt_bull', abbr: 'BULL', group: 'market' },
    { id: 'mkt_bear', abbr: 'BEAR', group: 'market' },
    { id: 'mkt_liq',  abbr: 'LIQ',  group: 'market' },
    { id: 'mkt_vol',  abbr: 'VOL',  group: 'market' },
    { id: 'mkt_sr',   abbr: 'S/R',  group: 'market' },
  ]},
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

  protected readonly CATEGORIES  = CATEGORIES;
  protected readonly TERM_GROUPS = TERM_GROUPS;
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

  protected groupLabel(groupId: string): string {
    return this.lang.t(`learn.glossary.group.${groupId}`);
  }

  protected termText(term: GlossaryTerm, field: 'name' | 'def'): string {
    return this.lang.t(`learn.glossary.term.${term.id}.${field}`);
  }
}
