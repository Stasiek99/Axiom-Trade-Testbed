import type { BarInput, IndicatorDef } from '../types';
import { indicatorRegistry } from '../registry';

function midpoint(b: BarInput): number {
  return (b.high + b.low) / 2;
}

export function awesomeOscillator(
  bars: BarInput[],
  shortLen: number,
  longLen: number,
): (number | null)[] {
  const n = bars.length;
  const result: (number | null)[] = new Array(n).fill(null);
  if (n < longLen) return result;

  const mid = bars.map(midpoint);
  const shortSma: (number | null)[] = new Array(n).fill(null);
  const longSma: (number | null)[] = new Array(n).fill(null);

  for (let i = shortLen - 1; i < n; i++) {
    let s = 0;
    for (let j = i - shortLen + 1; j <= i; j++) s += mid[j];
    shortSma[i] = s / shortLen;
  }
  for (let i = longLen - 1; i < n; i++) {
    let s = 0;
    for (let j = i - longLen + 1; j <= i; j++) s += mid[j];
    longSma[i] = s / longLen;
  }

  for (let i = longLen - 1; i < n; i++) {
    result[i] = shortSma[i]! - longSma[i]!;
  }
  return result;
}

const DEF: IndicatorDef<{ shortLen: number; longLen: number }, number | null> = {
  meta: {
    id: 'awesome-oscillator',
    name: 'Awesome Oscillator',
    shortName: 'AO',
    category: 'oscillators',
    overlay: false,
    description:
      'A histogram measuring the difference between a 5-period and 34-period simple moving average of median price (HL/2). Increasing green bars above zero indicate upward momentum; red bars below zero indicate downward momentum.',
    params: [
      { key: 'shortLen', label: 'Short Period', type: 'number', defaultValue: 5, min: 2, max: 50, description: 'Short SMA period' },
      { key: 'longLen', label: 'Long Period', type: 'number', defaultValue: 34, min: 5, max: 200, description: 'Long SMA period' },
    ],
  },
  defaultOptions: { shortLen: 5, longLen: 34 },
  calculate(bars, options) {
    return awesomeOscillator(bars, options.shortLen, options.longLen);
  },
};

indicatorRegistry.register(DEF);
export { DEF as awesomeOscillatorDef };
