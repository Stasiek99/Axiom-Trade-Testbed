import type { BarInput, IndicatorDef, ADXPoint } from '../types';
import { indicatorRegistry } from '../registry';

function trueRange(high: number, low: number, prevClose: number): number {
  return Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
}

function directionalMovement(
  high: number,
  low: number,
  prevHigh: number,
  prevLow: number,
): { plusDM: number; minusDM: number } {
  const upMove = high - prevHigh;
  const downMove = prevLow - low;
  const plusDM = upMove > downMove && upMove > 0 ? upMove : 0;
  const minusDM = downMove > upMove && downMove > 0 ? downMove : 0;
  return { plusDM, minusDM };
}

export function adx(bars: BarInput[], length: number): (ADXPoint | null)[] {
  const result: (ADXPoint | null)[] = new Array(bars.length).fill(null);
  if (bars.length < length * 2) return result;

  const trArr: number[] = [];
  const plusDMArr: number[] = [];
  const minusDMArr: number[] = [];

  for (let i = 1; i < bars.length; i++) {
    trArr.push(trueRange(bars[i].high, bars[i].low, bars[i - 1].close));
    const dm = directionalMovement(bars[i].high, bars[i].low, bars[i - 1].high, bars[i - 1].low);
    plusDMArr.push(dm.plusDM);
    minusDMArr.push(dm.minusDM);
  }

  // Wilder smoothing: first value = sum of first `length` elements, then iterative
  const smoothedTR: number[] = new Array(trArr.length).fill(0);
  const smoothedPlusDM: number[] = new Array(plusDMArr.length).fill(0);
  const smoothedMinusDM: number[] = new Array(minusDMArr.length).fill(0);

  let sumTR = 0;
  let sumPlusDM = 0;
  let sumMinusDM = 0;
  for (let j = 0; j < length; j++) {
    sumTR += trArr[j];
    sumPlusDM += plusDMArr[j];
    sumMinusDM += minusDMArr[j];
  }
  smoothedTR[length - 1] = sumTR;
  smoothedPlusDM[length - 1] = sumPlusDM;
  smoothedMinusDM[length - 1] = sumMinusDM;

  for (let i = length; i < trArr.length; i++) {
    smoothedTR[i] = smoothedTR[i - 1] - smoothedTR[i - 1] / length + trArr[i];
    smoothedPlusDM[i] = smoothedPlusDM[i - 1] - smoothedPlusDM[i - 1] / length + plusDMArr[i];
    smoothedMinusDM[i] = smoothedMinusDM[i - 1] - smoothedMinusDM[i - 1] / length + minusDMArr[i];
  }

  const diPlus: number[] = new Array(bars.length).fill(0);
  const diMinus: number[] = new Array(bars.length).fill(0);
  // DI values aligned with bar index: bar i uses smoothed[i-1]
  for (let i = 0; i < bars.length; i++) {
    const idx = i - 1;
    if (idx >= 0 && idx < smoothedTR.length) {
      diPlus[i] = smoothedTR[idx] !== 0 ? 100 * smoothedPlusDM[idx] / smoothedTR[idx] : 0;
      diMinus[i] = smoothedTR[idx] !== 0 ? 100 * smoothedMinusDM[idx] / smoothedTR[idx] : 0;
    }
  }

  // ADX is Wilder-smoothed DX starting from bar index `length * 2 - 2`
  let dxAccum = 0;
  let dxCount = 0;
  let prevAdx = 0;
  const adxReadyIdx = length * 2 - 2;

  for (let i = 0; i < bars.length; i++) {
    if (i < length) continue; // need at least `length` DI values
    const sum = diPlus[i] + diMinus[i];
    const dx = sum !== 0 ? 100 * Math.abs(diPlus[i] - diMinus[i]) / sum : 0;

    if (i < adxReadyIdx) {
      dxAccum += dx;
      dxCount++;
      continue;
    }

    if (i === adxReadyIdx) {
      prevAdx = (dxAccum + dx) / length;
    } else {
      prevAdx = (prevAdx * (length - 1) + dx) / length;
    }

    result[i] = { adx: prevAdx, plusDI: diPlus[i], minusDI: diMinus[i] };
  }

  return result;
}

const ADX_DEF: IndicatorDef<{ length: number }, ADXPoint | null> = {
  meta: {
    id: 'adx',
    name: 'Average Directional Index',
    shortName: 'ADX',
    category: 'trend',
    overlay: false,
    description:
      'Measures trend strength on a scale of 0–100. Values above 25 indicate a strong trend; below 20 suggests a weak or ranging market. Includes +DI and −DI lines for direction.',
    params: [
      {
        key: 'length',
        label: 'Period',
        type: 'number',
        defaultValue: 14,
        min: 2,
        max: 100,
        description: 'Number of bars for smoothing',
      },
    ],
  },
  defaultOptions: { length: 14 },
  calculate(bars: BarInput[], options: { length: number }): (ADXPoint | null)[] {
    return adx(bars, options.length);
  },
};

indicatorRegistry.register(ADX_DEF);
