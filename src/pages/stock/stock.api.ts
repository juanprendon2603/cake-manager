// src/pages/stock/stock.api.ts (versión genérica, sin imports del modelo viejo)
import {
  collection,
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  type DocumentData,
  type QuerySnapshot,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

import { persistGenericStockUpdate } from "../catalog/catalog.service"; // <- ya lo tienes en tu servicio

/* --------------------------- Tipos genéricos actuales --------------------------- */

export type VariantRow = {
  variantKey: string; // "tamano:libra|sabor:chocolate"
  parts: Record<string, string>; // { tamano: "libra", sabor: "chocolate" }
  qty: number; // delta a sumar
};

export type GenericStockForm = {
  categoryId: string; // p.ej. "tortas"
  date: string; // "YYYY-MM-DD"
  rows: VariantRow[];
};

/* -----------------------------------------------------------------------------
 * persistStockUpdate (firma legacy) → ahora espera el formato genérico
 * -----------------------------------------------------------------------------
 * Antes recibía FormValues con cakes/sponges “quemados”.
 * Ahora recibe GenericStockForm con { categoryId, date, rows[] }.
 * Si en tus pantallas aún la llamas con el nombre viejo, esto seguirá compilando,
 * pero el payload debe ser el nuevo.
 * --------------------------------------------------------------------------- */
export async function persistStockUpdate(formData: GenericStockForm) {
  const movements = (formData.rows || [])
    .filter((r) => Number.isFinite(r.qty) && Number(r.qty) !== 0)
    .map((r) => ({ variantKey: r.variantKey, delta: Number(r.qty) }));

  if (movements.length === 0) return;

  await persistGenericStockUpdate({
    categoryId: formData.categoryId,
    date: formData.date,
    movements,
  });
}

/* -----------------------------------------------------------------------------
 * Legacy helpers (opcionales)
 * Mantengo estos nombres para que no te rompa importaciones existentes.
 * Puedes eliminarlos cuando limpies el código que dependía de /stock (viejo).
 * --------------------------------------------------------------------------- */

// “clearSizeFlavors” en el esquema nuevo no aplica. Lo dejamos no-op.
export async function clearSizeFlavors(_id: string): Promise<void> {
  // No-op en el modelo genérico.
  return;
}

// Tipo “LocalStockDoc” ya no aplica; definimos un alias mínimo para compatibilidad.
export type LocalStockDoc =
  | {
      id: string;
      type: "generic";
      variantKey: string;
      stock: number;
      last_update?: unknown;
    }
  | never;

// “watchStock” del esquema viejo apuntaba a /stock. Si aún lo llamas, devolvemos
// un unsub inmediato para no romper la app. Migra a lecturas en /catalog_stock/{cat}/variants.
export function watchStock(_cb: (items: LocalStockDoc[]) => void): () => void {
  // Si quieres observar una categoría concreta, usa:
  // const col = collection(db, "catalog_stock", categoryId, "variants");
  // onSnapshot(col, snap => {...})
  return () => {};
}

/* -----------------------------------------------------------------------------
 * Ejemplo de watcher NUEVO por categoría (úsalo donde necesites observar stock)
 * --------------------------------------------------------------------------- */
export function watchCategoryStock(
  categoryId: string,
  cb: (items: { variantKey: string; stock: number }[]) => void
): () => void {
  const col = collection(db, "catalog_stock", categoryId, "variants");
  const unsub = onSnapshot(
    col,
    { includeMetadataChanges: false },
    (snap: QuerySnapshot<DocumentData>) => {
      const items = snap.docs.map((d) => {
        const data = d.data() || {};
        return {
          variantKey: (data.variantKey as string) ?? d.id,
          stock: Number(data.stock ?? 0),
        };
      });
      cb(items);
    }
  );
  return unsub;
}

/* -----------------------------------------------------------------------------
 * Helper opcional para asegurar/crear una variante puntual (no siempre necesario)
 * --------------------------------------------------------------------------- */
export async function upsertVariantStockOnce(
  categoryId: string,
  variantKey: string,
  stock: number
): Promise<void> {
  const ref = doc(
    collection(db, "catalog_stock", categoryId, "variants"),
    variantKey
  );
  await runTransaction(db, async (tx) => {
    tx.set(
      ref,
      {
        variantKey,
        stock: Math.max(0, Number(stock) || 0),
        updatedAt: Date.now(),
        last_update: serverTimestamp(),
      },
      { merge: true }
    );
  });
}
