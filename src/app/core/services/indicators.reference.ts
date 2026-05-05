/**
 * INDICATORS REFERENCE — lightweight-charts-indicators
 *
 * Install first:
 *   npm install lightweight-charts-indicators oakscriptjs
 *
 * This file is a living catalogue + integration skeleton.
 * It is NOT imported anywhere yet — copy what you need into
 * chart.service.ts (or a dedicated IndicatorService) when ready.
 *
 * Peer dependencies already in the project:
 *   lightweight-charts ^5.2.0
 *
 * Bar type note:
 *   oakscriptjs Bar requires a `volume` field.
 *   Our Bar (bar.model.ts) omits it, so we re-map before passing
 *   to any indicator. See `toOakBar()` below.
 */

// ─── Imports ────────────────────────────────────────────────────────────────

import {
  LineSeries,
  HistogramSeries,
  createChart,
} from 'lightweight-charts';

import type { Bar as OakBar } from 'oakscriptjs';

import {
  // Moving Averages
  SMA, EMA, WMA, RMA, DEMA, TEMA, HMA, LSMA, ALMA, VWMA, SMMA,
  McGinleyDynamic, MACross, MARibbon, ZLSMA,

  // Oscillators
  RSI, Stochastic, StochRSI, CCI, WilliamsPercentRange,
  AwesomeOscillator, ChandeMO, DPO, RVI, SMIErgodic, TSI,
  WoodiesCCI, BBPercentB, FisherTransform, UltimateOscillator,
  WaveTrend, KDJ, ConnorsRSI, RelativeVolatilityIndex,

  // Momentum
  MACD, Momentum, ROC, BOP, BullBearPower, ElderForceIndex,
  PriceOscillator, CoppockCurve, TRIX, KST, SqueezeMomentum,
  ImpulseMACD, MACD4C,

  // Trend
  ADX, DMI, IchimokuCloud, ParabolicSAR, Supertrend, Aroon,
  BBTrend, Choppiness, MassIndex, VortexIndicator, WilliamsAlligator,
  ZigZag, ChandeKrollStop, WilliamsFractals, CoralTrend,
  ChandelierExit, DonchianTrendRibbon, TWAP,

  // Volatility
  ATR, ADR, StandardDeviation, HistoricalVolatility,
  BBBandWidth, BollingerBars,

  // Channels & Bands
  BollingerBands, KeltnerChannels, DonchianChannels, Envelope, Median,

  // Volume
  OBV, MFI, PVT, VolumeOscillator, ChaikinMF, ChaikinOscillator,
  EaseOfMovement, KlingerOscillator, NetVolume, VolumeDelta,
  CumulativeVolumeDelta, OBVMACD, ColoredVolume,

  // Registry
  indicatorRegistry,
} from 'lightweight-charts-indicators';

import type { Bar } from '../models/bar.model';

// ─── Type adapter ────────────────────────────────────────────────────────────

/** Convert our Bar (no volume) to oakscriptjs Bar (volume required). */
function toOakBars(bars: Bar[], defaultVolume = 0): OakBar[] {
  return bars.map(b => ({
    time:   b.time as unknown as number,
    open:   b.open,
    high:   b.high,
    low:    b.low,
    close:  b.close,
    volume: (b as Bar & { volume?: number }).volume ?? defaultVolume,
  }));
}

// ─── Output shape ────────────────────────────────────────────────────────────

/**
 * All indicators return:
 *
 *   {
 *     metadata: { title, shortTitle, overlay: boolean },
 *     plots: {
 *       plot0: { time: number; value: number }[],
 *       plot1?: ...,
 *       plot2?: ...,
 *     }
 *   }
 *
 * overlay=true  → add series directly on the price chart
 * overlay=false → add series on a separate pane / sub-chart
 */

// ─── Moving Averages ─────────────────────────────────────────────────────────

export function calcSMA(bars: Bar[], len = 20) {
  return SMA.calculate(toOakBars(bars), { len, src: 'close' });
  // Returns: plot0 = SMA line
}

export function calcEMA(bars: Bar[], length = 14) {
  return EMA.calculate(toOakBars(bars), { length, src: 'close' });
}

export function calcWMA(bars: Bar[], length = 14) {
  return WMA.calculate(toOakBars(bars), { length });
}

export function calcRMA(bars: Bar[], length = 14) {
  // Wilder's smoothed MA — used internally by ATR, RSI
  return RMA.calculate(toOakBars(bars), { length });
}

export function calcDEMA(bars: Bar[], length = 14) {
  return DEMA.calculate(toOakBars(bars), { length });
}

export function calcTEMA(bars: Bar[], length = 14) {
  return TEMA.calculate(toOakBars(bars), { length });
}

export function calcHMA(bars: Bar[], length = 16) {
  // Hull MA — fast and smooth
  return HMA.calculate(toOakBars(bars), { length });
}

export function calcLSMA(bars: Bar[], length = 25, offset = 0) {
  return LSMA.calculate(toOakBars(bars), { length, offset });
}

export function calcALMA(bars: Bar[], windowSize = 9, offset = 0.85, sigma = 6) {
  return ALMA.calculate(toOakBars(bars), { windowSize, offset, sigma });
}

export function calcVWMA(bars: Bar[], length = 20) {
  return VWMA.calculate(toOakBars(bars), { length });
}

export function calcSMMA(bars: Bar[], length = 14) {
  return SMMA.calculate(toOakBars(bars), { length });
}

export function calcMcGinleyDynamic(bars: Bar[], length = 14) {
  return McGinleyDynamic.calculate(toOakBars(bars), { length });
}

export function calcZLSMA(bars: Bar[], length = 32, offset = 0) {
  return ZLSMA.calculate(toOakBars(bars), { length, offset });
}

export function calcMACross(bars: Bar[], fastLen = 9, slowLen = 21) {
  // plot0: fast MA, plot1: slow MA, plot2: crossover signals
  return MACross.calculate(toOakBars(bars), { fastLen, slowLen });
}

export function calcMARibbon(bars: Bar[]) {
  // Multiple MA lines plotted as a ribbon; uses default period ladder
  return MARibbon.calculate(toOakBars(bars), {});
}

// ─── Oscillators ─────────────────────────────────────────────────────────────

export function calcRSI(bars: Bar[], length = 14) {
  // overlay: false | range 0–100 | add overbought/oversold levels at 70/30
  return RSI.calculate(toOakBars(bars), { length, src: 'close' });
}

export function calcStochastic(bars: Bar[], length = 14, kSmoothing = 3, dSmoothing = 3) {
  // plot0: %K, plot1: %D
  return Stochastic.calculate(toOakBars(bars), { length, kSmoothing, dSmoothing });
}

export function calcStochRSI(bars: Bar[], length = 14, rsiLength = 14, kSmoothing = 3, dSmoothing = 3) {
  return StochRSI.calculate(toOakBars(bars), { length, rsiLength, kSmoothing, dSmoothing });
}

export function calcCCI(bars: Bar[], length = 20) {
  return CCI.calculate(toOakBars(bars), { length });
}

export function calcWilliamsR(bars: Bar[], length = 14) {
  return WilliamsPercentRange.calculate(toOakBars(bars), { length });
}

export function calcAwesomeOscillator(bars: Bar[], shortLen = 5, longLen = 34) {
  // plot0: histogram (green/red columns)
  return AwesomeOscillator.calculate(toOakBars(bars), { shortLen, longLen });
}

export function calcChandeMO(bars: Bar[], length = 9) {
  return ChandeMO.calculate(toOakBars(bars), { length });
}

export function calcDPO(bars: Bar[], length = 21) {
  return DPO.calculate(toOakBars(bars), { length });
}

export function calcRVI(bars: Bar[], length = 10) {
  // plot0: RVI, plot1: Signal
  return RVI.calculate(toOakBars(bars), { length });
}

export function calcTSI(bars: Bar[], longLength = 25, shortLength = 13, signalLength = 13) {
  // plot0: TSI, plot1: Signal
  return TSI.calculate(toOakBars(bars), { longLength, shortLength, signalLength });
}

export function calcBBPercentB(bars: Bar[], length = 20, mult = 2) {
  // 0 = at lower band, 1 = at upper band
  return BBPercentB.calculate(toOakBars(bars), { length, mult });
}

export function calcFisherTransform(bars: Bar[], length = 9) {
  // plot0: Fisher, plot1: Signal (−Fisher)
  return FisherTransform.calculate(toOakBars(bars), { length });
}

export function calcUltimateOscillator(bars: Bar[], len1 = 7, len2 = 14, len3 = 28) {
  return UltimateOscillator.calculate(toOakBars(bars), { len1, len2, len3 });
}

export function calcWaveTrend(bars: Bar[], channelLen = 9, avgLen = 12) {
  // plot0: WT1, plot1: WT2
  return WaveTrend.calculate(toOakBars(bars), { channelLen, avgLen });
}

export function calcKDJ(bars: Bar[], length = 9, signalLength = 3) {
  // plot0: K, plot1: D, plot2: J
  return KDJ.calculate(toOakBars(bars), { length, signalLength });
}

export function calcConnorsRSI(bars: Bar[], rsiLen = 3, streakLen = 2, rankLen = 100) {
  return ConnorsRSI.calculate(toOakBars(bars), { rsiLen, streakLen, rankLen });
}

export function calcRelativeVolatilityIndex(bars: Bar[], length = 14, smoothLen = 14) {
  return RelativeVolatilityIndex.calculate(toOakBars(bars), { length, smoothLen });
}

// ─── Momentum ────────────────────────────────────────────────────────────────

export function calcMACD(bars: Bar[], fastLength = 12, slowLength = 26, signalLength = 9) {
  // plot0: MACD line, plot1: Signal line, plot2: Histogram
  return MACD.calculate(toOakBars(bars), { fastLength, slowLength, signalLength });
}

export function calcMomentum(bars: Bar[], length = 10) {
  return Momentum.calculate(toOakBars(bars), { length });
}

export function calcROC(bars: Bar[], length = 12) {
  return ROC.calculate(toOakBars(bars), { length });
}

export function calcBOP(bars: Bar[]) {
  return BOP.calculate(toOakBars(bars), {});
}

export function calcBullBearPower(bars: Bar[], length = 13) {
  return BullBearPower.calculate(toOakBars(bars), { length });
}

export function calcElderForceIndex(bars: Bar[], length = 13) {
  return ElderForceIndex.calculate(toOakBars(bars), { length });
}

export function calcPPO(bars: Bar[], fastLength = 12, slowLength = 26, signalLength = 9) {
  // Price Oscillator (MACD as %)
  return PriceOscillator.calculate(toOakBars(bars), { fastLength, slowLength, signalLength });
}

export function calcCoppockCurve(bars: Bar[], wmaLength = 10, roc1Length = 14, roc2Length = 11) {
  return CoppockCurve.calculate(toOakBars(bars), { wmaLength, roc1Length, roc2Length });
}

export function calcTRIX(bars: Bar[], length = 18, signalLength = 9) {
  // plot0: TRIX, plot1: Signal
  return TRIX.calculate(toOakBars(bars), { length, signalLength });
}

export function calcKST(bars: Bar[]) {
  // Know Sure Thing — multi-ROC composite
  return KST.calculate(toOakBars(bars), {});
}

export function calcSqueezeMomentum(bars: Bar[], length = 20, mult = 2, lengthKC = 20, multKC = 1.5) {
  // Detects BB inside KC (squeeze), plot0: momentum histogram
  return SqueezeMomentum.calculate(toOakBars(bars), { length, mult, lengthKC, multKC });
}

export function calcImpulseMACD(bars: Bar[], lengthMA = 34, lengthSignal = 9) {
  // plot0: impulse MACD, plot1: signal
  return ImpulseMACD.calculate(toOakBars(bars), { lengthMA, lengthSignal });
}

// ─── Trend ───────────────────────────────────────────────────────────────────

export function calcADX(bars: Bar[], length = 14) {
  // plot0: ADX, plot1: +DI, plot2: −DI
  return ADX.calculate(toOakBars(bars), { length });
}

export function calcDMI(bars: Bar[], length = 14, adxSmoothing = 14) {
  // plot0: +DI, plot1: −DI, plot2: ADX
  return DMI.calculate(toOakBars(bars), { length, adxSmoothing });
}

export function calcIchimoku(bars: Bar[], tenkanLength = 9, kijunLength = 26, chikouLength = 52) {
  // plot0: Tenkan, plot1: Kijun, plot2: SpanA, plot3: SpanB, plot4: Chikou
  return IchimokuCloud.calculate(toOakBars(bars), { tenkanLength, kijunLength, chikouLength });
}

export function calcParabolicSAR(bars: Bar[], step = 0.02, max = 0.2) {
  return ParabolicSAR.calculate(toOakBars(bars), { step, max });
}

export function calcSupertrend(bars: Bar[], period = 10, multiplier = 3) {
  // plot0: Supertrend line (directional color by trend)
  return Supertrend.calculate(toOakBars(bars), { period, multiplier });
}

export function calcAroon(bars: Bar[], length = 14) {
  // plot0: Aroon Up, plot1: Aroon Down, plot2: Oscillator
  return Aroon.calculate(toOakBars(bars), { length });
}

export function calcChoppiness(bars: Bar[], length = 14) {
  // 100×log(ATR sum / (highest−lowest)) / log(length); above 61.8 = choppy
  return Choppiness.calculate(toOakBars(bars), { length });
}

export function calcMassIndex(bars: Bar[], fastLength = 9, slowLength = 25) {
  return MassIndex.calculate(toOakBars(bars), { fastLength, slowLength });
}

export function calcVortex(bars: Bar[], length = 14) {
  // plot0: VI+, plot1: VI−
  return VortexIndicator.calculate(toOakBars(bars), { length });
}

export function calcWilliamsAlligator(bars: Bar[]) {
  // plot0: Jaw (13), plot1: Teeth (8), plot2: Lips (5) — all displaced
  return WilliamsAlligator.calculate(toOakBars(bars), {});
}

export function calcZigZag(bars: Bar[], depth = 12, deviation = 5, backstep = 3) {
  return ZigZag.calculate(toOakBars(bars), { depth, deviation, backstep });
}

export function calcChandeKrollStop(bars: Bar[], p = 10, q = 15, x = 1) {
  // plot0: Stop Short, plot1: Stop Long
  return ChandeKrollStop.calculate(toOakBars(bars), { p, q, x });
}

export function calcCoralTrend(bars: Bar[], period = 21, cd = 0.4) {
  return CoralTrend.calculate(toOakBars(bars), { period, cd });
}

export function calcChandelierExit(bars: Bar[], period = 22, atrMultiplier = 3) {
  // plot0: Long stop, plot1: Short stop
  return ChandelierExit.calculate(toOakBars(bars), { period, atrMultiplier });
}

export function calcTWAP(bars: Bar[]) {
  return TWAP.calculate(toOakBars(bars), {});
}

// ─── Volatility ──────────────────────────────────────────────────────────────

export function calcATR(bars: Bar[], length = 14) {
  return ATR.calculate(toOakBars(bars), { length });
}

export function calcStdDev(bars: Bar[], length = 20, src = 'close') {
  return StandardDeviation.calculate(toOakBars(bars), { length, src });
}

export function calcHistoricalVolatility(bars: Bar[], length = 10) {
  // Annualised returns-based volatility
  return HistoricalVolatility.calculate(toOakBars(bars), { length });
}

export function calcBBBandWidth(bars: Bar[], length = 20, mult = 2) {
  // (upper − lower) / middle × 100
  return BBBandWidth.calculate(toOakBars(bars), { length, mult });
}

// ─── Channels & Bands ────────────────────────────────────────────────────────

export function calcBollingerBands(bars: Bar[], length = 20, mult = 2) {
  // plot0: Upper, plot1: Basis, plot2: Lower
  return BollingerBands.calculate(toOakBars(bars), { length, mult, src: 'close' });
}

export function calcKeltnerChannels(bars: Bar[], length = 20, mult = 2) {
  // plot0: Upper, plot1: Middle, plot2: Lower
  return KeltnerChannels.calculate(toOakBars(bars), { length, mult });
}

export function calcDonchianChannels(bars: Bar[], length = 20) {
  // plot0: Upper (highest high), plot1: Basis, plot2: Lower (lowest low)
  return DonchianChannels.calculate(toOakBars(bars), { length });
}

export function calcEnvelope(bars: Bar[], length = 20, percent = 0.1) {
  // plot0: Upper, plot1: Middle, plot2: Lower
  return Envelope.calculate(toOakBars(bars), { length, percent });
}

export function calcMedian(bars: Bar[], length = 3, atrLength = 14, atrMult = 2) {
  // plot0: Median, plot1: Upper Band, plot2: Lower Band, plot3: Median EMA
  // plot4: Median Above, plot5: Median Below
  return Median.calculate(toOakBars(bars), { length, atrLength, atrMult });
}

// ─── Volume ──────────────────────────────────────────────────────────────────

export function calcOBV(bars: Bar[]) {
  return OBV.calculate(toOakBars(bars), {});
}

export function calcMFI(bars: Bar[], length = 14) {
  // Money Flow Index; range 0–100
  return MFI.calculate(toOakBars(bars), { length });
}

export function calcPVT(bars: Bar[]) {
  return PVT.calculate(toOakBars(bars), {});
}

export function calcVolumeOscillator(bars: Bar[], shortLength = 5, longLength = 10) {
  return VolumeOscillator.calculate(toOakBars(bars), { shortLength, longLength });
}

export function calcChaikinMF(bars: Bar[], length = 20) {
  return ChaikinMF.calculate(toOakBars(bars), { length });
}

export function calcChaikinOscillator(bars: Bar[], fastLength = 3, slowLength = 10) {
  return ChaikinOscillator.calculate(toOakBars(bars), { fastLength, slowLength });
}

export function calcEaseOfMovement(bars: Bar[], length = 14) {
  return EaseOfMovement.calculate(toOakBars(bars), { length });
}

export function calcKlingerOscillator(bars: Bar[], shortLength = 34, longLength = 55, signalLength = 13) {
  // plot0: KVO, plot1: Signal
  return KlingerOscillator.calculate(toOakBars(bars), { shortLength, longLength, signalLength });
}

export function calcCVD(bars: Bar[]) {
  // Cumulative Volume Delta
  return CumulativeVolumeDelta.calculate(toOakBars(bars), {});
}

// ─── Dynamic Registry ────────────────────────────────────────────────────────

/**
 * List every indicator the library knows about.
 * Useful for building a dynamic indicator picker UI.
 *
 *   const all = listAllIndicators();
 *   // => [{ id, name, category, overlay, defaultInputs }, ...]
 */
export function listAllIndicators() {
  return indicatorRegistry.map(ind => ({
    id:           ind.id,
    name:         ind.name,
    category:     ind.category,
    overlay:      ind.metadata?.overlay ?? false,
    defaultInputs: ind.defaultInputs,
  }));
}

// ─── Full integration example ────────────────────────────────────────────────
//
// Shows how to wire SMA + RSI + MACD into a real chart.
// Adapt inside ChartService.init() or a dedicated IndicatorService.
//
// Assumes:
//   bars: Bar[] with volume field (add volume to bar.model.ts when ready)
//   chart: ReturnType<typeof createChart>  — already initialised
//   candleSeries: already populated with setData(bars)

export function attachDemoIndicators(
  chart: ReturnType<typeof createChart>,
  bars: Bar[],
): void {
  const oak = toOakBars(bars);

  // — SMA 20 (price overlay) ─────────────────────────────────────────────────
  const smaResult = SMA.calculate(oak, { len: 20, src: 'close' });
  const smaSeries = chart.addSeries(LineSeries, {
    color: '#2962FF',
    lineWidth: 1,
    priceLineVisible: false,
    lastValueVisible: false,
  });
  smaSeries.setData(smaResult.plots.plot0);

  // — Bollinger Bands (price overlay) ───────────────────────────────────────
  const bbResult = BollingerBands.calculate(oak, { length: 20, mult: 2 });
  const bbLineOpts = { color: '#546E7A', lineWidth: 1, priceLineVisible: false, lastValueVisible: false } as const;
  chart.addSeries(LineSeries, bbLineOpts).setData(bbResult.plots.plot0); // Upper
  chart.addSeries(LineSeries, { ...bbLineOpts, color: '#78909C' }).setData(bbResult.plots.plot1!); // Basis
  chart.addSeries(LineSeries, bbLineOpts).setData(bbResult.plots.plot2!); // Lower

  // — RSI (separate pane — create a second chart instance synced by time) ────
  // In production: create a second createChart() element below the main one
  // and sync its timeScale with chart.timeScale().subscribeVisibleLogicalRangeChange()
  //
  // const rsiResult = RSI.calculate(oak, { length: 14 });
  // rsiChart.addSeries(LineSeries, { color: '#CE93D8' }).setData(rsiResult.plots.plot0);

  // — MACD Histogram (separate pane) ────────────────────────────────────────
  // const macdResult = MACD.calculate(oak, { fastLength: 12, slowLength: 26, signalLength: 9 });
  // macdChart.addSeries(HistogramSeries, { color: '#26a69a' }).setData(macdResult.plots.plot2!);
  // macdChart.addSeries(LineSeries, { color: '#2962FF' }).setData(macdResult.plots.plot0);
  // macdChart.addSeries(LineSeries, { color: '#FF6D00' }).setData(macdResult.plots.plot1!);
}

// ─── Indicator catalogue (quick reference) ───────────────────────────────────
//
// MOVING AVERAGES (15)
//   SMA    — Simple MA                         { len, src }
//   EMA    — Exponential MA                    { length, src }
//   WMA    — Weighted MA                       { length }
//   RMA    — Wilder's smoothed MA              { length }
//   DEMA   — Double EMA                        { length }
//   TEMA   — Triple EMA                        { length }
//   HMA    — Hull MA                           { length }
//   LSMA   — Least Squares MA                  { length, offset }
//   ALMA   — Arnaud Legoux MA                  { windowSize, offset, sigma }
//   VWMA   — Volume Weighted MA                { length }
//   SMMA   — Smoothed MA                       { length }
//   McGinleyDynamic — Adaptive MA              { length }
//   MACross — Dual MA crossover signals        { fastLen, slowLen }
//   MARibbon — Multiple MA ribbon              {}
//   ZLSMA  — Zero Lag Linear Regression        { length, offset }
//
// OSCILLATORS (18)
//   RSI                — Relative Strength Index        { length, src }
//   Stochastic         — %K / %D                        { length, kSmoothing, dSmoothing }
//   StochRSI           — RSI applied stochastic         { length, rsiLength, ... }
//   CCI                — Commodity Channel Index         { length }
//   WilliamsPercentRange — Williams %R                  { length }
//   AwesomeOscillator  — SMA(5) − SMA(34) midpoints     { shortLen, longLen }
//   ChandeMO           — Chande Momentum Oscillator      { length }
//   DPO                — Detrended Price Oscillator      { length }
//   RVI                — Relative Vigor Index            { length }
//   TSI                — True Strength Index             { longLength, shortLength, signalLength }
//   BBPercentB         — BB position 0–1                 { length, mult }
//   FisherTransform    — Gaussian transform              { length }
//   UltimateOscillator — Multi-TF momentum              { len1, len2, len3 }
//   WaveTrend          — Channel index oscillator        { channelLen, avgLen }
//   KDJ                — Extended stochastic K/D/J       { length, signalLength }
//   ConnorsRSI         — Composite RSI                   { rsiLen, streakLen, rankLen }
//   RelativeVolatilityIndex — Volatility oscillator      { length, smoothLen }
//   SMIErgodic         — TSI-based ergodic               { ...lengths }
//
// MOMENTUM (13)
//   MACD           — { fastLength, slowLength, signalLength } → plot0/1/2
//   Momentum       — { length }
//   ROC            — Rate of change %                    { length }
//   BOP            — Balance of Power                    {}
//   BullBearPower  — Bull/bear vs EMA                    { length }
//   ElderForceIndex — Price × volume                    { length }
//   PriceOscillator — MACD as %  (PPO)                  { fastLength, slowLength, signalLength }
//   CoppockCurve   — Long-term momentum                  { wmaLength, roc1Length, roc2Length }
//   TRIX           — Triple EMA rate of change           { length, signalLength }
//   KST            — Know Sure Thing                     {}
//   SqueezeMomentum — BB/KC squeeze detector             { length, mult, lengthKC, multKC }
//   ImpulseMACD    — ZLEMA vs SMMA impulse               { lengthMA, lengthSignal }
//   MACD4C         — 4-colour histogram MACD             { ... }
//
// TREND (18)
//   ADX              — Average Directional Index         { length } → plot0/1/2
//   DMI              — Directional Movement              { length, adxSmoothing }
//   IchimokuCloud    — Tenkan/Kijun/Spans/Chikou         { tenkanLength, kijunLength, chikouLength }
//   ParabolicSAR     — Trailing stop parabola            { step, max }
//   Supertrend       — ATR-based trend line              { period, multiplier }
//   Aroon            — Trend strength by time            { length }
//   BBTrend          — BB trend measure                  { ... }
//   Choppiness       — Trending vs choppy 0–100          { length }
//   MassIndex        — Reversal identifier               { fastLength, slowLength }
//   VortexIndicator  — VI+ / VI−                        { length }
//   WilliamsAlligator — 3 smoothed MAs displaced        {}
//   ZigZag           — Pivot high/low connections        { depth, deviation, backstep }
//   ChandeKrollStop  — ATR trailing stop                 { p, q, x }
//   WilliamsFractals — 5-bar reversal markers            {}
//   CoralTrend       — Cascaded EMA filter               { period, cd }
//   ChandelierExit   — Trailing stop system              { period, atrMultiplier }
//   DonchianTrendRibbon — Multi-layer composite          {}
//   TWAP             — Time-weighted average price       {}
//
// VOLATILITY (6)
//   ATR                — Average True Range              { length }
//   ADR                — Average Daily Range             { length }
//   StandardDeviation  — { length, src }
//   HistoricalVolatility — Annualised vol                { length }
//   BBBandWidth        — (upper−lower)/middle            { length, mult }
//   BollingerBars      — Candles coloured by BB position {}
//
// CHANNELS & BANDS (5)
//   BollingerBands   — { length, mult } → upper/basis/lower
//   KeltnerChannels  — EMA ± ATR                        { length, mult }
//   DonchianChannels — highest/lowest over N bars        { length }
//   Envelope         — MA ± fixed %                      { length, percent }
//   Median           — Median price + ATR bands          {}
//
// VOLUME (13)
//   OBV                    — On Balance Volume           {}
//   MFI                    — Money Flow Index 0–100      { length }
//   PVT                    — Price Volume Trend          {}
//   VolumeOscillator       — Volume EMA %                { shortLength, longLength }
//   ChaikinMF              — Chaikin Money Flow          { length }
//   ChaikinOscillator      — AD momentum                 { fastLength, slowLength }
//   EaseOfMovement         — Price change / volume       { length }
//   KlingerOscillator      — Volume money flow           { shortLength, longLength, signalLength }
//   NetVolume              — Up − down volume            {}
//   VolumeDelta            — Buy vs sell volume          {}
//   CumulativeVolumeDelta  — Running delta total         {}
//   OBVMACD                — MACD applied to OBV         {}
//   ColoredVolume          — Volume bars by trend        {}
//
// CANDLESTICK PATTERNS (44 — rendered as chart markers)
//   Doji, Hammer, InvertedHammer, HangingMan, ShootingStar,
//   BullishEngulfing, BearishEngulfing, MorningStar, EveningStar,
//   BullishHarami, BearishHarami, PiercingLine, DarkCloudCover,
//   Marubozu, SpinningTop, ThreeWhiteSoldiers, ThreeBlackCrows,
//   KickingBullish, KickingBearish, ThreeInsideUp, ThreeInsideDown,
//   ThreeOutsideUp, ThreeOutsideDown, ... (44 total)
