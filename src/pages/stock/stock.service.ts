// Lógica de Firestore encapsulada (clean & testable)
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import {
  cakeSizes,
  normalizeKey,
  spongeSizes,
  type FormValues,
} from "./stock.model";

export async function persistStockUpdate(formData: FormValues) {
  // Tortas por tamaño
  for (const size of cakeSizes) {
    const key = normalizeKey(size);
    const entries = formData?.cakes?.[key] || [];

    const docId = `cake_${key}`;
    const docRef = doc(db, "stock", docId);
    const docSnap = await getDoc(docRef);

    const savedFlavors: Record<string, number> = docSnap.exists()
      ? (docSnap.data().flavors as Record<string, number>) || {}
      : {};

    const newFlavors: Record<string, number> = { ...savedFlavors };
    let hasChanges = false;

    for (const entry of entries) {
      const qty = parseInt(entry?.quantity ?? "0", 10);
      if (!entry?.flavor || qty <= 0) continue;

      const flavorKey = normalizeKey(entry.flavor);
      newFlavors[flavorKey] = (newFlavors[flavorKey] || 0) + qty;
      hasChanges = true;
    }

    if (hasChanges) {
      await setDoc(docRef, {
        type: "cake",
        size,
        flavors: newFlavors,
        last_update: Timestamp.now(),
      });
    }
  }

  // Bizcochos (sponges)
  for (const size of spongeSizes) {
    const key = normalizeKey(size);
    const qty = parseInt(formData?.sponges?.[key] ?? "0", 10);
    if (!qty || qty <= 0) continue;

    const docId = `sponge_${key}`;
    const docRef = doc(db, "stock", docId);
    const docSnap = await getDoc(docRef);

    let total = docSnap.exists() ? (docSnap.data().quantity as number) || 0 : 0;
    total += qty;

    await setDoc(docRef, {
      type: "sponge",
      size,
      quantity: total,
      last_update: Timestamp.now(),
    });
  }
}
