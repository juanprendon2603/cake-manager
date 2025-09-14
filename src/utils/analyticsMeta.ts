// utils/analyticsMeta.ts
import { doc, getDoc, setDoc, increment, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

export async function bumpMonthVersion(ym: string) {
  await setDoc(
    doc(db, "analytics_meta", ym),
    {
      ym,
      version: increment(1),
      lastWrite: serverTimestamp(),
    },
    { merge: true }
  );
}

export type MonthMeta = {
  ym: string;
  version: number;
  lastWrite?: Timestamp;
};

export async function getMonthMeta(ym: string): Promise<MonthMeta | null> {
  const snap = await getDoc(doc(db, "analytics_meta", ym));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    ym,
    version: Number(d?.version ?? 0),
    lastWrite: d?.lastWrite as Timestamp | undefined,
  };
}
