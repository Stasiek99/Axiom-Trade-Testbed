import type { BarInput, IndicatorDef, VortexPoint } from '../types';
import { indicatorRegistry } from '../registry';

export function vortex(bars: BarInput[], length: number): (VortexPoint | null)[] {
  const result: (VortexPoint | null)[] = new Array(bars.length).fill(null);
  if (bars.length < length + 1) return result;

  const vmPlus: number[] = new Array(bars.length).fill(0);
  const vmMinus: number[] = new Array(bars.length).fill(0);
  const tr: number[] = new Array(bars.length).fill(0);

  for (let i = 1; i < bars.length; i++) {
    vmPlus[i] = Math.abs(bars[i].high - bars[i - 1].low);
    vmMinus[i] = Math.abs(bars[i].low - bars[i - 1].high);
    tr[i] = Math.max(
      bars[i].high - bars[i].low,
      Math.abs(bars[i].high - bars[i - 1].close),
      Math.abs(bars[i].low - bars[i - 1].close),
    );
  }

  for (let i = length; i < bars.length; i++) {
    let sumVp = 0;
    let sumVm = 0;
    let sumTr = 0;
    for (let j = i - length + 1; j <= i; j++) {
      sumVp += vmPlus[j];
      sumVm += vmMinus[j];
      sumTr += tr[j];
    }

    result[i] = {
      viPlus: sumTr !== 0 ? sumVp / sumTr : 0,
      viMinus: sumTr !== 0 ? sumVm / sumTr : 0,
    };
  }

  return result;
}

const VORTEX_DEF: IndicatorDef<{ length: number }, VortexPoint | null> = {
  meta: {
    id: 'vortex',
    name: 'Vortex Indicator',
    shortName: 'Vortex',
    category: 'trend',
    overlay: false,
    description:
      'Two oscillators (VI+ and VI−) that capture positive and negative trend movement. A bullish signal occurs when VI+ crosses above VI−; bearish when VI− crosses above VI+.',
    params: [
      {
        key: 'length',
        label: 'Period',
        type: 'number',
        defaultValue: 14,
        min: 2,
        max: 100,
        description: 'Number of bars for calculation',
      },
    ],
  },
  defaultOptions: { length: 14 },
  calculate(bars: BarInput[], options: { length: number }): (VortexPoint | null)[] {
    return vortex(bars, options.length);
  },
};

indicatorRegistry.register(VORTEX_DEF);