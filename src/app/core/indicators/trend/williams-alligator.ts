import type { BarInput, IndicatorDef, AlligatorPoint } from '../types';
import { indicatorRegistry } from '../registry';

function smma(values: number[], period: number): number[] {
  const result: number[] = new Array(values.length).fill(0);
  if (values.length < period) return result;
  let sum = 0;
  for (let j = 0; j < period; j++) sum += values[j];
  result[period - 1] = sum / period;
  for (let i = period; i < values.length; i++) {
    result[i] = (result[i - 1] * (period - 1) + values[i]) / period;
  }
  return result;
}

export function williamsAlligator(bars: BarInput[]): (AlligatorPoint | null)[] {
  const result: (AlligatorPoint | null)[] = new Array(bars.length).fill(null);
  if (bars.length < 21) return result;

  const closes = bars.map(b => b.close);

  // Jaw: SMMA 13, displaced forward 8
  const jawRaw = smma(closes, 13);
  const jaw: number[] = new Array(bars.length).fill(0);
  for (let i = 0; i < bars.length; i++) {
    jaw[i] = i + 8 < bars.length ? jawRaw[i] : 0;
  }

  // Teeth: SMMA 8, displaced forward 5
  const teethRaw = smma(closes, 8);
  const teeth: number[] = new Array(bars.length).fill(0);
  for (let i = 0; i < bars.length; i++) {
    teeth[i] = i + 5 < bars.length ? teethRaw[i] : 0;
  }

  // Lips: SMMA 5, displaced forward 3
  const lipsRaw = smma(closes, 5);
  const lips: number[] = new Array(bars.length).fill(0);
  for (let i = 0; i < bars.length; i++) {
    lips[i] = i + 3 < bars.length ? lipsRaw[i] : 0;
  }

  for (let i = 0; i < bars.length; i++) {
    if (jaw[i] !== 0 && teeth[i] !== 0 && lips[i] !== 0) {
      result[i] = { jaw: jaw[i], teeth: teeth[i], lips: lips[i] };
    }
  }

  return result;
}

const ALLIGATOR_DEF: IndicatorDef<Record<string, unknown>, AlligatorPoint | null> = {
  meta: {
    id: 'williams-alligator',
    name: "Williams Alligator",
    shortName: 'Alligator',
    category: 'trend',
    overlay: true,
    description:
      "Three smoothed moving averages (Jaw, Teeth, Lips) with displacement. When the lines are intertwined (sleeping), the market is ranging. When they separate (eating) and align in order, a trend is in progress.",
    params: [],
  },
  defaultOptions: {},
  calculate(bars: BarInput[]): (AlligatorPoint | null)[] {
    return williamsAlligator(bars);
  },
};

indicatorRegistry.register(ALLIGATOR_DEF);