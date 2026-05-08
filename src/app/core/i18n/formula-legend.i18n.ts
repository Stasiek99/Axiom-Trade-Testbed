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
  'maribbon': [
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
  'rvi': [
    'Zamknięcie minus Otwarcie — energia wzrostowa słupka',
    'Szczyt minus Dno — pełny zakres słupka',
    'Symetrycznie ważona 4-barowa średnia: (v + 2v_{-1} + 2v_{-2} + v_{-3}) / 6',
  ],
  'tsi': [
    'Jednookresowa zmiana ceny',
    'Pierwsze wygładzanie EMA z okresu r',
    'Drugie wygładzanie EMA z okresu s',
  ],
  'bb-percentb': [
    'Bieżąca cena zamknięcia',
    'Górne pasmo Bollingera = SMA + k·σ',
    'Dolne pasmo Bollingera = SMA − k·σ',
  ],
  'fisher-transform': [
    'Znormalizowana pozycja ceny w zakresie (−1, 1)',
    'Najniższy dołek i najwyższy szczyt z n okresów',
    'Logarytm naturalny',
  ],
  'ultimate-oscillator': [
    'Presja zakupu = Zamknięcie − min(Dno, Poprzednie zamknięcie)',
    'True Range dla okresu p',
    'Średnia presja zakupu dla okresu p (7, 14 lub 28)',
  ],
  'wave-trend': [
    '(Szczyt + Dno + Zamknięcie) / 3',
    'Pierwsze wygładzanie EMA (okres kanału)',
    'Znormalizowane odchylenie — pośrednia wartość oscylatora',
    'Linia WaveTrend — EMA składowej CI',
    'Stała skalowania (taka sama jak w CCI)',
  ],
  'kdj': [
    'Surowa wartość stochastyczna = (C − L_n)/(H_n − L_n) × 100',
    'Wygładzona wartość stochastyczna',
    'Linia sygnału — wygładzone K',
    'Wzmacniacz momentum — może przekraczać zakres 0–100',
  ],
  'connors-rsi': [
    '3-okresowy RSI cen zamknięcia',
    '2-okresowy RSI długości serii wzrostów/spadków',
    'Ranga percentylowa dzisiejszego 1-dniowego ROC w ostatnich 100 słupkach',
  ],
  'smi-ergodic': [
    'Zmiana ceny od zamknięcia do zamknięcia',
    'Szybkie wygładzanie EMA (okres r)',
    'Wolne wygładzanie EMA (okres s)',
  ],
  'stochastic': [
    'Bieżąca cena zamknięcia',
    'Najniższy dołek z n słupków',
    'Najwyższy szczyt z n słupków',
    'Linia sygnału — SMA m-okresowa z %K',
  ],
  'relative-volatility-index': [
    'Odchylenie standardowe na słupkach wzrostowych (zamknięcie > poprzednie zamknięcie), w przeciwnym razie 0',
    'Odchylenie standardowe na słupkach spadkowych (zamknięcie < poprzednie zamknięcie), w przeciwnym razie 0',
    'Wykładnicza średnia krocząca z n okresów',
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
  'bop': [
    'Netto zmiana ceny od otwarcia do zamknięcia',
    'Pełny zakres słupka od szczytu do dna',
  ],
  'bull-bear-power': [
    'Szczyt słupka',
    'Dno słupka',
    'n-okresowa EMA ceny zamknięcia',
  ],
  'elder-force-index': [
    'Jednookresowa zmiana ceny (kierunek)',
    'Wolumen bieżącego słupka (wielkość)',
  ],
  'price-oscillator': [
    'EMA z krótszym okresem',
    'EMA z dłuższym okresem',
  ],
  'coppock-curve': [
    '14-okresowy wskaźnik stopy zwrotu',
    '11-okresowy wskaźnik stopy zwrotu',
    '10-okresowa ważona średnia krocząca sumy ROC',
  ],
  'trix': [
    'Potrójnie wygładzona EMA w bieżącym słupku',
    'Potrójnie wygładzona EMA jeden słupek temu',
  ],
  'kst': [
    'Wygładzona stopa zmian dla cyklu i',
    'ROC z okresem p (10, 13, 14, 15)',
    'Wygładzanie SMA z okresem r (10, 13, 14, 15)',
    'Wagi: 1, 2, 3, 4 (dłuższe cykle ważone bardziej)',
  ],
  'squeeze-momentum': [
    'Odchylenie ceny od punktu środkowego zakresu n-okresowego',
    'Wartość regresji liniowej x z n okresów',
    'Najwyższy szczyt i najniższy dołek z n okresów',
  ],
  'impulse-macd': [
    '(Szczyt + Dno + Zamknięcie) / 3 — cena typowa',
    'EMA z dłuższym okresem zastosowana do HLC3',
    'EMA z krótszym okresem zastosowana do pierwszej EMA',
  ],
  'macd4c': [
    'Szybka EMA − Wolna EMA',
    'EMA linii MACD',
    'Wartość histogramu poprzedniego słupka — służy do wykrycia przyspieszenia',
  ],

  // ── Volatility ────────────────────────────────────────────────────────────
  'atr': [
    'True Range — największy z: (H−L), |H−C_{t−1}|, |L−C_{t−1}|',
    'Okres wygładzania',
  ],
  'adr': [
    'Szczyt słupka i słupków temu',
    'Dno słupka i słupków temu',
    'Okres',
  ],
  'standard-deviation': [
    'Średnia cena zamknięcia w n-okresowym oknie',
    'Cena zamknięcia i słupków temu',
    'Okres',
  ],
  'historical-volatility': [
    'Logarytmiczny zwrot od słupka do słupka',
    'Odchylenie standardowe logarytmicznych zwrotów z n okresów',
    'Czynnik annualizacji (252 dni handlowych rocznie)',
  ],
  'bb-bandwidth': [
    'Pasma Bollingera = SMA ± k·σ',
    'SMA ceny zamknięcia z n okresów',
    'Mnożnik odchylenia standardowego (domyślnie 2)',
  ],
  'bollinger-bars': [
    'Cena zamknięcia',
    'Górne pasmo Bollingera = SMA + k·σ',
    'Dolne pasmo Bollingera = SMA − k·σ',
  ],

  // ── Trend ──────────────────────────────────────────────────────────────────
  'parabolic-sar': [
    'Bieżący poziom zatrzymania i odwrócenia',
    'Współczynnik przyspieszenia — zaczyna od step, przyrastając przy każdym nowym ekstremum, ograniczony przez max',
    'Punkt ekstremalny — najwyższy szczyt podczas trendu wzrostowego lub najniższe dno podczas trendu spadkowego',
  ],
  'supertrend': [
    'Punkt środkowy słupka',
    'Średni True Range z n okresów',
    'Mnożnik ATR — kontroluje odległość pasma',
  ],
  'aroon': [
    'Liczba słupków od najwyższego szczytu z n okresu',
    'Liczba słupków od najniższego dna z n okresu',
    'Okres wsteczny',
  ],
  'mass-index': [
    'Zakres szczyt-dno dla słupka i',
    '9-okresowa wykładnicza średnia krocząca',
  ],
  'vortex': [
    'Ruch w górę: bieżący szczyt do poprzedniego dna',
    'Ruch w dół: bieżące dno do poprzedniego szczytu',
    'True Range słupka t',
  ],
  'williams-alligator': [
    'Wygładzona Średnia Krocząca z n okresów',
    'Cena mediana = (Szczyt + Dno) / 2',
    'Przesunięcie do przodu o k słupków (wyrysowane z wyprzedzeniem)',
  ],
  'zig-zag': [
    'Minimalny procentowy ruch wymagany do wyznaczenia nowego pivotu',
    'Poziom cenowy ostatnio potwierdzonego pivotu',
  ],
  'chande-kroll-stop': [
    'ATR dla pierwszego okresu',
    'Drugi okres wsteczny do obliczenia ostatecznego stopu',
  ],
  'williams-fractals': [
    'Szczyt środkowego słupka',
    'Dno środkowego słupka',
    'Liczba słupków po każdej stronie wymagana do potwierdzenia fraktala (domyślnie 2)',
  ],
  'coral-trend': [
    'Współczynnik wygładzania EMA wyprowadzony z okresu n',
    'Parametr okresu kontrolujący gładkość',
    'Poprzednia wartość Coral Trend',
  ],
  'chandelier-exit': [
    'Najwyższy szczyt z n okresów',
    'Najniższe dno z n okresów',
    'Średni True Range z n okresów',
    'Mnożnik ATR (domyślnie 2 lub 3)',
  ],
  'donchian-trend-ribbon': [
    'Środek i-tego kanału Donchiana',
    'Najwyższy szczyt z okresu n_i',
    'Najniższe dno z okresu n_i',
  ],
  'twap': [
    'Otwarcie, Szczyt, Dno, Zamknięcie każdego słupka',
    'Długość kroczącego okna',
  ],
  'adx': [
    '+Wskaźnik kierunkowy = 100 × RMA(+DM) / ATR',
    '−Wskaźnik kierunkowy = 100 × RMA(−DM) / ATR',
    'Dodatni ruch kierunkowy = max(H − H_poprz, 0) jeśli > |L − L_poprz|',
    'Ujemny ruch kierunkowy = max(|L − L_poprz|, 0) jeśli > H − H_poprz',
  ],
  'dmi': [
    'Dodatni ruch kierunkowy dla każdego słupka',
    'Ujemny ruch kierunkowy dla każdego słupka',
    'Średni True Range z n okresów',
    'Wygładzona średnia Wildera',
  ],
  'ichimoku': [
    '9-okresowy punkt środkowy (Linia konwersji)',
    '26-okresowy punkt środkowy (Linia bazowa)',
    'Średnia Tenkan i Kijun, wyrysowana 26 słupków naprzód',
    '52-okresowy punkt środkowy, wyrysowany 26 słupków naprzód — tworzy "chmurę"',
    'Bieżące zamknięcie wyrysowane 26 słupków wstecz',
  ],
  'choppiness': [
    'Suma 1-periodowych true range z n słupków',
    'Całkowity zakres szczyt-dno z n okresów',
    'Czynnik normalizacji oparty na długości okresu',
  ],
  'bb-trend': [
    'Cena zamknięcia',
    'Górne i dolne pasma Bollingera',
    'n-okresowe odchylenie standardowe — normalizuje siłę trendu',
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
    'Najwyższy szczyt i słupków temu',
    'Najniższy dołek i słupków temu',
    'Okres wsteczny',
    'Najwyższy szczyt w oknie n słupków',
    'Najniższy dołek w oknie n słupków',
    'Punkt środkowy górnego i dolnego pasma',
  ],
  'envelope': [
    'Średnia krocząca (SMA lub EMA) ceny zamknięcia z n okresów',
    'Procentowe odchylenie od średniej kroczącej (domyślnie 2,5)',
    'Okres średniej kroczącej (domyślnie 20)',
  ],
  'median': [
    'Cena mediana (typowa): średnia szczytu, dna i zamknięcia',
    'Cena najwyższa bieżącego słupka',
    'Cena najniższa bieżącego słupka',
    'Cena zamknięcia bieżącego słupka',
    'Wykładnicza średnia krocząca ceny mediany z n okresów',
    'Okres EMA (domyślnie 20)',
    'Mnożnik ATR dla szerokości pasma (domyślnie 2)',
    'Średni True Range z a okresów',
    'Okres ATR (domyślnie 10)',
  ],

  // ── Volume ────────────────────────────────────────────────────────────────
  'obv': [
    'Wartość On Balance Volume z poprzedniego słupka',
    'Wolumen bieżącego słupka',
    'Cena zamknięcia bieżącego słupka',
    'Cena zamknięcia poprzedniego słupka',
  ],
  'mfi': [
    'Cena typowa: średnia szczytu, dna i zamknięcia',
    'Cena najwyższa',
    'Cena najniższa',
    'Cena zamknięcia',
    'Wolumen słupka',
    'Surowy przepływ pieniądza: cena typowa pomnożona przez wolumen',
    'Suma dodatnich przepływów pieniądza z n okresów (słupki, gdzie cena typowa wzrosła)',
    'Suma ujemnych przepływów pieniądza z n okresów (słupki, gdzie cena typowa spadła)',
    'Okres wsteczny (domyślnie 14)',
  ],
  'pvt': [
    'Wartość Price Volume Trend z poprzedniego słupka',
    'Wolumen bieżącego słupka',
    'Cena zamknięcia bieżącego słupka',
    'Cena zamknięcia poprzedniego słupka',
  ],
  'volume-oscillator': [
    'Krótkoterminowa wykładnicza średnia krocząca wolumenu (domyślnie okres 5)',
    'Długoterminowa wykładnicza średnia krocząca wolumenu (domyślnie okres 10)',
    'Wolumen słupka',
  ],
  'chaikin-mf': [
    'Mnożnik przepływu pieniądza: pozycja zamknięcia w zakresie szczyt-dno słupka, od −1 (zamknięcie przy dnie) do +1 (zamknięcie przy szczycie)',
    'Cena zamknięcia',
    'Cena najwyższa',
    'Cena najniższa',
    'Wolumen i słupków temu',
    'Okres wsteczny (domyślnie 20)',
  ],
  'chaikin-oscillator': [
    'Wartość linii Akumulacja/Dystrybucja w słupku t',
    'Poprzednia wartość linii A/D',
    'Cena zamknięcia',
    'Cena najwyższa',
    'Cena najniższa',
    'Wolumen',
    'Szybka EMA linii Akumulacja/Dystrybucja (domyślnie okres 3)',
    'Wolna EMA linii Akumulacja/Dystrybucja (domyślnie okres 10)',
  ],
  'ease-of-movement': [
    'Ruch punktu środkowego: zmiana środka zakresu słupka względem poprzedniego słupka',
    'Cena najwyższa bieżącego słupka',
    'Cena najniższa bieżącego słupka',
    'Cena najwyższa poprzedniego słupka',
    'Cena najniższa poprzedniego słupka',
    'Wskaźnik oporu: wolumen podzielony przez zakres szczyt-dno bieżącego słupka',
    'Wolumen bieżącego słupka',
    'Surowa wartość łatwości ruchu (zazwyczaj wygładzana 14-okresową SMA)',
  ],
  'klinger-oscillator': [
    'Siła wolumenu: podpisany wolumen skorygowany stosunkiem dziennego ruchu do skumulowanego ruchu',
    'Wolumen słupka',
    'Dzienny ruch: szczyt − dno bieżącego słupka',
    'Skumulowany ruch: kroczący sum dziennych ruchów używany do normalizacji',
    '+1 jeśli (Szczyt + Dno + Zamknięcie) > suma poprzedniego słupka, −1 w przeciwnym razie',
    '34-okresowa EMA siły wolumenu (szybka linia)',
    '55-okresowa EMA siły wolumenu (wolna linia)',
    'Klinger Oscillator: różnica między szybką a wolną EMA',
  ],
  'net-volume': [
    'Netto wolumen dla bieżącego słupka',
    'Całkowity wolumen bieżącego słupka',
    'Cena zamknięcia bieżącego słupka',
    'Cena zamknięcia poprzedniego słupka',
  ],
  'volume-delta': [
    'Szacowany wolumen zakupów: wolumen ważony odległością zamknięcia od szczytu',
    'Szacowany wolumen sprzedaży: pozostały wolumen (ogółem minus wolumen zakupów)',
    'Delta wolumenu: wolumen zakupów minus wolumen sprzedaży dla słupka',
    'Całkowity wolumen słupka',
    'Cena zamknięcia',
    'Cena najwyższa',
    'Cena najniższa',
  ],
  'cumulative-volume-delta': [
    'Skumulowana delta wolumenu w słupku t',
    'Delta wolumenu słupka i: szacowany wolumen zakupów minus szacowany wolumen sprzedaży',
    'Całkowity wolumen słupka i',
    'Cena zamknięcia słupka i',
    'Cena najwyższa słupka i',
    'Cena najniższa słupka i',
  ],
  'obv-macd': [
    'On Balance Volume: skumulowana suma podpisanego wolumenu',
    'Szybka EMA OBV (domyślnie okres 12)',
    'Wolna EMA OBV (domyślnie okres 26)',
    'Linia MACD OBV: szybka EMA minus wolna EMA OBV',
    'Linia sygnału: EMA linii MACD (domyślnie okres 9)',
    'Okres szybkiej EMA (domyślnie 12)',
    'Okres wolnej EMA (domyślnie 26)',
    'Okres EMA sygnału (domyślnie 9)',
  ],
  'colored-volume': [
    'Cena zamknięcia bieżącego słupka',
    'Cena otwarcia bieżącego słupka',
    'Wolumen bieżącego słupka (określa wysokość słupka)',
    'Klasyfikacja wizualna: zielony dla słupków wzrostowych, czerwony dla spadkowych',
  ],
};
