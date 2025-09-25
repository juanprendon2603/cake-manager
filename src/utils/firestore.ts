// utils/firestore.ts
export function pruneUndefined<T extends Record<string, any>>(obj: T): T {
  const out: any = Array.isArray(obj) ? [] : {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue; // 👈 clave
    if (v && typeof v === "object" && !(v instanceof Date)) {
      out[k] = pruneUndefined(v);
    } else {
      out[k] = v;
    }
  }
  return out as T;
}
