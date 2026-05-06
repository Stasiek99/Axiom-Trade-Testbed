import {
  Component,
  HostListener,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import katex from 'katex';
import type { TradingIndicatorData } from '../../core/indicators';
import { LangService } from '../../core/services/lang.service';

@Component({
  selector: 'app-indicator-info',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  templateUrl: './indicator-info.component.html',
  styleUrl: './indicator-info.component.scss',
})
export class IndicatorInfoComponent {
  indicator = input.required<TradingIndicatorData>();

  protected legendOpen = signal(false);
  protected legendX = signal(0);
  protected legendY = signal(0);

  private sanitizer = inject(DomSanitizer);
  protected lang = inject(LangService);

  protected resolved = computed(() => {
    const ind = this.indicator();
    return this.lang.resolveIndicatorDesc(ind.id, this.lang.currentLang(), ind);
  });

  protected formulaHtml = computed<SafeHtml>(() => {
    const html = katex.renderToString(this.indicator().formula, {
      throwOnError: false,
      displayMode: true,
    });
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  protected legendSymbolHtmls = computed<SafeHtml[]>(() =>
    this.indicator().formulaLegend.map(e => {
      const html = katex.renderToString(e.symbol, { throwOnError: false, displayMode: false });
      return this.sanitizer.bypassSecurityTrustHtml(html);
    })
  );

  protected resolvedLegend = computed(() =>
    this.lang.resolveFormulaLegend(this.indicator().id, this.indicator().formulaLegend)
  );

  protected learnMoreUrl = computed(() => {
    const q = encodeURIComponent(this.indicator().title + ' trading indicator');
    return `https://www.google.com/search?q=${q}`;
  });

  protected onFormulaContextMenu(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.legendX.set(event.clientX);
    this.legendY.set(event.clientY);
    this.legendOpen.set(true);
  }

  protected closeLegend(): void {
    this.legendOpen.set(false);
  }

  @HostListener('document:click')
  protected onDocumentClick(): void {
    this.legendOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.legendOpen.set(false);
  }
}
