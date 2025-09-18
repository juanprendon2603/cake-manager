// src/pages/sales/sales.service.ts
import { format } from "date-fns";
import {
  arrayUnion,
  collection,
  doc,
  increment,
  runTransaction,
  serverTimestamp,
  setDoc,
  writeBatch,
  type DocumentData,
  type Timestamp,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import type {
  CakeStockDoc,
  GeneralExpenseItem,
  PaymentMethod, // para UI si lo necesitas en otros lugares
  PendingSale,
  ProductType,
  SaleEntry,
  SpongeStockDoc,
} from "../../types/stock";
import { getBasePrice } from "./constants";

/* --------------------------------- Helpers -------------------------------- */
const normalizeKey = (s: string) => s.trim().toLowerCase().replace(/\s+/g, "_");

export function computeAmount(
  productType: ProductType,
  size: string,
  flavor: string,
  qty: number
) {
  const base = getBasePrice(productType, size, flavor);
  return base * Math.max(1, qty);
}

export function buildKeys() {
  const dayKey = format(new Date(), "yyyy-MM-dd");
  const monthKey = dayKey.slice(0, 7);
  return { dayKey, monthKey };
}

const getErrorMessage = (e: unknown): string =>
  e instanceof Error ? e.message : "Error al actualizar stock";

/* --------------------- Type guards para datos de Firestore ----------------- */
type StockData = CakeStockDoc | SpongeStockDoc;

const isCake = (d: StockData): d is CakeStockDoc => d.type === "cake";
const isSponge = (d: StockData): d is SpongeStockDoc => d.type === "sponge";

/* ------------------------------- Decrementos ------------------------------- */
/**
 * Decrementa stock de forma atómica.
 * - Cake: decrementa flavors.<flavor> con increment(-qty)
 * - Sponge: decrementa quantity con increment(-qty)
 * - Verifica no-negativos dentro de la transacción
 */
export async function tryDecrementStock(
  productType: ProductType,
  size: string,
  flavor: string,
  quantityNumber: number
): Promise<{ decremented: boolean; error?: string }> {
  const normSize = normalizeKey(size);
  const normFlavor = normalizeKey(flavor);
  const stockRef = doc(db, "stock", `${productType}_${normSize}`);

  try {
    let decremented = false;

    await runTransaction(db, async (tx) => {
      const snap = await tx.get(stockRef);
      if (!snap.exists()) throw new Error("El producto no existe en el stock.");
      const data = snap.data() as StockData;

      if (isCake(data)) {
        const current = Number(data.flavors?.[normFlavor] ?? 0);
        if (current < quantityNumber) return; // no suficiente stock
        tx.update(stockRef, {
          [`flavors.${normFlavor}`]: increment(-quantityNumber),
          last_update: serverTimestamp(),
        });
        decremented = true;
      } else if (isSponge(data)) {
        const current = Number(data.quantity ?? 0);
        if (current < quantityNumber) return;
        tx.update(stockRef, {
          quantity: increment(-quantityNumber),
          last_update: serverTimestamp(),
        });
        decremented = true;
      } else {
        throw new Error("Tipo de stock desconocido.");
      }
    });

    return { decremented };
  } catch (e) {
    return { decremented: false, error: getErrorMessage(e) };
  }
}

/* --------------------------------- Ventas --------------------------------- */
/**
 * Registra una venta y actualiza agregados del mes en UN SOLO batch (atómico):
 * - Crea entrada en sales_monthly/{month}/entries
 * - Actualiza totals y byPayment.{method} con increment()
 */
export async function registerSale(p: PendingSale) {
  const {
    productType,
    size,
    flavor,
    quantityNumber,
    amountCOP,
    dayKey,
    monthKey,
    paymentMethod,
  } = p;

  const entriesColRef = collection(db, "sales_monthly", monthKey, "entries");
  const monthRef = doc(db, "sales_monthly", monthKey);
  const entryRef = doc(entriesColRef); // ID auto, pero en batch

  const entry: SaleEntry = {
    kind: "sale",
    day: dayKey,
    createdAt: serverTimestamp(),
    type: productType,
    size,
    flavor,
    quantity: quantityNumber,
    amountCOP,
    paymentMethod,
  };

  const batch = writeBatch(db);

  // 1) Inserta la entrada del día
  batch.set(entryRef, entry as DocumentData);

  // 2) Upsert + agregados del mes
  batch.set(
    monthRef,
    {
      month: monthKey,
      updatedAt: serverTimestamp(),
      totals: {
        salesRevenue: increment(amountCOP),
        salesCount: increment(1),
      },
      byPayment: {
        [paymentMethod]: {
          salesRevenue: increment(amountCOP),
          salesCount: increment(1),
        },
      },
    },
    { merge: true }
  );

  await batch.commit();
}

/* --------------------------------- Gastos --------------------------------- */
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
