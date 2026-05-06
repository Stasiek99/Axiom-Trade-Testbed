import type { BarInput, IndicatorDef, DMIPoint } from '../types';
import { indicatorRegistry } from '../registry';

function trueRange(high: number, low: number, prevClose: number): number {
  return Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
}

function directionalMovement(high: number, low: number, prevHigh: number, prevLow: number): { plusDM: number; minusDM: number } {
  const upMove = high - prevHigh;
  const downMove = prevLow - low;
  return {
    plusDM: upMove > downMove && upMove > 0 ? upMove : 0,
    minusDM: downMove > upMove && downMove > 0 ? downMove : 0,
  };
}

function wilderSmooth(values: number[], length: number): number[] {
  const result: number[] = new Array(values.length).fill(0);
  let sum = 0;
  for (let j = 0; j < length; j++) sum += values[j];
  result[length - 1] = sum;
  for (let i = length; i < values.length; i++) {
    result[i] = result[i - 1] - result[i - 1] / length + values[i];
  }
  return result;
}

function diValue(smoothedTR: number, smoothedDM: number): number {
  return smoothedTR !== 0 ? 100 * smoothedDM / smoothedTR : 0;
}

export function dmi(bars: BarInput[], length: number, adxSmoothing: number): (DMIPoint | null)[] {
  const result: (DMIPoint | null)[] = new Array(bars.length).fill(null);
  if (bars.length < length + adxSmoothing) return result;

  const trArr: number[] = new Array(bars.length).fill(0);
  const plusDMArr: number[] = new Array(bars.length).fill(0);
  const minusDMArr: number[] = new Array(bars.length).fill(0);

  for (let i = 1; i < bars.length; i++) {
    trArr[i] = trueRange(bars[i].high, bars[i].low, bars[i - 1].close);
    const dm = directionalMovement(bars[i].high, bars[i].low, bars[i - 1].high, bars[i - 1].low);
    plusDMArr[i] = dm.plusDM;
    minusDMArr[i] = dm.minusDM;
  }

  const smoothedTR = wilderSmooth(trArr, length);
  const smoothedPlusDM = wilderSmooth(plusDMArr, length);
  const smoothedMinusDM = wilderSmooth(minusDMArr, length);

  // DI values: first valid at bar index `length`
  let dxAccum = 0;
  let dxCount = 0;
  let prevAdx = 0;
  const adxReadyIdx = length + adxSmoothing - 1;

  for (let i = 0; i < bars.length; i++) {
    if (i < length) continue;

    const plusDI = diValue(smoothedTR[i], smoothedPlusDM[i]);
    const minusDI = diValue(smoothedTR[i], smoothedMinusDM[i]);

    if (i < adxReadyIdx) {
      // Accumulate DX before ADX is ready
      const sum = plusDI + minusDI;
      const dx = sum !== 0 ? 100 * Math.abs(plusDI - minusDI) / sum : 0;
      dxAccum += dx;
      dxCount++;
      continue;
    }

    const sum = plusDI + minusDI;
    const dx = sum !== 0 ? 100 * Math.abs(plusDI - minusDI) / sum : 0;

    if (i === adxReadyIdx) {
      prevAdx = (dxAccum + dx) / adxSmoothing;
    } else {
      prevAdx = (prevAdx * (adxSmoothing - 1) + dx) / adxSmoothing;
    }

    result[i] = { plusDI, minusDI, adx: prevAdx };
  }

  return result;
}

const DMI_DEF: IndicatorDef<{ length: number; adxSmoothing: number }, DMIPoint | null> = {
  meta: {
    id: 'dmi',
    name: 'Directional Movement Index',
    shortName: 'DMI',
    category: 'trend',
    overlay: false,
    description:
      'Displays +DI and −DI directional lines with a separately smoothed ADX line. +DI crossing above −DI signals an uptrend; the reverse signals a downtrend. ADX measures trend strength.',
    params: [
      {
        key: 'length',
        label: 'DI Period',
        type: 'number',
        defaultValue: 14,
        min: 2,
        max: 100,
        description: 'Period for DI calculation',
      },
      {
        key: 'adxSmoothing',
        label: 'ADX Smoothing',
        type: 'number',
        defaultValue: 14,
        min: 2,
        max: 100,
        description: 'Smoothing period for ADX line',
      },
    ],
  },
  defaultOptions: { length: 14, adxSmoothing: 14 },
  calculate(bars: BarInput[], options: { length: number; adxSmoothing: number }): (DMIPoint | null)[] {
    return dmi(bars, options.length, options.adxSmoothing);
  },
};

indicatorRegistry.register(DMI_DEF);
