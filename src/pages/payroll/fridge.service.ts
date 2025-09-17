// src/pages/payments/fridge.service.ts
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    getDocs,
    query,
    orderBy,
    type DocumentReference,
    type CollectionReference,
  } from "firebase/firestore";
  import { db } from "../../lib/firebase";
  import type { Shift, TemperatureRecord, MonthlyRecord, Fridge } from "../../types/fridge";
  
  /** Neveras "quemadas" por ahora */
  export const FRIDGES: Fridge[] = [
    { id: "f1", name: "Nevera Pasteles", brand: "Whirlpool" },
    { id: "f2", name: "Nevera Bebidas", brand: "Samsung" },
  ];
  
  /** Utils de fecha */
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  export const getLocalTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  export const monthKeyFromDateStr = (dateStr: string) => dateStr.slice(0, 7); // yyyy-MM
  
  /** Refs helpers */
  const dailyRef = (date: string, fridgeId: string) =>
    doc(db, "fridgeTemperatures", date, "units", fridgeId) as DocumentReference<TemperatureRecord>;
  
  const monthDocRef = (monthKey: string) =>
    doc(db, "fridgeTemperatures_monthly", monthKey) as DocumentReference<{ month: string }>;
  
  const monthlyDayRef = (monthKey: string, fridgeId: string, date: string) =>
    doc(db, "fridgeTemperatures_monthly", monthKey, "byFridge", fridgeId, "days", date) as DocumentReference<MonthlyRecord>;
  
  const monthlyDaysCol = (monthKey: string, fridgeId: string) =>
    collection(db, "fridgeTemperatures_monthly", monthKey, "byFridge", fridgeId, "days") as CollectionReference<MonthlyRecord>;
  
  /** Cargar temperaturas del día para una nevera */
  export async function loadDailyTemperature(
    date: string,
    fridgeId: string
  ): Promise<TemperatureRecord> {
    const snap = await getDoc(dailyRef(date, fridgeId));
    return snap.exists() ? (snap.data() as TemperatureRecord) : {};
  }
  
  /** Cargar historial mensual (por nevera) */
  export async function loadMonthlyRecords(
    monthKey: string,
    fridgeId: string
  ): Promise<MonthlyRecord[]> {
    const snaps = await getDocs(query(monthlyDaysCol(monthKey, fridgeId), orderBy("date", "asc")));
    const rows: MonthlyRecord[] = [];
    snaps.forEach((s) => {
      const d = s.data();
      rows.push({
        date: d.date ?? s.id,
        morning: typeof d.morning === "number" ? d.morning : undefined,
        afternoon: typeof d.afternoon === "number" ? d.afternoon : undefined,
      });
    });
    return rows;
  }
  
  /** Guardar temperatura (diario + mensual) para una nevera */
  export async function saveTemperature(args: {
    date: string;                // yyyy-MM-dd
    fridgeId: string;
    shift: Shift;
    value: number;
  }): Promise<void> {
    const { date, fridgeId, shift, value } = args;
    const monthKey = monthKeyFromDateStr(date);
  
    // Diario
    const dRef = dailyRef(date, fridgeId);
    const dSnap = await getDoc(dRef);
    if (dSnap.exists()) {
      await updateDoc(dRef, { [shift]: value });
    } else {
      await setDoc(dRef, { [shift]: value });
    }
  
    // Mensual
    await setDoc(monthDocRef(monthKey), { month: monthKey }, { merge: true });
  
    const mRef = monthlyDayRef(monthKey, fridgeId, date);
    const mSnap = await getDoc(mRef);
    if (mSnap.exists()) {
      await updateDoc(mRef, { [shift]: value, date });
    } else {
      await setDoc(mRef, { date, [shift]: value });
    }
  }
  