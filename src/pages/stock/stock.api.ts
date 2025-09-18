// src/features/stock/stock.api.ts
import type { DocumentData, QuerySnapshot } from "firebase/firestore"; // 👈 tipos con import type
import {
  collection,
  doc,
  increment,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

import { db } from "../../lib/firebase";
import type { LocalStockDoc } from "./stock.model";
import {
  cakeSizes,
  normalizeKey,
  spongeSizes,
  type FormValues,
} from "./stock.model";

// persistStockUpdate FIX
export async function persistStockUpdate(formData: FormValues) {
  const batch = writeBatch(db);

  // TORTAS
  for (const size of cakeSizes) {
    const key = normalizeKey(size);
    const entries = formData?.cakes?.[key] || [];
    if (!entries.length) continue;

    const docRef = doc(db, "stock", `cake_${key}`);

    // 1) Asegura doc + metadatos
    batch.set(
      docRef,
      { type: "cake", size, last_update: serverTimestamp() },
      { merge: true }
    );

    // 2) Increments anidados vía dot-path (SÍ con update)
    const updates: Record<string, any> = {};
    for (const entry of entries) {
      const qty = parseInt(entry?.quantity ?? "0", 10);
      const flavor = entry?.flavor?.trim();
      if (!flavor || qty <= 0) continue;
      updates[`flavors.${normalizeKey(flavor)}`] = increment(qty);
    }
    if (Object.keys(updates).length) {
      updates["last_update"] = serverTimestamp();
      batch.update(docRef, updates);
    }
  }

  // BIZCOCHOS
  for (const size of spongeSizes) {
    const key = normalizeKey(size);
    const qty = parseInt(formData?.sponges?.[key] ?? "0", 10);
    if (!qty || qty <= 0) continue;

    const docRef = doc(db, "stock", `sponge_${key}`);

    // Crea/mergea doc y luego incrementa
    batch.set(docRef, { type: "sponge", size }, { merge: true });
    batch.update(docRef, {
      quantity: increment(qty),
      last_update: serverTimestamp(),
    });
  }

  await batch.commit();
}

export async function clearSizeFlavors(id: string): Promise<void> {
  const ref = doc(db, "stock", id);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) return;
    tx.update(ref, { flavors: {}, last_update: serverTimestamp() });
  });
}

function mapDoc(d: any): LocalStockDoc {
  const data = d.data();
  const base = {
    id: d.id as string,
    size: (data.size as string) ?? "",
    last_update: data.last_update,
  };
  if (data.type === "cake") {
    return {
      ...base,
      type: "cake",
      flavors: (data.flavors as Record<string, number>) || {},
    };
  }
  return { ...base, type: "sponge", quantity: Number(data.quantity || 0) };
}

export function watchStock(cb: (items: LocalStockDoc[]) => void): () => void {
  const q = query(collection(db, "stock"));

  const unsub = onSnapshot(
    q,
    { includeMetadataChanges: true },
    (snap: QuerySnapshot<DocumentData>) => {
      // evita renders por writes locales
      if (snap.metadata.hasPendingWrites) return;
      cb(snap.docs.map(mapDoc));
    }
  );

  // Ahorro simple: si la pestaña se oculta, cancela la suscripción (puedes re-suscribir en tu hook al volver a montar)
  const onVis = () => {
    if (document.hidden) unsub();
  };
  document.addEventListener("visibilitychange", onVis, { once: true });

  return () => {
    document.removeEventListener("visibilitychange", onVis);
    unsub();
  };
}
