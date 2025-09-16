import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { LocalStockDoc } from "./stock.model";

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
  return {
    ...base,
    type: "sponge",
    quantity: Number(data.quantity || 0),
  };
}

export async function fetchStockOnce(): Promise<LocalStockDoc[]> {
  const snap = await getDocs(collection(db, "stock"));
  return snap.docs.map(mapDoc);
}

export function watchStock(cb: (items: LocalStockDoc[]) => void): () => void {
  const colRef = collection(db, "stock");
  const unsub = onSnapshot(colRef, (snap) => {
    const items = snap.docs.map(mapDoc);
    cb(items);
  });
  return unsub;
}

export async function clearSizeFlavors(id: string): Promise<void> {
  await updateDoc(doc(db, "stock", id), { flavors: {} });
}
