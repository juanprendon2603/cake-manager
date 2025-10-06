// src/pages/stock/stock.repository.ts
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  runTransaction,
  type DocumentData,
  type QuerySnapshot,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

export type VariantStockDoc = {
  variantKey: string; // "tamano:libra|sabor:chocolate" (o el id del doc)
  stock: number;
  updatedAt?: number;
};

const variantsCol = (categoryId: string) =>
  collection(db, "catalog_stock", categoryId, "variants");

/* ----------------------------- helpers de parsing ----------------------------- */
type Rec = Record<string, unknown>;

function isRec(v: unknown): v is Rec {
  return typeof v === "object" && v !== null;
}
function asNumber(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}
function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

export async function fetchCategoryStockOnce(
  categoryId: string
): Promise<VariantStockDoc[]> {
  const snap = await getDocs(variantsCol(categoryId));
  return snap.docs.map((d) => {
    const data: DocumentData = d.data(); // DocumentData, no `any`
    const rec = isRec(data) ? data : ({} as Rec);
    return {
      variantKey: asString(rec.variantKey, d.id),
      stock: asNumber(rec.stock, 0),
      updatedAt: asNumber(rec.updatedAt, 0),
    };
  });
}

export function watchCategoryStock(
  categoryId: string,
  cb: (items: VariantStockDoc[]) => void
): () => void {
  const unsub = onSnapshot(
    variantsCol(categoryId),
    { includeMetadataChanges: false },
    (snap: QuerySnapshot<DocumentData>) => {
      const items = snap.docs.map((d) => {
        const data: DocumentData = d.data(); // DocumentData, no `any`
        const rec = isRec(data) ? data : ({} as Rec);
        return {
          variantKey: asString(rec.variantKey, d.id),
          stock: asNumber(rec.stock, 0),
          updatedAt: asNumber(rec.updatedAt, 0),
        };
      });
      cb(items);
    }
  );
  return unsub;
}

/** Opcional: resetear el stock de una variante a un valor específico (por defecto 0). */
export async function setVariantStock(
  categoryId: string,
  variantKey: string,
  to: number = 0
): Promise<void> {
  const ref = doc(variantsCol(categoryId), variantKey);
  await runTransaction(db, async (tx) => {
    tx.set(
      ref,
      {
        variantKey,
        stock: Math.max(0, Number(to) || 0),
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  });
}
