import type { TradingIndicatorData } from '../indicators';

/**
 * INDICATORS_CATALOG
 *
 * Rich UI metadata for all 70 indicators in the engine.
 * Each entry maps 1-to-1 with an IndicatorDef by `id`.
 *
 * formula  → LaTeX string; render with KaTeX
 * category → used by the search/filter panel
 *
 * "Learn More" link pattern:
 *   `https://www.google.com/search?q=${encodeURIComponent(entry.title + ' trading indicator')}`
 */
export const INDICATORS_CATALOG: TradingIndicatorData[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // MOVING AVERAGES
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'sma',
    title: 'Simple Moving Average',
    shortDescription: 'The plain arithmetic mean of price over n periods — the baseline smoothing tool.',
    fullDescription: {
      assumptions: 'All bars in the lookback window carry equal weight.',
      whatItShows: 'The average price level over the selected period, smoothing out short-term noise.',
      howItHelps: 'Identifies overall trend direction and acts as dynamic support/resistance; crossovers signal potential trend changes.',
    },
    formula: 'SMA_n = \\frac{1}{n}\\sum_{i=0}^{n-1} C_{t-i}',
    formulaLegend: [
      { symbol: 'C_{t-i}', explanation: 'Closing price i bars ago' },
      { symbol: 'n', explanation: 'Period — number of bars averaged' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 14, min: 1, description: 'Number of bars in the average' },
    ],
    category: 'Moving Average',
  },

  {
    id: 'ema',
    title: 'Exponential Moving Average',
    shortDescription: 'A weighted average that gives exponentially more importance to recent prices.',
    fullDescription: {
      assumptions: 'Recent price action is more relevant to the current trend than older data.',
      whatItShows: 'A smoothed price line that reacts faster to new information than the SMA.',
      howItHelps: 'Provides earlier trend-change signals; shorter EMAs crossing longer ones are classic entry/exit triggers.',
    },
    formula: 'EMA_t = \\alpha \\cdot C_t + (1 - \\alpha) \\cdot EMA_{t-1}, \\quad \\alpha = \\frac{2}{n+1}',
    formulaLegend: [
      { symbol: 'C_t', explanation: 'Current closing price' },
      { symbol: '\\alpha', explanation: 'Smoothing factor — controls how fast the EMA adapts' },
      { symbol: 'n', explanation: 'Period — larger n = slower reaction' },
      { symbol: 'EMA_{t-1}', explanation: 'Previous bar EMA value' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 14, min: 1, description: 'Smoothing period' },
    ],
    category: 'Moving Average',
  },

  {
    id: 'wma',
    title: 'Weighted Moving Average',
    shortDescription: 'A linearly weighted average where the most recent bar has the highest weight.',
    fullDescription: {
      assumptions: 'Each successive bar deserves proportionally more influence than the one before it.',
      whatItShows: 'A smoothed price that is more responsive to recent moves than the SMA yet less jumpy than the EMA.',
      howItHelps: 'Used as a filter to reduce lag while still identifying trend direction cleanly.',
    },
    formula: 'WMA_n = \\frac{\\displaystyle\\sum_{i=1}^{n} i \\cdot C_{t-n+i}}{\\dfrac{n(n+1)}{2}}',
    formulaLegend: [
      { symbol: 'C_{t-n+i}', explanation: 'Closing price at bar i (i=1 is oldest, i=n is current)' },
      { symbol: 'n', explanation: 'Period' },
      { symbol: 'n(n+1)/2', explanation: 'Normalisation divisor — sum of weights 1+2+…+n' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 14, min: 1, description: 'Number of bars' },
    ],
    category: 'Moving Average',
  },

  {
    id: 'rma',
    title: "Wilder's Smoothed Moving Average",
    shortDescription: "J. Welles Wilder's smoothing method — slower than EMA, used internally by RSI and ATR.",
    fullDescription: {
      assumptions: 'A gradual, stable average is preferable to a reactive one for momentum calculations.',
      whatItShows: 'A very smooth price average equivalent to an EMA with period 2n−1.',
      howItHelps: 'Underlying component of RSI, ATR, and ADX — also usable directly as a low-noise trend filter.',
    },
    formula: 'RMA_t = RMA_{t-1} + \\frac{C_t - RMA_{t-1}}{n}',
    formulaLegend: [
      { symbol: 'RMA_{t-1}', explanation: 'Previous smoothed value' },
      { symbol: 'C_t', explanation: 'Current closing price' },
      { symbol: 'n', explanation: 'Period' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 14, min: 1, description: 'Smoothing period' },
    ],
    category: 'Moving Average',
  },

  {
    id: 'smma',
    title: 'Smoothed Moving Average',
    shortDescription: 'A slow-reacting average that uses all historical data with decreasing weight over time.',
    fullDescription: {
      assumptions: 'Long-term price history still carries relevance and should not be discarded entirely.',
      whatItShows: 'An ultra-smooth trend line ideal for identifying the dominant direction on higher timeframes.',
      howItHelps: 'Cuts through short-term noise; traders use it to stay in macro trends longer.',
    },
    formula: 'SMMA_t = \\frac{SMMA_{t-1} \\cdot (n-1) + C_t}{n}',
    formulaLegend: [
      { symbol: 'SMMA_{t-1}', explanation: 'Previous smoothed value' },
      { symbol: 'C_t', explanation: 'Current closing price' },
      { symbol: 'n', explanation: 'Period' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 14, min: 1, description: 'Smoothing period' },
    ],
    category: 'Moving Average',
  },

  {
    id: 'dema',
    title: 'Double Exponential Moving Average',
    shortDescription: 'An EMA of an EMA with the lag removed — roughly twice as fast as a standard EMA.',
    fullDescription: {
      assumptions: 'EMA lag can be halved by subtracting the double-smoothed component.',
      whatItShows: 'A low-lag moving average that tracks price closely without excessive noise.',
      howItHelps: 'Generates earlier crossover signals than the plain EMA while maintaining smooth output.',
    },
    formula: 'DEMA_n = 2 \\cdot EMA_n - EMA_n(EMA_n)',
    formulaLegend: [
      { symbol: 'EMA_n', explanation: 'Single exponential moving average over n periods' },
      { symbol: 'EMA_n(EMA_n)', explanation: 'EMA applied a second time to the first EMA (double-smoothed)' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 14, min: 1, description: 'Base EMA period' },
    ],
    category: 'Moving Average',
  },

  {
    id: 'tema',
    title: 'Triple Exponential Moving Average',
    shortDescription: 'Three nested EMAs with lag correction — even faster than DEMA with minimal lag.',
    fullDescription: {
      assumptions: 'Triple smoothing with algebraic lag cancellation produces the most responsive average in the EMA family.',
      whatItShows: 'A very low-lag smooth trend line that hugs price tightly.',
      howItHelps: 'Useful on fast-moving assets or short timeframes where standard EMAs are too slow.',
    },
    formula: 'TEMA_n = 3 \\cdot EMA_n - 3 \\cdot EMA_n(EMA_n) + EMA_n(EMA_n(EMA_n))',
    formulaLegend: [
      { symbol: 'EMA_n', explanation: 'First-pass EMA over n periods' },
      { symbol: 'EMA_n(EMA_n)', explanation: 'Second-pass EMA (double-smoothed)' },
      { symbol: 'EMA_n(EMA_n(EMA_n))', explanation: 'Third-pass EMA (triple-smoothed)' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 14, min: 1, description: 'Base EMA period' },
    ],
    category: 'Moving Average',
  },

  {
    id: 'hma',
    title: 'Hull Moving Average',
    shortDescription: "Alan Hull's average — nearly eliminates lag while keeping the line smooth.",
    fullDescription: {
      assumptions: 'Combining two WMAs of different lengths and re-smoothing the difference removes most of the inherent lag.',
      whatItShows: 'A fast, smooth trend line that closely tracks current price.',
      howItHelps: 'Allows traders to enter and exit trends earlier with fewer false signals than traditional MAs.',
    },
    formula: 'HMA_n = WMA_{\\lfloor\\sqrt{n}\\rfloor}\\!\\left(2\\,WMA_{\\lfloor n/2\\rfloor} - WMA_n\\right)',
    formulaLegend: [
      { symbol: 'WMA_n', explanation: 'Weighted moving average over full period n' },
      { symbol: 'WMA_{\\lfloor n/2\\rfloor}', explanation: 'WMA over half the period' },
      { symbol: '\\lfloor\\sqrt{n}\\rfloor', explanation: 'Integer square root of n — final smoothing window' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 14, min: 2, description: 'Base period (must be ≥ 2)' },
    ],
    category: 'Moving Average',
  },

  {
    id: 'lsma',
    title: 'Least Squares Moving Average',
    shortDescription: 'The endpoint of a linear regression line fitted to the last n bars — also called LinReg.',
    fullDescription: {
      assumptions: 'Price follows a locally linear trend over the lookback window.',
      whatItShows: 'Where the best-fit regression line ends today, indicating the "fair value" of the trend.',
      howItHelps: 'Provides a lag-reduced directional view; slope angle indicates trend strength.',
    },
    formula: '\\hat{y}_t = \\hat{a} + \\hat{b}\\,t \\quad\\text{(OLS fit over last } n \\text{ bars)}',
    formulaLegend: [
      { symbol: '\\hat{a}', explanation: 'OLS intercept' },
      { symbol: '\\hat{b}', explanation: 'OLS slope — positive means uptrend' },
      { symbol: 't', explanation: 'Bar index (t=0 is oldest bar in window)' },
      { symbol: 'n', explanation: 'Regression window length' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 25, min: 2, description: 'Regression lookback' },
    ],
    category: 'Moving Average',
  },

  {
    id: 'zlsma',
    title: 'Zero Lag LSMA',
    shortDescription: 'LSMA with the lag component subtracted, producing an even more responsive trend line.',
    fullDescription: {
      assumptions: 'Subtracting the lagged LSMA from itself at the midpoint cancels the built-in delay.',
      whatItShows: 'A forward-shifted regression line that attempts to predict where the trend is heading.',
      howItHelps: 'Gives earlier signals than LSMA at the cost of slightly more noise.',
    },
    formula: 'ZLSMA_t = 2\\,LSMA_n(C) - LSMA_n(C_{t-\\text{lag}})',
    formulaLegend: [
      { symbol: 'LSMA_n', explanation: 'Least Squares Moving Average over n periods' },
      { symbol: 'C_{t-\\text{lag}}', explanation: 'Close price shifted back by the lag offset' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 25, min: 2, description: 'LSMA period' },
    ],
    category: 'Moving Average',
  },

  {
    id: 'alma',
    title: 'Arnaud Legoux Moving Average',
    shortDescription: 'A Gaussian-weighted average that balances smoothness and responsiveness via three parameters.',
    fullDescription: {
      assumptions: 'A bell-curve weight distribution centered near the most recent bars minimises lag while controlling noise.',
      whatItShows: 'A smooth, low-lag average whose behaviour is tunable via offset and sigma.',
      howItHelps: 'Traders adjust offset toward 1 for more responsiveness or toward 0 for more smoothness.',
    },
    formula: 'ALMA_t = \\frac{\\displaystyle\\sum_{i=0}^{n-1} w_i\\,C_{t-i}}{\\displaystyle\\sum_{i=0}^{n-1} w_i}, \\quad w_i = e^{-\\frac{(i-\\phi)^2}{2\\sigma^2}}',
    formulaLegend: [
      { symbol: 'w_i', explanation: 'Gaussian weight for bar i' },
      { symbol: '\\phi', explanation: 'Weight centre = offset × (n−1)' },
      { symbol: '\\sigma', explanation: 'Bell-curve width = n / sigma_param' },
      { symbol: 'n', explanation: 'Period' },
    ],
    parameters: [
      { name: 'Period',    symbol: 'n',      defaultValue: 9,    min: 1,   description: 'Lookback window' },
      { name: 'Offset',   symbol: 'offset', defaultValue: 0.85, min: 0, max: 1, description: '0 = full smoothing, 1 = full responsiveness' },
      { name: 'Sigma',    symbol: '\\sigma', defaultValue: 6,    min: 1,   description: 'Controls bell-curve width' },
    ],
    category: 'Moving Average',
  },

  {
    id: 'vwma',
    title: 'Volume Weighted Moving Average',
    shortDescription: 'An SMA where each bar is weighted by its trading volume.',
    fullDescription: {
      assumptions: 'Bars with higher volume represent more significant price levels and should carry more weight.',
      whatItShows: 'The average price weighted by activity — high-volume bars pull the line more than low-volume ones.',
      howItHelps: 'Reveals the "true" average price that the market has accepted; divergence from price signals potential reversals.',
    },
    formula: 'VWMA_n = \\frac{\\displaystyle\\sum_{i=0}^{n-1} C_{t-i}\\,V_{t-i}}{\\displaystyle\\sum_{i=0}^{n-1} V_{t-i}}',
    formulaLegend: [
      { symbol: 'C_{t-i}', explanation: 'Closing price i bars ago' },
      { symbol: 'V_{t-i}', explanation: 'Volume i bars ago' },
      { symbol: 'n', explanation: 'Period' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 14, min: 1, description: 'Number of bars' },
    ],
    category: 'Moving Average',
  },

  {
    id: 'mcginley',
    title: 'McGinley Dynamic',
    shortDescription: "John McGinley's self-adjusting average that automatically corrects for speed differences in up vs. down markets.",
    fullDescription: {
      assumptions: 'Markets accelerate in different directions; a fixed smoothing factor mis-tracks price during fast moves.',
      whatItShows: 'A dynamic trend line that speeds up in fast markets and slows down in slow ones.',
      howItHelps: 'Reduces whipsaws and better tracks price without constant manual period adjustment.',
    },
    formula: 'MD_t = MD_{t-1} + \\frac{C_t - MD_{t-1}}{n \\cdot \\left(\\dfrac{C_t}{MD_{t-1}}\\right)^4}',
    formulaLegend: [
      { symbol: 'MD_{t-1}', explanation: 'Previous McGinley Dynamic value' },
      { symbol: 'C_t', explanation: 'Current closing price' },
      { symbol: 'n', explanation: 'Period parameter (controls base speed)' },
      { symbol: '\\left(C_t/MD_{t-1}\\right)^4', explanation: 'Speed-correction factor — amplifies effect during fast moves' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 14, min: 1, description: 'Base smoothing period' },
    ],
    category: 'Moving Average',
  },

  {
    id: 'macross',
    title: 'MA Cross',
    shortDescription: 'Plots a fast and a slow moving average on the same pane; highlights their crossovers.',
    fullDescription: {
      assumptions: 'A short-term MA crossing above a long-term MA signals a shift to bullish momentum, and vice versa.',
      whatItShows: 'Two configurable MAs and visual markers at every bullish (golden) and bearish (death) cross.',
      howItHelps: 'One of the most straightforward trend-following entry/exit systems — easy to automate.',
    },
    formula: '\\text{Cross}_{\\uparrow} : MA_{fast} > MA_{slow}, \\quad \\text{Cross}_{\\downarrow} : MA_{fast} < MA_{slow}',
    formulaLegend: [
      { symbol: 'MA_{fast}', explanation: 'Moving average of shorter period' },
      { symbol: 'MA_{slow}', explanation: 'Moving average of longer period' },
    ],
    parameters: [
      { name: 'Fast Period', symbol: 'f', defaultValue: 9,  min: 1, description: 'Period of the faster MA' },
      { name: 'Slow Period', symbol: 's', defaultValue: 21, min: 1, description: 'Period of the slower MA' },
    ],
    category: 'Moving Average',
  },

  {
    id: 'maribbon',
    title: 'MA Ribbon',
    shortDescription: 'A fan of equally-spaced moving averages that visualises trend strength by the width of their spread.',
    fullDescription: {
      assumptions: 'When multiple MAs of different periods move together, the trend is strong; when they diverge, momentum is changing.',
      whatItShows: 'A ribbon of MA lines — a wide, well-ordered ribbon signals a strong trend; a compressed ribbon signals consolidation.',
      howItHelps: 'Makes trend strength and potential reversals immediately visible; ribbon contractions often precede breakouts.',
    },
    formula: '\\text{Ribbon}_i = MA_{n_i}, \\quad n_i = start + (i-1) \\cdot step, \\quad i = 1,\\ldots,k',
    formulaLegend: [
      { symbol: 'MA_{n_i}', explanation: 'Moving average with period n_i' },
      { symbol: 'start', explanation: 'Period of the shortest MA in the ribbon' },
      { symbol: 'step', explanation: 'Increment between successive MA periods' },
      { symbol: 'k', explanation: 'Total number of MA lines' },
    ],
    parameters: [
      { name: 'Start Period', symbol: 'start', defaultValue: 10,  min: 1, description: 'Shortest MA period' },
      { name: 'Step',         symbol: 'step',  defaultValue: 10,  min: 1, description: 'Period increment per ribbon line' },
      { name: 'Count',        symbol: 'k',     defaultValue: 8,   min: 2, description: 'Number of MA lines in the ribbon' },
    ],
    category: 'Moving Average',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // OSCILLATORS
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'rsi',
    title: 'Relative Strength Index',
    shortDescription: 'A momentum oscillator that measures the speed and magnitude of recent price changes on a 0–100 scale.',
    fullDescription: {
      assumptions: 'Sustained upward closes indicate excessive buying strength that will eventually revert.',
      whatItShows: 'Readings above 70 suggest overbought conditions; below 30 suggest oversold.',
      howItHelps: 'Identifies potential reversals, divergences with price, and momentum shifts.',
    },
    formula: 'RSI = 100 - \\frac{100}{1 + RS}, \\quad RS = \\frac{\\overline{G}_n}{\\overline{L}_n}',
    formulaLegend: [
      { symbol: 'RS', explanation: 'Relative Strength = average gain ÷ average loss over n periods' },
      { symbol: '\\overline{G}_n', explanation: "Wilder's smoothed average of up-closes over n periods" },
      { symbol: '\\overline{L}_n', explanation: "Wilder's smoothed average of down-closes over n periods" },
      { symbol: 'n', explanation: 'Period (default 14)' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 14, min: 1, description: 'Lookback for average gain/loss' },
    ],
    category: 'Oscillator',
  },

  {
    id: 'stochrsi',
    title: 'Stochastic RSI',
    shortDescription: 'RSI normalised to its own range using the Stochastic formula — more sensitive than raw RSI.',
    fullDescription: {
      assumptions: 'Applying the Stochastic formula to RSI values reveals momentum extremes that RSI alone misses.',
      whatItShows: 'Values near 1 indicate RSI is at the top of its recent range (momentum high); near 0 is the bottom.',
      howItHelps: 'Generates more frequent signals than RSI; often smoothed into %K and %D lines for crossover signals.',
    },
    formula: 'StochRSI_t = \\frac{RSI_t - \\min_n(RSI)}{\\max_n(RSI) - \\min_n(RSI)}',
    formulaLegend: [
      { symbol: 'RSI_t', explanation: 'Current RSI value' },
      { symbol: '\\min_n(RSI)', explanation: 'Lowest RSI over the last n bars' },
      { symbol: '\\max_n(RSI)', explanation: 'Highest RSI over the last n bars' },
    ],
    parameters: [
      { name: 'RSI Period',    symbol: 'r', defaultValue: 14, min: 1, description: 'Period for the underlying RSI' },
      { name: 'Stoch Period',  symbol: 'n', defaultValue: 14, min: 1, description: 'Lookback for min/max of RSI' },
      { name: '%K Smooth',     symbol: 'k', defaultValue: 3,  min: 1, description: 'SMA period for %K line' },
      { name: '%D Smooth',     symbol: 'd', defaultValue: 3,  min: 1, description: 'SMA period for %D signal line' },
    ],
    category: 'Oscillator',
  },

  {
    id: 'cci',
    title: 'Commodity Channel Index',
    shortDescription: 'Measures how far price has deviated from its statistical mean, scaled by average deviation.',
    fullDescription: {
      assumptions: 'Prices cycle around a mean; extreme deviations (±100) are unsustainable.',
      whatItShows: 'Values above +100 indicate a strong uptrend or overbought condition; below −100 indicate a downtrend or oversold.',
      howItHelps: 'Identifies trend initiations on breakouts beyond ±100 and potential reversals near ±200.',
    },
    formula: 'CCI = \\frac{TP - SMA_n(TP)}{0.015 \\cdot MAD_n}, \\quad TP = \\frac{H + L + C}{3}',
    formulaLegend: [
      { symbol: 'TP', explanation: 'Typical Price = (High + Low + Close) / 3' },
      { symbol: 'SMA_n(TP)', explanation: 'Simple moving average of typical price over n periods' },
      { symbol: 'MAD_n', explanation: 'Mean absolute deviation of TP from its SMA over n periods' },
      { symbol: '0.015', explanation: 'Scaling constant — keeps ~75% of values within ±100' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 20, min: 1, description: 'Lookback period' },
    ],
    category: 'Oscillator',
  },

  {
    id: 'williams-r',
    title: 'Williams Percent Range',
    shortDescription: "Larry Williams' momentum oscillator showing where the close sits within the n-period high-low range.",
    fullDescription: {
      assumptions: 'In a healthy uptrend, prices close near the top of their range; in a downtrend, near the bottom.',
      whatItShows: 'A value from −100 (close at period low) to 0 (close at period high); readings above −20 are overbought, below −80 are oversold.',
      howItHelps: 'Fast reversals from extreme readings signal momentum exhaustion and potential entries.',
    },
    formula: '\\%R = \\frac{H_n - C}{H_n - L_n} \\times (-100)',
    formulaLegend: [
      { symbol: 'H_n', explanation: 'Highest high over the last n bars' },
      { symbol: 'L_n', explanation: 'Lowest low over the last n bars' },
      { symbol: 'C', explanation: 'Current closing price' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 14, min: 1, description: 'Lookback for high/low range' },
    ],
    category: 'Oscillator',
  },

  {
    id: 'awesome-oscillator',
    title: 'Awesome Oscillator',
    shortDescription: "Bill Williams' histogram measuring the difference between a 5-period and 34-period simple moving average of bar midpoints.",
    fullDescription: {
      assumptions: 'Short-term momentum above long-term momentum confirms bullish energy and vice versa.',
      whatItShows: 'A histogram above zero indicates bullish momentum; below zero is bearish. Colour changes signal acceleration/deceleration.',
      howItHelps: 'Used for "twin peaks" and "saucer" entry setups; zero-line crossovers confirm trend direction.',
    },
    formula: 'AO = SMA_5(M) - SMA_{34}(M), \\quad M = \\frac{H + L}{2}',
    formulaLegend: [
      { symbol: 'M', explanation: 'Bar midpoint = (High + Low) / 2' },
      { symbol: 'SMA_5(M)', explanation: '5-period SMA of midpoints' },
      { symbol: 'SMA_{34}(M)', explanation: '34-period SMA of midpoints' },
    ],
    parameters: [],
    category: 'Oscillator',
  },

  {
    id: 'chande-mo',
    title: 'Chande Momentum Oscillator',
    shortDescription: "Tushar Chande's oscillator measuring net momentum as the ratio of up-move sum to total move sum.",
    fullDescription: {
      assumptions: 'The balance between upward and downward closes over a period captures the net directional conviction of the market.',
      whatItShows: 'Values range from −100 to +100; above +50 is overbought, below −50 is oversold.',
      howItHelps: 'Useful for spotting divergence and momentum exhaustion; also used to adapt other indicators dynamically.',
    },
    formula: 'CMO = 100 \\cdot \\frac{S_u - S_d}{S_u + S_d}',
    formulaLegend: [
      { symbol: 'S_u', explanation: 'Sum of all up-closes (C_t − C_{t−1} > 0) over n periods' },
      { symbol: 'S_d', explanation: 'Sum of all down-closes (absolute value) over n periods' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 9, min: 1, description: 'Lookback for momentum sum' },
    ],
    category: 'Oscillator',
  },

  {
    id: 'dpo',
    title: 'Detrended Price Oscillator',
    shortDescription: 'Removes the long-term trend from price to isolate shorter cycles.',
    fullDescription: {
      assumptions: 'Price moves in cycles; removing the dominant trend reveals the underlying cyclical component.',
      whatItShows: 'Oscillation above/below zero corresponding to the cyclical portion of price; peaks and troughs mark cycle turns.',
      howItHelps: 'Useful for measuring cycle length and timing entries/exits within a known price cycle.',
    },
    formula: 'DPO_t = C_{t - \\lfloor n/2 \\rfloor - 1} - SMA_n(C)_{t - \\lfloor n/2 \\rfloor - 1}',
    formulaLegend: [
      { symbol: 'C_{t - \\lfloor n/2 \\rfloor - 1}', explanation: 'Close price n/2+1 bars ago' },
      { symbol: 'SMA_n(C)', explanation: 'n-period SMA of close, also evaluated n/2+1 bars ago' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 21, min: 2, description: 'Cycle lookback' },
    ],
    category: 'Oscillator',
  },

  {
    id: 'rvi',
    title: 'Relative Vigor Index',
    shortDescription: 'Compares the close-to-open range to the high-to-low range, smoothed symmetrically.',
    fullDescription: {
      assumptions: 'In an uptrend, prices close higher than they open; the vigor (energy) of the move is captured by the close-minus-open ratio.',
      whatItShows: 'Values above zero confirm bullish vigor; a signal line crossover triggers entries.',
      howItHelps: 'Confirms trend direction after breakouts; divergence with price identifies potential reversals.',
    },
    formula: 'RVI = \\frac{EMA_4^*(C - O)}{EMA_4^*(H - L)}, \\quad EMA_4^* \\text{ = 4-point symmetric MA}',
    formulaLegend: [
      { symbol: 'C - O', explanation: 'Close minus Open — represents upward energy of the bar' },
      { symbol: 'H - L', explanation: 'High minus Low — total bar range' },
      { symbol: 'EMA_4^*', explanation: 'Symmetrically weighted 4-bar average: (v + 2v_{-1} + 2v_{-2} + v_{-3}) / 6' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 10, min: 1, description: 'Smoothing period for RVI line' },
    ],
    category: 'Oscillator',
  },

  {
    id: 'tsi',
    title: 'True Strength Index',
    shortDescription: 'Double-smoothed momentum indicator measuring the ratio of smoothed price change to smoothed absolute change.',
    fullDescription: {
      assumptions: 'Double EMA smoothing of price changes eliminates noise while preserving the true direction of momentum.',
      whatItShows: 'Values range from −100 to +100; positive values indicate bullish momentum, negative indicate bearish.',
      howItHelps: 'Divergences with price are high-quality reversal signals; zero-line crossovers confirm trend changes.',
    },
    formula: 'TSI = 100 \\cdot \\frac{EMA_s(EMA_r(\\Delta C))}{EMA_s(EMA_r(|\\Delta C|))}, \\quad \\Delta C = C_t - C_{t-1}',
    formulaLegend: [
      { symbol: '\\Delta C', explanation: 'One-bar price change' },
      { symbol: 'EMA_r', explanation: 'First EMA smoothing with period r' },
      { symbol: 'EMA_s', explanation: 'Second EMA smoothing with period s' },
    ],
    parameters: [
      { name: 'Long Period',   symbol: 'r', defaultValue: 25, min: 1, description: 'First smoothing period' },
      { name: 'Short Period',  symbol: 's', defaultValue: 13, min: 1, description: 'Second smoothing period' },
      { name: 'Signal Period', symbol: 'g', defaultValue: 7,  min: 1, description: 'EMA period for the signal line' },
    ],
    category: 'Oscillator',
  },

  {
    id: 'bb-percentb',
    title: 'Bollinger Band %B',
    shortDescription: 'Shows where price sits relative to the upper and lower Bollinger Bands as a 0–1 percentage.',
    fullDescription: {
      assumptions: 'The Bollinger Bands define a statistically derived price envelope; %B measures position within it.',
      whatItShows: 'A value of 1 means price is at the upper band; 0 means at the lower; above 1 or below 0 indicates a breakout.',
      howItHelps: 'Identifies overbought/oversold conditions and confirms Bollinger Band breakouts.',
    },
    formula: '\\%B = \\frac{C - Lower}{Upper - Lower}',
    formulaLegend: [
      { symbol: 'C', explanation: 'Current closing price' },
      { symbol: 'Upper', explanation: 'Upper Bollinger Band = SMA + k·σ' },
      { symbol: 'Lower', explanation: 'Lower Bollinger Band = SMA − k·σ' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 20, min: 1,   description: 'Bollinger Band SMA period' },
      { name: 'Std Dev Mult', symbol: 'k', defaultValue: 2, min: 0.1, description: 'Standard deviation multiplier' },
    ],
    category: 'Oscillator',
  },

  {
    id: 'fisher-transform',
    title: 'Fisher Transform',
    shortDescription: 'Converts prices into a Gaussian normal distribution via the inverse hyperbolic tangent (Fisher) transformation.',
    fullDescription: {
      assumptions: 'Price extremes become more visible when the distribution is normalised; turning points coincide with Fisher peaks.',
      whatItShows: 'Sharp spikes indicate price extremes; signal line crossovers mark potential reversal points.',
      howItHelps: 'Pinpoints turning points with greater precision than RSI or Stochastics; works well for swing trades.',
    },
    formula: 'F = 0.5 \\cdot \\ln\\!\\left(\\frac{1+X}{1-X}\\right), \\quad X = \\frac{2(C - L_n)}{H_n - L_n} - 1',
    formulaLegend: [
      { symbol: 'X', explanation: 'Normalised price position scaled to (−1, 1)' },
      { symbol: 'L_n, H_n', explanation: 'Lowest low and highest high over n periods' },
      { symbol: '\\ln', explanation: 'Natural logarithm' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 9, min: 1, description: 'High/Low range lookback' },
    ],
    category: 'Oscillator',
  },

  {
    id: 'ultimate-oscillator',
    title: 'Ultimate Oscillator',
    shortDescription: "Larry Williams' multi-period oscillator combining short, medium, and long buying-pressure averages.",
    fullDescription: {
      assumptions: 'Using three timeframes reduces false signals from any single period; true range normalises for volatility.',
      whatItShows: 'Values above 70 are overbought; below 30 are oversold; divergence with price across all three periods is the strongest signal.',
      howItHelps: 'More reliable divergence signals than single-period oscillators; avoids whipsaws by requiring multi-timeframe confirmation.',
    },
    formula: 'UO = \\frac{4A_7 + 2A_{14} + A_{28}}{7} \\times 100, \\quad A_p = \\frac{\\sum BP}{\\sum TR_p}',
    formulaLegend: [
      { symbol: 'BP', explanation: 'Buying Pressure = Close − min(Low, Prior Close)' },
      { symbol: 'TR_p', explanation: 'True Range over period p' },
      { symbol: 'A_p', explanation: 'Average buying pressure over period p (7, 14, or 28)' },
    ],
    parameters: [
      { name: 'Short Period',  symbol: 'p_1', defaultValue: 7,  min: 1, description: 'Fastest cycle length' },
      { name: 'Medium Period', symbol: 'p_2', defaultValue: 14, min: 1, description: 'Medium cycle length' },
      { name: 'Long Period',   symbol: 'p_3', defaultValue: 28, min: 1, description: 'Slowest cycle length' },
    ],
    category: 'Oscillator',
  },

  {
    id: 'wave-trend',
    title: 'WaveTrend',
    shortDescription: 'A momentum oscillator based on EMA-smoothed typical price deviation, similar to CCI but double-smoothed.',
    fullDescription: {
      assumptions: 'Price oscillations around a smoothed baseline can be normalised into a consistent wave with predictable extremes.',
      whatItShows: 'Overbought and oversold zones (default ±60/±53); crossover of the two lines generates buy/sell signals.',
      howItHelps: 'Popular for confluence — when WaveTrend extremes align with key support/resistance, reversals are high-probability.',
    },
    formula: 'CI_t = \\frac{HLC_3 - EMA_{n_1}(HLC_3)}{0.015 \\cdot EMA_{n_1}(|HLC_3 - EMA_{n_1}(HLC_3)|)}, \\quad WT = EMA_{n_2}(CI)',
    formulaLegend: [
      { symbol: 'HLC_3', explanation: '(High + Low + Close) / 3' },
      { symbol: 'EMA_{n_1}', explanation: 'First smoothing EMA (channel period)' },
      { symbol: 'CI_t', explanation: 'Normalised deviation — intermediate oscillator value' },
      { symbol: 'WT', explanation: 'WaveTrend line — EMA of CI' },
      { symbol: '0.015', explanation: 'Scaling constant (same as CCI)' },
    ],
    parameters: [
      { name: 'Channel Period', symbol: 'n_1', defaultValue: 10, min: 1, description: 'EMA period for channel calculation' },
      { name: 'Average Period', symbol: 'n_2', defaultValue: 21, min: 1, description: 'EMA period for WaveTrend smoothing' },
    ],
    category: 'Oscillator',
  },

  {
    id: 'kdj',
    title: 'KDJ Indicator',
    shortDescription: 'An extension of the Stochastic Oscillator that adds a J line to highlight momentum extremes.',
    fullDescription: {
      assumptions: 'The J line amplifies K and D, making overbought/oversold conditions more prominent.',
      whatItShows: 'Three lines: %K (fast stochastic), %D (signal), and J (3K − 2D) which can exceed 0–100 to flag extremes.',
      howItHelps: 'J crossovers above 80 or below 20 are reliable short-term reversal signals, especially on daily charts.',
    },
    formula: 'K_t = \\tfrac{2}{3}K_{t-1} + \\tfrac{1}{3}RSV,\\quad D_t = \\tfrac{2}{3}D_{t-1} + \\tfrac{1}{3}K_t,\\quad J = 3K - 2D',
    formulaLegend: [
      { symbol: 'RSV', explanation: 'Raw Stochastic Value = (C − L_n)/(H_n − L_n) × 100' },
      { symbol: 'K', explanation: 'Smoothed stochastic value' },
      { symbol: 'D', explanation: 'Signal line — smoothed K' },
      { symbol: 'J', explanation: 'Momentum amplifier — can exceed 0–100 range' },
    ],
    parameters: [
      { name: 'Period',    symbol: 'n', defaultValue: 9, min: 1, description: 'Stochastic lookback' },
      { name: 'Signal',   symbol: 'm', defaultValue: 3, min: 1, description: 'Smoothing for %D' },
    ],
    category: 'Oscillator',
  },

  {
    id: 'connors-rsi',
    title: 'Connors RSI',
    shortDescription: "Larry Connors' composite RSI combining short-term RSI, consecutive up/down streak length, and percentile rank.",
    fullDescription: {
      assumptions: 'Three complementary momentum signals averaged together are more reliable than any single signal.',
      whatItShows: 'A composite 0–100 score; values below 10 are strongly oversold, above 90 are strongly overbought.',
      howItHelps: 'Designed specifically for short-term mean-reversion strategies on equities; highly actionable at extremes.',
    },
    formula: 'CRSI = \\frac{RSI_3 + UpDownLength_2 + PercentRank_{100}}{3}',
    formulaLegend: [
      { symbol: 'RSI_3', explanation: '3-period RSI of closing prices' },
      { symbol: 'UpDownLength_2', explanation: '2-period RSI of the consecutive up/down streak length' },
      { symbol: 'PercentRank_{100}', explanation: 'Percentile rank of today\'s 1-day ROC within the last 100 bars' },
    ],
    parameters: [
      { name: 'RSI Period',    symbol: 'r', defaultValue: 3,   min: 1, description: 'Short RSI period' },
      { name: 'Streak Period', symbol: 's', defaultValue: 2,   min: 1, description: 'RSI period for streak' },
      { name: 'Rank Period',   symbol: 'p', defaultValue: 100, min: 2, description: 'Lookback for percent rank' },
    ],
    category: 'Oscillator',
  },

  {
    id: 'smi-ergodic',
    title: 'SMI Ergodic Oscillator',
    shortDescription: 'A double-smoothed momentum oscillator based on price change relative to absolute change, derived from the TSI.',
    fullDescription: {
      assumptions: 'Double EMA smoothing produces an ergodic (mean-reverting) oscillator that is highly sensitive to momentum shifts.',
      whatItShows: 'Oscillates around zero; signal line crossovers and zero-line crossings generate trade signals.',
      howItHelps: 'More responsive than TSI for short-term trading; the histogram makes momentum direction and strength immediately visible.',
    },
    formula: 'SMI = 100 \\cdot \\frac{EMA_{s}(EMA_{r}(\\Delta C))}{EMA_{s}(EMA_{r}(|\\Delta C|))}',
    formulaLegend: [
      { symbol: '\\Delta C', explanation: 'Close-to-close price change' },
      { symbol: 'EMA_r', explanation: 'Fast EMA smoothing (period r)' },
      { symbol: 'EMA_s', explanation: 'Slow EMA smoothing (period s)' },
    ],
    parameters: [
      { name: 'Long Period',   symbol: 'r', defaultValue: 20, min: 1, description: 'First smoothing EMA period' },
      { name: 'Short Period',  symbol: 's', defaultValue: 5,  min: 1, description: 'Second smoothing EMA period' },
      { name: 'Signal Period', symbol: 'g', defaultValue: 5,  min: 1, description: 'Signal line EMA period' },
    ],
    category: 'Oscillator',
  },

  {
    id: 'stochastic',
    title: 'Stochastic Oscillator',
    shortDescription: "George Lane's momentum indicator comparing the close to the high-low range over n periods.",
    fullDescription: {
      assumptions: 'During uptrends, prices close near the high of the range; during downtrends, near the low.',
      whatItShows: '%K line (0–100) showing relative close position; %D signal line — above 80 overbought, below 20 oversold.',
      howItHelps: '%K/%D crossovers in extreme zones are classic reversal entries; divergence confirms weakening momentum.',
    },
    formula: '\\%K = \\frac{C - L_n}{H_n - L_n} \\times 100, \\quad \\%D = SMA_m(\\%K)',
    formulaLegend: [
      { symbol: 'C', explanation: 'Current closing price' },
      { symbol: 'L_n', explanation: 'Lowest low over n bars' },
      { symbol: 'H_n', explanation: 'Highest high over n bars' },
      { symbol: '\\%D', explanation: 'Signal line — m-period SMA of %K' },
    ],
    parameters: [
      { name: '%K Period', symbol: 'n', defaultValue: 14, min: 1, description: 'Stochastic lookback' },
      { name: '%K Smooth', symbol: 'k', defaultValue: 1,  min: 1, description: 'Smoothing for %K (1 = fast, 3 = slow)' },
      { name: '%D Period', symbol: 'm', defaultValue: 3,  min: 1, description: 'Signal line SMA period' },
    ],
    category: 'Oscillator',
  },

  {
    id: 'relative-volatility-index',
    title: 'Relative Volatility Index',
    shortDescription: "Donald Dorsey's RVI — like RSI but applied to standard deviation instead of price change.",
    fullDescription: {
      assumptions: 'Directional volatility (upward vs. downward standard deviation) captures the quality of a trend better than price alone.',
      whatItShows: 'Values above 50 indicate that volatility is predominantly upward (bullish energy); below 50 is bearish.',
      howItHelps: 'Used as a confirmation filter — only take buy signals from other indicators when RVI > 50.',
    },
    formula: 'RVI = 100 \\cdot \\frac{EMA_n(\\sigma^+)}{EMA_n(\\sigma^+) + EMA_n(\\sigma^-)}',
    formulaLegend: [
      { symbol: '\\sigma^+', explanation: 'Standard deviation on up-bars (close > prior close), else 0' },
      { symbol: '\\sigma^-', explanation: 'Standard deviation on down-bars (close < prior close), else 0' },
      { symbol: 'EMA_n', explanation: 'Exponential moving average with period n' },
    ],
    parameters: [
      { name: 'Std Dev Period', symbol: 'w', defaultValue: 10, min: 2, description: 'Window for standard deviation' },
      { name: 'EMA Period',     symbol: 'n', defaultValue: 14, min: 1, description: 'Smoothing EMA period' },
    ],
    category: 'Oscillator',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // MOMENTUM
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'macd',
    title: 'MACD',
    shortDescription: 'The classic moving average convergence/divergence indicator — momentum via the spread of two EMAs.',
    fullDescription: {
      assumptions: 'The difference between a fast and slow EMA captures the directional momentum of the trend.',
      whatItShows: 'MACD line, signal line, and histogram — positive histogram means bullish momentum is increasing.',
      howItHelps: 'Signal line crossovers, zero-line crossings, and divergence are the three primary trade signals.',
    },
    formula: 'MACD = EMA_{12} - EMA_{26}, \\quad Signal = EMA_9(MACD), \\quad Hist = MACD - Signal',
    formulaLegend: [
      { symbol: 'EMA_{12}', explanation: '12-period EMA of closing price' },
      { symbol: 'EMA_{26}', explanation: '26-period EMA of closing price' },
      { symbol: 'Signal', explanation: '9-period EMA of the MACD line' },
      { symbol: 'Hist', explanation: 'Histogram = MACD − Signal; shows momentum acceleration' },
    ],
    parameters: [
      { name: 'Fast Period',   symbol: 'f', defaultValue: 12, min: 1, description: 'Fast EMA period' },
      { name: 'Slow Period',   symbol: 's', defaultValue: 26, min: 1, description: 'Slow EMA period' },
      { name: 'Signal Period', symbol: 'g', defaultValue: 9,  min: 1, description: 'Signal line EMA period' },
    ],
    category: 'Momentum',
  },

  {
    id: 'momentum',
    title: 'Momentum',
    shortDescription: 'The simplest momentum indicator — the raw price difference over n bars.',
    fullDescription: {
      assumptions: 'The absolute change in price over a fixed period is the purest measure of directional velocity.',
      whatItShows: 'Positive values mean price is higher than n bars ago (bullish momentum); negative means it is lower.',
      howItHelps: 'Zero-line crossovers signal trend changes; the slope of the indicator shows acceleration/deceleration.',
    },
    formula: 'Mom_n = C_t - C_{t-n}',
    formulaLegend: [
      { symbol: 'C_t', explanation: 'Current closing price' },
      { symbol: 'C_{t-n}', explanation: 'Closing price n bars ago' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 10, min: 1, description: 'Look-back distance' },
    ],
    category: 'Momentum',
  },

  {
    id: 'roc',
    title: 'Rate of Change',
    shortDescription: 'Percentage price change over n periods — the momentum oscillator expressed as a percentage.',
    fullDescription: {
      assumptions: 'Percentage change normalises momentum across different price levels, making assets comparable.',
      whatItShows: 'Positive values confirm upward momentum; zero-line crossings indicate trend direction changes.',
      howItHelps: 'Divergence with price is a leading reversal signal; extreme readings indicate overbought/oversold conditions.',
    },
    formula: 'ROC_n = \\frac{C_t - C_{t-n}}{C_{t-n}} \\times 100',
    formulaLegend: [
      { symbol: 'C_t', explanation: 'Current closing price' },
      { symbol: 'C_{t-n}', explanation: 'Closing price n bars ago' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 10, min: 1, description: 'Lookback period' },
    ],
    category: 'Momentum',
  },

  {
    id: 'bop',
    title: 'Balance of Power',
    shortDescription: 'Measures the strength of buyers vs. sellers by comparing the close-to-open move against the total range.',
    fullDescription: {
      assumptions: 'The close position within the full range reveals whether bulls or bears dominated the bar.',
      whatItShows: 'Values near +1 indicate bull dominance (close near high); near −1 indicates bear dominance (close near low).',
      howItHelps: 'Smoothed BOP trending toward zero during an uptrend warns of fading buying pressure.',
    },
    formula: 'BOP = \\frac{C - O}{H - L}',
    formulaLegend: [
      { symbol: 'C - O', explanation: 'Net price change from open to close' },
      { symbol: 'H - L', explanation: 'Full bar range from high to low' },
    ],
    parameters: [
      { name: 'Smooth Period', symbol: 'n', defaultValue: 14, min: 1, description: 'SMA period for smoothing' },
    ],
    category: 'Momentum',
  },

  {
    id: 'bull-bear-power',
    title: 'Bull/Bear Power',
    shortDescription: "Alexander Elder's two-component indicator measuring bull power (high vs. EMA) and bear power (low vs. EMA).",
    fullDescription: {
      assumptions: 'Bulls push prices above the EMA and bears push prices below it; the deviation measures their relative strength.',
      whatItShows: 'Bull Power = High − EMA (positive = bulls control highs); Bear Power = Low − EMA (negative = bears control lows).',
      howItHelps: 'Used with a trend filter: go long when trend is up and Bear Power is negative but rising (bears losing strength).',
    },
    formula: 'BullPower = H - EMA_n, \\quad BearPower = L - EMA_n',
    formulaLegend: [
      { symbol: 'H', explanation: 'Bar high' },
      { symbol: 'L', explanation: 'Bar low' },
      { symbol: 'EMA_n', explanation: 'n-period EMA of closing price' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 13, min: 1, description: 'EMA period' },
    ],
    category: 'Momentum',
  },

  {
    id: 'elder-force-index',
    title: 'Elder Force Index',
    shortDescription: "Alexander Elder's indicator combining price change direction with volume to measure the force of market moves.",
    fullDescription: {
      assumptions: 'A price move backed by high volume reflects real conviction; the same move on low volume does not.',
      whatItShows: 'Positive values indicate upward force; negative values indicate downward force. Magnitude reflects conviction.',
      howItHelps: 'Smoothed 13-period EFI confirms trend; 2-period EFI identifies pullback entries within the trend.',
    },
    formula: 'EFI_t = (C_t - C_{t-1}) \\times V_t',
    formulaLegend: [
      { symbol: 'C_t - C_{t-1}', explanation: 'One-bar price change (direction)' },
      { symbol: 'V_t', explanation: 'Current bar volume (magnitude)' },
    ],
    parameters: [
      { name: 'Smooth Period', symbol: 'n', defaultValue: 13, min: 1, description: 'EMA period for smoothing raw EFI' },
    ],
    category: 'Momentum',
  },

  {
    id: 'price-oscillator',
    title: 'Price Oscillator (PPO)',
    shortDescription: 'The percentage difference between two EMAs — a normalised version of MACD.',
    fullDescription: {
      assumptions: 'Expressing the EMA difference as a percentage makes it comparable across assets with different price levels.',
      whatItShows: 'The same structure as MACD but in percentage terms — PPO line, signal, and histogram.',
      howItHelps: 'Useful for comparing momentum across different-priced assets; signal line crossovers and divergence are the primary signals.',
    },
    formula: 'PPO = \\frac{EMA_{fast} - EMA_{slow}}{EMA_{slow}} \\times 100',
    formulaLegend: [
      { symbol: 'EMA_{fast}', explanation: 'EMA with the shorter period' },
      { symbol: 'EMA_{slow}', explanation: 'EMA with the longer period' },
    ],
    parameters: [
      { name: 'Fast Period',   symbol: 'f', defaultValue: 12, min: 1, description: 'Fast EMA period' },
      { name: 'Slow Period',   symbol: 's', defaultValue: 26, min: 1, description: 'Slow EMA period' },
      { name: 'Signal Period', symbol: 'g', defaultValue: 9,  min: 1, description: 'Signal EMA period' },
    ],
    category: 'Momentum',
  },

  {
    id: 'coppock-curve',
    title: 'Coppock Curve',
    shortDescription: "Edwin Coppock's long-term momentum oscillator designed for identifying major stock market bottoms.",
    fullDescription: {
      assumptions: 'The sum of two different ROC periods captures the "grief cycle" following a bear market bottom.',
      whatItShows: 'A WMA-smoothed oscillator; zero-line crossovers from below signal major bull market entries.',
      howItHelps: 'Best used on monthly charts for macro trend changes — highly reliable for identifying secular bull market starts.',
    },
    formula: 'CC = WMA_{10}(ROC_{14} + ROC_{11})',
    formulaLegend: [
      { symbol: 'ROC_{14}', explanation: '14-period Rate of Change' },
      { symbol: 'ROC_{11}', explanation: '11-period Rate of Change' },
      { symbol: 'WMA_{10}', explanation: '10-period weighted moving average of the ROC sum' },
    ],
    parameters: [
      { name: 'WMA Period',    symbol: 'w',  defaultValue: 10, min: 1, description: 'Smoothing WMA period' },
      { name: 'Long ROC',      symbol: 'l',  defaultValue: 14, min: 1, description: 'Longer ROC period' },
      { name: 'Short ROC',     symbol: 'r',  defaultValue: 11, min: 1, description: 'Shorter ROC period' },
    ],
    category: 'Momentum',
  },

  {
    id: 'trix',
    title: 'Triple Exponential Average (TRIX)',
    shortDescription: 'The percentage rate of change of a triple-smoothed EMA — filters out cycles shorter than the period.',
    fullDescription: {
      assumptions: 'Triple smoothing removes short-cycle noise, leaving only longer-term momentum changes.',
      whatItShows: 'Values above zero indicate upward long-term momentum; below zero is bearish. Signal line crossovers generate entries.',
      howItHelps: 'Minimal whipsaws compared to MACD; particularly useful for identifying the early stages of new trends.',
    },
    formula: 'TRIX = 100 \\cdot \\frac{EMA^3_t - EMA^3_{t-1}}{EMA^3_{t-1}}, \\quad EMA^3 = EMA(EMA(EMA(C)))',
    formulaLegend: [
      { symbol: 'EMA^3_t', explanation: 'Triple-smoothed EMA at current bar' },
      { symbol: 'EMA^3_{t-1}', explanation: 'Triple-smoothed EMA one bar ago' },
    ],
    parameters: [
      { name: 'Period',        symbol: 'n', defaultValue: 18, min: 1, description: 'Triple EMA period' },
      { name: 'Signal Period', symbol: 's', defaultValue: 9,  min: 1, description: 'Signal line EMA period' },
    ],
    category: 'Momentum',
  },

  {
    id: 'kst',
    title: 'Know Sure Thing (KST)',
    shortDescription: "Martin Pring's smoothed rate-of-change oscillator across four timeframes, weighted toward longer cycles.",
    fullDescription: {
      assumptions: 'Price is driven by multiple overlapping cycles; combining four ROC periods smooths out noise and captures the dominant momentum.',
      whatItShows: 'A composite momentum line with signal; zero-line crossovers confirm major trend changes.',
      howItHelps: 'Widely used for long-term trend identification on weekly/monthly charts; avoids false signals common in single-period ROC.',
    },
    formula: 'KST = \\sum_{i=1}^{4} w_i \\cdot RCMA_i, \\quad RCMA_i = SMA_{r_i}(ROC_{p_i})',
    formulaLegend: [
      { symbol: 'RCMA_i', explanation: 'Rate of Change Moving Average for cycle i' },
      { symbol: 'ROC_{p_i}', explanation: 'ROC with period p (10, 13, 14, 15)' },
      { symbol: 'SMA_{r_i}', explanation: 'SMA smoothing with period r (10, 13, 14, 15)' },
      { symbol: 'w_i', explanation: 'Weights: 1, 2, 3, 4 (longer cycles weighted more)' },
    ],
    parameters: [
      { name: 'Signal Period', symbol: 'g', defaultValue: 9, min: 1, description: 'SMA period for signal line' },
    ],
    category: 'Momentum',
  },

  {
    id: 'squeeze-momentum',
    title: 'Squeeze Momentum',
    shortDescription: "LazyBear's adaptation of John Carter's Squeeze Pro — combines Bollinger Bands, Keltner Channels, and momentum.",
    fullDescription: {
      assumptions: 'When Bollinger Bands compress inside Keltner Channels (the squeeze), energy is building for an explosive move.',
      whatItShows: 'A momentum histogram indicating direction of the impending breakout; dots on the zero line signal active squeeze.',
      howItHelps: 'The squeeze condition identifies low-volatility setups; the histogram colour tells you which direction to trade the breakout.',
    },
    formula: 'Mom = LinReg\\!\\left(\\delta - SMA_n(\\delta),\\; n\\right), \\quad \\delta = C - \\frac{H_n + L_n}{2}',
    formulaLegend: [
      { symbol: '\\delta', explanation: 'Price deviation from midpoint of the n-period range' },
      { symbol: 'LinReg(x, n)', explanation: 'Linear regression value of x over n periods' },
      { symbol: 'H_n, L_n', explanation: 'Highest high and lowest low over n periods' },
    ],
    parameters: [
      { name: 'BB Period',      symbol: 'b',  defaultValue: 20,  min: 1,   description: 'Bollinger Band period' },
      { name: 'BB Mult',        symbol: 'bm', defaultValue: 2.0, min: 0.1, description: 'Bollinger Band standard deviation multiplier' },
      { name: 'KC Period',      symbol: 'k',  defaultValue: 20,  min: 1,   description: 'Keltner Channel period' },
      { name: 'KC Mult',        symbol: 'km', defaultValue: 1.5, min: 0.1, description: 'Keltner Channel ATR multiplier' },
    ],
    category: 'Momentum',
  },

  {
    id: 'impulse-macd',
    title: 'Impulse MACD',
    shortDescription: "LaBoursicot's MACD variant computed on the HLC3 source with higher/lower EMA periods than standard.",
    fullDescription: {
      assumptions: 'Using typical price (HLC3) and non-standard EMA lengths captures a different and often cleaner momentum signal.',
      whatItShows: 'An MACD histogram and signal line; bar colouring indicates direction and acceleration of momentum.',
      howItHelps: 'The non-standard periods reduce noise from individual close prices; colour coding makes trend direction immediately obvious.',
    },
    formula: '\\Delta_{MACD} = EMA_{hi}(HLC_3) - EMA_{lo}\\!\\bigl(EMA_{hi}(HLC_3)\\bigr)',
    formulaLegend: [
      { symbol: 'HLC_3', explanation: '(High + Low + Close) / 3 — typical price' },
      { symbol: 'EMA_{hi}', explanation: 'Longer-period EMA applied to HLC3' },
      { symbol: 'EMA_{lo}', explanation: 'Shorter-period EMA applied to the first EMA' },
    ],
    parameters: [
      { name: 'Long Period',   symbol: 'hi', defaultValue: 34, min: 1, description: 'Longer EMA period (applied to HLC3)' },
      { name: 'Short Period',  symbol: 'lo', defaultValue: 9,  min: 1, description: 'Shorter EMA period (applied to first EMA)' },
      { name: 'Signal Period', symbol: 'g',  defaultValue: 9,  min: 1, description: 'Signal line EMA period' },
    ],
    category: 'Momentum',
  },

  {
    id: 'macd4c',
    title: 'MACD 4-Colour Histogram',
    shortDescription: 'Standard MACD with a histogram colour-coded into four states based on direction and acceleration.',
    fullDescription: {
      assumptions: 'Momentum quality is better understood when rising vs. falling histograms are visually distinguished.',
      whatItShows: 'The same MACD/Signal structure as classic MACD but histogram bars are coloured: strong bull, weak bull, strong bear, weak bear.',
      howItHelps: 'Colour transitions from strong bull → weak bull signal early deceleration, giving earlier exit warnings than a standard histogram.',
    },
    formula: 'Hist = MACD - Signal; \\text{ colour} = \\begin{cases} \\text{strong bull} & Hist > 0 \\wedge Hist > Hist_{t-1}\\\\ \\text{weak bull} & Hist > 0 \\wedge Hist \\le Hist_{t-1}\\\\ \\text{weak bear} & Hist < 0 \\wedge Hist \\ge Hist_{t-1}\\\\ \\text{strong bear} & Hist < 0 \\wedge Hist < Hist_{t-1} \\end{cases}',
    formulaLegend: [
      { symbol: 'MACD', explanation: 'Fast EMA − Slow EMA' },
      { symbol: 'Signal', explanation: 'EMA of MACD' },
      { symbol: 'Hist_{t-1}', explanation: 'Previous bar histogram value — used to detect acceleration' },
    ],
    parameters: [
      { name: 'Fast Period',   symbol: 'f', defaultValue: 12, min: 1, description: 'Fast EMA period' },
      { name: 'Slow Period',   symbol: 's', defaultValue: 26, min: 1, description: 'Slow EMA period' },
      { name: 'Signal Period', symbol: 'g', defaultValue: 9,  min: 1, description: 'Signal EMA period' },
    ],
    category: 'Momentum',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // VOLATILITY
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'atr',
    title: 'Average True Range',
    shortDescription: "J. Welles Wilder's measure of market volatility based on the true range of each bar.",
    fullDescription: {
      assumptions: 'Volatility gaps and overnight moves should be included in any true measure of a bar\'s range.',
      whatItShows: 'The average true range of price over n bars — higher ATR means more volatility.',
      howItHelps: 'Used for stop placement (e.g., 2× ATR trailing stop), position sizing, and identifying volatility breakouts.',
    },
    formula: 'TR_t = \\max(H - L,\\;|H - C_{t-1}|,\\;|L - C_{t-1}|), \\quad ATR_n = RMA_n(TR)',
    formulaLegend: [
      { symbol: 'H, L', explanation: 'Current bar high and low' },
      { symbol: 'C_{t-1}', explanation: 'Previous closing price' },
      { symbol: 'RMA_n', explanation: "Wilder's smoothed average over n periods" },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 14, min: 1, description: 'Smoothing period' },
    ],
    category: 'Volatility',
  },

  {
    id: 'adr',
    title: 'Average Daily Range',
    shortDescription: 'The average high-minus-low range over n bars — a simple volatility gauge without gap adjustment.',
    fullDescription: {
      assumptions: 'The intraday high-low span is the most intuitive measure of how much price typically moves.',
      whatItShows: 'The average bar range in price units; useful for setting realistic intraday targets.',
      howItHelps: 'Day traders use ADR to estimate daily profit targets and stop distances; high ADR = more opportunity and risk.',
    },
    formula: 'ADR_n = \\frac{1}{n}\\sum_{i=0}^{n-1}(H_{t-i} - L_{t-i})',
    formulaLegend: [
      { symbol: 'H_{t-i}', explanation: 'High of bar i bars ago' },
      { symbol: 'L_{t-i}', explanation: 'Low of bar i bars ago' },
      { symbol: 'n', explanation: 'Period' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 14, min: 1, description: 'Averaging period' },
    ],
    category: 'Volatility',
  },

  {
    id: 'standard-deviation',
    title: 'Standard Deviation',
    shortDescription: 'The statistical standard deviation of closing prices over n periods — a direct measure of price dispersion.',
    fullDescription: {
      assumptions: 'The further prices scatter from their mean, the higher the uncertainty and risk in the market.',
      whatItShows: 'Rising values indicate increasing volatility; falling values indicate consolidation.',
      howItHelps: 'Used to size positions (risk parity), set stop distances, and identify breakout conditions.',
    },
    formula: '\\sigma_n = \\sqrt{\\frac{1}{n}\\sum_{i=0}^{n-1}(C_{t-i} - \\bar{C})^2}',
    formulaLegend: [
      { symbol: '\\bar{C}', explanation: 'Mean closing price over the n-period window' },
      { symbol: 'C_{t-i}', explanation: 'Closing price i bars ago' },
      { symbol: 'n', explanation: 'Period' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 20, min: 2, description: 'Window for variance calculation' },
    ],
    category: 'Volatility',
  },

  {
    id: 'historical-volatility',
    title: 'Historical Volatility',
    shortDescription: 'Annualised standard deviation of log returns — the standard finance definition of realised volatility.',
    fullDescription: {
      assumptions: 'Log returns are approximately normally distributed, making their standard deviation a meaningful risk metric.',
      whatItShows: 'The annualised percentage volatility — directly comparable to implied volatility from options.',
      howItHelps: 'Options traders compare HV to IV to judge whether options are cheap or expensive; trend traders use HV spikes as reversal signals.',
    },
    formula: 'HV = \\sigma\\!\\left(\\ln\\frac{C_t}{C_{t-1}}\\right) \\times \\sqrt{252} \\times 100',
    formulaLegend: [
      { symbol: '\\ln(C_t/C_{t-1})', explanation: 'Log return from bar to bar' },
      { symbol: '\\sigma', explanation: 'Standard deviation of log returns over n periods' },
      { symbol: '\\sqrt{252}', explanation: 'Annualisation factor (252 trading days per year)' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 20, min: 2, description: 'Lookback for standard deviation' },
    ],
    category: 'Volatility',
  },

  {
    id: 'bb-bandwidth',
    title: 'Bollinger Bandwidth',
    shortDescription: 'The width of the Bollinger Bands as a percentage of the middle band — a pure volatility/squeeze indicator.',
    fullDescription: {
      assumptions: 'Periods of very low bandwidth (the "Bollinger squeeze") precede explosive volatility expansions.',
      whatItShows: 'Low bandwidth = low volatility / squeeze; high bandwidth = high volatility / trend extension.',
      howItHelps: 'Multi-year low bandwidth signals high-probability squeeze setups; bandwidth spikes confirm breakout entries.',
    },
    formula: 'BW = \\frac{Upper - Lower}{Middle} \\times 100, \\quad Upper/Lower = SMA_n \\pm k\\,\\sigma_n',
    formulaLegend: [
      { symbol: 'Upper, Lower', explanation: 'Bollinger Bands = SMA ± k·σ' },
      { symbol: 'Middle', explanation: 'SMA of closing price over n periods' },
      { symbol: 'k', explanation: 'Standard deviation multiplier (default 2)' },
    ],
    parameters: [
      { name: 'Period',   symbol: 'n', defaultValue: 20,  min: 1,   description: 'Bollinger Band SMA period' },
      { name: 'Std Dev',  symbol: 'k', defaultValue: 2.0, min: 0.1, description: 'Band width multiplier' },
    ],
    category: 'Volatility',
  },

  {
    id: 'bollinger-bars',
    title: 'Bollinger Bars',
    shortDescription: 'Colours each price bar based on its position relative to the Bollinger Bands to show volatility context at a glance.',
    fullDescription: {
      assumptions: 'Bar colour reflecting BB position is a more immediate visual signal than drawing the bands themselves.',
      whatItShows: 'Bars outside the bands are colour-coded for immediate overbought/oversold identification; inside bars show consolidation.',
      howItHelps: 'Quick visual scan of historical volatility extremes without cluttering the chart with additional lines.',
    },
    formula: '\\text{colour} = \\begin{cases} \\text{overbought} & C > Upper_{BB} \\\\ \\text{oversold} & C < Lower_{BB} \\\\ \\text{neutral} & \\text{otherwise} \\end{cases}',
    formulaLegend: [
      { symbol: 'C', explanation: 'Closing price' },
      { symbol: 'Upper_{BB}', explanation: 'Upper Bollinger Band = SMA + k·σ' },
      { symbol: 'Lower_{BB}', explanation: 'Lower Bollinger Band = SMA − k·σ' },
    ],
    parameters: [
      { name: 'Period',  symbol: 'n', defaultValue: 20,  min: 1,   description: 'Bollinger Band SMA period' },
      { name: 'Std Dev', symbol: 'k', defaultValue: 2.0, min: 0.1, description: 'Band width multiplier' },
    ],
    category: 'Volatility',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // TREND
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'parabolic-sar',
    title: 'Parabolic SAR',
    shortDescription: "Wilder's trailing stop system that accelerates toward price during a trend and reverses when price turns.",
    fullDescription: {
      assumptions: 'Trends accelerate over time; the stop should tighten as the trend matures.',
      whatItShows: 'Dots above price = downtrend; dots below price = uptrend. The dot IS the trailing stop level.',
      howItHelps: 'Provides automatic trailing stop placement; flips to the opposite side when price crosses the stop.',
    },
    formula: 'SAR_{t+1} = SAR_t + AF \\cdot (EP - SAR_t)',
    formulaLegend: [
      { symbol: 'SAR_t', explanation: 'Current stop and reverse level' },
      { symbol: 'AF', explanation: 'Acceleration factor — starts at step, increments each new extreme, capped at max' },
      { symbol: 'EP', explanation: 'Extreme point — highest high in uptrend or lowest low in downtrend' },
    ],
    parameters: [
      { name: 'Step', symbol: 'step', defaultValue: 0.02, min: 0.001, description: 'AF increment per new extreme point' },
      { name: 'Max',  symbol: 'max',  defaultValue: 0.2,  min: 0.001, description: 'Maximum acceleration factor' },
    ],
    category: 'Trend',
  },

  {
    id: 'supertrend',
    title: 'Supertrend',
    shortDescription: 'An ATR-based trailing stop/trend line that flips between upper and lower bands as price breaks through.',
    fullDescription: {
      assumptions: 'ATR scales the band width to current volatility, making the indicator adaptive across different market conditions.',
      whatItShows: 'A single line below price in an uptrend (green) and above price in a downtrend (red).',
      howItHelps: 'Clean, visual trend-following system; crossovers provide clear buy/sell signals with built-in stop placement.',
    },
    formula: 'UB = \\tfrac{H+L}{2} + k \\cdot ATR_n, \\quad LB = \\tfrac{H+L}{2} - k \\cdot ATR_n',
    formulaLegend: [
      { symbol: '(H+L)/2', explanation: 'Bar midpoint' },
      { symbol: 'ATR_n', explanation: 'Average True Range over n periods' },
      { symbol: 'k', explanation: 'ATR multiplier — controls band distance' },
    ],
    parameters: [
      { name: 'Period',     symbol: 'n', defaultValue: 10,  min: 1,   description: 'ATR lookback period' },
      { name: 'Multiplier', symbol: 'k', defaultValue: 3.0, min: 0.1, description: 'ATR band multiplier' },
    ],
    category: 'Trend',
  },

  {
    id: 'aroon',
    title: 'Aroon',
    shortDescription: 'Measures how long ago the highest high and lowest low occurred within the n-period window.',
    fullDescription: {
      assumptions: 'A new high near the end of the period indicates an uptrend; a new low indicates a downtrend.',
      whatItShows: 'Aroon Up and Down lines (0–100) plus an oscillator. Aroon Up above 70 confirms bullish trend.',
      howItHelps: 'Trend identification and trend strength assessment; crossovers of the Up and Down lines signal trend changes.',
    },
    formula: 'Aroon_{Up} = \\frac{n - P_{HH}}{n} \\times 100, \\quad Aroon_{Down} = \\frac{n - P_{LL}}{n} \\times 100',
    formulaLegend: [
      { symbol: 'P_{HH}', explanation: 'Number of bars since the n-period highest high' },
      { symbol: 'P_{LL}', explanation: 'Number of bars since the n-period lowest low' },
      { symbol: 'n', explanation: 'Lookback period' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 25, min: 2, description: 'Aroon lookback window' },
    ],
    category: 'Trend',
  },

  {
    id: 'mass-index',
    title: 'Mass Index',
    shortDescription: "Donald Dorsey's reversal indicator that detects narrowing and widening of the high-low range via a double-EMA ratio.",
    fullDescription: {
      assumptions: 'Extreme widening of the range followed by narrowing ("reversal bulge") signals a trend reversal.',
      whatItShows: 'Cumulative ratio of 9-period EMA of the range to the 9-period EMA of that EMA; reversal bulge when MI crosses 27 then drops below 26.5.',
      howItHelps: 'Identifies potential turning points regardless of direction; confirm with another trend indicator after the bulge signal.',
    },
    formula: 'MI = \\sum_{i=1}^{25} \\frac{EMA_9(H_i - L_i)}{EMA_9(EMA_9(H_i - L_i))}',
    formulaLegend: [
      { symbol: 'H_i - L_i', explanation: 'High-Low range for bar i' },
      { symbol: 'EMA_9', explanation: '9-period exponential moving average' },
    ],
    parameters: [
      { name: 'Sum Period',   symbol: 'm', defaultValue: 25, min: 1, description: 'Number of bars to sum the ratio' },
      { name: 'EMA Period',   symbol: 'e', defaultValue: 9,  min: 1, description: 'EMA period for range smoothing' },
    ],
    category: 'Trend',
  },

  {
    id: 'vortex',
    title: 'Vortex Indicator',
    shortDescription: "Etienne Botes and Douglas Siepman's indicator capturing the two rotational movements of price.",
    fullDescription: {
      assumptions: 'The distance from the current high to the prior low (upward vortex) and current low to prior high (downward vortex) reveal trend energy.',
      whatItShows: 'VI+ and VI− lines: when VI+ crosses above VI−, a new uptrend is starting; the reverse signals a downtrend.',
      howItHelps: 'Trend initiation signals with built-in smoothing via the n-period sum; works well on daily charts.',
    },
    formula: 'VI^+_n = \\frac{\\sum_{i=1}^{n}|H_t - L_{t-1}|}{\\sum_{i=1}^{n} TR_t}, \\quad VI^-_n = \\frac{\\sum_{i=1}^{n}|L_t - H_{t-1}|}{\\sum_{i=1}^{n} TR_t}',
    formulaLegend: [
      { symbol: '|H_t - L_{t-1}|', explanation: 'Upward movement: current high to prior low' },
      { symbol: '|L_t - H_{t-1}|', explanation: 'Downward movement: current low to prior high' },
      { symbol: 'TR_t', explanation: 'True Range of bar t' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 14, min: 2, description: 'Sum window for movements and ATR' },
    ],
    category: 'Trend',
  },

  {
    id: 'williams-alligator',
    title: 'Williams Alligator',
    shortDescription: "Bill Williams' three-SMMA system (Jaw, Teeth, Lips) modelling an alligator's feeding behaviour.",
    fullDescription: {
      assumptions: 'Markets spend most time in non-trending "sleeping" phases; the Alligator wakes and eats during trends.',
      whatItShows: 'Three offset SMMA lines — when intertwined, the alligator sleeps (range); when diverging, it is eating (trend).',
      howItHelps: 'Avoid trading in consolidation; enter when lines diverge and price breaks out in one direction.',
    },
    formula: 'Jaw = SMMA_{13}(M)_{+8}, \\quad Teeth = SMMA_8(M)_{+5}, \\quad Lips = SMMA_5(M)_{+3}, \\quad M = \\tfrac{H+L}{2}',
    formulaLegend: [
      { symbol: 'SMMA_n', explanation: 'Smoothed Moving Average over n periods' },
      { symbol: 'M', explanation: 'Median price = (High + Low) / 2' },
      { symbol: '+k', explanation: 'Forward shift of k bars (plotted ahead)' },
    ],
    parameters: [
      { name: 'Jaw Period',   symbol: 'j', defaultValue: 13, min: 1, description: 'Blue line SMMA period' },
      { name: 'Teeth Period', symbol: 't', defaultValue: 8,  min: 1, description: 'Red line SMMA period' },
      { name: 'Lips Period',  symbol: 'l', defaultValue: 5,  min: 1, description: 'Green line SMMA period' },
    ],
    category: 'Trend',
  },

  {
    id: 'zig-zag',
    title: 'Zig Zag',
    shortDescription: 'Connects significant swing highs and lows by filtering out moves smaller than a percentage threshold.',
    fullDescription: {
      assumptions: 'Only price swings larger than the threshold represent meaningful market structure.',
      whatItShows: 'A simplified price path showing only significant highs and lows, eliminating minor noise.',
      howItHelps: 'Identifies chart patterns (head-and-shoulders, double tops/bottoms), Fibonacci levels, and wave counts cleanly.',
    },
    formula: '\\text{New pivot when: } |\\Delta\\%| \\geq \\delta, \\quad \\Delta\\% = \\frac{|C - C_{\\text{last pivot}}|}{C_{\\text{last pivot}}} \\times 100',
    formulaLegend: [
      { symbol: '\\delta', explanation: 'Minimum percentage move required to register a new pivot' },
      { symbol: 'C_{\\text{last pivot}}', explanation: 'Price level of the most recent confirmed pivot' },
    ],
    parameters: [
      { name: 'Deviation %', symbol: '\\delta', defaultValue: 5, min: 0.1, description: 'Minimum % swing to form a new pivot' },
    ],
    category: 'Trend',
  },

  {
    id: 'chande-kroll-stop',
    title: 'Chande Kroll Stop',
    shortDescription: "Tushar Chande and Stanley Kroll's ATR-based stop-loss system with dual short/long stop lines.",
    fullDescription: {
      assumptions: 'Trailing stops derived from ATR adapt to volatility; applying a second ATR multiple produces a more robust stop.',
      whatItShows: 'Two stop lines — when price is above both, the trend is up (long); below both, the trend is down (short).',
      howItHelps: 'More stable than single ATR stops; reduces noise-driven stop-outs while maintaining trend-following discipline.',
    },
    formula: 'First_{\\pm} = ATR_{atr} \\text{ based stop}; \\quad Stop = \\max/\\min_{q}(First_{\\pm})',
    formulaLegend: [
      { symbol: 'ATR_{atr}', explanation: 'ATR over the first (atr) period' },
      { symbol: 'q', explanation: 'Second lookback period for the final stop calculation' },
    ],
    parameters: [
      { name: 'ATR Period', symbol: 'p',   defaultValue: 10,  min: 1,   description: 'First ATR calculation period' },
      { name: 'ATR Mult',   symbol: 'x',   defaultValue: 1.0, min: 0.1, description: 'ATR multiplier for first stop' },
      { name: 'Slow Period', symbol: 'q',  defaultValue: 9,   min: 1,   description: 'Lookback for final stop smoothing' },
    ],
    category: 'Trend',
  },

  {
    id: 'williams-fractals',
    title: 'Williams Fractals',
    shortDescription: "Bill Williams' fractal pattern — marks pivot highs and lows where price reversed after at least 5 bars.",
    fullDescription: {
      assumptions: 'Local price extremes that are higher/lower than the surrounding bars represent meaningful structural pivots.',
      whatItShows: 'Up arrows at fractal highs (bar high is highest of the n surrounding bars); down arrows at fractal lows.',
      howItHelps: 'Used to identify support/resistance levels and as entry filters; breaking a fractal in the trend direction confirms continuation.',
    },
    formula: '\\text{Fractal High: } H_t = \\max(H_{t-n},\\ldots,H_{t+n}); \\quad \\text{Fractal Low: } L_t = \\min(L_{t-n},\\ldots,L_{t+n})',
    formulaLegend: [
      { symbol: 'H_t', explanation: 'High of the centre bar' },
      { symbol: 'L_t', explanation: 'Low of the centre bar' },
      { symbol: 'n', explanation: 'Number of bars on each side required to confirm the fractal (default 2)' },
    ],
    parameters: [
      { name: 'Bars Each Side', symbol: 'n', defaultValue: 2, min: 1, description: 'Confirmation bars on each side' },
    ],
    category: 'Trend',
  },

  {
    id: 'coral-trend',
    title: 'Coral Trend',
    shortDescription: 'A custom EMA-based smoothing that applies a dynamically scaled coefficient to produce an ultra-smooth trend line.',
    fullDescription: {
      assumptions: 'A dynamically scaled smoothing factor adapts to volatility, providing a cleaner trend line than fixed-parameter averages.',
      whatItShows: 'A single colour-changing line — green above price signals uptrend; red below price signals downtrend.',
      howItHelps: 'Simple visual trend filter; used as a colour-coded background signal to only take trades in the trend direction.',
    },
    formula: 'CT_t = \\alpha \\cdot C_t + (1-\\alpha)^2 \\cdot CT_{t-1}, \\quad \\alpha = \\frac{2}{n+1}',
    formulaLegend: [
      { symbol: '\\alpha', explanation: 'EMA smoothing factor derived from period n' },
      { symbol: 'n', explanation: 'Period parameter controlling smoothness' },
      { symbol: 'CT_{t-1}', explanation: 'Previous Coral Trend value' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 21, min: 1, description: 'Trend smoothing period' },
    ],
    category: 'Trend',
  },

  {
    id: 'chandelier-exit',
    title: 'Chandelier Exit',
    shortDescription: 'ATR-based chandelier trailing stop with separate long and short stop lines.',
    fullDescription: {
      assumptions: 'Hanging the stop from the highest high (long) or lowest low (short) like a chandelier from the ceiling produces a natural trailing exit.',
      whatItShows: 'Long stop = highest(High, n) − k·ATR; short stop = lowest(Low, n) + k·ATR.',
      howItHelps: 'Keeps you in trends during pullbacks while exiting on genuine reversals; widely used as an objective exit rule.',
    },
    formula: 'Long_{stop} = \\max_n(H) - k \\cdot ATR_n, \\quad Short_{stop} = \\min_n(L) + k \\cdot ATR_n',
    formulaLegend: [
      { symbol: '\\max_n(H)', explanation: 'Highest high over n periods' },
      { symbol: '\\min_n(L)', explanation: 'Lowest low over n periods' },
      { symbol: 'ATR_n', explanation: 'Average True Range over n periods' },
      { symbol: 'k', explanation: 'ATR multiplier (default 2 or 3)' },
    ],
    parameters: [
      { name: 'Period',     symbol: 'n', defaultValue: 22,  min: 1,   description: 'ATR and H/L lookback' },
      { name: 'Multiplier', symbol: 'k', defaultValue: 3.0, min: 0.1, description: 'ATR multiplier for stop distance' },
    ],
    category: 'Trend',
  },

  {
    id: 'donchian-trend-ribbon',
    title: 'Donchian Trend Ribbon',
    shortDescription: 'A fan of Donchian channel midlines across multiple periods — ribbon width indicates trend strength.',
    fullDescription: {
      assumptions: 'When multiple Donchian midlines align and spread, a strong trend exists; when compressed, the market is ranging.',
      whatItShows: 'Multiple midlines of Donchian channels; aligned and spreading lines confirm a trend; overlapping lines signal consolidation.',
      howItHelps: 'Visual trend-quality filter; trade with the ribbon, not against it when lines are well-ordered.',
    },
    formula: 'Mid_i = \\frac{\\max_{n_i}(H) + \\min_{n_i}(L)}{2}, \\quad n_i = start + (i-1) \\cdot step',
    formulaLegend: [
      { symbol: 'Mid_i', explanation: 'Midline of the i-th Donchian channel' },
      { symbol: '\\max_{n_i}(H)', explanation: 'Highest high over period n_i' },
      { symbol: '\\min_{n_i}(L)', explanation: 'Lowest low over period n_i' },
    ],
    parameters: [
      { name: 'Start Period', symbol: 'start', defaultValue: 5,  min: 1, description: 'Shortest channel period' },
      { name: 'Step',         symbol: 'step',  defaultValue: 5,  min: 1, description: 'Period increment per line' },
      { name: 'Count',        symbol: 'k',     defaultValue: 8,  min: 2, description: 'Number of channel midlines' },
    ],
    category: 'Trend',
  },

  {
    id: 'twap',
    title: 'Time-Weighted Average Price',
    shortDescription: 'The arithmetic average of a bar\'s four price components (O, H, L, C) over a rolling period.',
    fullDescription: {
      assumptions: 'Institutional execution algorithms use TWAP as a benchmark; deviations from TWAP signal potential reversion.',
      whatItShows: 'A smooth average of the full-bar price level, less susceptible to close-price manipulation.',
      howItHelps: 'Used as a fair-value benchmark for execution; price far above TWAP may revert, far below may recover.',
    },
    formula: 'TWAP_n = \\frac{1}{n}\\sum_{i=0}^{n-1}\\frac{O_{t-i}+H_{t-i}+L_{t-i}+C_{t-i}}{4}',
    formulaLegend: [
      { symbol: 'O, H, L, C', explanation: 'Open, High, Low, Close of each bar' },
      { symbol: 'n', explanation: 'Rolling window length' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 20, min: 1, description: 'Rolling TWAP window' },
    ],
    category: 'Trend',
  },

  {
    id: 'adx',
    title: 'Average Directional Index',
    shortDescription: "Wilder's indicator measuring trend strength (not direction) on a 0–100 scale.",
    fullDescription: {
      assumptions: 'Directional movement indicators, smoothed and normalised, reveal how strongly price is trending regardless of direction.',
      whatItShows: 'ADX above 25 indicates a strong trend; below 20 indicates a weak or ranging market. +DI and −DI show trend direction.',
      howItHelps: 'Filter for other systems — only take trend-following signals when ADX > 25; +DI/−DI crossovers signal trend direction changes.',
    },
    formula: 'ADX = 100 \\cdot RMA_n\\!\\left(\\frac{|{+DI} - {-DI}|}{+DI + {-DI}}\\right)',
    formulaLegend: [
      { symbol: '+DI', explanation: '+Directional Index = 100 × RMA(+DM) / ATR' },
      { symbol: '-DI', explanation: '−Directional Index = 100 × RMA(−DM) / ATR' },
      { symbol: '+DM', explanation: 'Positive Directional Movement = max(H − H_{prev}, 0) if > |L − L_{prev}|' },
      { symbol: '-DM', explanation: 'Negative Directional Movement = max(|L − L_{prev}|, 0) if > H − H_{prev}' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 14, min: 1, description: 'Smoothing period for DI and ADX' },
    ],
    category: 'Trend',
  },

  {
    id: 'dmi',
    title: 'Directional Movement Index',
    shortDescription: "The +DI and −DI components of Wilder's ADX system shown independently as a trend-direction indicator.",
    fullDescription: {
      assumptions: '+DI capturing upward directional movement and −DI capturing downward movement together reveal trend bias.',
      whatItShows: '+DI above −DI = bullish trend; −DI above +DI = bearish trend; the spread indicates trend strength.',
      howItHelps: '+DI/−DI crossovers are direct buy/sell signals; used alongside ADX to filter for strong trending periods.',
    },
    formula: '+DI_n = 100 \\cdot \\frac{RMA_n(+DM)}{ATR_n}, \\quad -DI_n = 100 \\cdot \\frac{RMA_n(-DM)}{ATR_n}',
    formulaLegend: [
      { symbol: '+DM', explanation: 'Positive Directional Movement for each bar' },
      { symbol: '-DM', explanation: 'Negative Directional Movement for each bar' },
      { symbol: 'ATR_n', explanation: 'Average True Range over n periods' },
      { symbol: 'RMA_n', explanation: "Wilder's smoothed average" },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 14, min: 1, description: 'ADX/DI smoothing period' },
    ],
    category: 'Trend',
  },

  {
    id: 'ichimoku',
    title: 'Ichimoku Cloud',
    shortDescription: "Goichi Hosoda's all-in-one trend system using five lines to show support, resistance, trend, and momentum.",
    fullDescription: {
      assumptions: 'Multiple timeframe midpoints projected forward create a visual cloud that summarises the trend structure.',
      whatItShows: 'Tenkan (conversion), Kijun (base), Senkou A/B (future cloud), and Chikou (lagging span) lines.',
      howItHelps: 'Price above the cloud is bullish; price inside is ranging; below is bearish. TK crosses are entry signals.',
    },
    formula: 'Tenkan = \\frac{H_9+L_9}{2}, \\; Kijun = \\frac{H_{26}+L_{26}}{2}, \\; SpanA = \\frac{Tenkan+Kijun}{2}_{\\;+26}, \\; SpanB = \\frac{H_{52}+L_{52}}{2}_{\\;+26}',
    formulaLegend: [
      { symbol: 'Tenkan', explanation: '9-period midpoint (Conversion Line)' },
      { symbol: 'Kijun', explanation: '26-period midpoint (Base Line)' },
      { symbol: 'SpanA', explanation: 'Average of Tenkan and Kijun, plotted 26 bars ahead' },
      { symbol: 'SpanB', explanation: '52-period midpoint, plotted 26 bars ahead — forms the "cloud"' },
      { symbol: 'Chikou', explanation: 'Current close plotted 26 bars back' },
    ],
    parameters: [
      { name: 'Conversion Period', symbol: 'c', defaultValue: 9,  min: 1, description: 'Tenkan-sen period' },
      { name: 'Base Period',       symbol: 'b', defaultValue: 26, min: 1, description: 'Kijun-sen period' },
      { name: 'Span B Period',     symbol: 's', defaultValue: 52, min: 1, description: 'Senkou Span B period' },
    ],
    category: 'Trend',
  },

  {
    id: 'choppiness',
    title: 'Choppiness Index',
    shortDescription: 'Measures whether the market is trending (low values) or ranging/choppy (high values) on a 100–log10(n) to 100 scale.',
    fullDescription: {
      assumptions: 'In a trending market, the sum of ATR bars is close to the total range; in a choppy market, it greatly exceeds it.',
      whatItShows: 'Values near 100 indicate maximum choppiness; values near 38.2 (for n=14) indicate a strong trend.',
      howItHelps: 'Use as a regime filter — switch from trend-following to mean-reversion strategies when CI is above 61.8.',
    },
    formula: 'CI_n = \\frac{100 \\cdot \\log_{10}\\!\\left(\\dfrac{\\sum_{i=1}^{n} ATR_1}{H_n - L_n}\\right)}{\\log_{10}(n)}',
    formulaLegend: [
      { symbol: '\\sum ATR_1', explanation: 'Sum of 1-period true ranges over n bars' },
      { symbol: 'H_n - L_n', explanation: 'Total high-low range over n periods' },
      { symbol: '\\log_{10}(n)', explanation: 'Normalisation factor based on period length' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 14, min: 2, description: 'Lookback window' },
    ],
    category: 'Trend',
  },

  {
    id: 'bb-trend',
    title: 'BB Trend',
    shortDescription: 'Identifies trend direction and strength using the relative position and width of Bollinger Bands.',
    fullDescription: {
      assumptions: 'A price persistently hugging the upper band is in a strong uptrend; the lower band signals a downtrend.',
      whatItShows: 'A colour-coded trend signal derived from the relationship between price and the Bollinger Bands.',
      howItHelps: 'Simple visual trend confirmation; used as a filter to only take signals aligned with the dominant band direction.',
    },
    formula: '\\text{Trend} = \\text{sign}\\!\\left(C - \\frac{Upper + Lower}{2}\\right) \\cdot \\frac{Upper - Lower}{\\sigma_n}',
    formulaLegend: [
      { symbol: 'C', explanation: 'Closing price' },
      { symbol: 'Upper, Lower', explanation: 'Upper and lower Bollinger Bands' },
      { symbol: '\\sigma_n', explanation: 'n-period standard deviation — normalises trend strength' },
    ],
    parameters: [
      { name: 'Period',     symbol: 'n', defaultValue: 20,  min: 1,   description: 'Bollinger Band period' },
      { name: 'Multiplier', symbol: 'k', defaultValue: 2.0, min: 0.1, description: 'Standard deviation multiplier' },
    ],
    category: 'Trend',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CHANNELS & BANDS
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'bollinger-bands',
    title: 'Bollinger Bands',
    shortDescription: 'Price envelope built from a 20-period SMA ± 2 standard deviations — expands in volatility, contracts in calm.',
    fullDescription: {
      assumptions: 'Price tends to stay within the bands roughly 95% of the time, and volatility is mean-reverting — wide bands eventually contract, narrow bands eventually expand.',
      whatItShows: 'Three lines: a central SMA and an upper/lower band each k standard deviations away. Band width reflects current volatility; the bands act as dynamic support and resistance levels.',
      howItHelps: 'Traders look for price tags of the upper band (potential overbought) and lower band (potential oversold), "Bollinger Squeezes" (tight bands) as breakout setups, and %B to quantify position within the bands.',
    },
    formula: 'Upper_t = SMA_n(C) + k\\,\\sigma_n,\\quad Middle_t = SMA_n(C),\\quad Lower_t = SMA_n(C) - k\\,\\sigma_n',
    formulaLegend: [
      { symbol: 'SMA_n(C)', explanation: 'Simple moving average of closing price over n periods' },
      { symbol: 'k', explanation: 'Multiplier — number of standard deviations from the middle band' },
      { symbol: '\\sigma_n', explanation: 'Population standard deviation of closing price over n periods' },
      { symbol: 'n', explanation: 'Lookback period (default 20)' },
      { symbol: 'C', explanation: 'Closing price' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 20, min: 2, description: 'SMA period used for the middle band and standard deviation calculation' },
      { name: 'Multiplier', symbol: 'k', defaultValue: 2, min: 0.1, description: 'Number of standard deviations to offset the upper and lower bands' },
    ],
    category: 'Channels & Bands',
  },

  {
    id: 'keltner-channels',
    title: 'Keltner Channels',
    shortDescription: 'Volatility channel using an EMA midline ± ATR multiples — smoother than Bollinger Bands.',
    fullDescription: {
      assumptions: 'Average True Range is a better measure of current volatility than standard deviation because it accounts for gaps; price oscillates around a central EMA trend line.',
      whatItShows: 'Three lines: an EMA middle band flanked by upper and lower bands separated by a multiple of ATR. The channel expands and contracts with price volatility, remaining smooth because both the midline and ATR use exponential smoothing.',
      howItHelps: 'Breakouts above the upper band signal strong momentum to the upside; breakouts below the lower band signal strong downside momentum. Combined with Bollinger Bands (when BB is inside Keltner), the "Squeeze" pattern predicts low-volatility breakouts.',
    },
    formula: 'Middle_t = EMA_n(C),\\quad Upper_t = EMA_n(C) + m\\cdot ATR_a,\\quad Lower_t = EMA_n(C) - m\\cdot ATR_a',
    formulaLegend: [
      { symbol: 'EMA_n(C)', explanation: 'Exponential moving average of closing price over n periods' },
      { symbol: 'm', explanation: 'ATR multiplier (default 2)' },
      { symbol: 'ATR_a', explanation: 'Average True Range over a periods' },
      { symbol: 'n', explanation: 'EMA period (default 20)' },
      { symbol: 'a', explanation: 'ATR period (default 10)' },
      { symbol: 'C', explanation: 'Closing price' },
    ],
    parameters: [
      { name: 'EMA Period', symbol: 'n', defaultValue: 20, min: 1, description: 'Period for the central exponential moving average' },
      { name: 'ATR Period', symbol: 'a', defaultValue: 10, min: 1, description: 'Period for the Average True Range calculation' },
      { name: 'Multiplier', symbol: 'm', defaultValue: 2, min: 0.1, description: 'Number of ATRs to offset the upper and lower bands' },
    ],
    category: 'Channels & Bands',
  },

  {
    id: 'donchian-channels',
    title: 'Donchian Channels',
    shortDescription: 'Highest-high and lowest-low over n bars — the original trend-following channel from Richard Donchian.',
    fullDescription: {
      assumptions: "Breakouts beyond recent price extremes indicate genuine momentum rather than noise; the market's recent range defines the boundaries of \"normal\" price action.",
      whatItShows: 'Three lines: the highest high (upper band), lowest low (lower band), and their midpoint over a rolling n-bar window. The channel visually shows the current trading range and narrows when the market consolidates.',
      howItHelps: 'A close above the upper band is a breakout buy signal (the classic Turtle Trading entry); a close below the lower band is a breakout sell. The midline acts as a mean-reversion target. Narrow channels warn of impending high-volatility moves.',
    },
    formula: 'Upper_t = \\max_{i=0}^{n-1}(H_{t-i}),\\quad Lower_t = \\min_{i=0}^{n-1}(L_{t-i}),\\quad Middle_t = \\frac{Upper_t + Lower_t}{2}',
    formulaLegend: [
      { symbol: 'H_{t-i}', explanation: 'High price i bars ago' },
      { symbol: 'L_{t-i}', explanation: 'Low price i bars ago' },
      { symbol: 'n', explanation: 'Lookback period (default 20)' },
      { symbol: 'Upper_t', explanation: 'Highest high over the n-bar window' },
      { symbol: 'Lower_t', explanation: 'Lowest low over the n-bar window' },
      { symbol: 'Middle_t', explanation: 'Midpoint of upper and lower bands' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 20, min: 1, description: 'Number of bars used to compute the highest high and lowest low' },
    ],
    category: 'Channels & Bands',
  },

  {
    id: 'envelope',
    title: 'Moving Average Envelope',
    shortDescription: 'Two bands plotted a fixed percentage above and below a moving average — simple overbought/oversold channel.',
    fullDescription: {
      assumptions: 'Price deviates from its moving average by a relatively constant percentage; extreme deviations are temporary and tend to revert back toward the average.',
      whatItShows: 'An upper and lower band placed a fixed percentage (d%) above and below a selected moving average. Unlike Bollinger Bands, the width is static and does not adapt to volatility.',
      howItHelps: 'When price reaches the upper envelope it may be overextended to the upside (potential short); when it reaches the lower envelope it may be overextended to the downside (potential long). Trend traders also use the bands as trailing profit targets.',
    },
    formula: 'Upper_t = MA_n \\cdot \\left(1 + \\frac{d}{100}\\right),\\quad Lower_t = MA_n \\cdot \\left(1 - \\frac{d}{100}\\right)',
    formulaLegend: [
      { symbol: 'MA_n', explanation: 'Moving average (SMA or EMA) of closing price over n periods' },
      { symbol: 'd', explanation: 'Percentage offset from the moving average (default 2.5)' },
      { symbol: 'n', explanation: 'Moving average period (default 20)' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 20, min: 1, description: 'Moving average period for the midline' },
      { name: 'Deviation %', symbol: 'd', defaultValue: 2.5, min: 0.1, description: 'Percentage distance of each band from the midline' },
    ],
    category: 'Channels & Bands',
  },

  {
    id: 'median',
    title: 'Median Channel',
    shortDescription: 'Midpoint price (median of high, low, close) with ATR-based upper and lower bands.',
    fullDescription: {
      assumptions: "The median price — average of high, low, and close — better represents a bar's fair value than the close alone; volatility (ATR) should determine band width rather than a fixed percentage.",
      whatItShows: 'A central line tracking the EMA of median price (HLC3), flanked by upper and lower bands set at a multiple of ATR. The result is an adaptive channel that widens in volatile markets and tightens in quiet ones.',
      howItHelps: 'Acts as a dynamic support/resistance channel. Traders buy the lower band and sell the upper band in ranging markets, or use breakouts beyond the bands as trend signals. The median EMA itself serves as a trend bias reference.',
    },
    formula: 'M_t = \\frac{H_t + L_t + C_t}{3},\\quad EMA_M = EMA_n(M),\\quad Upper_t = EMA_M + m\\cdot ATR_a,\\quad Lower_t = EMA_M - m\\cdot ATR_a',
    formulaLegend: [
      { symbol: 'M_t', explanation: 'Median (typical) price: average of high, low, and close' },
      { symbol: 'H_t', explanation: 'High price of the current bar' },
      { symbol: 'L_t', explanation: 'Low price of the current bar' },
      { symbol: 'C_t', explanation: 'Closing price of the current bar' },
      { symbol: 'EMA_M', explanation: 'Exponential moving average of the median price over n periods' },
      { symbol: 'n', explanation: 'EMA period (default 20)' },
      { symbol: 'm', explanation: 'ATR multiplier for band width (default 2)' },
      { symbol: 'ATR_a', explanation: 'Average True Range over a periods' },
      { symbol: 'a', explanation: 'ATR period (default 10)' },
    ],
    parameters: [
      { name: 'EMA Period', symbol: 'n', defaultValue: 20, min: 1, description: 'Period for the EMA of median price' },
      { name: 'ATR Period', symbol: 'a', defaultValue: 10, min: 1, description: 'Period for the Average True Range' },
      { name: 'Multiplier', symbol: 'm', defaultValue: 2, min: 0.1, description: 'ATR multiple used to offset upper and lower bands' },
    ],
    category: 'Channels & Bands',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // VOLUME
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'obv',
    title: 'On Balance Volume',
    shortDescription: 'Cumulative volume sum — adds volume on up-days, subtracts on down-days — to detect buying and selling pressure.',
    fullDescription: {
      assumptions: "Volume precedes price; a rising OBV without a rising price warns of accumulation, while falling OBV on stable prices warns of distribution.",
      whatItShows: "A running total that increments by the bar's volume when the close is higher than the previous close, and decrements by volume when the close is lower. The absolute level is meaningless — direction and divergences are what matter.",
      howItHelps: 'Bullish divergence (OBV rising, price falling) can warn of an upcoming price rally. Bearish divergence (OBV falling, price rising) warns of a coming decline. Trend confirmations: a healthy uptrend should see OBV making new highs alongside price.',
    },
    formula: 'OBV_t = OBV_{t-1} + \\begin{cases} +V_t & \\text{if } C_t > C_{t-1} \\\\ 0 & \\text{if } C_t = C_{t-1} \\\\ -V_t & \\text{if } C_t < C_{t-1} \\end{cases}',
    formulaLegend: [
      { symbol: 'OBV_{t-1}', explanation: 'On Balance Volume value from the previous bar' },
      { symbol: 'V_t', explanation: 'Volume of the current bar' },
      { symbol: 'C_t', explanation: 'Closing price of the current bar' },
      { symbol: 'C_{t-1}', explanation: 'Closing price of the previous bar' },
    ],
    parameters: [],
    category: 'Volume',
  },

  {
    id: 'mfi',
    title: 'Money Flow Index',
    shortDescription: 'Volume-weighted RSI measuring buying and selling pressure — values above 80 or below 20 signal extremes.',
    fullDescription: {
      assumptions: 'Price and volume together better reflect market sentiment than price alone; volume-heavy moves deserve more weight than low-volume moves of the same magnitude.',
      whatItShows: 'An oscillator ranging 0–100 that computes the ratio of positive money flow (bars where the typical price rose) to total money flow over n periods, weighted by volume. It behaves like a volume-weighted RSI.',
      howItHelps: 'Readings above 80 suggest overbought conditions; below 20 suggest oversold. Divergences between MFI and price — e.g., price at new highs while MFI fails to follow — are high-probability reversal signals. Failure swings add further confirmation.',
    },
    formula: 'TP_t = \\frac{H_t+L_t+C_t}{3},\\quad MF_t = TP_t \\cdot V_t,\\quad MFI = 100 - \\frac{100}{1 + \\dfrac{\\sum PMF_n}{\\sum NMF_n}}',
    formulaLegend: [
      { symbol: 'TP_t', explanation: 'Typical price: average of high, low, and close' },
      { symbol: 'H_t', explanation: 'High price' },
      { symbol: 'L_t', explanation: 'Low price' },
      { symbol: 'C_t', explanation: 'Closing price' },
      { symbol: 'V_t', explanation: 'Bar volume' },
      { symbol: 'MF_t', explanation: 'Raw money flow: typical price multiplied by volume' },
      { symbol: '\\sum PMF_n', explanation: 'Sum of positive money flow over n periods (bars where TP rose)' },
      { symbol: '\\sum NMF_n', explanation: 'Sum of negative money flow over n periods (bars where TP fell)' },
      { symbol: 'n', explanation: 'Lookback period (default 14)' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 14, min: 2, description: 'Number of bars used to accumulate positive and negative money flow' },
    ],
    category: 'Volume',
  },

  {
    id: 'pvt',
    title: 'Price Volume Trend',
    shortDescription: 'Cumulative sum of percentage price change × volume — similar to OBV but proportional to the size of each move.',
    fullDescription: {
      assumptions: "The significance of a volume bar should scale with how much price moved, not just its direction. A 5% up-move on heavy volume is more meaningful than a 0.1% up-move on the same volume.",
      whatItShows: "A running cumulative line where each bar contributes volume multiplied by the percentage change in closing price. Unlike OBV, it rewards large moves with proportionally larger additions, making it more sensitive to the magnitude of each day's change.",
      howItHelps: 'Rising PVT confirms an uptrend; falling PVT confirms a downtrend. Divergences between PVT and price — PVT lagging behind new price highs — are warnings of weakening momentum and potential reversals.',
    },
    formula: 'PVT_t = PVT_{t-1} + V_t \\cdot \\frac{C_t - C_{t-1}}{C_{t-1}}',
    formulaLegend: [
      { symbol: 'PVT_{t-1}', explanation: 'Price Volume Trend value from the previous bar' },
      { symbol: 'V_t', explanation: 'Volume of the current bar' },
      { symbol: 'C_t', explanation: 'Closing price of the current bar' },
      { symbol: 'C_{t-1}', explanation: 'Closing price of the previous bar' },
    ],
    parameters: [],
    category: 'Volume',
  },

  {
    id: 'volume-oscillator',
    title: 'Volume Oscillator',
    shortDescription: 'Difference between a fast and slow EMA of volume — shows whether volume is expanding or contracting.',
    fullDescription: {
      assumptions: 'Trend moves are sustained when volume is expanding relative to its recent average, and likely to stall when volume is contracting.',
      whatItShows: 'The difference between a short-period EMA of volume and a long-period EMA of volume. Positive values mean recent volume is above its longer-term average; negative values mean it is below.',
      howItHelps: 'Rising price on positive Volume Oscillator confirms the trend. Rising price on negative Volume Oscillator warns of a potential reversal. Divergences — price making new highs while the oscillator falls — are early reversal signals.',
    },
    formula: 'VO_t = EMA_{\\text{fast}}(V) - EMA_{\\text{slow}}(V)',
    formulaLegend: [
      { symbol: 'EMA_{\\text{fast}}(V)', explanation: 'Short-period exponential moving average of volume (default period 5)' },
      { symbol: 'EMA_{\\text{slow}}(V)', explanation: 'Long-period exponential moving average of volume (default period 10)' },
      { symbol: 'V', explanation: 'Bar volume' },
    ],
    parameters: [
      { name: 'Fast Period', symbol: 'f', defaultValue: 5, min: 1, description: 'Period for the fast EMA of volume' },
      { name: 'Slow Period', symbol: 's', defaultValue: 10, min: 2, description: 'Period for the slow EMA of volume' },
    ],
    category: 'Volume',
  },

  {
    id: 'chaikin-mf',
    title: 'Chaikin Money Flow',
    shortDescription: 'Rolling sum of volume-weighted close location over n bars — positive values indicate accumulation.',
    fullDescription: {
      assumptions: "Where the closing price falls within a bar's range reveals buying vs. selling pressure; closes near the high indicate accumulation and closes near the low indicate distribution.",
      whatItShows: 'The Money Flow Multiplier measures where price closed within each bar\'s range (–1 to +1). Multiplied by volume it gives Money Flow Volume. Summing that over n periods and dividing by total volume produces the CMF, oscillating roughly between –1 and +1.',
      howItHelps: 'Values above zero indicate net buying pressure (accumulation); below zero indicate net selling pressure (distribution). A sustained CMF above +0.25 is bullish; below –0.25 is bearish. Divergences with price warn of impending reversals.',
    },
    formula: 'MFM_t = \\frac{(C_t - L_t) - (H_t - C_t)}{H_t - L_t},\\quad CMF_n = \\frac{\\displaystyle\\sum_{i=0}^{n-1} MFM_{t-i}\\cdot V_{t-i}}{\\displaystyle\\sum_{i=0}^{n-1} V_{t-i}}',
    formulaLegend: [
      { symbol: 'MFM_t', explanation: "Money Flow Multiplier: position of close within the bar's high-low range, from –1 (close at low) to +1 (close at high)" },
      { symbol: 'C_t', explanation: 'Closing price' },
      { symbol: 'H_t', explanation: 'High price' },
      { symbol: 'L_t', explanation: 'Low price' },
      { symbol: 'V_{t-i}', explanation: 'Volume i bars ago' },
      { symbol: 'n', explanation: 'Lookback period (default 20)' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 20, min: 1, description: 'Number of bars over which money flow volume is accumulated' },
    ],
    category: 'Volume',
  },

  {
    id: 'chaikin-oscillator',
    title: 'Chaikin Oscillator',
    shortDescription: 'MACD applied to the Accumulation/Distribution line — measures momentum of money flow.',
    fullDescription: {
      assumptions: "Momentum in the Accumulation/Distribution line leads price momentum; accelerating A/D line divergences are early warning signs of trend exhaustion.",
      whatItShows: "The difference between a fast (3-period) and slow (10-period) EMA of the Accumulation/Distribution line. Positive values mean the A/D line's short-term momentum is above its longer-term trend (accumulation accelerating); negative means distribution is accelerating.",
      howItHelps: 'A Chaikin Oscillator crossing above zero is a bullish signal; crossing below zero is bearish. Divergences — oscillator trending opposite to price — provide early reversal warnings before price actually turns.',
    },
    formula: 'AD_t = AD_{t-1} + \\frac{(C_t-L_t)-(H_t-C_t)}{H_t-L_t}\\cdot V_t,\\quad CO_t = EMA_f(AD) - EMA_s(AD)',
    formulaLegend: [
      { symbol: 'AD_t', explanation: 'Accumulation/Distribution line value at bar t' },
      { symbol: 'AD_{t-1}', explanation: 'Previous bar A/D line value' },
      { symbol: 'C_t', explanation: 'Closing price' },
      { symbol: 'H_t', explanation: 'High price' },
      { symbol: 'L_t', explanation: 'Low price' },
      { symbol: 'V_t', explanation: 'Volume' },
      { symbol: 'EMA_f(AD)', explanation: 'Fast EMA of the Accumulation/Distribution line (default period 3)' },
      { symbol: 'EMA_s(AD)', explanation: 'Slow EMA of the Accumulation/Distribution line (default period 10)' },
    ],
    parameters: [
      { name: 'Fast Period', symbol: 'f', defaultValue: 3, min: 1, description: 'Period for the fast EMA of the A/D line' },
      { name: 'Slow Period', symbol: 's', defaultValue: 10, min: 2, description: 'Period for the slow EMA of the A/D line' },
    ],
    category: 'Volume',
  },

  {
    id: 'ease-of-movement',
    title: 'Ease of Movement',
    shortDescription: 'Measures how easily price moves in relation to volume — high values mean large moves on light volume.',
    fullDescription: {
      assumptions: 'Large price moves on low volume indicate that the market is moving with minimal resistance (ease); small price moves on high volume indicate heavy resistance or congestion.',
      whatItShows: 'A normalised ratio of price movement to volume. Positive values indicate upward price movement requiring little volume effort; negative values indicate downward movement with little resistance. A smoothing SMA is typically applied to reduce noise.',
      howItHelps: 'Positive EOM suggests the market is rising easily — a bullish sign. Negative EOM suggests it is falling easily — a bearish sign. Divergence from price direction or a reading near zero despite a trending market reveals exhaustion.',
    },
    formula: 'MidPM_t = \\frac{H_t+L_t}{2} - \\frac{H_{t-1}+L_{t-1}}{2},\\quad BR_t = \\frac{V_t}{H_t - L_t},\\quad EOM_t = \\frac{MidPM_t}{BR_t}',
    formulaLegend: [
      { symbol: 'MidPM_t', explanation: "Midpoint price move: change in the midpoint of the bar's range from the previous bar" },
      { symbol: 'H_t', explanation: 'High price of the current bar' },
      { symbol: 'L_t', explanation: 'Low price of the current bar' },
      { symbol: 'H_{t-1}', explanation: 'High price of the previous bar' },
      { symbol: 'L_{t-1}', explanation: 'Low price of the previous bar' },
      { symbol: 'BR_t', explanation: "Box ratio: volume divided by the current bar's high-low range (resistance measure)" },
      { symbol: 'V_t', explanation: 'Volume of the current bar' },
      { symbol: 'EOM_t', explanation: 'Raw ease of movement value (usually smoothed with a 14-period SMA)' },
    ],
    parameters: [
      { name: 'Period', symbol: 'n', defaultValue: 14, min: 1, description: 'SMA period used to smooth the raw EOM values' },
    ],
    category: 'Volume',
  },

  {
    id: 'klinger-oscillator',
    title: 'Klinger Volume Oscillator',
    shortDescription: 'Long-minus-short EMA of a volume-force measure — detects reversals using volume and price range.',
    fullDescription: {
      assumptions: "Each bar's volume contributes either to accumulation or distribution depending on whether price closed in the upper or lower half of its range relative to the previous bar; this volume force can be smoothed and differenced to detect momentum shifts.",
      whatItShows: "A Volume Force is computed each bar by assigning the full volume as positive (accumulation) or negative (distribution) based on the trend direction of typical price, then adjusted by the bar's high-low range and close location. The oscillator is the difference between a fast (34-period) and slow (55-period) EMA of this volume force, with a 13-period signal EMA.",
      howItHelps: 'Crossovers of the oscillator above/below its signal line generate buy/sell triggers. Divergences between the oscillator and price — particularly at new price highs or lows — are strong early reversal signals. It is especially useful for identifying major tops and bottoms.',
    },
    formula: 'VF_t = V_t \\cdot \\left|\\frac{2\\,dm_t}{cm_t} - 1\\right| \\cdot \\text{trend}_t \\cdot 100,\\quad KO = EMA_{34}(VF) - EMA_{55}(VF)',
    formulaLegend: [
      { symbol: 'VF_t', explanation: 'Volume Force: signed volume adjusted by the ratio of daily movement to cumulative movement' },
      { symbol: 'V_t', explanation: 'Bar volume' },
      { symbol: 'dm_t', explanation: 'Daily movement: H − L of the current bar' },
      { symbol: 'cm_t', explanation: 'Cumulative movement: rolling sum of daily movements used for normalisation' },
      { symbol: '\\text{trend}_t', explanation: '+1 if (H + L + C) > previous bar\'s sum, –1 otherwise' },
      { symbol: 'EMA_{34}(VF)', explanation: '34-period EMA of Volume Force (fast line)' },
      { symbol: 'EMA_{55}(VF)', explanation: '55-period EMA of Volume Force (slow line)' },
      { symbol: 'KO', explanation: 'Klinger Oscillator: difference between fast and slow EMAs' },
    ],
    parameters: [
      { name: 'Fast Period',   symbol: 'f',   defaultValue: 34, min: 1, description: 'Fast EMA period applied to the Volume Force' },
      { name: 'Slow Period',   symbol: 's',   defaultValue: 55, min: 2, description: 'Slow EMA period applied to the Volume Force' },
      { name: 'Signal Period', symbol: 'sig', defaultValue: 13, min: 1, description: 'EMA period for the signal line' },
    ],
    category: 'Volume',
  },

  {
    id: 'net-volume',
    title: 'Net Volume',
    shortDescription: 'Up-bar volume minus down-bar volume per candle — raw measure of buying vs. selling pressure each bar.',
    fullDescription: {
      assumptions: 'Volume on bars that close up reflects buying pressure, while volume on bars that close down reflects selling pressure; the net difference is a direct proxy for order flow imbalance.',
      whatItShows: "A histogram where each bar equals the current bar's volume if price closed higher than the previous close (positive, buying pressure) or the negative of the volume if it closed lower (negative, selling pressure). Flat bars register zero.",
      howItHelps: 'Tall positive net-volume bars during a rally confirm strong buying; tall negative bars during a decline confirm strong selling. Divergences — such as a price high accompanied by shrinking net volume — hint at absorption and potential reversal.',
    },
    formula: 'NV_t = \\begin{cases} +V_t & \\text{if } C_t > C_{t-1} \\\\ -V_t & \\text{if } C_t < C_{t-1} \\\\ 0 & \\text{if } C_t = C_{t-1} \\end{cases}',
    formulaLegend: [
      { symbol: 'NV_t', explanation: 'Net Volume for the current bar' },
      { symbol: 'V_t', explanation: 'Total volume of the current bar' },
      { symbol: 'C_t', explanation: 'Closing price of the current bar' },
      { symbol: 'C_{t-1}', explanation: 'Closing price of the previous bar' },
    ],
    parameters: [],
    category: 'Volume',
  },

  {
    id: 'volume-delta',
    title: 'Volume Delta',
    shortDescription: 'Estimated buy volume minus sell volume per bar — shows who dominated each candle.',
    fullDescription: {
      assumptions: 'Within each candle, volume can be split into aggressive buy orders (lifting the ask) and aggressive sell orders (hitting the bid). Without tick data, the close position within the bar is used to estimate this split.',
      whatItShows: 'For each bar, buy volume is estimated as the fraction of volume proportional to how close the bar closed to its high, and sell volume as the fraction proportional to how close it closed to its low. Delta = buy volume − sell volume.',
      howItHelps: 'Consistent positive delta in an uptrend confirms buyer conviction. Negative delta appearing at a price high is a warning of distribution. Climactic negative delta spikes at lows may signal capitulation and potential reversal points.',
    },
    formula: 'BV_t = V_t \\cdot \\frac{C_t - L_t}{H_t - L_t},\\quad SV_t = V_t - BV_t,\\quad \\Delta_t = BV_t - SV_t',
    formulaLegend: [
      { symbol: 'BV_t', explanation: 'Estimated buy volume: volume weighted by proximity of close to the high' },
      { symbol: 'SV_t', explanation: 'Estimated sell volume: remaining volume (total minus buy volume)' },
      { symbol: '\\Delta_t', explanation: 'Volume Delta: buy volume minus sell volume for the bar' },
      { symbol: 'V_t', explanation: 'Total bar volume' },
      { symbol: 'C_t', explanation: 'Closing price' },
      { symbol: 'H_t', explanation: 'High price' },
      { symbol: 'L_t', explanation: 'Low price' },
    ],
    parameters: [],
    category: 'Volume',
  },

  {
    id: 'cumulative-volume-delta',
    title: 'Cumulative Volume Delta',
    shortDescription: 'Running total of per-bar volume delta — tracks the ongoing imbalance between buyers and sellers.',
    fullDescription: {
      assumptions: 'The cumulative sum of buyer-vs-seller volume imbalance across all bars carries persistent information about market structure and the dominant side of the order flow over time.',
      whatItShows: 'The same Volume Delta (estimated buy minus sell volume per bar) accumulated as a running total. A rising CVD line means buyers have cumulatively outpaced sellers; a falling CVD means sellers are in control. Unlike plain volume delta, CVD shows the sustained trend in order flow.',
      howItHelps: 'Bullish price trend with a rising CVD confirms healthy buying. Bearish divergence — price at new highs while CVD falls — indicates distribution and warns of a potential top. CVD is especially powerful for spotting hidden supply and demand imbalances invisible on the price chart.',
    },
    formula: 'CVD_t = \\sum_{i=1}^{t} \\Delta_i,\\quad \\Delta_i = V_i\\cdot\\frac{C_i-L_i}{H_i-L_i} - V_i\\cdot\\frac{H_i-C_i}{H_i-L_i}',
    formulaLegend: [
      { symbol: 'CVD_t', explanation: 'Cumulative Volume Delta at bar t' },
      { symbol: '\\Delta_i', explanation: 'Volume Delta of bar i: estimated buy volume minus estimated sell volume' },
      { symbol: 'V_i', explanation: 'Total volume of bar i' },
      { symbol: 'C_i', explanation: 'Closing price of bar i' },
      { symbol: 'H_i', explanation: 'High price of bar i' },
      { symbol: 'L_i', explanation: 'Low price of bar i' },
    ],
    parameters: [],
    category: 'Volume',
  },

  {
    id: 'obv-macd',
    title: 'OBV MACD',
    shortDescription: 'MACD crossover system applied to On Balance Volume — finds momentum shifts in volume flow.',
    fullDescription: {
      assumptions: 'The MACD framework (fast minus slow EMA, plus a signal EMA) that works on price also reveals meaningful momentum cycles when applied to the OBV line, since OBV already integrates both price direction and volume.',
      whatItShows: 'Computes OBV first, then applies a standard MACD: the OBV MACD line is a fast EMA of OBV minus a slow EMA of OBV; the signal line is an EMA of the MACD line; the histogram is their difference. All three react to accelerating or decelerating volume flow rather than price.',
      howItHelps: 'A bullish MACD crossover on OBV (MACD line crossing above signal) signals accelerating accumulation — often before price follows. A bearish cross signals accelerating distribution. Divergences with the price MACD are particularly powerful.',
    },
    formula: 'MACD_{OBV} = EMA_f(OBV) - EMA_s(OBV),\\quad Signal = EMA_{sig}(MACD_{OBV})',
    formulaLegend: [
      { symbol: 'OBV', explanation: 'On Balance Volume: cumulative signed-volume sum' },
      { symbol: 'EMA_f(OBV)', explanation: 'Fast EMA of OBV (default period 12)' },
      { symbol: 'EMA_s(OBV)', explanation: 'Slow EMA of OBV (default period 26)' },
      { symbol: 'MACD_{OBV}', explanation: 'OBV MACD line: fast EMA minus slow EMA of OBV' },
      { symbol: 'EMA_{sig}(MACD_{OBV})', explanation: 'Signal line: EMA of the MACD line (default period 9)' },
      { symbol: 'f', explanation: 'Fast EMA period (default 12)' },
      { symbol: 's', explanation: 'Slow EMA period (default 26)' },
      { symbol: 'sig', explanation: 'Signal EMA period (default 9)' },
    ],
    parameters: [
      { name: 'Fast Period',   symbol: 'f',   defaultValue: 12, min: 1, description: 'Fast EMA period applied to OBV' },
      { name: 'Slow Period',   symbol: 's',   defaultValue: 26, min: 2, description: 'Slow EMA period applied to OBV' },
      { name: 'Signal Period', symbol: 'sig', defaultValue: 9,  min: 1, description: 'EMA period for the signal line' },
    ],
    category: 'Volume',
  },

  {
    id: 'colored-volume',
    title: 'Colored Volume',
    shortDescription: 'Standard volume histogram with bars colored green on up-closes and red on down-closes.',
    fullDescription: {
      assumptions: "The direction of a bar's close relative to its open is the most straightforward way to classify volume as buying-dominated or selling-dominated.",
      whatItShows: 'The conventional volume histogram with a visual encoding: green bars when the closing price is higher than the open, and red bars when the close is lower. No transformation of the volume values occurs.',
      howItHelps: 'Instantly highlights whether heavy-volume bars are driven by buyers or sellers. Traders look for high-volume green bars in uptrends to confirm momentum, high-volume red bars in downtrends to confirm selling pressure, and volume climaxes as potential exhaustion signals.',
    },
    formula: '\\text{Color}_t = \\begin{cases} \\text{green} & \\text{if } C_t \\geq O_t \\\\ \\text{red} & \\text{if } C_t < O_t \\end{cases},\\quad \\text{Height}_t = V_t',
    formulaLegend: [
      { symbol: 'C_t', explanation: 'Closing price of the current bar' },
      { symbol: 'O_t', explanation: 'Opening price of the current bar' },
      { symbol: 'V_t', explanation: 'Volume of the current bar (determines bar height)' },
      { symbol: '\\text{Color}_t', explanation: 'Visual classification: green for up-close bars, red for down-close bars' },
    ],
    parameters: [],
    category: 'Volume',
  },
];

/** Lookup helper — O(1) by indicator id. */
export const CATALOG_MAP = new Map<string, TradingIndicatorData>(
  INDICATORS_CATALOG.map(d => [d.id, d])
);
