import type { ConditionKey } from './strategy.model';

export type IndicatorOutputShape = 'overlay-line' | 'oscillator' | 'macd' | 'band' | 'two-line';

export interface ConditionDef {
  key: ConditionKey;
  label: string;
  needsSecondarySlot: boolean;
  needsThreshold: boolean;
}

const OVERLAY_LINE: ConditionDef[] = [
  { key: 'price_crosses_above', label: 'Price crosses above',             needsSecondarySlot: false, needsThreshold: false },
  { key: 'price_crosses_below', label: 'Price crosses below',             needsSecondarySlot: false, needsThreshold: false },
  { key: 'price_above',         label: 'Price is above',                  needsSecondarySlot: false, needsThreshold: false },
  { key: 'price_below',         label: 'Price is below',                  needsSecondarySlot: false, needsThreshold: false },
  { key: 'line_crosses_above',  label: 'Crosses above another indicator', needsSecondarySlot: true,  needsThreshold: false },
  { key: 'line_crosses_below',  label: 'Crosses below another indicator', needsSecondarySlot: true,  needsThreshold: false },
];

const OSCILLATOR: ConditionDef[] = [
  { key: 'above_threshold',          label: 'Is above level',      needsSecondarySlot: false, needsThreshold: true },
  { key: 'below_threshold',          label: 'Is below level',      needsSecondarySlot: false, needsThreshold: true },
  { key: 'crosses_above_threshold',  label: 'Crosses above level', needsSecondarySlot: false, needsThreshold: true },
  { key: 'crosses_below_threshold',  label: 'Crosses below level', needsSecondarySlot: false, needsThreshold: true },
];

const MACD: ConditionDef[] = [
  { key: 'macd_bullish',       label: 'MACD crosses above signal',        needsSecondarySlot: false, needsThreshold: false },
  { key: 'macd_bearish',       label: 'MACD crosses below signal',        needsSecondarySlot: false, needsThreshold: false },
  { key: 'histogram_positive', label: 'Histogram turns positive (↗ 0)',   needsSecondarySlot: false, needsThreshold: false },
  { key: 'histogram_negative', label: 'Histogram turns negative (↘ 0)',   needsSecondarySlot: false, needsThreshold: false },
];

const TWO_LINE: ConditionDef[] = [
  { key: 'fast_crosses_above_slow', label: 'Fast line crosses above slow', needsSecondarySlot: false, needsThreshold: false },
  { key: 'fast_crosses_below_slow', label: 'Fast line crosses below slow', needsSecondarySlot: false, needsThreshold: false },
  { key: 'fast_above_slow',         label: 'Fast line is above slow',      needsSecondarySlot: false, needsThreshold: false },
  { key: 'fast_below_slow',         label: 'Fast line is below slow',      needsSecondarySlot: false, needsThreshold: false },
];

const BAND: ConditionDef[] = [
  { key: 'price_crosses_upper', label: 'Price crosses above upper band', needsSecondarySlot: false, needsThreshold: false },
  { key: 'price_crosses_lower', label: 'Price crosses below lower band', needsSecondarySlot: false, needsThreshold: false },
  { key: 'price_above_upper',   label: 'Price is above upper band',      needsSecondarySlot: false, needsThreshold: false },
  { key: 'price_below_lower',   label: 'Price is below lower band',      needsSecondarySlot: false, needsThreshold: false },
  { key: 'price_above_middle',  label: 'Price is above middle band',     needsSecondarySlot: false, needsThreshold: false },
  { key: 'price_below_middle',  label: 'Price is below middle band',     needsSecondarySlot: false, needsThreshold: false },
];

const ALL_CONDITIONS: ConditionDef[] = [...OVERLAY_LINE, ...OSCILLATOR, ...MACD, ...TWO_LINE, ...BAND];

export const INDICATOR_OUTPUT_SHAPES: Record<string, IndicatorOutputShape> = {
  // overlay-line
  sma: 'overlay-line', ema: 'overlay-line', wma: 'overlay-line', rma: 'overlay-line',
  smma: 'overlay-line', dema: 'overlay-line', tema: 'overlay-line', hma: 'overlay-line',
  lsma: 'overlay-line', zlsma: 'overlay-line', alma: 'overlay-line', vwma: 'overlay-line',
  mcginley: 'overlay-line', 'parabolic-sar': 'overlay-line', supertrend: 'overlay-line',
  'bb-trend': 'overlay-line', 'zig-zag': 'overlay-line', 'coral-trend': 'overlay-line',
  twap: 'overlay-line',
  // oscillator (bounded or scalar single-line)
  rsi: 'oscillator', stochrsi: 'oscillator', cci: 'oscillator', 'williams-r': 'oscillator',
  'chande-mo': 'oscillator', dpo: 'oscillator', 'bb-percentb': 'oscillator',
  'fisher-transform': 'oscillator', 'ultimate-oscillator': 'oscillator',
  'connors-rsi': 'oscillator', 'relative-volatility-index': 'oscillator',
  'awesome-oscillator': 'oscillator', 'bull-bear-power': 'oscillator',
  'elder-force-index': 'oscillator', 'squeeze-momentum': 'oscillator',
  choppiness: 'oscillator', 'volume-oscillator': 'oscillator',
  'chaikin-mf': 'oscillator', 'chaikin-oscillator': 'oscillator',
  'ease-of-movement': 'oscillator', 'net-volume': 'oscillator',
  'volume-delta': 'oscillator', mfi: 'oscillator',
  momentum: 'oscillator', roc: 'oscillator', bop: 'oscillator',
  'coppock-curve': 'oscillator', 'mass-index': 'oscillator',
  atr: 'oscillator', adr: 'oscillator', 'standard-deviation': 'oscillator',
  'historical-volatility': 'oscillator', 'bb-bandwidth': 'oscillator',
  obv: 'oscillator', pvt: 'oscillator', 'cumulative-volume-delta': 'oscillator',
  // two-line (fast/slow pairs or K/D pairs)
  stochastic: 'two-line', macross: 'two-line', kdj: 'two-line',
  'wave-trend': 'two-line', 'smi-ergodic': 'two-line', rvi: 'two-line',
  tsi: 'two-line', trix: 'two-line', kst: 'two-line',
  vortex: 'two-line', aroon: 'two-line', 'chande-kroll-stop': 'two-line',
  'chandelier-exit': 'two-line', 'klinger-oscillator': 'two-line',
  // macd (macd / signal / histogram triple)
  macd: 'macd', macd4c: 'macd', 'impulse-macd': 'macd',
  'price-oscillator': 'macd', 'obv-macd': 'macd',
  // band (upper / middle / lower)
  'bollinger-bands': 'band', 'keltner-channels': 'band', 'donchian-channels': 'band',
  envelope: 'band', median: 'band',
};

const CONDITIONS_BY_SHAPE: Record<IndicatorOutputShape, ConditionDef[]> = {
  'overlay-line': OVERLAY_LINE,
  oscillator:     OSCILLATOR,
  macd:           MACD,
  'two-line':     TWO_LINE,
  band:           BAND,
};

export function getConditionsForIndicator(indicatorId: string): ConditionDef[] {
  const shape = INDICATOR_OUTPUT_SHAPES[indicatorId] ?? 'oscillator';
  return CONDITIONS_BY_SHAPE[shape];
}

export function conditionNeedsSecondarySlot(key: ConditionKey): boolean {
  return ALL_CONDITIONS.find(c => c.key === key)?.needsSecondarySlot ?? false;
}

export function conditionNeedsThreshold(key: ConditionKey): boolean {
  return ALL_CONDITIONS.find(c => c.key === key)?.needsThreshold ?? false;
}
