import { Injectable, signal } from '@angular/core';
import type { IndicatorDescI18n, IndicatorMeta } from '../indicators';
import { type Lang, TRANSLATIONS } from '../i18n/translations';
import { INDICATORS_I18N } from '../i18n/indicators.i18n';
import { PARAM_DESCRIPTIONS_PL } from '../i18n/param-descriptions.i18n';
import { FORMULA_LEGEND_PL } from '../i18n/formula-legend.i18n';

@Injectable({ providedIn: 'root' })
export class LangService {
  private readonly _lang = signal<Lang>('pl');
  readonly currentLang = this._lang.asReadonly();

  setLang(lang: Lang): void {
    this._lang.set(lang);
  }

  t(key: string): string {
    return TRANSLATIONS[this._lang()][key] ?? key;
  }

  resolveDescription(meta: IndicatorMeta): string {
    const i18n = meta.descriptionI18n;
    if (i18n) {
      return i18n[this._lang()] ?? meta.description;
    }
    return meta.description;
  }

  resolveIndicatorDesc(id: string, lang: Lang, fallback: IndicatorDescI18n): IndicatorDescI18n {
    return INDICATORS_I18N[id]?.[lang] ?? fallback;
  }

  /** Translates formula legend explanation strings for a given indicator.
   *  Returns the fallback array (English) when the language is English or no
   *  translation exists for the indicator. Individual entries fall back to
   *  English when the Polish array is shorter than the catalog's array. */
  resolveFormulaLegend(
    id: string,
    fallback: ReadonlyArray<{ symbol: string; explanation: string }>,
  ): Array<{ symbol: string; explanation: string }> {
    if (this._lang() === 'en') return [...fallback];
    const pl = FORMULA_LEGEND_PL[id];
    return fallback.map((entry, i) => ({
      symbol: entry.symbol,
      explanation: pl?.[i] ?? entry.explanation,
    }));
  }

  /** Translates an OptionParam label (e.g. "Fast Period" → "Szybki okres").
   *  Falls back to the original label when no translation exists. */
  paramLabel(label: string): string {
    const key = 'param.' + label.toLowerCase().replace(/\s+/g, '_');
    const result = TRANSLATIONS[this._lang()][key];
    return result ?? label;
  }

  /** Translates an OptionParam description (tooltip) for a given indicator.
   *  Falls back to the original English description when no translation exists. */
  paramDescription(indicatorId: string, paramKey: string, fallback: string): string {
    if (this._lang() === 'en') return fallback;
    return PARAM_DESCRIPTIONS_PL[`${indicatorId}.${paramKey}`] ?? fallback;
  }
}
