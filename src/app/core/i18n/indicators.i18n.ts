import type { Lang } from './translations';
import type { IndicatorDescI18n } from '../indicators';

/**
 * Polish (and future language) overrides for indicator descriptions.
 * Keys must match IndicatorDef.meta.id exactly.
 * Falls back to the English catalog entry if a key or lang is missing.
 */
export const INDICATORS_I18N: Record<string, Partial<Record<Lang, IndicatorDescI18n>>> = {
  // ── MOVING AVERAGES ─────────────────────────────────────────────────────────
  'sma': {
    pl: {
      shortDescription: 'Zwykła średnia arytmetyczna ceny z n okresów – podstawowe narzędzie wygładzania.',
      fullDescription: {
        assumptions: 'Wszystkie słupki w oknie wstecznym mają równą wagę.',
        whatItShows: 'Średni poziom ceny w wybranym okresie, wygładzający krótkoterminowe szumy.',
        howItHelps: 'Identyfikuje ogólny kierunek trendu i działa jako dynamiczne wsparcie/opór; przecięcia (crossover) sygnalizują potencjalne zmiany trendu.',
      },
    },
  },
  'ema': {
    pl: {
      shortDescription: 'Średnia ważona, która nadaje wykładniczo większe znaczenie ostatnim cenom.',
      fullDescription: {
        assumptions: 'Najnowsze działania cenowe są bardziej istotne dla bieżącego trendu niż starsze dane.',
        whatItShows: 'Wygładzona linia cenowa, która reaguje szybciej na nowe informacje niż SMA.',
        howItHelps: 'Dostarcza wcześniejszych sygnałów zmiany trendu; krótsze EMA przecinające dłuższe są klasycznymi sygnałami wejścia/wyjścia (entry/exit triggers).',
      },
    },
  },
  'wma': {
    pl: {
      shortDescription: 'Liniowo ważona średnia, gdzie najnowszy słupek ma największą wagę.',
      fullDescription: {
        assumptions: 'Każdy kolejny słupek zasługuje na proporcjonalnie większy wpływ niż poprzedni.',
        whatItShows: 'Wygładzona cena, która jest bardziej responsywna na ostatnie ruchy niż SMA, ale mniej skokowa niż EMA.',
        howItHelps: 'Używana jako filtr do redukcji opóźnienia (lag) przy jednoczesnym czystym identyfikowaniu kierunku trendu.',
      },
    },
  },
  'rma': {
    pl: {
      shortDescription: 'Metoda wygładzania J. Wellesa Wildera – wolniejsza od EMA, używana wewnętrznie przez RSI i ATR.',
      fullDescription: {
        assumptions: 'Preferowana jest stopniowa, stabilna średnia zamiast reaktywnej dla obliczeń momentum.',
        whatItShows: 'Bardzo gładka średnia ceny, równoważna EMA z okresem 2n-1.',
        howItHelps: 'Podstawowy składnik RSI, ATR i ADX – może być również używana bezpośrednio jako filtr trendu o niskim szumie.',
      },
    },
  },
  'smma': {
    pl: {
      shortDescription: 'Wolno reagująca średnia, która wykorzystuje wszystkie historyczne dane z malejącą wagą w czasie.',
      fullDescription: {
        assumptions: 'Długoterminowa historia cen wciąż ma znaczenie i nie powinna być całkowicie odrzucona.',
        whatItShows: 'Ultra-gładka linia trendu, idealna do identyfikacji dominującego kierunku na wyższych interwałach czasowych.',
        howItHelps: 'Przecina krótkoterminowy szum; traderzy używają jej, aby dłużej pozostawać w trendach makro.',
      },
    },
  },
  'dema': {
    pl: {
      shortDescription: 'EMA z EMA z usuniętym opóźnieniem – około dwa razy szybsza niż standardowa EMA.',
      fullDescription: {
        assumptions: 'Opóźnienie EMA można zmniejszyć o połowę, odejmując dwukrotnie wygładzoną składową.',
        whatItShows: 'Średnia ruchoma o niskim opóźnieniu, która ściśle śledzi cenę bez nadmiernego szumu.',
        howItHelps: 'Generuje wcześniejsze sygnały crossover niż zwykła EMA, zachowując jednocześnie gładkie wyjście.',
      },
    },
  },
  'tema': {
    pl: {
      shortDescription: 'Trzy zagnieżdżone EMA z korektą opóźnienia – jeszcze szybsza niż DEMA, z minimalnym opóźnieniem.',
      fullDescription: {
        assumptions: 'Potrójne wygładzanie z algebraiczną eliminacją opóźnienia daje najbardziej responsywną średnią w rodzinie EMA.',
        whatItShows: 'Bardzo nisko opóźniona gładka linia trendu, która ściśle przylega do ceny.',
        howItHelps: 'Przydatna na szybko poruszających się aktywach lub krótkich interwałach czasowych, gdzie standardowe EMA są zbyt wolne.',
      },
    },
  },
  'hma': {
    pl: {
      shortDescription: 'Średnia Alana Hulla – prawie całkowicie eliminuje opóźnienie, zachowując gładkość linii.',
      fullDescription: {
        assumptions: 'Połączenie dwóch WMA o różnych długościach i ponowne wygładzenie różnicy usuwa większość wrodzonego opóźnienia.',
        whatItShows: 'Szybka, gładka linia trendu, która ściśle śledzi bieżącą cenę.',
        howItHelps: 'Pozwala traderom wchodzić i wychodzić z trendów wcześniej, z mniejszą liczbą fałszywych sygnałów niż tradycyjne MA.',
      },
    },
  },
  'lsma': {
    pl: {
      shortDescription: 'Punkt końcowy linii regresji liniowej dopasowanej do ostatnich n świec – zwany również LinReg.',
      fullDescription: {
        assumptions: 'Cena podąża za lokalnie liniowym trendem w oknie przeszukiwania.',
        whatItShows: 'Gdzie kończy się dziś linia najlepszego dopasowania regresji, wskazując uczciwą wartość trendu.',
        howItHelps: 'Zapewnia widok kierunkowy z mniejszym opóźnieniem; kąt nachylenia wskazuje siłę trendu.',
      },
    },
  },
  'zlsma': {
    pl: {
      shortDescription: 'LSMA z odjętym składnikiem opóźnienia, tworzący jeszcze bardziej responsywną linię trendu.',
      fullDescription: {
        assumptions: 'Odjęcie opóźnionego LSMA od siebie w punkcie środkowym niweluje wbudowane opóźnienie.',
        whatItShows: 'Przesunięta do przodu linia regresji, która próbuje przewidzieć, gdzie zmierza trend.',
        howItHelps: 'Daje wcześniejsze sygnały niż LSMA kosztem nieco większego szumu.',
      },
    },
  },
  'alma': {
    pl: {
      shortDescription: 'Średnia ważona Gaussa, która równoważy gładkość i responsywność za pomocą trzech parametrów.',
      fullDescription: {
        assumptions: 'Rozkład wag o kształcie dzwonu skupiony wokół najnowszych świec minimalizuje opóźnienie, jednocześnie kontrolując szum.',
        whatItShows: 'Gładka średnia z niskim opóźnieniem, której zachowanie można dostroić za pomocą offset i sigma.',
        howItHelps: 'Traderzy dostosowują offset w kierunku 1 dla większej responsywności lub w kierunku 0 dla większej gładkości.',
      },
    },
  },
  'vwma': {
    pl: {
      shortDescription: 'SMA, w której każda świeca jest ważona swoim wolumenem obrotu.',
      fullDescription: {
        assumptions: 'Świece z wyższym wolumenem reprezentują bardziej znaczące poziomy cenowe i powinny mieć większą wagę.',
        whatItShows: 'Średnia cena ważona aktywnością – świece o wysokim wolumenie przyciągają linię bardziej niż te o niskim.',
        howItHelps: 'Ujawnia prawdziwą średnią cenę zaakceptowaną przez rynek; dywergencja od ceny sygnalizuje potencjalne odwrócenia.',
      },
    },
  },
  'mcginley': {
    pl: {
      shortDescription: 'Samodostosowująca się średnia Johna McGinleya, która automatycznie koryguje różnice prędkości w rynkach wzrostowych i spadkowych.',
      fullDescription: {
        assumptions: 'Rynki przyspieszają w różnych kierunkach; stały współczynnik wygładzania nie nadąża za ceną podczas szybkich ruchów.',
        whatItShows: 'Dynamiczna linia trendu, która przyspiesza na szybkich rynkach i zwalnia na wolnych.',
        howItHelps: 'Zmniejsza liczbę fałszywych sygnałów i lepiej śledzi cenę bez konieczności ciągłej ręcznej zmiany okresu.',
      },
    },
  },
  'macross': {
    pl: {
      shortDescription: 'Wyświetla szybką i wolną średnią kroczącą na tym samym panelu; podkreśla ich przecięcia (crossovers).',
      fullDescription: {
        assumptions: 'Krótkoterminowa MA przecinająca długoterminową MA od dołu sygnalizuje zmianę na bullish momentum, a odwrotnie na bearish.',
        whatItShows: 'Dwie konfigurowalne MA i wizualne znaczniki przy każdym bullish (złoty krzyż) i bearish (krzyż śmierci) crossover.',
        howItHelps: 'Jeden z najprostszych systemów trend-following do wejścia/wyjścia – łatwy do automatyzacji.',
      },
    },
  },
  'maribbon': {
    pl: {
      shortDescription: 'Wachlarz równomiernie rozłożonych średnich kroczących (ribbon), który wizualizuje siłę trendu poprzez szerokość ich rozrzutu.',
      fullDescription: {
        assumptions: 'Gdy wiele MA o różnych okresach porusza się razem, trend jest silny; gdy się rozchodzą, momentum się zmienia.',
        whatItShows: 'Ribbon linii MA – szeroki, uporządkowany ribbon sygnalizuje silny trend; ściśnięty ribbon sygnalizuje konsolidację.',
        howItHelps: 'Sprawia, że siła trendu i potencjalne odwrócenia są natychmiast widoczne; ściśnięcia ribbonu często poprzedzają wybicia.',
      },
    },
  },

  // ── OSCILLATORS ──────────────────────────────────────────────────────────────
  'rsi': {
    pl: {
      shortDescription: 'Momentum oscillator mierzący prędkość i skalę ostatnich zmian cen w skali 0-100.',
      fullDescription: {
        assumptions: 'Sustained upward closes wskazują na nadmierną siłę kupna, która ostatecznie ulegnie odwróceniu.',
        whatItShows: 'Odczyty powyżej 70 sugerują overbought; poniżej 30 sugerują oversold.',
        howItHelps: 'Identyfikuje potencjalne odwrócenia, divergences z ceną oraz zmiany momentum.',
      },
    },
  },
  'stochrsi': {
    pl: {
      shortDescription: 'RSI znormalizowane do własnego zakresu przy użyciu formuły Stochastic - bardziej czułe niż surowe RSI.',
      fullDescription: {
        assumptions: 'Zastosowanie formuły Stochastic do wartości RSI ujawnia ekstrema momentum, których samo RSI nie wychwytuje.',
        whatItShows: 'Wartości bliskie 1 oznaczają, że RSI znajduje się na szczycie swojego ostatniego zakresu (wysokie momentum); bliskie 0 to dno.',
        howItHelps: 'Generuje częstsze sygnały niż RSI; często wygładzane do linii %K i %D w celu uzyskania sygnałów crossover.',
      },
    },
  },
  'cci': {
    pl: {
      shortDescription: 'Mierzy, jak bardzo cena odchyliła się od swojej statystycznej średniej, skalowanej przez średnie odchylenie.',
      fullDescription: {
        assumptions: 'Ceny oscylują wokół średniej; ekstremalne odchylenia (±100) są nie do utrzymania.',
        whatItShows: 'Wartości powyżej +100 wskazują na silny uptrend lub overbought; poniżej -100 na downtrend lub oversold.',
        howItHelps: 'Identyfikuje inicjacje trendu przy breakoutach powyżej ±100 oraz potencjalne odwrócenia w okolicach ±200.',
      },
    },
  },
  'williams-r': {
    pl: {
      shortDescription: 'Momentum oscillator Larry\'ego Williamsa pokazujący, gdzie zamknięcie znajduje się w zakresie high-low dla n okresów.',
      fullDescription: {
        assumptions: 'W zdrowym uptrendzie ceny zamykają się blisko górnej granicy zakresu; w downtrendzie blisko dolnej.',
        whatItShows: 'Wartość od -100 (zamknięcie na dole okresu) do 0 (zamknięcie na górze); odczyty powyżej -20 są overbought, poniżej -80 są oversold.',
        howItHelps: 'Szybkie odwrócenia z ekstremalnych odczytów sygnalizują wyczerpanie momentum i potencjalne wejścia.',
      },
    },
  },
  'awesome-oscillator': {
    pl: {
      shortDescription: 'Histogram Billa Williamsa mierzący różnicę między SMA 5-okresową a SMA 34-okresową z midpointów świec.',
      fullDescription: {
        assumptions: 'Krótkoterminowe momentum powyżej długoterminowego potwierdza bullish energy i odwrotnie.',
        whatItShows: 'Histogram powyżej zera wskazuje na bullish momentum; poniżej zera na bearish. Zmiana koloru sygnalizuje przyspieszenie/spowolnienie.',
        howItHelps: 'Używany do setupów twin peaks i saucer; crossovers linii zerowej potwierdzają kierunek trendu.',
      },
    },
  },
  'chande-mo': {
    pl: {
      shortDescription: 'Oscillator Tushara Chande\'a mierzący net momentum jako stosunek sumy ruchów w górę do sumy wszystkich ruchów.',
      fullDescription: {
        assumptions: 'Bilans między zamknięciami w górę a w dół w danym okresie oddaje netto kierunkowe przekonanie rynku.',
        whatItShows: 'Wartości od -100 do +100; powyżej +50 to overbought, poniżej -50 to oversold.',
        howItHelps: 'Przydatny do wykrywania divergence i wyczerpania momentum; używany również do dynamicznej adaptacji innych wskaźników.',
      },
    },
  },
  'dpo': {
    pl: {
      shortDescription: 'Usuwa długoterminowy trend z ceny, aby wyizolować krótsze cykle.',
      fullDescription: {
        assumptions: 'Cena porusza się w cyklach; usunięcie dominującego trendu ujawnia ukrytą składową cykliczną.',
        whatItShows: 'Oscylacja powyżej/poniżej zera odpowiadająca cyklicznej części ceny; szczyty i dołki oznaczają zwroty cyklu.',
        howItHelps: 'Przydatny do mierzenia długości cyklu i timingowania wejść/wyjść w ramach znanego cyklu cenowego.',
      },
    },
  },
  'rvi': {
    pl: {
      shortDescription: 'Porównuje zakres close-to-open do zakresu high-to-low, wygładzony symetrycznie.',
      fullDescription: {
        assumptions: 'W uptrendzie ceny zamykają się wyżej niż otwierają; vigor (energia) ruchu jest uchwycona przez stosunek close-minus-open.',
        whatItShows: 'Wartości powyżej zera potwierdzają bullish vigor; crossover linii sygnałowej inicjuje wejścia.',
        howItHelps: 'Potwierdza kierunek trendu po breakoutach; divergence z ceną identyfikuje potencjalne odwrócenia.',
      },
    },
  },
  'tsi': {
    pl: {
      shortDescription: 'Podwójnie wygładzony wskaźnik momentum mierzący stosunek wygładzonej zmiany ceny do wygładzonej zmiany absolutnej.',
      fullDescription: {
        assumptions: 'Podwójne wygładzanie EMA zmian cen eliminuje szum, zachowując prawdziwy kierunek momentum.',
        whatItShows: 'Wartości wahają się od -100 do +100; wartości dodatnie wskazują bycze momentum, ujemne – niedźwiedzie.',
        howItHelps: 'Divergences z ceną to wysokiej jakości sygnały odwrócenia; zero-line crossovers potwierdzają zmiany trendu.',
      },
    },
  },
  'bb-percentb': {
    pl: {
      shortDescription: 'Pokazuje, gdzie cena znajduje się względem górnego i dolnego Bollinger Band jako procent 0-1.',
      fullDescription: {
        assumptions: 'Bollinger Bands definiują statystycznie wyznaczoną obwiednię cen; %B mierzy pozycję wewnątrz niej.',
        whatItShows: 'Wartość 1 oznacza, że cena jest przy górnym paśmie; 0 – przy dolnym; powyżej 1 lub poniżej 0 wskazuje breakout.',
        howItHelps: 'Identyfikuje warunki overbought/oversold i potwierdza breakouty Bollinger Band.',
      },
    },
  },
  'fisher-transform': {
    pl: {
      shortDescription: 'Konwertuje ceny na rozkład normalny Gaussa za pomocą odwrotnej transformacji tangensa hiperbolicznego.',
      fullDescription: {
        assumptions: 'Ekstrema cen stają się bardziej widoczne, gdy rozkład jest znormalizowany; punkty zwrotne pokrywają się z Fisher peaks.',
        whatItShows: 'Ostre szpice wskazują ekstrema cen; signal line crossovers oznaczają potencjalne punkty odwrócenia.',
        howItHelps: 'Wskazuje punkty zwrotne z większą precyzją niż RSI czy Stochastics; dobrze sprawdza się przy swing trades.',
      },
    },
  },
  'ultimate-oscillator': {
    pl: {
      shortDescription: 'Wielookresowy oscillator Larry\'ego Williamsa łączący krótko-, średnio- i długoterminowe średnie presji kupna.',
      fullDescription: {
        assumptions: 'Użycie trzech ram czasowych redukuje fałszywe sygnały z pojedynczego okresu; true range normalizuje zmienność.',
        whatItShows: 'Wartości powyżej 70 są overbought; poniżej 30 są oversold; divergence z ceną przez wszystkie trzy okresy jest najsilniejszym sygnałem.',
        howItHelps: 'Bardziej niezawodne sygnały divergence niż jednoookresowe oscillatory; unika whipsaws poprzez wymaganie potwierdzenia z wielu ram czasowych.',
      },
    },
  },
  'wave-trend': {
    pl: {
      shortDescription: 'Oscillator momentum oparty na wygładzonej EMA odchyłce typowej ceny, podobny do CCI, ale podwójnie wygładzony.',
      fullDescription: {
        assumptions: 'Oscylacje cen wokół wygładzonej linii bazowej mogą być znormalizowane w spójną falę z przewidywalnymi ekstremami.',
        whatItShows: 'Strefy overbought i oversold (domyślnie ±60/±53); crossover dwóch linii generuje sygnały kupna/sprzedaży.',
        howItHelps: 'Popularny dla confluence – gdy ekstrema WaveTrend pokrywają się z kluczowymi support/resistance, odwrócenia są wysokoprawdopodobne.',
      },
    },
  },
  'kdj': {
    pl: {
      shortDescription: 'Rozszerzenie Stochastic Oscillator, które dodaje linię J, aby podkreślić ekstrema momentum.',
      fullDescription: {
        assumptions: 'Linia J wzmacnia K i D, czyniąc warunki overbought/oversold bardziej wyrazistymi.',
        whatItShows: 'Trzy linie: %K (fast stochastic), %D (signal) oraz J (3K - 2D), która może przekraczać 0-100, aby oznaczyć ekstrema.',
        howItHelps: 'J crossovers powyżej 80 lub poniżej 20 to niezawodne krótkoterminowe sygnały odwrócenia, szczególnie na wykresach dziennych.',
      },
    },
  },
  'connors-rsi': {
    pl: {
      shortDescription: 'Złożony RSI Larry\'ego Connorsa łączący krótkoterminowy RSI, długość kolejnych świec oraz percentyl rank.',
      fullDescription: {
        assumptions: 'Trzy uzupełniające się sygnały momentum uśrednione razem są bardziej niezawodne niż pojedynczy sygnał.',
        whatItShows: 'Złożony wynik 0-100; wartości poniżej 10 są silnie oversold, powyżej 90 są silnie overbought.',
        howItHelps: 'Zaprojektowany specjalnie dla krótkoterminowych strategii mean-reversion na akcjach; bardzo użyteczny przy ekstremach.',
      },
    },
  },
  'smi-ergodic': {
    pl: {
      shortDescription: 'Podwójnie wygładzony oscillator momentum oparty na zmianie ceny względem zmiany absolutnej, wywodzący się z TSI.',
      fullDescription: {
        assumptions: 'Podwójne wygładzanie EMA tworzy ergodyczny (mean-reverting) oscillator, który jest bardzo czuły na zmiany momentum.',
        whatItShows: 'Oscyluje wokół zera; signal line crossovers i przecięcia linii zero generują sygnały transakcyjne.',
        howItHelps: 'Bardziej responsywny niż TSI dla krótkoterminowego tradingu; histogram natychmiast uwidacznia kierunek i siłę momentum.',
      },
    },
  },
  'stochastic': {
    pl: {
      shortDescription: 'Wskaźnik momentum George\'a Lane\'a porównujący zamknięcie do zakresu high-low w ciągu n okresów.',
      fullDescription: {
        assumptions: 'Podczas trendów wzrostowych ceny zamykają się blisko górnej granicy zakresu; podczas spadkowych – blisko dolnej.',
        whatItShows: 'Linia %K (0-100) pokazująca względną pozycję zamknięcia; linia sygnałowa %D – powyżej 80 overbought, poniżej 20 oversold.',
        howItHelps: '%K/%D crossovers w strefach ekstremalnych to klasyczne wejścia odwrócenia; divergence potwierdza słabnięcie momentum.',
      },
    },
  },
  'relative-volatility-index': {
    pl: {
      shortDescription: 'RVI Donalda Dorseya – jak RSI, ale zastosowane do odchylenia standardowego zamiast zmiany ceny.',
      fullDescription: {
        assumptions: 'Kierunkowa zmienność (odchylenie standardowe w górę vs. w dół) lepiej oddaje jakość trendu niż sama cena.',
        whatItShows: 'Wartości powyżej 50 wskazują, że zmienność jest przeważnie rosnąca (bycza energia); poniżej 50 – niedźwiedzia.',
        howItHelps: 'Używany jako filtr potwierdzający – przyjmuj tylko sygnały kupna z innych wskaźników, gdy RVI > 50.',
      },
    },
  },

  // ── MOMENTUM ──────────────────────────────────────────────────────────────────
  'macd': {
    pl: {
      shortDescription: 'Klasyczny wskaźnik MACD (Moving Average Convergence/Divergence) – momentum poprzez spread dwóch EMA.',
      fullDescription: {
        assumptions: 'Różnica między szybką a wolną EMA wychwytuje kierunkowe momentum trendu.',
        whatItShows: 'Linia MACD, linia sygnalna (signal line) i histogram – dodatni histogram oznacza rosnące momentum bullish.',
        howItHelps: 'Przecięcia linii sygnalnej (crossover), przecięcia linii zerowej oraz dywergencje (divergence) to trzy główne sygnały transakcyjne.',
      },
    },
  },
  'momentum': {
    pl: {
      shortDescription: 'Najprostszy wskaźnik momentum – surowa zmiana ceny w ciągu n świec.',
      fullDescription: {
        assumptions: 'Bezwzględna zmiana ceny w ustalonym okresie jest najczystszą miarą kierunkowej prędkości.',
        whatItShows: 'Dodatnie wartości oznaczają cenę wyższą niż n okresów temu (momentum bullish); ujemne – cenę niższą.',
        howItHelps: 'Przecięcia linii zerowej sygnalizują zmiany trendu; nachylenie wskaźnika pokazuje przyspieszenie/spowolnienie.',
      },
    },
  },
  'roc': {
    pl: {
      shortDescription: 'Procentowa zmiana ceny w ciągu n okresów – oscillator momentum wyrażony jako procent.',
      fullDescription: {
        assumptions: 'Zmiana procentowa normalizuje momentum dla różnych poziomów cen, umożliwiając porównywanie aktywów.',
        whatItShows: 'Dodatnie wartości potwierdzają momentum wzrostowe; przecięcia linii zerowej wskazują zmiany kierunku trendu.',
        howItHelps: 'Dywergencje (divergence) z ceną są sygnałem wyprzedzającym odwrócenia; skrajne odczyty wskazują na wykupienie/wyprzedanie.',
      },
    },
  },
  'bop': {
    pl: {
      shortDescription: 'Mierzy siłę kupujących vs. sprzedających poprzez porównanie zamknięcia-otwarcia do całkowitego zakresu.',
      fullDescription: {
        assumptions: 'Położenie zamknięcia w pełnym zakresie ujawnia, czy byki czy niedźwiedzie dominowały na świecy.',
        whatItShows: 'Wartości bliskie +1 wskazują na dominację byków (zamknięcie blisko high); bliskie -1 na dominację niedźwiedzi (zamknięcie blisko low).',
        howItHelps: 'Wygładzony BOP zmierzający w kierunku zera podczas trendu wzrostowego ostrzega o słabnącej presji kupujących.',
      },
    },
  },
  'bull-bear-power': {
    pl: {
      shortDescription: 'Dwuskładnikowy wskaźnik Alexandra Eldera mierzący siłę byków (high względem EMA) i niedźwiedzi (low względem EMA).',
      fullDescription: {
        assumptions: 'Byki wypychają cenę powyżej EMA, a niedźwiedzie poniżej EMA; odchylenie mierzy ich względną siłę.',
        whatItShows: 'Bull Power = High - EMA (dodatnie = byki kontrolują szczyty); Bear Power = Low - EMA (ujemne = niedźwiedzie kontrolują dołki).',
        howItHelps: 'Używany z filtrem trendu: wchodź długo, gdy trend jest wzrostowy, a Bear Power jest ujemne, ale rośnie (niedźwiedzie tracą siłę).',
      },
    },
  },
  'elder-force-index': {
    pl: {
      shortDescription: 'Wskaźnik Alexandra Eldera łączący kierunek zmiany ceny z wolumenem, aby zmierzyć siłę ruchów rynkowych.',
      fullDescription: {
        assumptions: 'Ruch cen poparty dużym wolumenem odzwierciedla prawdziwe przekonanie; ten sam ruch przy niskim wolumenie nie.',
        whatItShows: 'Dodatnie wartości wskazują siłę wzrostową; ujemne – siłę spadkową. Wielkość odzwierciedla przekonanie.',
        howItHelps: 'Wygładzony 13-okresowy EFI potwierdza trend; 2-okresowy EFI identyfikuje wejścia korekcyjne (pullback entries) w ramach trendu.',
      },
    },
  },
  'price-oscillator': {
    pl: {
      shortDescription: 'Procentowa różnica między dwiema EMA – znormalizowana wersja MACD.',
      fullDescription: {
        assumptions: 'Wyrażenie różnicy EMA jako procentu umożliwia porównywanie aktywów o różnych poziomach cen.',
        whatItShows: 'Ta sama struktura co MACD, ale w procentach – linia PPO, linia sygnalna (signal line) i histogram.',
        howItHelps: 'Przydatny do porównywania momentum między aktywami o różnych cenach; przecięcia linii sygnalnej i dywergencje (divergence) są głównymi sygnałami.',
      },
    },
  },
  'coppock-curve': {
    pl: {
      shortDescription: 'Długoterminowy oscylator momentum Edwina Coppocka zaprojektowany do identyfikacji głównych dołków giełdowych.',
      fullDescription: {
        assumptions: 'Suma dwóch różnych okresów ROC wychwytuje cykl żałoby (grief cycle) po dołku bessy.',
        whatItShows: 'Wygładzony WMA oscylator; przecięcie linii zerowej od dołu sygnalizuje główne wejścia w rynek byka (bull market).',
        howItHelps: 'Najlepiej stosować na wykresach miesięcznych dla makro zmian trendu – bardzo niezawodny do identyfikacji początku długoterminowych rynków byka.',
      },
    },
  },
  'trix': {
    pl: {
      shortDescription: 'Procentowa zmiana potrójnie wygładzonej EMA – filtruje cykle krótsze niż okres.',
      fullDescription: {
        assumptions: 'Potrójne wygładzanie usuwa szum krótkoterminowych cykli, pozostawiając tylko długoterminowe zmiany momentum.',
        whatItShows: 'Wartości powyżej zera wskazują na długoterminowe momentum wzrostowe; poniżej – spadkowe. Przecięcia linii sygnalnej generują sygnały wejścia.',
        howItHelps: 'Minimalna liczba fałszywych sygnałów w porównaniu z MACD; szczególnie przydatny do identyfikacji wczesnych etapów nowych trendów.',
      },
    },
  },
  'kst': {
    pl: {
      shortDescription: 'Wygładzony oscylator ROC Martina Pringa w czterech ramach czasowych, ważonych w kierunku dłuższych cykli.',
      fullDescription: {
        assumptions: 'Cena jest napędzana przez wiele nakładających się cykli; połączenie czterech okresów ROC wygładza szum i wychwytuje dominujące momentum.',
        whatItShows: 'Złożona linia momentum z sygnałem; przecięcia linii zerowej potwierdzają główne zmiany trendu.',
        howItHelps: 'Szeroko stosowany do identyfikacji długoterminowych trendów na wykresach tygodniowych/miesięcznych; unika fałszywych sygnałów typowych dla pojedynczego okresu ROC.',
      },
    },
  },
  'squeeze-momentum': {
    pl: {
      shortDescription: 'Łączy Bollinger Bands, Keltner Channels i momentum – wykrywa ustawienia do wybuchowego breakoutu.',
      fullDescription: {
        assumptions: 'Kiedy Bollinger Bands kompresują się wewnątrz Keltner Channels (squeeze), gromadzi się energia do wybuchowego ruchu.',
        whatItShows: 'Histogram momentum wskazujący kierunek zbliżającego się breakoutu; kropki na linii zera sygnalizują aktywny squeeze.',
        howItHelps: 'Stan squeeze identyfikuje ustawienia o niskiej zmienności; kolor histogramu mówi, w którym kierunku handlować breakout.',
      },
    },
  },
  'impulse-macd': {
    pl: {
      shortDescription: 'Wariant MACD obliczany na źródle HLC3 z innymi okresami EMA niż standardowe.',
      fullDescription: {
        assumptions: 'Użycie typowej ceny (HLC3) i niestandardowych długości EMA wychwytuje inny i często czystszy sygnał momentum.',
        whatItShows: 'Histogram MACD i linia sygnałowa; kolorowanie słupków wskazuje kierunek i przyspieszenie momentum.',
        howItHelps: 'Niestandardowe okresy redukują szum pochodzący z pojedynczych cen zamknięcia; kodowanie kolorem natychmiast ujawnia kierunek trendu.',
      },
    },
  },
  'macd4c': {
    pl: {
      shortDescription: 'Standardowy MACD z histogramem kodowanym kolorem na cztery stany w zależności od kierunku i przyspieszenia.',
      fullDescription: {
        assumptions: 'Jakość momentum jest lepiej zrozumiała, gdy rosnące i opadające histogramy są wizualnie rozróżniane.',
        whatItShows: 'Ta sama struktura MACD/Signal jak w klasycznym MACD, ale słupki histogramu są kolorowane: silny bullish, słaby bullish, silny bearish, słaby bearish.',
        howItHelps: 'Przejścia kolorów z silnego bullish na słaby bullish sygnalizują wczesne zwolnienie, dając wcześniejsze ostrzeżenia o wyjściu niż standardowy histogram.',
      },
    },
  },

  // ── TREND ──────────────────────────────────────────────────────────────────────
  'adx': {
    pl: {
      shortDescription: 'Wilder\'s Average Directional Index (ADX) określający siłę trendu w skali 0-100 bez uwzględniania kierunku.',
      fullDescription: {
        assumptions: 'Wskaźniki ruchu kierunkowego, wygładzone i znormalizowane, pokazują, jak silnie cena trenduje niezależnie od kierunku.',
        whatItShows: 'ADX powyżej 25 wskazuje na silny trend; poniżej 20 wskazuje na słaby lub boczny rynek. +DI i -DI pokazują kierunek trendu.',
        howItHelps: 'Filtr dla innych systemów – stosuj sygnały trendu tylko gdy ADX > 25; +DI/-DI crossover sygnalizują zmiany kierunku trendu.',
      },
    },
  },
  'dmi': {
    pl: {
      shortDescription: 'Indeks ruchu kierunkowego Wildera (DMI) pokazujący równowagę sił kierunkowych między bykami a niedźwiedziami.',
      fullDescription: {
        assumptions: '+DI wychwytuje ruch wzrostowy, a -DI ruch spadkowy; razem ujawniają nachylenie trendu (trend bias).',
        whatItShows: '+DI powyżej -DI = trend bullish; -DI powyżej +DI = trend bearish; rozpiętość wskazuje siłę trendu.',
        howItHelps: '+DI/-DI crossover to bezpośrednie sygnały kupna/sprzedaży; stosowane razem z ADX do filtrowania silnych okresów trendu.',
      },
    },
  },
  'ichimoku': {
    pl: {
      shortDescription: 'Kompletny system trendów Goichiego Hosody wykorzystujący pięć linii i cloud jako wsparcie/opór.',
      fullDescription: {
        assumptions: 'Punkty środkowe z wielu ram czasowych rzutowane do przodu tworzą wizualny cloud podsumowujący strukturę trendu.',
        whatItShows: 'Linie Tenkan (conversion line), Kijun (base line), Senkou A/B (future cloud) i Chikou (lagging span).',
        howItHelps: 'Cena powyżej cloud = trend bullish; wewnątrz cloud = boczny; poniżej cloud = trend bearish. TK crossover to sygnały wejścia.',
      },
    },
  },
  'parabolic-sar': {
    pl: {
      shortDescription: 'System trailing stop Wildera, który przyspiesza w kierunku ceny w trakcie trendu i odwraca się, gdy cena zmienia kierunek.',
      fullDescription: {
        assumptions: 'Trendy przyspieszają z czasem; stop powinien się zaciskać w miarę dojrzewania trendu.',
        whatItShows: 'Kropki powyżej ceny = downtrend; kropki poniżej ceny = uptrend. Kropka JEST poziomem trailing stop.',
        howItHelps: 'Zapewnia automatyczne ustawienie trailing stop; przełącza się na przeciwną stronę, gdy cena przekroczy stop.',
      },
    },
  },
  'supertrend': {
    pl: {
      shortDescription: 'Oparty na ATR trailing stop/linia trendu, która przełącza się między górnym i dolnym pasmem w momencie przebicia ceny.',
      fullDescription: {
        assumptions: 'ATR skaluje szerokość pasma do bieżącej zmienności, co czyni wskaźnik adaptacyjnym w różnych warunkach rynkowych.',
        whatItShows: 'Pojedyncza linia poniżej ceny w trendzie wzrostowym (zielona) i powyżej ceny w trendzie spadkowym (czerwona).',
        howItHelps: 'Czysty, wizualny system podążania za trendem; przecięcia dają jasne sygnały kupna/sprzedaży z wbudowanym ustawieniem stop.',
      },
    },
  },
  'aroon': {
    pl: {
      shortDescription: 'Mierzy, jak dawno temu wystąpił najwyższy high i najniższy low w oknie n-okresowym.',
      fullDescription: {
        assumptions: 'Nowy high blisko końca okresu wskazuje na uptrend; nowy low wskazuje na downtrend.',
        whatItShows: 'Linie Aroon Up i Down (0-100) plus oscylator. Aroon Up powyżej 70 potwierdza trend bullish.',
        howItHelps: 'Identyfikacja trendu i ocena jego siły; przecięcia linii Up i Down sygnalizują zmiany trendu.',
      },
    },
  },
  'bb-trend': {
    pl: {
      shortDescription: 'Identyfikuje kierunek i siłę trendu za pomocą względnej pozycji i szerokości Bollinger Bands.',
      fullDescription: {
        assumptions: 'Cena uporczywie przylegająca do górnego pasma wskazuje na silny uptrend; dolne pasmo sygnalizuje downtrend.',
        whatItShows: 'Sygnał trendu kodowany kolorem, wyprowadzony z relacji między ceną a Bollinger Bands.',
        howItHelps: 'Proste wizualne potwierdzenie trendu; używane jako filtr do przyjmowania tylko sygnałów zgodnych z dominującym kierunkiem pasma.',
      },
    },
  },
  'choppiness': {
    pl: {
      shortDescription: 'Mierzy, czy rynek trenduje (niskie wartości) czy jest boczny/zakłócony (wysokie wartości) na znormalizowanej skali.',
      fullDescription: {
        assumptions: 'W rynku trendującym suma pasków ATR jest bliska całkowitemu zasięgowi; w rynku bocznym znacznie go przekracza.',
        whatItShows: 'Wartości bliskie 100 wskazują maksymalną zmienność boczną; wartości bliskie 38,2 (dla n=14) wskazują silny trend.',
        howItHelps: 'Używaj jako filtra reżimu rynkowego – przełącz się z trend-following na mean-reversion strategies gdy CI przekracza 61.8.',
      },
    },
  },
  'mass-index': {
    pl: {
      shortDescription: 'Wskaźnik odwrócenia Donalda Dorseya, który wykrywa zwężanie i rozszerzanie zakresu high-low.',
      fullDescription: {
        assumptions: 'Ekstremalne rozszerzenie zakresu, a następnie zwężenie (reversal bulge) sygnalizuje odwrócenie trendu.',
        whatItShows: 'Skumulowany stosunek 9-okresowej EMA zakresu do 9-okresowej EMA tej EMA; reversal bulge, gdy MI przekracza 27, a następnie spada poniżej 26,5.',
        howItHelps: 'Identyfikuje potencjalne punkty zwrotne niezależnie od kierunku; potwierdź za pomocą innego wskaźnika trendu po sygnale bulge.',
      },
    },
  },
  'vortex': {
    pl: {
      shortDescription: 'Wskaźnik Etienne\'a Botesa i Douglasa Siepmana uchwycający dwa rotacyjne ruchy ceny.',
      fullDescription: {
        assumptions: 'Odległość od bieżącego high do poprzedniego low (vortex w górę) i bieżącego low do poprzedniego high (vortex w dół) ujawniają energię trendu.',
        whatItShows: 'Linie VI+ i VI-: gdy VI+ przecina powyżej VI-, zaczyna się nowy uptrend; odwrotna sytuacja sygnalizuje downtrend.',
        howItHelps: 'Sygnały inicjacji trendu z wbudowanym wygładzaniem przez sumę n-okresową; dobrze działa na wykresach dziennych.',
      },
    },
  },
  'williams-alligator': {
    pl: {
      shortDescription: 'Trzy wygładzone średnie kroczące Billa Williamsa przesunięte do przodu – szczęka, zęby i usta.',
      fullDescription: {
        assumptions: 'Rynki spędzają większość czasu w nietrędowych fazach uśpienia; Aligator budzi się i je podczas trendów.',
        whatItShows: 'Trzy przesunięte linie SMMA – gdy się przeplatają, aligator śpi (konsolidacja); gdy się rozchodzą, je (trend).',
        howItHelps: 'Unikaj handlu w konsolidacji; wchodź, gdy linie się rozchodzą i cena wybija w jednym kierunku.',
      },
    },
  },
  'zig-zag': {
    pl: {
      shortDescription: 'Łączy istotne szczyty i dołki wahań, filtrując ruchy mniejsze niż próg procentowy.',
      fullDescription: {
        assumptions: 'Tylko wahania cen większe niż próg reprezentują znaczącą strukturę rynkową.',
        whatItShows: 'Uproszczona ścieżka cenowa pokazująca tylko istotne szczyty i dołki, eliminując drobny szum.',
        howItHelps: 'Identyfikuje formacje wykresów (głowa-ramiona, podwójne szczyty/dołki), poziomy Fibonacciego i liczby fal.',
      },
    },
  },
  'chande-kroll-stop': {
    pl: {
      shortDescription: 'Stop oparty na ATR z dwiema liniami stopów wywodzonymi z najwyższych/najniższych wielokrotności ATR.',
      fullDescription: {
        assumptions: 'Stopy oparte na ATR dostosowują się do zmienności; zastosowanie drugiej wielokrotności ATR daje bardziej solidny stop.',
        whatItShows: 'Dwie linie stopów – gdy cena jest powyżej obu, trend jest wzrostowy (long); poniżej obu, trend jest spadkowy (short).',
        howItHelps: 'Bardziej stabilny niż pojedyncze stopy ATR; redukuje przedwczesne stop-outy przy zachowaniu dyscypliny podążania za trendem.',
      },
    },
  },
  'williams-fractals': {
    pl: {
      shortDescription: 'Pięcioświecowe markery odwróceń Billa Williamsa identyfikujące lokalne szczyty i dołki.',
      fullDescription: {
        assumptions: 'Lokalne ekstrema cenowe wyższe/niższe od otaczających świec reprezentują istotne punkty zwrotne struktury.',
        whatItShows: 'Strzałki w górę przy fractal highs (high świecy jest najwyższy z n otaczających świec); strzałki w dół przy fractal lows.',
        howItHelps: 'Używane do identyfikacji poziomów wsparcia/oporu i jako filtry wejścia; przełamanie fraktala w kierunku trendu potwierdza kontynuację.',
      },
    },
  },
  'coral-trend': {
    pl: {
      shortDescription: 'Niestandardowe wygładzanie oparte na EMA ze dynamicznie skalowanym współczynnikiem, tworzące ultra-gładką linię trendu.',
      fullDescription: {
        assumptions: 'Dynamicznie skalowany współczynnik wygładzania dostosowuje się do zmienności, dając czystszą linię trendu.',
        whatItShows: 'Pojedyncza linia zmieniająca kolor – zielona powyżej ceny = uptrend; czerwona poniżej ceny = downtrend.',
        howItHelps: 'Prosty wizualny filtr trendu; używany jako sygnał tła (colour-coded) do zawierania transakcji tylko w kierunku trendu.',
      },
    },
  },
  'chandelier-exit': {
    pl: {
      shortDescription: 'Oparty na ATR chandelier trailing stop z oddzielnymi liniami stop dla pozycji long i short.',
      fullDescription: {
        assumptions: 'Zawieszenie stopu od najwyższego high (long) lub najniższego low (short) jak żyrandol tworzy naturalne wyjście śledzące.',
        whatItShows: 'Long stop = highest(High, n) - k*ATR; short stop = lowest(Low, n) + k*ATR.',
        howItHelps: 'Utrzymuje pozycje w trendach podczas korekt i wychodzi przy prawdziwych odwróceniach; powszechnie używany jako obiektywna reguła wyjścia.',
      },
    },
  },
  'donchian-trend-ribbon': {
    pl: {
      shortDescription: 'Wachlarz środkowych linii kanałów Donchiana w wielu okresach – szerokość wstążki wskazuje siłę trendu.',
      fullDescription: {
        assumptions: 'Gdy wiele środkowych linii Donchiana wyrównuje się i rozpina, istnieje silny trend; gdy są skompresowane, rynek konsoliduje się.',
        whatItShows: 'Wiele środkowych linii kanałów Donchiana; wyrównane i rozpinające się linie potwierdzają trend; nachodzące na siebie linie sygnalizują konsolidację.',
        howItHelps: 'Wizualny filtr jakości trendu; handluj zgodnie z wstążką, nie przeciw niej gdy linie są dobrze ułożone.',
      },
    },
  },
  'twap': {
    pl: {
      shortDescription: 'Średnia arytmetyczna wszystkich cen świec od początku sesji – benchmark egzekucji dla instytucji.',
      fullDescription: {
        assumptions: 'Algorytmy egzekucji instytucjonalnej używają TWAP jako benchmarku; odchylenia od TWAP sygnalizują potencjalny powrót.',
        whatItShows: 'Gładka średnia całkowitego poziomu cenowego świecy, mniej podatna na manipulacje ceną zamknięcia.',
        howItHelps: 'Używany jako benchmark wartości godziwej dla egzekucji; cena daleko powyżej TWAP może ulec rewersji, daleko poniżej może się odbudować.',
      },
    },
  },

  // ── VOLATILITY ────────────────────────────────────────────────────────────────
  'atr': {
    pl: {
      shortDescription: 'Miara zmienności rynku J. Wellesa Wildera oparta na rzeczywistym zasięgu każdego słupka.',
      fullDescription: {
        assumptions: 'Luki zmienności i ruchy overnight powinny być uwzględnione w każdej prawdziwej mierze zasięgu słupka.',
        whatItShows: 'Średni rzeczywisty zasięg ceny z n słupków – wyższy ATR oznacza większą zmienność.',
        howItHelps: 'Stosowany do ustawiania stopów (np. trailing stop 2x ATR), określania wielkości pozycji i identyfikacji breakoutów zmienności.',
      },
    },
  },
  'adr': {
    pl: {
      shortDescription: 'Średni zasięg (high minus low) z n słupków – prosty miernik zmienności bez korekty na luki.',
      fullDescription: {
        assumptions: 'Zasięg intraday high-low jest najbardziej intuicyjną miarą typowego ruchu ceny.',
        whatItShows: 'Średni zasięg słupka w jednostkach ceny; przydatny do ustalania realistycznych celów intraday.',
        howItHelps: 'Day traderzy używają ADR do szacowania dziennych celów zysku i odległości stopów; wysoki ADR = większe możliwości i ryzyko.',
      },
    },
  },
  'standard-deviation': {
    pl: {
      shortDescription: 'Statystyczne odchylenie standardowe cen zamknięcia z n okresów – bezpośrednia miara rozproszenia cen.',
      fullDescription: {
        assumptions: 'Im bardziej ceny odbiegają od średniej, tym wyższa niepewność i ryzyko na rynku.',
        whatItShows: 'Rosnące wartości oznaczają rosnącą zmienność; spadające wartości oznaczają konsolidację.',
        howItHelps: 'Stosowane do określania wielkości pozycji (risk parity), ustawiania odległości stopów i identyfikacji warunków breakoutu.',
      },
    },
  },
  'historical-volatility': {
    pl: {
      shortDescription: 'Annualizowane odchylenie standardowe logarytmicznych stóp zwrotu – standardowa finansowa definicja zrealizowanej volatility.',
      fullDescription: {
        assumptions: 'Logarytmiczne stopy zwrotu mają w przybliżeniu rozkład normalny, co czyni ich odchylenie standardowe użyteczną miarą ryzyka.',
        whatItShows: 'Annualizowana procentowa volatility – bezpośrednio porównywalna z implied volatility z opcji.',
        howItHelps: 'Traderzy opcji porównują HV do IV, aby ocenić, czy opcje są tanie czy drogie; traderzy trendowi używają gwałtownych wzrostów HV jako sygnałów odwrócenia.',
      },
    },
  },
  'bb-bandwidth': {
    pl: {
      shortDescription: 'Szerokość Bollinger Bands jako procent środkowego pasma – czysty wskaźnik volatility/squeeze.',
      fullDescription: {
        assumptions: 'Okresy bardzo niskiej szerokości pasma (Bollinger squeeze) poprzedzają gwałtowne ekspansje volatility.',
        whatItShows: 'Niska szerokość pasma = niska volatility / squeeze; wysoka szerokość pasma = wysoka volatility / rozszerzenie trendu.',
        howItHelps: 'Wieloletnie minima szerokości pasma sygnalizują squeeze setups o wysokim prawdopodobieństwie; gwałtowne wzrosty szerokości pasma potwierdzają wejścia breakout.',
      },
    },
  },
  'bollinger-bars': {
    pl: {
      shortDescription: 'Koloruje każdy słupek cenowy na podstawie jego pozycji względem Bollinger Bands, aby pokazać kontekst volatility na pierwszy rzut oka.',
      fullDescription: {
        assumptions: 'Kolor słupka odzwierciedlający pozycję względem BB jest bardziej natychmiastowym sygnałem wizualnym niż rysowanie samych pasm.',
        whatItShows: 'Słupki poza pasmami są kodowane kolorem dla natychmiastowej identyfikacji overbought/oversold; słupki wewnątrz pokazują konsolidację.',
        howItHelps: 'Szybki wizualny przegląd historycznych ekstremów volatility bez zaśmiecania wykresu dodatkowymi liniami.',
      },
    },
  },

  // ── CHANNELS & BANDS ──────────────────────────────────────────────────────────
  'bollinger-bands': {
    pl: {
      shortDescription: 'Koperta cenowa zbudowana z 20-okresowej SMA ± 2 odchylenia standardowe – rozszerza się podczas wzrostu volatility, zwęża w spokoju.',
      fullDescription: {
        assumptions: 'Cena ma tendencję do pozostawania w obrębie pasm przez około 95% czasu, a volatility ma charakter mean-reverting.',
        whatItShows: 'Trzy linie: centralna SMA oraz górne/dolne pasmo oddalone o k odchyleń standardowych. Szerokość pasma odzwierciedla bieżącą volatility.',
        howItHelps: 'Traderzy szukają dotknięć górnego/dolnego pasma oraz Bollinger Squeezes (ciasne pasma) jako setupów breakout.',
      },
    },
  },
  'keltner-channels': {
    pl: {
      shortDescription: 'Kanał volatility wykorzystujący linię środkową EMA ± wielokrotności ATR – gładszy niż Bollinger Bands.',
      fullDescription: {
        assumptions: 'Average True Range (ATR) jest lepszą miarą bieżącej volatility niż odchylenie standardowe, ponieważ uwzględnia luki (gaps).',
        whatItShows: 'Trzy linie: środkowe pasmo EMA otoczone górnym i dolnym pasmem oddzielonymi wielokrotnością ATR.',
        howItHelps: 'Breakout powyżej górnego pasma sygnalizuje silny momentum wzrostowy; w połączeniu z BB wzór Squeeze przewiduje breakouts.',
      },
    },
  },
  'donchian-channels': {
    pl: {
      shortDescription: 'Najwyższe maksimum i najniższe minimum z n słupków – oryginalny kanał podążający za trendem Richarda Donchiana.',
      fullDescription: {
        assumptions: 'Breakout poza ostatnimi ekstremami cenowymi wskazuje na autentyczne momentum, a nie szum.',
        whatItShows: 'Trzy linie: najwyższe maksimum (górne pasmo), najniższe minimum (dolne pasmo) oraz ich punkt środkowy w ruchomym oknie n słupków.',
        howItHelps: 'Zamknięcie powyżej górnego pasma to sygnał kupna breakout (klasyczne wejście Turtle Trading); wąskie kanały ostrzegają przed ruchami o wysokiej volatility.',
      },
    },
  },
  'envelope': {
    pl: {
      shortDescription: 'Dwa pasma wykreślone o stały procent powyżej i poniżej średniej ruchomej – prosty kanał overbought/oversold.',
      fullDescription: {
        assumptions: 'Cena odchyla się od swojej średniej ruchomej o stosunkowo stały procent; skrajne odchylenia zwykle się cofają.',
        whatItShows: 'Górne i dolne pasmo umieszczone o stały procent (d%) powyżej i poniżej wybranej średniej ruchomej.',
        howItHelps: 'Gdy cena dociera do górnej koperty, może być wyciągnięta w górę (potencjalna pozycja short); dolna koperta w dół (potencjalna pozycja long).',
      },
    },
  },
  'median': {
    pl: {
      shortDescription: 'Cena środkowa (mediana high, low, close) z górnym i dolnym pasmem opartym na ATR.',
      fullDescription: {
        assumptions: 'Cena mediany lepiej reprezentuje wartość godziwą słupka niż samo close; ATR powinno określać szerokość pasma.',
        whatItShows: 'Centralna linia śledząca EMA ceny mediany (HLC3), otoczona górnym i dolnym pasmem ustawionymi na wielokrotność ATR.',
        howItHelps: 'Działa jako dynamiczny kanał wsparcia/oporu; traderzy kupują przy dolnym pasmie i sprzedają przy górnym w rynkach bocznych.',
      },
    },
  },

  // ── VOLUME ─────────────────────────────────────────────────────────────────────
  'obv': {
    pl: {
      shortDescription: 'Skumulowana suma wolumenu – dodaje wolumen w dniach wzrostowych, odejmuje w dniach spadkowych – aby wykryć presję kupna i sprzedaży.',
      fullDescription: {
        assumptions: 'Wolumen poprzedza cenę; rosnący OBV bez rosnącej ceny ostrzega o akumulacji.',
        whatItShows: 'Bieżąca suma, która zwiększa się o wolumen słupka, gdy zamknięcie jest wyższe niż poprzednie zamknięcie, i zmniejsza się, gdy jest niższe.',
        howItHelps: 'Bycza dywergencja (OBV rośnie, cena spada) ostrzega o nadchodzącym rajdzie cenowym. Niedźwiedzia dywergencja ostrzega o nadchodzącym spadku.',
      },
    },
  },
  'mfi': {
    pl: {
      shortDescription: 'Ważony wolumenem RSI mierzący presję kupna i sprzedaży – wartości powyżej 80 lub poniżej 20 sygnalizują ekstrema.',
      fullDescription: {
        assumptions: 'Cena i wolumen razem lepiej odzwierciedlają nastroje rynkowe niż sama cena.',
        whatItShows: 'Oscylator w zakresie 0-100 obliczający stosunek dodatniego przepływu pieniędzy do całkowitego przepływu w ciągu n okresów, ważony wolumenem.',
        howItHelps: 'Odczyt powyżej 80 sugeruje wykupienie (overbought); poniżej 20 sugeruje wyprzedanie (oversold). Dywergencje są sygnałami odwrócenia o wysokim prawdopodobieństwie.',
      },
    },
  },
  'pvt': {
    pl: {
      shortDescription: 'Skumulowana suma procentowej zmiany ceny pomnożonej przez wolumen – podobny do OBV, ale proporcjonalny do wielkości ruchu.',
      fullDescription: {
        assumptions: 'Znaczenie słupka wolumenu powinno być proporcjonalne do wielkości ruchu ceny, a nie tylko jego kierunku.',
        whatItShows: 'Bieżąca linia skumulowana, gdzie każdy słupek wnosi wolumen pomnożony przez procentową zmianę ceny zamknięcia.',
        howItHelps: 'Rosnący PVT potwierdza uptrend; malejący PVT potwierdza downtrend. Dywergencje ostrzegają o słabnącym momentum.',
      },
    },
  },
  'volume-oscillator': {
    pl: {
      shortDescription: 'Różnica między szybką a wolną EMA wolumenu – pokazuje, czy wolumen rośnie czy maleje.',
      fullDescription: {
        assumptions: 'Ruchy trendowe są podtrzymywane, gdy wolumen rośnie względem swojej ostatniej średniej, i zatrzymują się, gdy maleje.',
        whatItShows: 'Różnica między krótko- a długookresową EMA wolumenu. Wartości dodatnie = bieżący wolumen powyżej długoterminowej średniej.',
        howItHelps: 'Rosnąca cena przy dodatnim Volume Oscillator potwierdza trend. Dywergencje są wczesnymi sygnałami odwrócenia.',
      },
    },
  },
  'chaikin-mf': {
    pl: {
      shortDescription: 'Krocząca suma wolumenowo-ważonej pozycji zamknięcia z n słupków – wartości dodatnie wskazują akumulację.',
      fullDescription: {
        assumptions: 'Miejsce, w którym cena zamknięcia wypada w zakresie słupka, ujawnia presję kupna lub sprzedaży.',
        whatItShows: 'Money Flow Multiplier mierzy, gdzie cena zamknęła się w zakresie słupka (od -1 do +1), skalowany wolumenem.',
        howItHelps: 'Wartości powyżej zera wskazują na netto presję kupna (akumulację); poniżej zera na dystrybucję. CMF powyżej +0,25 jest bycze.',
      },
    },
  },
  'chaikin-oscillator': {
    pl: {
      shortDescription: 'MACD zastosowany do linii Akumulacji/Dystrybucji – mierzy momentum przepływu pieniędzy.',
      fullDescription: {
        assumptions: 'Momentum w linii Akumulacji/Dystrybucji wyprzedza momentum cenowe.',
        whatItShows: 'Różnica między szybką a wolną EMA linii A/D. Wartości dodatnie = akumulacja przyspiesza.',
        howItHelps: 'Chaikin Oscillator przekraczający zero od dołu to sygnał bycze; przekraczający od góry – niedźwiedzie. Dywergencje dają wczesne ostrzeżenia o odwróceniu.',
      },
    },
  },
  'ease-of-movement': {
    pl: {
      shortDescription: 'Mierzy, jak łatwo cena porusza się w stosunku do wolumenu – wysokie wartości oznaczają duże ruchy przy niskim wolumenie.',
      fullDescription: {
        assumptions: 'Duże ruchy cenowe przy niskim wolumenie wskazują na minimalny opór; małe ruchy przy wysokim wolumenie wskazują na duży opór.',
        whatItShows: 'Znormalizowany stosunek ruchu ceny do wolumenu. Wartości dodatnie = ruch wzrostowy z małym nakładem wolumenu.',
        howItHelps: 'Dodatnie EOM sugeruje, że rynek rośnie łatwo (sygnał byczy). Ujemne EOM sugeruje, że spada łatwo (sygnał niedźwiedzi).',
      },
    },
  },
  'klinger-oscillator': {
    pl: {
      shortDescription: 'EMA szybka minus wolna miary siły wolumenu – wykrywa odwrócenia za pomocą wolumenu i zakresu cenowego.',
      fullDescription: {
        assumptions: 'Wolumen każdego słupka wnosi wkład w akumulację lub dystrybucję w zależności od tego, czy cena zamknęła się w górnej czy dolnej połowie zakresu.',
        whatItShows: 'Różnica między szybką (34-okresową) a wolną (55-okresową) EMA siły wolumenu (Volume Force), z 13-okresową linią sygnałową.',
        howItHelps: 'Crossovery powyżej/poniżej linii sygnałowej generują sygnały kupna/sprzedaży. Dywergencje przy nowych szczytach/dołkach cenowych są silnymi sygnałami odwrócenia.',
      },
    },
  },
  'net-volume': {
    pl: {
      shortDescription: 'Wolumen słupków wzrostowych minus wolumen słupków spadkowych – surowa miara presji kupna i sprzedaży każdego słupka.',
      fullDescription: {
        assumptions: 'Wolumen na słupkach zamykających się wyżej odzwierciedla presję kupna; wolumen na słupkach zamykających się niżej odzwierciedla presję sprzedaży.',
        whatItShows: 'Histogram: dodatni, gdy zamknięcie jest wyższe niż poprzednie zamknięcie (presja kupna), ujemny, gdy jest niższe.',
        howItHelps: 'Wysokie dodatnie słupki net-volume podczas rajdu potwierdzają silne kupowanie. Dywergencje – szczyt cenowy przy malejącym net-volume – sugerują odwrócenie.',
      },
    },
  },
  'volume-delta': {
    pl: {
      shortDescription: 'Szacowany wolumen kupna minus wolumen sprzedaży dla słupka – pokazuje, kto dominował na każdej świecy.',
      fullDescription: {
        assumptions: 'Wolumen w świecy można podzielić na agresywne zlecenia kupna i sprzedaży. Pozycja zamknięcia w zakresie słupka służy do oszacowania tego podziału.',
        whatItShows: 'Wolumen kupna szacowany na podstawie bliskości zamknięcia do high; wolumen sprzedaży jako reszta. Delta = kupno minus sprzedaż.',
        howItHelps: 'Stale dodatnia delta w uptrendzie potwierdza przekonanie kupujących. Ujemna delta przy szczycie cenowym ostrzega o dystrybucji.',
      },
    },
  },
  'cumulative-volume-delta': {
    pl: {
      shortDescription: 'Bieżąca suma delty wolumenu – śledzi ciągłą nierównowagę między kupującymi a sprzedającymi.',
      fullDescription: {
        assumptions: 'Skumulowana suma nierównowagi wolumenu kupno-sprzedaż niesie trwałe informacje o strukturze rynkowej.',
        whatItShows: 'Ta sama delta wolumenu skumulowana jako bieżąca suma. Rosnąca linia CVD oznacza, że kupujący przeważali nad sprzedającymi.',
        howItHelps: 'Bycki trend cenowy z rosnącym CVD potwierdza zdrowe kupowanie. CVD malejące przy rosnącej cenie wskazuje na dystrybucję.',
      },
    },
  },
  'obv-macd': {
    pl: {
      shortDescription: 'System crossover MACD zastosowany do On Balance Volume – wykrywa zmiany momentum w przepływie wolumenu.',
      fullDescription: {
        assumptions: 'Framework MACD zastosowany do OBV ujawnia znaczące cykle momentum w przepływie wolumenu.',
        whatItShows: 'Szybka EMA OBV minus wolna EMA OBV (linia MACD), plus linia sygnałowa EMA i histogram. Reaguje na momentum przepływu wolumenu.',
        howItHelps: 'Byczy crossover MACD na OBV sygnalizuje przyspieszającą akumulację – często przed ceną. Dywergencje z MACD cenowym są szczególnie silne.',
      },
    },
  },
  'colored-volume': {
    pl: {
      shortDescription: 'Standardowy histogram wolumenu z słupkami kolorowanymi na zielono przy wzrostach i na czerwono przy spadkach.',
      fullDescription: {
        assumptions: 'Kierunek zamknięcia słupka względem jego otwarcia to najprostszy sposób klasyfikacji wolumenu jako zdominowanego przez kupujących lub sprzedających.',
        whatItShows: 'Konwencjonalny histogram wolumenu z kodowaniem wizualnym: zielone słupki przy zamknięciach wyżej niż otwarcie, czerwone przy zamknięciach niżej.',
        howItHelps: 'Natychmiast podkreśla, czy duże wolumeny są napędzane przez kupujących czy sprzedających. Klimaksy wolumenu (niezwykle wysokie słupki) sygnalizują potencjalne wyczerpanie.',
      },
    },
  },
};
