export type Lang = 'pl' | 'en';

export const TRANSLATIONS: Record<Lang, Record<string, string>> = {
  pl: {
    'nav.dashboard': 'Panel',
    'toolbar.screenshotTooltip': 'Zrzut ekranu',
    'toolbar.langToggleLabel': 'Zmień język',
  },
  en: {
    'nav.dashboard': 'Dashboard',
    'toolbar.screenshotTooltip': 'Screenshot',
    'toolbar.langToggleLabel': 'Change language',
  },
};
