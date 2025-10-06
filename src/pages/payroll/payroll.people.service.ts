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
  type CollectionReference,
  type FieldValue,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { PaymentMode, Person } from "../../types/payroll";

const PAYROLL_COL = "payroll";

// La data en Firestore no incluye `id` en el documento.
// Permitimos timestamps del servidor.
type FireDate = FieldValue | Timestamp | number;
type PersonDoc = Omit<Person, "id"> & {
  createdAt?: FireDate;
  updatedAt?: FireDate;
};

// Col. tipada para evitar `any`
const peopleCol = collection(db, PAYROLL_COL) as CollectionReference<PersonDoc>;

/* --------------------------------- utils --------------------------------- */

// Detecta objetos "planos" (evita recursión en sentinels como serverTimestamp)
const isPlainObject = (val: unknown): val is Record<string, unknown> =>
  Object.prototype.toString.call(val) === "[object Object]";

// Quita keys con undefined (Firestore no lo permite)
function pruneUndefined<T>(obj: T): T {
  if (Array.isArray(obj)) {
    const arr = (obj as unknown[]).reduce<unknown[]>((acc, v) => {
      if (v === undefined) return acc;
      if (Array.isArray(v) || isPlainObject(v)) {
        acc.push(pruneUndefined(v));
      } else {
        acc.push(v);
      }
      return acc;
    }, []);
    return arr as unknown as T;
  }

  if (isPlainObject(obj)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v === undefined) continue;
      if (Array.isArray(v) || isPlainObject(v)) {
        out[k] = pruneUndefined(v);
      } else {
        out[k] = v;
      }
    }
    return out as unknown as T;
  }

  return obj;
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
    if (valuePerDay == null || Number.isNaN(valuePerDay)) {
      throw new Error("Debes indicar 'Valor por día'.");
    }
  }
  if (mode === "fixed_fortnight") {
    if (fixedFortnightPay == null || Number.isNaN(fixedFortnightPay)) {
      throw new Error("Debes indicar 'Pago fijo quincenal'.");
    }
  }
  if (mode === "fixed_monthly") {
    if (fixedMonthlyPay == null || Number.isNaN(fixedMonthlyPay)) {
      throw new Error("Debes indicar 'Pago fijo mensual'.");
    }
  }
}

/* --------------------------------- CRUD ---------------------------------- */

export async function listPeople(): Promise<Person[]> {
  const q = query(peopleCol, orderBy("lastName"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
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
  const ref = doc(peopleCol, id);
  const exists = await getDoc(ref);
  if (exists.exists()) {
    throw new Error("Ya existe un trabajador con ese ID.");
  }

  const body = pruneUndefined<PersonDoc>({
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

  const ref = doc(peopleCol, p.id);

  // Quita `id` sin generar warning de variable sin uso
  const { id, ...rest } = p;
  void id;

  const body = pruneUndefined<PersonDoc>({
    ...rest,
    firstName: p.firstName.trim(),
    lastName: p.lastName.trim(),
    active: p.active ?? true,
    disabled: p.disabled ?? false,
    // timestamps
    updatedAt: serverTimestamp(),
  });

  await setDoc(ref, body, { merge: true });
}

export async function deletePerson(id: string) {
  const ref = doc(peopleCol, id);
  await deleteDoc(ref);
}
