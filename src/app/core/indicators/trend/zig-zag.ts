import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

export function zigZag(
  bars: BarInput[],
  depth: number,
  deviation: number,
  backstep: number,
): (number | null)[] {
  const result: (number | null)[] = new Array(bars.length).fill(null);
  if (bars.length < depth + backstep + 2) return result;

  const pivotHighs: Map<number, number> = new Map();
  const pivotLows: Map<number, number> = new Map();

  // Find pivots
  for (let i = depth; i < bars.length - depth; i++) {
    let isHigh = true;
    let isLow = true;
    for (let j = i - depth; j <= i + depth; j++) {
      if (j === i) continue;
      if (bars[j].high >= bars[i].high) isHigh = false;
      if (bars[j].low <= bars[i].low) isLow = false;
    }
    if (isHigh) pivotHighs.set(i, bars[i].high);
    if (isLow) pivotLows.set(i, bars[i].low);
  }

  // Filter by deviation and backstep
  const filteredHighs = filterPivots(pivotHighs, bars, deviation, backstep, true);
  const filteredLows = filterPivots(pivotLows, bars, deviation, backstep, false);

  // Merge alternating pivots
  const merged = mergeAlternating(filteredHighs, filteredLows, bars);

  // Set zigzag lines at pivot points
  for (let k = 1; k < merged.length; k++) {
    const prev = merged[k - 1];
    const curr = merged[k];
    const startIdx = prev.index;
    const endIdx = curr.index;
    const startVal = prev.value;
    const endVal = curr.value;
    for (let i = startIdx; i <= endIdx; i++) {
      const ratio = (i - startIdx) / (endIdx - startIdx);
      result[i] = startVal + ratio * (endVal - startVal);
    }
  }

  return result;
}

interface PivotPoint {
  index: number;
  value: number;
}

function filterPivots(
  pivots: Map<number, number>,
  bars: BarInput[],
  deviation: number,
  backstep: number,
  isHigh: boolean,
): PivotPoint[] {
  const sorted = [...pivots.entries()]
    .sort(([a], [b]) => a - b)
    .map(([idx, val]) => ({ index: idx, value: val }));

  // Remove nearby pivots (backstep)
  const filtered: PivotPoint[] = [];
  for (const p of sorted) {
    let keep = true;
    for (let i = filtered.length - 1; i >= 0; i--) {
      const prev = filtered[i];
      if (p.index - prev.index > backstep) break;
      if (
        (isHigh && p.value <= prev.value) ||
        (!isHigh && p.value >= prev.value)
      ) {
        keep = false;
        break;
      }
      if (keep) filtered.pop();
    }
    if (keep) filtered.push(p);
  }

  // Filter by minimum deviation
  if (filtered.length < 2) return filtered;
  const result: PivotPoint[] = [filtered[0]];
  for (let i = 1; i < filtered.length; i++) {
    const priceChange = Math.abs(
      (filtered[i].value - result[result.length - 1].value) /
        result[result.length - 1].value,
    );
    if (priceChange >= deviation / 100) {
      result.push(filtered[i]);
    }
  }

  return result;
}

function mergeAlternating(
  highs: PivotPoint[],
  lows: PivotPoint[],
  bars: BarInput[],
): PivotPoint[] {
  const combined: Array<PivotPoint & { type: 'high' | 'low' }> = [];
  let hi = 0;
  let li = 0;

  // Start with the earlier pivot
  if (highs.length === 0 && lows.length === 0) return [];
  if (highs.length === 0) return lows;
  if (lows.length === 0) return highs;

  const all = [...highs.map(h => ({ ...h, type: 'high' as const })), ...lows.map(l => ({ ...l, type: 'low' as const }))]
    .sort((a, b) => a.index - b.index);

  // Filter to alternating types
  const merged: Array<PivotPoint & { type: 'high' | 'low' }> = [];
  for (const item of all) {
    if (merged.length === 0) {
      merged.push(item);
    } else {
      const last = merged[merged.length - 1];
      if (item.type === last.type) {
        // Replace with stronger pivot of the same type
        if (item.type === 'high' && item.value > last.value) {
          merged[merged.length - 1] = item;
        } else if (item.type === 'low' && item.value < last.value) {
          merged[merged.length - 1] = item;
        }
      } else {
        merged.push(item);
      }
    }
  }

  return merged;
}

const ZIGZAG_DEF: IndicatorDef<{ depth: number; deviation: number; backstep: number }, number | null> = {
  meta: {
    id: 'zig-zag',
    name: 'Zig Zag',
    shortName: 'ZigZag',
    category: 'trend',
    overlay: true,
    description:
      'Connects alternating pivot highs and lows to filter out minor price movements. Useful for identifying support/resistance levels and Elliott Wave structures.',
    params: [
      {
        key: 'depth',
        label: 'Depth',
        type: 'number',
        defaultValue: 12,
        min: 2,
        max: 100,
        description: 'Bars to look on each side of a pivot',
      },
      {
        key: 'deviation',
        label: 'Deviation %',
        type: 'number',
        defaultValue: 5,
        min: 0.1,
        max: 50,
        step: 0.1,
        description: 'Minimum price change percentage',
      },
      {
        key: 'backstep',
        label: 'Backstep',
        type: 'number',
        defaultValue: 3,
        min: 1,
        max: 50,
        description: 'Nearby pivot removal distance',
      },
    ],
  },
  defaultOptions: { depth: 12, deviation: 5, backstep: 3 },
  calculate(
    bars: BarInput[],
    options: { depth: number; deviation: number; backstep: number },
  ): (number | null)[] {
    return zigZag(bars, options.depth, options.deviation, options.backstep);
  },
};

indicatorRegistry.register(ZIGZAG_DEF);