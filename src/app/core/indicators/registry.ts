import type { IndicatorCategory, IndicatorDef } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDef = IndicatorDef<any, any>;

class IndicatorRegistryImpl {
  private readonly map = new Map<string, AnyDef>();

  register(def: AnyDef): void {
    this.map.set(def.meta.id, def);
  }

  get(id: string): AnyDef | undefined {
    return this.map.get(id);
  }

  getAll(): AnyDef[] {
    return [...this.map.values()];
  }

  getByCategory(category: IndicatorCategory): AnyDef[] {
    return this.getAll().filter(d => d.meta.category === category);
  }
}

// Singleton — indicator files self-register on import (side-effect pattern)
export const indicatorRegistry = new IndicatorRegistryImpl();
