import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  setDoc,
  type CollectionReference,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import type {
  CategoryOption,
  CategoryStep,
  ProductCategory,
  SelectedValues,
} from "../../types/catalog";
import type { GenericSale, VariantStock } from "../sales/sales.service";

const CATEGORIES_COL = collection(
  db,
  "catalog_categories"
) as CollectionReference<ProductCategory>;

const STOCK_ROOT = collection(db, "catalog_stock");

const SALES_COL = collection(
  db,
  "sales_generic"
) as CollectionReference<GenericSale>;

function clean<T extends object>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}
function slugify(s: string) {
  return s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function normalizeSteps(
  steps: CategoryStep[] | undefined
): CategoryStep[] {
  return (steps || []).map((s) => {
    const normOptions: CategoryOption[] = (s.options || []).map((o) => ({
      key: slugify(o.label || o.key || ""),
      label: o.label || o.key || "",
      active: o.active !== false,
    })) as CategoryOption[];

    return {
      id: s.id || crypto.randomUUID(),
      key: slugify(s.label || s.key || ""),
      label: s.label || s.key || "",
      type: "select",
      required: true,
      affectsStock: s.affectsStock !== false,
      multi: false,
      options: normOptions,
    } as CategoryStep;
  });
}

export function normalizeVariantPrices(
  variantPrices: Record<string, number> | undefined,
  originalSteps: CategoryStep[] | undefined,
  newSteps: CategoryStep[]
): Record<string, number> {
  if (!variantPrices || !originalSteps || originalSteps.length === 0) return {};

  const out: Record<string, number> = {};

  const splitPair = (pair: string) => {
    const idx = pair.indexOf(":") >= 0 ? pair.indexOf(":") : pair.indexOf("=");
    if (idx < 0) return [pair, ""];
    return [pair.slice(0, idx), pair.slice(idx + 1)];
  };

  for (const [oldKey, price] of Object.entries(variantPrices)) {
    const pairs = oldKey
      .split("|")
      .map((p) => p.trim())
      .filter(Boolean);
    const oldSelMap = new Map<string, string>();
    for (const p of pairs) {
      const [sk, ov] = splitPair(p);
      oldSelMap.set(sk, ov);
    }

    const rebuiltPairs: string[] = [];
    for (let i = 0; i < newSteps.length; i++) {
      const newStep = newSteps[i];
      const oldStep = originalSteps[i];

      const oldStepKeyCandidates = [
        oldStep?.key,
        slugify(oldStep?.label || ""),
      ].filter(Boolean) as string[];

      let oldOptKey = "";
      for (const cand of oldStepKeyCandidates) {
        if (oldSelMap.has(cand)) {
          oldOptKey = oldSelMap.get(cand) || "";
          break;
        }
      }

      const oldOpt =
        oldStep?.options?.find(
          (o) => o.key === oldOptKey || slugify(o.label || "") === oldOptKey
        ) || null;

      const newOptKey = oldOpt ? slugify(oldOpt.label || oldOpt.key || "") : "";
      rebuiltPairs.push(`${newStep.key}:${newOptKey}`);
    }

    const newKey = rebuiltPairs.join("|");
    out[newKey] = Number(price) || 0;
  }

  return out;
}

export async function listCategories(opts?: {
  includeInactive?: boolean;
}): Promise<ProductCategory[]> {
  const qs = await getDocs(query(CATEGORIES_COL, orderBy("name")));
  const items: ProductCategory[] = [];
  qs.forEach((d) =>
    items.push({ id: d.id, ...(d.data() as Omit<ProductCategory, "id">) })
  );
  return opts?.includeInactive
    ? items
    : items.filter((c) => c.active !== false);
}

export async function upsertCategory(cat: ProductCategory): Promise<void> {
  const id = (cat.id || slugify(cat.name)).trim();
  if (!id) throw new Error("Falta id/nombre de la categoría");

  const stepsNormalized = normalizeSteps(cat.steps);

  const variantPricesNormalized = normalizeVariantPrices(
    (cat as any).variantPrices || {},
    cat.steps || [],
    stepsNormalized
  );

  const ref = doc(CATEGORIES_COL, id);

  const payload: any = clean({
    id,
    name: cat.name,
    active: cat.active !== false,
    pricingMode: "fixed_per_combo" as const,
    steps: stepsNormalized,
    variantPrices: variantPricesNormalized,
    createdAt: cat.createdAt ?? Date.now(),
    updatedAt: Date.now(),
  });

  await setDoc(ref, payload, { merge: true });
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(CATEGORIES_COL, id));
}
function buildKeyFrom(
  steps: { key: string }[],
  selections: Record<string, string | string[] | undefined>
): string {
  return (steps || [])
    .map((s) => {
      const raw = selections[s.key];
      const v = Array.isArray(raw) ? raw[0] : raw ?? "";
      return `${s.key}:${String(v)}`;
    })
    .join("|");
}

export function buildVariantKey(
  category: ProductCategory,
  selections: SelectedValues,
  opts?: { mode?: "price" | "stock" }
): string {
  const mode = opts?.mode ?? "stock";
  const stepsAll = category?.steps || [];
  const steps =
    mode === "stock"
      ? stepsAll.filter((s) => s.affectsStock !== false)
      : stepsAll;
  return buildKeyFrom(steps, selections as Record<string, string>);
}

export const buildPriceKey = (
  cat: ProductCategory,
  sel: SelectedValues
): string => buildVariantKey(cat, sel, { mode: "price" });

export const buildStockKey = (
  cat: ProductCategory,
  sel: SelectedValues
): string => buildVariantKey(cat, sel, { mode: "stock" });

export function computePrice(
  category: ProductCategory,
  selections: SelectedValues
): number {
  const vp = (category as any).variantPrices as
    | Record<string, number>
    | undefined;
  if (vp && Object.keys(vp).length > 0) {
    const key = buildPriceKey(category, selections);
    return Number(vp[key] ?? 0);
  }

  if ((category as any).pricingMode === "base_plus_deltas") {
    let price = (category as any).basePrice || 0;
    for (const step of category.steps || []) {
      if (step.type === "select" && step.options?.length) {
        const val = selections[step.key];
        const optKey = Array.isArray(val) ? val[0] : String(val ?? "");
        const opt = step.options.find((o) => o.key === optKey);
        if ((opt as any)?.priceDelta) price += Number((opt as any).priceDelta);
      }
    }
    return price;
  }

  return 0;
}

const variantsCol = (categoryId: string) =>
  collection(
    STOCK_ROOT,
    categoryId,
    "variants"
  ) as CollectionReference<VariantStock>;

export async function getVariantStock(
  categoryId: string,
  variantKey: string
): Promise<number> {
  const snap = await getDoc(doc(variantsCol(categoryId), variantKey));
  return snap.exists() ? snap.data().stock ?? 0 : 0;
}

export async function addStock(
  categoryId: string,
  variantKey: string,
  qty: number
) {
  const ref = doc(variantsCol(categoryId), variantKey);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const curr = snap.exists() ? snap.data().stock ?? 0 : 0;
    const next = Math.max(0, curr + qty);
    tx.set(
      ref,
      { variantKey, stock: next, updatedAt: Date.now() },
      { merge: true }
    );
  });
}

export async function tryDecrementStockGeneric(
  categoryId: string,
  variantKey: string,
  qty: number
) {
  const ref = doc(variantsCol(categoryId), variantKey);
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const curr = snap.exists() ? snap.data().stock ?? 0 : 0;
    if (curr < qty) return { decremented: false, current: curr };
    tx.set(
      ref,
      { variantKey, stock: curr - qty, updatedAt: Date.now() },
      { merge: true }
    );
    return { decremented: true, current: curr - qty };
  });
}

type StockMovement = { variantKey: string; delta: number };
export async function persistGenericStockUpdate(args: {
  categoryId: string;
  movements: StockMovement[];
}): Promise<void> {
  const { categoryId, movements } = args;

  const valid = (movements || []).filter(
    (m) => Number.isFinite(m.delta) && m.delta !== 0 && m.variantKey
  );
  if (valid.length === 0) return;

  for (const { variantKey, delta } of valid) {
    const ref = doc(variantsCol(categoryId), variantKey);
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      const curr = snap.exists() ? Number(snap.data().stock ?? 0) : 0;
      const next = Math.max(0, curr + delta);
      tx.set(
        ref,
        { variantKey, stock: next, updatedAt: Date.now() },
        { merge: true }
      );
    });
  }
}

export function buildKeys() {
  const d = new Date();
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const dayKey = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}`;
  const monthKey = dayKey.slice(0, 7);
  return { dayKey, monthKey };
}

export async function registerGenericSale(sale: GenericSale) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  await setDoc(doc(SALES_COL, id), {
    ...sale,
    id,
    createdAt: Date.now(),
  } as GenericSale);
}
