// src/features/stock/stock.model.ts
export type CategoryOption = {
  key: string; // slug (p.ej. "libra")
  label: string; // "libra"
  active?: boolean;
};

export type CategoryStep = {
  id: string;
  key: string; // slug de la etiqueta (p.ej. "tamano")
  label: string; // "tamaño"
  type: "select"; // por ahora solo select
  required: boolean;
  affectsStock: boolean;
  multi: false;
  options: CategoryOption[];
};

export type ProductCategory = {
  id: string; // "tortas"
  name: string; // "Tortas"
  active: boolean;
  pricingMode: "fixed_per_combo" | "base_plus_deltas";
  steps: CategoryStep[];
  variantPrices?: Record<string, number>; // "tamano:libra|sabor:chocolate": 12000
  createdAt?: number;
  updatedAt?: number;
};

export type SelectedValues = Record<string, string>; // { tamano: 'libra', sabor: 'chocolate' }

export type VariantRow = {
  variantKey: string; // "tamano:libra|sabor:chocolate"
  parts: SelectedValues; // { tamano: 'libra', sabor: 'chocolate' } (para mostrar)
  qty: number; // cantidad a sumar (delta)
};

// Form genérico para sumar stock de una categoría concreta
export type GenericStockForm = {
  categoryId: string;
  rows: VariantRow[];
};

// Helpers
export function buildVariantKey(
  category: ProductCategory,
  selections: SelectedValues
) {
  const keys = (category.steps || [])
    .filter((s) => s.affectsStock)
    .map((s) => `${s.key}:${String(selections[s.key] ?? "")}`);
  return keys.join("|");
}

// Producto cartesiano de opciones activas para steps que afectan stock
export function buildAllVariantRows(category: ProductCategory): VariantRow[] {
  const steps = (category.steps || []).filter(
    (s) => s.affectsStock && s.type === "select" && s.options?.length
  );

  if (!steps.length) return [];

  // Cartesiano
  let acc: SelectedValues[] = [{}];
  for (const step of steps) {
    const opts = (step.options || []).filter((o) => o.active !== false);
    const next: SelectedValues[] = [];
    for (const partial of acc) {
      for (const opt of opts) {
        next.push({ ...partial, [step.key]: opt.key });
      }
    }
    acc = next;
  }

  return acc.map((parts) => ({
    variantKey: buildVariantKey(category, parts),
    parts,
    qty: 0,
  }));
}

// Fecha YYYY-MM-DD
export function todayKey(d = new Date()) {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
