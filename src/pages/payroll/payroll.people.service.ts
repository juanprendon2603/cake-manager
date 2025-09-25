// src/pages/payroll/payroll.people.service.ts
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { PaymentMode, Person } from "../../types/payroll";

const PAYROLL_COL = "payroll";

/* --------------------------------- utils --------------------------------- */

// Quita keys con undefined (Firestore no lo permite)
function pruneUndefined<T extends Record<string, any>>(obj: T): T {
  const out: any = Array.isArray(obj) ? [] : {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    if (v && typeof v === "object" && !(v instanceof Date)) {
      out[k] = pruneUndefined(v as any);
    } else {
      out[k] = v;
    }
  }
  return out as T;
}

export function buildPersonId(firstName: string, lastName: string) {
  const s = (firstName + "_" + lastName)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // sin acentos
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  return s || `worker_${Date.now()}`;
}

function validatePayment(
  mode: PaymentMode,
  valuePerDay?: number,
  fixedFortnightPay?: number,
  fixedMonthlyPay?: number
) {
  if (mode === "per_day") {
    if (valuePerDay == null || isNaN(valuePerDay)) {
      throw new Error("Debes indicar 'Valor por día'.");
    }
  }
  if (mode === "fixed_fortnight") {
    if (fixedFortnightPay == null || isNaN(fixedFortnightPay)) {
      throw new Error("Debes indicar 'Pago fijo quincenal'.");
    }
  }
  if (mode === "fixed_monthly") {
    if (fixedMonthlyPay == null || isNaN(fixedMonthlyPay)) {
      throw new Error("Debes indicar 'Pago fijo mensual'.");
    }
  }
}

/* --------------------------------- CRUD ---------------------------------- */

export async function listPeople(): Promise<Person[]> {
  const q = query(collection(db, PAYROLL_COL), orderBy("lastName"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Person[];
}

/** Crea una persona nueva. Recibe campos “de formulario”, genera id si falta y valida por modo */
export async function createPerson(input: {
  id?: string;
  firstName: string;
  lastName: string;
  paymentMode: PaymentMode;
  valuePerDay?: number;
  fixedFortnightPay?: number;
  fixedMonthlyPay?: number;
}) {
  const id = input.id?.trim() || buildPersonId(input.firstName, input.lastName);

  // valida modo de pago
  validatePayment(
    input.paymentMode,
    input.valuePerDay,
    input.fixedFortnightPay,
    input.fixedMonthlyPay
  );

  // evita duplicados
  const ref = doc(db, PAYROLL_COL, id);
  const exists = await getDoc(ref);
  if (exists.exists()) {
    throw new Error("Ya existe un trabajador con ese ID.");
  }

  const body = pruneUndefined({
    id,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    paymentMode: input.paymentMode,
    // solo envía lo que aplique al modo
    valuePerDay:
      input.paymentMode === "per_day"
        ? Number(input.valuePerDay ?? 0)
        : undefined,
    fixedFortnightPay:
      input.paymentMode === "fixed_fortnight"
        ? Number(input.fixedFortnightPay ?? 0)
        : undefined,
    fixedMonthlyPay:
      input.paymentMode === "fixed_monthly"
        ? Number(input.fixedMonthlyPay ?? 0)
        : undefined,
    attendance: {}, // empieza vacío
    active: true,
    disabled: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await setDoc(ref, body);
  return id;
}

/** upsert (actualiza/crea si no existe) desde un objeto Person “completo” */
export async function upsertPerson(p: Person) {
  // valida modo según los valores presentes
  validatePayment(
    p.paymentMode,
    p.valuePerDay,
    p.fixedFortnightPay,
    p.fixedMonthlyPay
  );

  const ref = doc(db, PAYROLL_COL, p.id);
  const body = pruneUndefined({
    ...p,
    firstName: p.firstName.trim(),
    lastName: p.lastName.trim(),
    active: p.active ?? true,
    disabled: p.disabled ?? false,
    // timestamps
    updatedAt: serverTimestamp(),
    createdAt: undefined, // no lo sobreescribas si ya existe
  });

  await setDoc(ref, body, { merge: true });
}

export async function deletePerson(id: string) {
  const ref = doc(db, PAYROLL_COL, id);
  await deleteDoc(ref);
}
