import { Injectable, signal } from '@angular/core';
import type { IndicatorDescI18n, IndicatorMeta } from '../indicators';
import { type Lang, TRANSLATIONS } from '../i18n/translations';
import { INDICATORS_I18N } from '../i18n/indicators.i18n';

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
}
