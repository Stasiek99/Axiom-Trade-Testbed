/**
 * Polish translations for formula legend explanations.
 * Key = indicator id (matches IndicatorDef.meta.id / INDICATORS_CATALOG entry id).
 * Value = array of Polish explanation strings in the SAME ORDER as the catalog's formulaLegend array.
 * Falls back to the English catalog string when a key or index is missing.
 */
export const FORMULA_LEGEND_PL: Record<string, string[]> = {

  // ── Moving Averages ──────────────────────────────────────────────────────
  'sma': [
    'Cena zamknięcia i słupków temu',
    'Okres — liczba uśrednianych słupków',
  ],
  'ema': [
    'Bieżąca cena zamknięcia',
    'Współczynnik wygładzania — kontroluje szybkość adaptacji EMA',
    'Okres — większe n = wolniejsza reakcja',
    'Poprzednia wartość EMA',
  ],
  'wma': [
    'Cena zamknięcia i słupków temu (i=1 = najstarszy, i=n = bieżący)',
    'Okres',
    'Mianownik normalizacji — suma wag 1+2+…+n',
  ],
  'rma': [
    'Poprzednia wygładzona wartość',
    'Bieżąca cena zamknięcia',
    'Okres',
  ],
  'smma': [
    'Poprzednia wygładzona wartość',
    'Bieżąca cena zamknięcia',
    'Okres',
  ],
  'dema': [
    'Prosta EMA z n okresów',
    'EMA zastosowana ponownie do pierwszej EMA (podwójnie wygładzona)',
  ],
  'tema': [
    'EMA pierwszego przejścia z n okresów',
    'EMA drugiego przejścia (podwójnie wygładzona)',
    'EMA trzeciego przejścia (potrójnie wygładzona)',
  ],
  'hma': [
    'Ważona średnia krocząca z pełnego okresu n',
    'WMA z połowy okresu',
    'Całkowity pierwiastek z n — okno końcowego wygładzania',
  ],
  'lsma': [
    'Wyraz wolny regresji MNK',
    'Nachylenie regresji MNK — dodatnie oznacza trend wzrostowy',
    'Indeks słupka (t=0 = najstarszy słupek w oknie)',
    'Długość okna regresji',
  ],
  'zlsma': [
    'Średnia krocząca MNK z n okresów',
    'Cena zamknięcia przesunięta o wartość opóźnienia',
  ],
  'alma': [
    'Waga Gaussa dla słupka i',
    'Środek ciężkości wag = offset × (n−1)',
    'Szerokość krzywej dzwonowej = n / sigma',
    'Okres',
  ],
  'vwma': [
    'Cena zamknięcia i słupków temu',
    'Wolumen i słupków temu',
    'Okres',
  ],
  'mcginley': [
    'Poprzednia wartość McGinley Dynamic',
    'Bieżąca cena zamknięcia',
    'Parametr okresu (kontroluje prędkość bazową)',
    'Współczynnik korekcji prędkości — wzmacnia efekt podczas szybkich ruchów',
  ],
  'macross': [
    'Średnia krocząca z krótszego okresu',
    'Średnia krocząca z dłuższego okresu',
  ],
  'ma-ribbon': [
    'Średnia krocząca z okresem n_i',
    'Okres najkrótszej MA w wstążce',
    'Przyrost między kolejnymi okresami MA',
    'Całkowita liczba linii MA',
  ],

  // ── Oscillators ───────────────────────────────────────────────────────────
  'rsi': [
    'Względna siła = średni zysk ÷ średnia strata z n okresów',
    'Wygładzona średnia Wildera z rosnących zamknięć z n okresów',
    'Wygładzona średnia Wildera z malejących zamknięć z n okresów',
    'Okres (domyślnie 14)',
  ],
  'stochrsi': [
    'Bieżąca wartość RSI',
    'Najniższe RSI z ostatnich n słupków',
    'Najwyższe RSI z ostatnich n słupków',
  ],
  'cci': [
    'Cena typowa = (Szczyt + Dno + Zamknięcie) / 3',
    'Prosta średnia krocząca ceny typowej z n okresów',
    'Średnie bezwzględne odchylenie TP od SMA z n okresów',
    'Stała skalowania — utrzymuje ~75% wartości w zakresie ±100',
  ],
  'williams-r': [
    'Najwyższy szczyt z n słupków',
    'Najniższy dołek z n słupków',
    'Bieżąca cena zamknięcia',
  ],
  'awesome-oscillator': [
    'Środek słupka = (Szczyt + Dno) / 2',
    'Prosta średnia 5-okresowa z punktów środkowych',
    'Prosta średnia 34-okresowa z punktów środkowych',
  ],
  'chande-mo': [
    'Suma wszystkich wzrostów zamknięcia (C_t − C_{t−1} > 0) z n okresów',
    'Suma wszystkich spadków zamknięcia (wartość bezwzględna) z n okresów',
  ],
  'dpo': [
    'Cena zamknięcia n/2+1 słupków temu',
    'SMA z n okresów, oceniana n/2+1 słupków temu',
  ],
  'stochastic': [
    'Bieżąca cena zamknięcia',
    'Najniższy dołek z n słupków',
    'Najwyższy szczyt z n słupków',
    'Linia sygnału — SMA m-okresowa z %K',
  ],

  // ── Momentum ──────────────────────────────────────────────────────────────
  'macd': [
    '12-okresowa EMA ceny zamknięcia',
    '26-okresowa EMA ceny zamknięcia',
    '9-okresowa EMA linii MACD',
    'Histogram = MACD − Sygnał; pokazuje przyspieszenie momentum',
  ],
  'momentum': [
    'Bieżąca cena zamknięcia',
    'Cena zamknięcia n słupków temu',
    'Okres wsteczny',
  ],
  'roc': [
    'Bieżąca cena zamknięcia',
    'Cena zamknięcia n słupków temu',
    'Okres wsteczny',
  ],

  // ── Volatility ────────────────────────────────────────────────────────────
  'atr': [
    'True Range — największy z: (H−L), |H−C_{t−1}|, |L−C_{t−1}|',
    'Okres wygładzania',
  ],

  // ── Channels & Bands ──────────────────────────────────────────────────────
  'bollinger-bands': [
    'Prosta średnia krocząca ceny zamknięcia z n okresów',
    'Mnożnik — liczba odchyleń standardowych od środkowego pasma',
    'Odchylenie standardowe ceny zamknięcia z n okresów',
    'Okres wsteczny (domyślnie 20)',
    'Cena zamknięcia',
  ],
  'keltner-channels': [
    'Wykładnicza średnia krocząca z n okresów',
    'Mnożnik ATR',
    'Średni True Range z n okresów',
  ],
  'donchian-channels': [
    'Najwyższy szczyt z n słupków',
    'Najniższy dołek z n słupków',
    'Środek kanału',
    'Okres wsteczny',
  ],
};
