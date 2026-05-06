import type { UTCTimestamp } from 'lightweight-charts';
import type { Lang } from '../i18n/translations';

export type { Lang };

/** Bilingual string pair. Add to IndicatorMeta.descriptionI18n to provide Polish/English descriptions. */
export type TranslationMap = Partial<Record<Lang, string>>;

export interface BarInput {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export type IndicatorCategory =
  | 'moving-averages'
  | 'oscillators'
  | 'momentum'
  | 'trend'
  | 'volatility'
  | 'channels-bands'
  | 'volume'
  | 'patterns';

export interface MACDPoint {
  macd: number;
  signal: number;
  histogram: number;
}

export interface MACrossPoint {
  fast: number;
  slow: number;
  crossover: 1 | -1 | 0; // 1 = bullish cross, -1 = bearish cross, 0 = no cross
}

// Oscillator multi-plot point types
export interface KDJPoint {
  k: number;
  d: number;
  j: number;
}

export interface TwoLinePoint {
  line1: number;
  line2: number;
}

// Momentum multi-plot point types
export interface TRIXPoint {
  trix: number;
  signal: number;
}

export interface SqueezeMomentumPoint {
  momentum: number;
  squeeze: boolean;
}

export interface ImpulseMACDPoint {
  impulse: number;
  signal: number;
  direction: 1 | -1 | 0;
}

export interface MACD4CPoint {
  macd: number;
  signal: number;
  histogram: number;
  color: -2 | -1 | 1 | 2; // -2: strong bear, -1: weak bear, 1: weak bull, 2: strong bull
}

export interface KSTPoint {
  kst: number;
  signal: number;
}

export interface PriceOscillatorPoint {
  main: number;
  signal: number;
  histogram: number;
}

// Trend indicator multi-plot point types
export interface ADXPoint {
  adx: number;
  plusDI: number;
  minusDI: number;
}

export interface DMIPoint {
  plusDI: number;
  minusDI: number;
  adx: number;
}

export interface IchimokuPoint {
  tenkan: number;
  kijun: number;
  spanA: number;
  spanB: number;
  chikou: number;
}

export interface AroonPoint {
  up: number;
  down: number;
  oscillator: number;
}

export interface AlligatorPoint {
  jaw: number;
  teeth: number;
  lips: number;
}

export interface VortexPoint {
  viPlus: number;
  viMinus: number;
}

export interface ChandeKrollPoint {
  shortStop: number;
  longStop: number;
}

export interface FractalPoint {
  high: number | null;
  low: number | null;
}

export interface ChandelierPoint {
  longStop: number;
  shortStop: number;
}

export interface DonchianRibbonPoint {
  values: number[];
}

// Channels & Bands multi-plot types
export interface ThreeBandPoint {
  upper: number;
  middle: number;
  lower: number;
}

export interface MedianPoint {
  median: number;
  upper: number;
  lower: number;
  ema: number;
}

// Volume indicator multi-plot types
export interface VolumeBarPoint {
  volume: number;
  color: 1 | -1 | 0; // 1 = up/green, -1 = down/red, 0 = flat/gray
}

// Candlestick pattern marker — rendered as chart markers on the price series
export interface PatternPoint {
  marker?: { time: number; position: string; shape: string; color: string; text?: string; size?: number };
  bgColor?: { time: number; color: string };
}

// Drives the future parameter-editor UI panel for each indicator
export interface OptionParam {
  key: string;
  label: string;
  type: 'number' | 'select' | 'boolean';
  defaultValue: number | string | boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ label: string; value: string }>; // for type:'select'
  description?: string;                              // tooltip in the editor
}

// Drives the future indicator-explanation window
export interface IndicatorMeta {
  id: string;          // unique slug used as registry key, e.g. 'sma'
  name: string;        // 'Simple Moving Average'
  shortName: string;   // 'SMA' — used on chart axis labels
  category: IndicatorCategory;
  description: string; // English description (legacy; always required as fallback)
  descriptionI18n?: TranslationMap; // optional multilingual override; use LangService.resolveDescription()
  overlay: boolean;    // true → price pane; false → separate sub-pane
  params: OptionParam[];
}

// T = options object shape, O = one element of the output array
export interface IndicatorDef<T = Record<string, unknown>, O = number | null> {
  meta: IndicatorMeta;
  defaultOptions: T;
  calculate: (bars: BarInput[], options: T) => O[];
}

// ─── Rich UI metadata layer ───────────────────────────────────────────────────
// Powers the indicator explanation panel, formula popover, and param editor.

/** Translatable text fields for one indicator — used in INDICATORS_I18N. */
export interface IndicatorDescI18n {
  shortDescription: string;
  fullDescription: {
    assumptions: string;
    whatItShows: string;
    howItHelps: string;
  };
}

export type TradingIndicatorCategory =
  | 'Moving Average'
  | 'Oscillator'
  | 'Momentum'
  | 'Trend'
  | 'Volatility'
  | 'Channels & Bands'
  | 'Volume';

export interface TradingIndicatorParam {
  name: string;        // e.g. "Period"
  symbol: string;      // e.g. "n" — used in formulaLegend cross-referencing
  defaultValue: number;
  min?: number;
  max?: number;
  description: string;
}

export interface TradingIndicatorData {
  id: string;          // must match IndicatorMeta.id
  title: string;       // full industry-standard name (used for Google "Learn More" link)
  shortDescription: string;
  fullDescription: {
    assumptions: string;   // market conditions the indicator assumes
    whatItShows: string;   // what the output represents
    howItHelps: string;    // how a trader acts on it
  };
  formula: string;           // LaTeX string — render with KaTeX
  formulaLegend: Array<{ symbol: string; explanation: string }>;
  parameters: TradingIndicatorParam[];
  category: TradingIndicatorCategory;
}
