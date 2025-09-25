// src/types/catalog.ts (o donde tengas tus tipos)
export type CategoryOption = { key: string; label: string; active?: boolean };
export type CategoryStep = {
  id: string;
  key: string; // p.ej. "tamano"
  label: string; // p.ej. "tamaño"
  type: "select";
  required: boolean;
  affectsStock: boolean;
  multi: false;
  options: CategoryOption[];
};
export type ProductCategory = {
  id: string;
  name: string;
  active: boolean;
  pricingMode: "fixed_per_combo" | "base_plus_deltas";
  steps: CategoryStep[];
  variantPrices?: Record<string, number>;
  createdAt?: number;
  updatedAt?: number;
};

export type SelectedValues = Record<string, string>; // { tamano:"gran", sabor:"ama" }

export function buildVariantKey(cat: ProductCategory, sel: SelectedValues) {
  const keys = (cat.steps || [])
    .filter((s) => s.affectsStock)
    .map((s) => `${s.key}:${String(sel[s.key] ?? "")}`);
  return keys.join("|");
}
