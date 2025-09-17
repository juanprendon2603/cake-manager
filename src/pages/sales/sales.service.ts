import {
    doc,
    runTransaction,
    collection,
    addDoc,
    serverTimestamp,
    setDoc,
    increment,
    type DocumentReference,
    type CollectionReference,
    type UpdateData,
    type DocumentData,
    type Timestamp,
  } from "firebase/firestore";
  import { format } from "date-fns";
  import { db } from "../../lib/firebase";
  import type {
    ProductType,
    StockDoc,
    PendingSale,
    SaleEntry,
    GeneralExpenseItem,
  } from "../../types/stock";
  import { getBasePrice } from "./constants";
  import {
    // ...lo que ya tienes
    getDoc,
    updateDoc,
    arrayUnion,
  } from "firebase/firestore";
  
  
  /** === Helpers compartidos === */
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
  
  /** === Stock / Ventas === */
  export async function tryDecrementStock(
    productType: ProductType,
    size: string,
    flavor: string,
    quantityNumber: number
  ): Promise<{ decremented: boolean } & ({ error?: never } | { error: string })> {
    const stockRef = doc(
      db,
      "stock",
      `${productType}_${size}`
    ) as DocumentReference<StockDoc>;
  
    try {
      let decremented = false;
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(stockRef);
        if (!snap.exists())
          throw new Error("El producto no existe en el stock.");
        const data = snap.data(); // StockDoc
  
        if (productType === "cake") {
          const flavors =
            "flavors" in data && data.flavors ? data.flavors : {};
          const current = Number(flavors[flavor] ?? 0);
          if (current >= quantityNumber) {
            const updateFlavors: UpdateData<StockDoc> = {
              [`flavors.${flavor}`]: current - quantityNumber,
            } as unknown as UpdateData<StockDoc>;
            tx.update(stockRef, updateFlavors);
            decremented = true;
          }
        } else {
          const current =
            "quantity" in data ? Number(data.quantity ?? 0) : 0;
          if (current >= quantityNumber) {
            const updateQty: UpdateData<StockDoc> = {
              quantity: current - quantityNumber,
            } as unknown as UpdateData<StockDoc>;
            tx.update(stockRef, updateQty);
            decremented = true;
          }
        }
      });
      return { decremented };
    } catch (e: unknown) {
      return { decremented: false, error: getErrorMessage(e) };
    }
  }
  
  export async function registerSale({
    productType,
    size,
    flavor,
    quantityNumber,
    amountCOP,
    dayKey,
    monthKey,
    paymentMethod,
  }: PendingSale) {
    const entriesColRef = collection(
      db,
      "sales_monthly",
      monthKey,
      "entries"
    ) as CollectionReference<SaleEntry>;
    const monthRef = doc(db, "sales_monthly", monthKey);
  
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
    await addDoc(entriesColRef, entry as unknown as DocumentData);
  
    await setDoc(
      monthRef,
      {
        month: monthKey,
        updatedAt: serverTimestamp(),
        [`byPayment.${paymentMethod}.salesRevenue`]: increment(0),
        [`byPayment.${paymentMethod}.salesCount`]: increment(0),
      },
      { merge: true }
    );
  
    await setDoc(
      monthRef,
      {
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
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }
  
  /** === Gastos === */
  export type PaymentMethod = "cash" | "transfer"; // si ya tienes este tipo centralizado, impórtalo y borra esta línea
  
  export interface ExpenseEntry {
    day: string; // yyyy-MM-dd
    createdAt: Timestamp | ReturnType<typeof serverTimestamp>;
    description: string;
    paymentMethod: PaymentMethod;
    valueCOP: number;
  }
  
  /**
   * Registra un gasto y actualiza agregados del mes.
   * Lanza error si falla (el componente lo captura).
   */
  export async function registerExpense(input: {
    description: string;
    valueCOP: number;
    paymentMethod: PaymentMethod;
  }): Promise<void> {
    const { dayKey, monthKey } = buildKeys();
  
    const expensesColRef = collection(
      db,
      "sales_monthly",
      monthKey,
      "expenses"
    );
    const monthRef = doc(db, "sales_monthly", monthKey);
  
    const expense: ExpenseEntry = {
      day: dayKey,
      createdAt: serverTimestamp(),
      description: input.description.trim(),
      paymentMethod: input.paymentMethod,
      valueCOP: input.valueCOP,
    };
  
    await addDoc(expensesColRef, expense as unknown as DocumentData);
  
    await setDoc(
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
  }



export async function registerGeneralExpense(input: {
  description: string;
  valueCOP: number;
  paymentMethod: PaymentMethod;
}): Promise<void> {
  const currentMonth = format(new Date(), "yyyy-MM");
  const docRef = doc(db, "generalExpenses", currentMonth);

  const expense: GeneralExpenseItem = {
    description: input.description.trim(),
    value: input.valueCOP,                 // 👈 se guarda como 'value' (igual que tu código original)
    paymentMethod: input.paymentMethod,
    date: format(new Date(), "yyyy-MM-dd"),
  };

  const snap = await getDoc(docRef);
  if (snap.exists()) {
    await updateDoc(docRef, { expenses: arrayUnion(expense) });
  } else {
    await setDoc(docRef, { month: currentMonth, expenses: [expense] });
  }
}

  