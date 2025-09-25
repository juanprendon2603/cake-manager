// src/pages/payments/fridge.service.ts
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  writeBatch,
  type CollectionReference,
  type DocumentReference,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import type {
  Fridge,
  MonthlyRecord,
  Shift,
  TemperatureRecord,
} from "../../types/fridge";

/* ------------------------------ Utils fecha ------------------------------ */
const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
export const getLocalTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
export const monthKeyFromDateStr = (dateStr: string) => dateStr.slice(0, 7); // yyyy-MM

/* ----------------------------- Helpers de refs ---------------------------- */
type ServerTs = ReturnType<typeof serverTimestamp>; // sentinel write type

interface FridgeMonthDoc {
  month: string;
  updatedAt?: Timestamp | ServerTs;
}

const FRIDGES_COL = collection(db, "fridges") as CollectionReference<Fridge>;

const dailyRef = (date: string, fridgeId: string) =>
  doc(
    db,
    "fridgeTemperatures",
    date,
    "units",
    fridgeId
  ) as DocumentReference<TemperatureRecord>;

const monthDocRef = (monthKey: string) =>
  doc(
    db,
    "fridgeTemperatures_monthly",
    monthKey
  ) as DocumentReference<FridgeMonthDoc>;

const monthlyDayRef = (monthKey: string, fridgeId: string, date: string) =>
  doc(
    db,
    "fridgeTemperatures_monthly",
    monthKey,
    "byFridge",
    fridgeId,
    "days",
    date
  ) as DocumentReference<MonthlyRecord>;

const monthlyDaysCol = (monthKey: string, fridgeId: string) =>
  collection(
    db,
    "fridgeTemperatures_monthly",
    monthKey,
    "byFridge",
    fridgeId,
    "days"
  ) as CollectionReference<MonthlyRecord>;

/* ------------------------------ Slug helper ------------------------------ */
export function buildFridgeId(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/* ------------------------------ CRUD Neveras ------------------------------ */
export async function listFridges(opts?: {
  includeInactive?: boolean;
}): Promise<Fridge[]> {
  const qs = await getDocs(FRIDGES_COL);
  const items: Fridge[] = [];
  qs.forEach((d) =>
    items.push({ id: d.id, ...(d.data() as Omit<Fridge, "id">) })
  );
  return opts?.includeInactive
    ? items
    : items.filter((f) => f.active !== false);
}

export async function upsertFridge(f: Fridge): Promise<void> {
  const ref = doc(FRIDGES_COL, f.id);

  // Construimos el payload sin poner undefined en ningún campo
  const payload: Partial<Fridge> = {
    name: f.name,
    active: f.active !== false,
  };

  if (f.brand && f.brand.trim()) payload.brand = f.brand.trim();
  if (f.model && f.model.trim()) payload.model = f.model.trim();
  if (f.serialNumber && f.serialNumber.trim())
    payload.serialNumber = f.serialNumber.trim();
  if (f.purchaseDate) payload.purchaseDate = f.purchaseDate;
  if (f.location && f.location.trim()) payload.location = f.location.trim();
  if (typeof f.minTemp === "number") payload.minTemp = f.minTemp;
  if (typeof f.maxTemp === "number") payload.maxTemp = f.maxTemp;

  await setDoc(ref, payload, { merge: true });
}

export async function deleteFridge(id: string): Promise<void> {
  await deleteDoc(doc(FRIDGES_COL, id));
}

/* ---------------------------- Carga día/mes ------------------------------- */
export async function loadDailyTemperature(
  date: string,
  fridgeId: string
): Promise<TemperatureRecord> {
  const snap = await import("firebase/firestore").then(({ getDoc }) =>
    getDoc(dailyRef(date, fridgeId))
  );
  return snap.exists() ? (snap.data() as TemperatureRecord) : {};
}

export function watchDailyTemperature(
  date: string,
  fridgeId: string,
  cb: (rec: TemperatureRecord) => void
): Unsubscribe {
  return onSnapshot(dailyRef(date, fridgeId), (snap) => {
    cb(snap.exists() ? (snap.data() as TemperatureRecord) : {});
  });
}

type MonthKey = string; // yyyy-MM
const mk = (monthKey: MonthKey, fridgeId: string) => `${monthKey}__${fridgeId}`;

const monthlyCache = new Map<string, MonthlyRecord[]>();
const monthlyInflight = new Map<string, Promise<MonthlyRecord[]>>();

export async function loadMonthlyRecords(
  monthKey: string,
  fridgeId: string,
  opts?: { force?: boolean }
): Promise<MonthlyRecord[]> {
  const key = mk(monthKey, fridgeId);

  if (!opts?.force && monthlyCache.has(key)) return monthlyCache.get(key)!;
  if (monthlyInflight.has(key)) return monthlyInflight.get(key)!;

  const p = (async () => {
    const snaps = await getDocs(
      query(monthlyDaysCol(monthKey, fridgeId), orderBy("date", "asc"))
    );
    const rows: MonthlyRecord[] = [];
    snaps.forEach((s) => {
      const d = s.data();
      rows.push({
        date: d.date ?? s.id,
        morning: typeof d.morning === "number" ? d.morning : undefined,
        afternoon: typeof d.afternoon === "number" ? d.afternoon : undefined,
      });
    });
    monthlyCache.set(key, rows);
    monthlyInflight.delete(key);
    return rows;
  })();

  monthlyInflight.set(key, p);
  return p;
}

export async function saveTemperature(args: {
  date: string; // yyyy-MM-dd
  fridgeId: string;
  shift: Shift;
  value: number;
}): Promise<void> {
  const { date, fridgeId, shift, value } = args;
  const monthKey = monthKeyFromDateStr(date);

  const batch = writeBatch(db);

  batch.set(dailyRef(date, fridgeId), { [shift]: value }, { merge: true });
  batch.set(
    monthDocRef(monthKey),
    { month: monthKey, updatedAt: serverTimestamp() },
    { merge: true }
  );
  batch.set(
    monthlyDayRef(monthKey, fridgeId, date),
    { date, [shift]: value },
    { merge: true }
  );

  await batch.commit();

  const key = mk(monthKey, fridgeId);
  const cached = monthlyCache.get(key);
  if (cached) {
    const idx = cached.findIndex((r) => r.date === date);
    if (idx >= 0) {
      const prev = cached[idx];
      const next: MonthlyRecord =
        shift === "morning"
          ? { ...prev, morning: value }
          : { ...prev, afternoon: value };
      cached[idx] = next;
    } else {
      const next: MonthlyRecord =
        shift === "morning"
          ? { date, morning: value }
          : { date, afternoon: value };
      cached.push(next);
      cached.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    }
    monthlyCache.set(key, [...cached]);
  }
}

/* ----------------------------- Utils de cache ----------------------------- */
export function clearFridgeCache() {
  monthlyCache.clear();
  monthlyInflight.clear();
}
export function invalidateMonthlyCache(monthKey: string, fridgeId: string) {
  const key = mk(monthKey, fridgeId);
  monthlyCache.delete(key);
  monthlyInflight.delete(key);
}
