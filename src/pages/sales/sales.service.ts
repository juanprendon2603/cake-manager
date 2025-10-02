// src/pages/sales/sales.service.ts
import { format } from "date-fns";
import {
  arrayUnion,
  collection,
  doc,
  increment,
  serverTimestamp,
  setDoc,
  writeBatch,
  type DocumentData,
  type Timestamp,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { GeneralExpenseItem, PaymentMethod } from "../../types/stock";

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

export function buildKeys() {
  const dayKey = format(new Date(), "yyyy-MM-dd");
  const monthKey = dayKey.slice(0, 7);
  return { dayKey, monthKey };
}

function pad13(n: number) {
  return String(n).padStart(13, "0");
}

function ensureDayKey(day?: string) {
  const { dayKey } = buildKeys();
  return day && /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : dayKey;
}

/** Ej: 2025-09-25_0001758771350000 (13 dígitos, orden lexicográfico correcto) */
export function makeSaleEntryId(day?: string, now = Date.now()) {
  return `${ensureDayKey(day)}_${pad13(now)}`;
}

/* -------------------------------------------------------------------------- */
/*                              Ventas (GENÉRICO)                             */
/* -------------------------------------------------------------------------- */

export type GenericSale = {
  categoryId: string;
  variantKey: string;
  selections: Record<string, string>;
  quantity: number;
  unitPriceCOP: number;
  amountCOP: number;
  paymentMethod: PaymentMethod;
  dayKey: string;
  monthKey: string;

  // 👇 NUEVO
  seller: {
    name: string;
    uid?: string;
    email?: string;
  };
};

/**
 * Registra una venta genérica y actualiza agregados del mes en UN SOLO batch:
 * - Crea entrada en sales_monthly/{month}/entries
 * - Actualiza totals y byPayment.{method} con increment()
 */
export async function registerGenericSale(s: GenericSale) {
  const entriesColRef = collection(db, "sales_monthly", s.monthKey, "entries");
  const entryId = makeSaleEntryId(s.dayKey);
  const entryRef = doc(entriesColRef, entryId);
  const monthRef = doc(db, "sales_monthly", s.monthKey);

  const entry: DocumentData = {
    id: entryId,
    kind: "sale",
    createdAt: serverTimestamp(),
    day: s.dayKey,
    categoryId: s.categoryId,
    variantKey: s.variantKey,
    selections: s.selections,
    quantity: s.quantity,
    unitPriceCOP: s.unitPriceCOP,
    amountCOP: s.amountCOP,
    paymentMethod: s.paymentMethod,

    // 👇 guardamos el vendedor como objeto anidado
    seller: {
      name: s.seller?.name ?? "Desconocido",
      ...(s.seller?.uid ? { uid: s.seller.uid } : {}),
      ...(s.seller?.email ? { email: s.seller.email } : {}),
    },
  };

  const batch = writeBatch(db);
  batch.set(entryRef, entry);

  batch.set(
    monthRef,
    {
      month: s.monthKey,
      updatedAt: serverTimestamp(),
      totals: {
        salesRevenue: increment(s.amountCOP),
        salesCount: increment(1),
      },
      byPayment: {
        [s.paymentMethod]: {
          salesRevenue: increment(s.amountCOP),
          salesCount: increment(1),
        },
      },
    },
    { merge: true }
  );

  await batch.commit();
}

/* Si prefieres importar el decremento genérico desde el servicio de catálogo
   para usarlo desde aquí, lo reexportamos para que el resto del código
   pueda hacer: import { tryDecrementStockGeneric } from "./sales.service";
*/
export { tryDecrementStockGeneric } from "../catalog/catalog.service";

/* -------------------------------------------------------------------------- */
/*                                   Gastos                                   */
/* -------------------------------------------------------------------------- */

export interface ExpenseEntry {
  day: string; // yyyy-MM-dd
  createdAt: Timestamp | ReturnType<typeof serverTimestamp>;
  description: string;
  paymentMethod: PaymentMethod;
  valueCOP: number;
}

/** Registra un gasto y actualiza agregados del mes en UN SOLO batch. */
export async function registerExpense(input: {
  description: string;
  valueCOP: number;
  paymentMethod: PaymentMethod;
}): Promise<void> {
  const { dayKey, monthKey } = buildKeys();

  const expensesColRef = collection(db, "sales_monthly", monthKey, "expenses");
  const expenseRef = doc(expensesColRef);
  const monthRef = doc(db, "sales_monthly", monthKey);

  const batch = writeBatch(db);

  batch.set(expenseRef, {
    day: dayKey,
    createdAt: serverTimestamp(),
    description: input.description.trim(),
    paymentMethod: input.paymentMethod,
    valueCOP: input.valueCOP,
  } as ExpenseEntry as DocumentData);

  batch.set(
    monthRef,
    {
      month: monthKey,
      updatedAt: serverTimestamp(),
      totals: {
        expensesAmount: increment(input.valueCOP),
        expensesCount: increment(1),
      },
    },
    { merge: true }
  );

  await batch.commit();
}

/**
 * Registra un gasto general (colección por mes) sin lecturas:
 * setDoc(..., { merge: true }) + arrayUnion(expense)
 */
export async function registerGeneralExpense(input: {
  description: string;
  valueCOP: number;
  paymentMethod: PaymentMethod;
}): Promise<void> {
  const currentMonth = format(new Date(), "yyyy-MM");
  const docRef = doc(db, "generalExpenses", currentMonth);

  const expense: GeneralExpenseItem = {
    description: input.description.trim(),
    value: input.valueCOP, // mantiene 'value' como en tu modelo
    paymentMethod: input.paymentMethod,
    date: format(new Date(), "yyyy-MM-dd"),
  };

  await setDoc(
    docRef,
    {
      month: currentMonth,
      updatedAt: serverTimestamp(),
      expenses: arrayUnion(expense),
    },
    { merge: true }
  );
}

export type VariantStock = {
  variantKey: string;
  stock: number;
  updatedAt?: number;
};
