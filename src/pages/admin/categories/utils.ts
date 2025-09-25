import type {
  CategoryOption,
  CategoryStep,
  ProductCategory,
} from "../../../utils/catalog";

export const slugify = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

export type DraftCat = Omit<ProductCategory, "createdAt" | "updatedAt"> & {
  pricingMode: "fixed_per_combo";
};

export const makeEmptyDraft = (): DraftCat => ({
  id: "",
  name: "",
  active: true,
  pricingMode: "fixed_per_combo",
  steps: [],
  variantPrices: {},
});

export function draftFromCategory(c: ProductCategory): DraftCat {
  const steps: CategoryStep[] = (c.steps || []).map((s) => ({
    ...s,
    type: "select",
    required: true,
    affectsStock: true,
    key: s.key || slugify(s.label || ""),
    options: (s.options || []).map((o) => ({
      ...o,
      key: o.key || slugify(o.label || ""),
      active: o.active !== false,
      priceDelta: null,
    })),
  }));
  return {
    id: c.id,
    name: c.name,
    active: c.active !== false,
    pricingMode: "fixed_per_combo",
    steps,
    variantPrices: c.variantPrices || {},
  };
}

export type ComboRow = {
  key: string;
  labels: { stepLabel: string; optionLabel: string }[];
  parts: { stepKey: string; optionKey: string }[];
};

export function generateCombos(steps: CategoryStep[]): ComboRow[] {
  const selectSteps = (steps || []).filter((s) => s.type === "select");
  if (selectSteps.length === 0) return [];

  const pools = selectSteps.map((step) =>
    (step.options || [])
      .filter((o) => o.active !== false && !!o.label.trim())
      .map((opt) => ({ step, opt }))
  );
  if (pools.some((p) => p.length === 0)) return [];

  const out: ComboRow[] = [];
  const dfs = (
    i: number,
    acc: { step: CategoryStep; opt: CategoryOption }[]
  ) => {
    if (i === pools.length) {
      const key = acc
        .map(({ step, opt }) => `${step.key}=${opt.key}`)
        .join("|");
      out.push({
        key,
        labels: acc.map(({ step, opt }) => ({
          stepLabel: step.label,
          optionLabel: opt.label,
        })),
        parts: acc.map(({ step, opt }) => ({
          stepKey: step.key,
          optionKey: opt.key,
        })),
      });
      return;
    }
    for (const pair of pools[i]) dfs(i + 1, [...acc, pair]);
  };
  dfs(0, []);
  return out;
}

export function validateDraft(
  draft: DraftCat,
  combos: ComboRow[]
): string | null {
  if (!draft.name.trim()) return "La categoría necesita un nombre.";
  if ((draft.steps || []).length === 0)
    return "Debes crear al menos un atributo.";
  for (const s of draft.steps) {
    if (!s.label.trim()) return "Cada atributo necesita etiqueta.";
    const actives = (s.options || []).filter(
      (o) => o.active !== false && !!o.label.trim()
    );
    if (actives.length === 0)
      return `El atributo "${s.label}" necesita opciones activas.`;
  }
  if (combos.length === 0)
    return "No hay combinaciones posibles (revisa opciones activas).";
  for (const c of combos) {
    const v = draft.variantPrices?.[c.key];
    if (!(typeof v === "number" && v > 0))
      return "Asigna precio a todas las combinaciones.";
  }
  return null;
}
