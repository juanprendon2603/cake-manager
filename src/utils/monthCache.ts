// utils/monthCache.ts
export type CacheKey = string; // "YYYY-MM"
export type CachedMonth<T> = { version: number; payload: T; cachedAt: number };

// Usamos unknown porque el contenido exacto se conocerá al usar getMonthCache<T>
const mem = new Map<CacheKey, CachedMonth<unknown>>();

export function getMonthCache<T>(ym: string): CachedMonth<T> | null {
  if (mem.has(ym)) {
    return mem.get(ym)! as CachedMonth<T>;
  }
  const raw = localStorage.getItem(`cm:month:${ym}`);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CachedMonth<T>;
    mem.set(ym, parsed);
    return parsed;
  } catch {
    return null;
  }
}

export function setMonthCache<T>(ym: string, data: CachedMonth<T>) {
  mem.set(ym, data);
  localStorage.setItem(`cm:month:${ym}`, JSON.stringify(data));
}

export function clearMonthCache(ym: string) {
  mem.delete(ym);
  localStorage.removeItem(`cm:month:${ym}`);
}
