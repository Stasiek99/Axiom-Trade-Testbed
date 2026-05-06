export type Lang = 'pl' | 'en';

export const TRANSLATIONS: Record<Lang, Record<string, string>> = {
  pl: {
    // ── Navigation ────────────────────────────────────────────────────────
    'nav.dashboard': 'Wykres',
    'nav.strategy':  'Strategia',

    // ── Toolbar ───────────────────────────────────────────────────────────
    'toolbar.screenshotTooltip': 'Zrzut ekranu',
    'toolbar.langToggleLabel':   'Zmień język',

    // ── Strategy Builder ──────────────────────────────────────────────────
    'strategy.title':          'Kreator Strategii',
    'strategy.name':           'Nazwa strategii',
    'strategy.presets':        'Presety',
    'strategy.runBacktest':    'Uruchom Backtest',
    'strategy.backtestPhase4': 'Backtest dostępny w Fazie 4',
    'strategy.entryCondition': 'Warunek Wejścia',
    'strategy.exitCondition':  'Warunek Wyjścia',
    'strategy.when':           'Kiedy',
    'strategy.level':          'Poziom',
    'strategy.compareWith':    'Porównaj z',

    // ── Risk ──────────────────────────────────────────────────────────────
    'strategy.risk.title':          'Parametry Ryzyka',
    'strategy.risk.positionSize':   'Rozmiar pozycji',
    'strategy.risk.commission':     'Prowizja',
    'strategy.risk.slippage':       'Poślizg',
    'strategy.risk.positionHint':   '% kapitału na transakcję',
    'strategy.risk.commissionHint': 'Punkty bazowe na stronę',
    'strategy.risk.slippageHint':   'Zakładany wpływ rynkowy',

    // ── Indicator slot ────────────────────────────────────────────────────
    'slot.category':  'Kategoria',
    'slot.indicator': 'Wskaźnik',

    // ── Categories ────────────────────────────────────────────────────────
    'category.moving-averages': 'Średnie kroczące',
    'category.oscillators':     'Oscylatory',
    'category.momentum':        'Momentum',
    'category.trend':           'Trend',
    'category.volatility':      'Zmienność',
    'category.channels-bands':  'Kanały i pasma',
    'category.volume':          'Wolumen',

    // ── Conditions — overlay-line ─────────────────────────────────────────
    'condition.price_crosses_above': 'Cena przecina wskaźnik od dołu',
    'condition.price_crosses_below': 'Cena przecina wskaźnik od góry',
    'condition.price_above':         'Cena jest powyżej wskaźnika',
    'condition.price_below':         'Cena jest poniżej wskaźnika',
    'condition.line_crosses_above':  'Przecina inny wskaźnik od dołu',
    'condition.line_crosses_below':  'Przecina inny wskaźnik od góry',

    // ── Conditions — oscillator ───────────────────────────────────────────
    'condition.above_threshold':          'Jest powyżej poziomu',
    'condition.below_threshold':          'Jest poniżej poziomu',
    'condition.crosses_above_threshold':  'Przecina poziom od dołu',
    'condition.crosses_below_threshold':  'Przecina poziom od góry',

    // ── Conditions — MACD ────────────────────────────────────────────────
    'condition.macd_bullish':       'MACD przecina sygnał od dołu',
    'condition.macd_bearish':       'MACD przecina sygnał od góry',
    'condition.histogram_positive': 'Histogram staje się dodatni (↗ 0)',
    'condition.histogram_negative': 'Histogram staje się ujemny (↘ 0)',

    // ── Conditions — two-line ─────────────────────────────────────────────
    'condition.fast_crosses_above_slow': 'Linia szybka przecina wolną od dołu',
    'condition.fast_crosses_below_slow': 'Linia szybka przecina wolną od góry',
    'condition.fast_above_slow':         'Linia szybka jest powyżej wolnej',
    'condition.fast_below_slow':         'Linia szybka jest poniżej wolnej',

    // ── Conditions — band ────────────────────────────────────────────────
    'condition.price_crosses_upper': 'Cena przebija górne pasmo',
    'condition.price_crosses_lower': 'Cena przebija dolne pasmo',
    'condition.price_above_upper':   'Cena jest powyżej górnego pasma',
    'condition.price_below_lower':   'Cena jest poniżej dolnego pasma',
    'condition.price_above_middle':  'Cena jest powyżej środkowego pasma',
    'condition.price_below_middle':  'Cena jest poniżej środkowego pasma',

    // ── Learn page ───────────────────────────────────────────────────────
    'nav.learn':             'Edukacja',
    'learn.title':           'Baza wskaźników',
    'learn.searchPlaceholder': 'Szukaj wskaźnika...',
    'learn.allCategories':   'Wszystkie',
    'learn.formula':         'Wzór',
    'learn.formulaHint':     'Kliknij prawym przyciskiem, aby zobaczyć definicje zmiennych',
    'learn.howItWorks':      'Jak działa',
    'learn.assumes':         'Zakłada',
    'learn.shows':           'Pokazuje',
    'learn.helpsWith':       'Pomaga z',
    'learn.parameters':      'Parametry',
    'learn.formulaLegend':   'Legenda wzoru',
    'learn.learnMoreTooltip': 'Więcej informacji w Google',
    'learn.default':         'domyślnie',
    'learn.noResults':       'Brak wyników dla wybranego filtra',
    'learn.learnMore':       'Dowiedz się więcej',
    'learn.cat.moving_average': 'Średnie kroczące',
    'learn.cat.oscillator':  'Oscylatory',
    'learn.cat.momentum':    'Momentum',
    'learn.cat.trend':       'Trend',
    'learn.cat.volatility':  'Zmienność',
    'learn.cat.channels_bands': 'Kanały i pasma',
    'learn.cat.volume':      'Wolumen',

    // ── Indicator param labels ────────────────────────────────────────────
    'param.period':          'Okres',
    'param.fast_period':     'Szybki okres',
    'param.slow_period':     'Wolny okres',
    'param.signal_period':   'Okres sygnału',
    'param.fast_ema_period': 'Szybki okres EMA',
    'param.slow_ema_period': 'Wolny okres EMA',
    'param.fast_len':        'Szybka długość',
    'param.slow_len':        'Wolna długość',
    'param.multiplier':      'Mnożnik',
    'param.length':          'Długość',
    'param.lookback':        'Liczba okresów',
    'param.smoothing':       'Wygładzanie',
    'param.factor':          'Współczynnik',
    'param.deviation':       'Odchylenie',
    'param.atr_period':      'Okres ATR',
    'param.atr_multiplier':  'Mnożnik ATR',
    'param.source':          'Źródło',
  },

  en: {
    // ── Navigation ────────────────────────────────────────────────────────
    'nav.dashboard': 'Chart',
    'nav.strategy':  'Strategy',

    // ── Toolbar ───────────────────────────────────────────────────────────
    'toolbar.screenshotTooltip': 'Screenshot',
    'toolbar.langToggleLabel':   'Change language',

    // ── Strategy Builder ──────────────────────────────────────────────────
    'strategy.title':          'Strategy Builder',
    'strategy.name':           'Strategy Name',
    'strategy.presets':        'Presets',
    'strategy.runBacktest':    'Run Backtest',
    'strategy.backtestPhase4': 'Backtest coming in Phase 4',
    'strategy.entryCondition': 'Entry Condition',
    'strategy.exitCondition':  'Exit Condition',
    'strategy.when':           'When',
    'strategy.level':          'Level',
    'strategy.compareWith':    'Compare with',

    // ── Risk ──────────────────────────────────────────────────────────────
    'strategy.risk.title':          'Risk Parameters',
    'strategy.risk.positionSize':   'Position Size',
    'strategy.risk.commission':     'Commission',
    'strategy.risk.slippage':       'Slippage',
    'strategy.risk.positionHint':   '% of capital per trade',
    'strategy.risk.commissionHint': 'Basis points per side',
    'strategy.risk.slippageHint':   'Assumed market impact',

    // ── Indicator slot ────────────────────────────────────────────────────
    'slot.category':  'Category',
    'slot.indicator': 'Indicator',

    // ── Categories ────────────────────────────────────────────────────────
    'category.moving-averages': 'Moving Averages',
    'category.oscillators':     'Oscillators',
    'category.momentum':        'Momentum',
    'category.trend':           'Trend',
    'category.volatility':      'Volatility',
    'category.channels-bands':  'Channels & Bands',
    'category.volume':          'Volume',

    // ── Conditions — overlay-line ─────────────────────────────────────────
    'condition.price_crosses_above': 'Price crosses above',
    'condition.price_crosses_below': 'Price crosses below',
    'condition.price_above':         'Price is above',
    'condition.price_below':         'Price is below',
    'condition.line_crosses_above':  'Crosses above another indicator',
    'condition.line_crosses_below':  'Crosses below another indicator',

    // ── Conditions — oscillator ───────────────────────────────────────────
    'condition.above_threshold':          'Is above level',
    'condition.below_threshold':          'Is below level',
    'condition.crosses_above_threshold':  'Crosses above level',
    'condition.crosses_below_threshold':  'Crosses below level',

    // ── Conditions — MACD ────────────────────────────────────────────────
    'condition.macd_bullish':       'MACD crosses above signal',
    'condition.macd_bearish':       'MACD crosses below signal',
    'condition.histogram_positive': 'Histogram turns positive (↗ 0)',
    'condition.histogram_negative': 'Histogram turns negative (↘ 0)',

    // ── Conditions — two-line ─────────────────────────────────────────────
    'condition.fast_crosses_above_slow': 'Fast line crosses above slow',
    'condition.fast_crosses_below_slow': 'Fast line crosses below slow',
    'condition.fast_above_slow':         'Fast line is above slow',
    'condition.fast_below_slow':         'Fast line is below slow',

    // ── Conditions — band ────────────────────────────────────────────────
    'condition.price_crosses_upper': 'Price crosses above upper band',
    'condition.price_crosses_lower': 'Price crosses below lower band',
    'condition.price_above_upper':   'Price is above upper band',
    'condition.price_below_lower':   'Price is below lower band',
    'condition.price_above_middle':  'Price is above middle band',
    'condition.price_below_middle':  'Price is below middle band',

    // ── Learn page ───────────────────────────────────────────────────────
    'nav.learn':             'Learn',
    'learn.title':           'Indicator Library',
    'learn.searchPlaceholder': 'Search indicators...',
    'learn.allCategories':   'All',
    'learn.formula':         'Formula',
    'learn.formulaHint':     'Right-click to see variable definitions',
    'learn.howItWorks':      'How It Works',
    'learn.assumes':         'Assumes',
    'learn.shows':           'Shows',
    'learn.helpsWith':       'Helps with',
    'learn.parameters':      'Parameters',
    'learn.formulaLegend':   'Formula Legend',
    'learn.learnMoreTooltip': 'Learn more on Google',
    'learn.default':         'default',
    'learn.noResults':       'No results for the selected filter',
    'learn.learnMore':       'Learn more',
    'learn.cat.moving_average': 'Moving Averages',
    'learn.cat.oscillator':  'Oscillators',
    'learn.cat.momentum':    'Momentum',
    'learn.cat.trend':       'Trend',
    'learn.cat.volatility':  'Volatility',
    'learn.cat.channels_bands': 'Channels & Bands',
    'learn.cat.volume':      'Volume',

    // ── Indicator param labels ────────────────────────────────────────────
    'param.period':          'Period',
    'param.fast_period':     'Fast Period',
    'param.slow_period':     'Slow Period',
    'param.signal_period':   'Signal Period',
    'param.fast_ema_period': 'Fast EMA Period',
    'param.slow_ema_period': 'Slow EMA Period',
    'param.fast_len':        'Fast Length',
    'param.slow_len':        'Slow Length',
    'param.multiplier':      'Multiplier',
    'param.length':          'Length',
    'param.lookback':        'Lookback',
    'param.smoothing':       'Smoothing',
    'param.factor':          'Factor',
    'param.deviation':       'Deviation',
    'param.atr_period':      'ATR Period',
    'param.atr_multiplier':  'ATR Multiplier',
    'param.source':          'Source',
  },
};
