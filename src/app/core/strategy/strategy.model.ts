import type { IndicatorCategory } from '../indicators';

export type ConditionKey =
  | 'price_crosses_above'      | 'price_crosses_below'
  | 'price_above'              | 'price_below'
  | 'line_crosses_above'       | 'line_crosses_below'
  | 'above_threshold'          | 'below_threshold'
  | 'crosses_above_threshold'  | 'crosses_below_threshold'
  | 'macd_bullish'             | 'macd_bearish'
  | 'histogram_positive'       | 'histogram_negative'
  | 'fast_crosses_above_slow'  | 'fast_crosses_below_slow'
  | 'fast_above_slow'          | 'fast_below_slow'
  | 'price_crosses_upper'      | 'price_crosses_lower'
  | 'price_above_upper'        | 'price_below_lower'
  | 'price_above_middle'       | 'price_below_middle';

export interface IndicatorSlot {
  indicatorId: string;
  category: IndicatorCategory;
  params: Record<string, number | string | boolean>;
}

export interface ConditionRule {
  primarySlot: IndicatorSlot;
  conditionKey: ConditionKey;
  threshold?: number;
  secondarySlot?: IndicatorSlot;
}

export interface RiskConfig {
  positionSizePct: number;
  commissionBps: number;
  slippageBps: number;
}

export interface StrategyConfig {
  name: string;
  entry: ConditionRule;
  exit: ConditionRule;
  risk: RiskConfig;
}
