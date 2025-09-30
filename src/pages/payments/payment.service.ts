// src/pages/payments/payment.service.ts
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
  type CollectionReference,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import type {
  PaymentsMonthlyEntry,
  PaymentsMonthlyRow,
  PendingPaymentGroup,
  RegisterPaymentInput,
  SalesMonthlyPaymentEntry,
} from "../../types/payments";

import {
  buildVariantKey,
  persistGenericStockUpdate,
} from "../catalog/catalog.service";
import type { ProductCategory } from "../stock/stock.model";

/** Utils */
const orderMonthOf = (orderDay: string) => orderDay.slice(0, 7);
const shortId = () => Math.random().toString(36).slice(2, 8);

/** Construye variantKey desde categoría + selections (proxy al de catálogo) */
export function buildVariantKeyFromSelections(
  category: ProductCategory,
  selections: Record<string, string>
) {
  return buildVariantKey(category, selections);
}

/** Descuenta stock reutilizando tu servicio genérico de catálogo */
export async function deductStockIfRequested(
  categoryId: string,
  variantKey: string,
  quantity: number,
  shouldDeduct: boolean
): Promise<void> {
  if (!shouldDeduct) return;
  await persistGenericStockUpdate({
    categoryId,
    movements: [{ variantKey, delta: -Math.abs(quantity) }],
  });
}

/** Busca si hay UN pedido abierto (no finalizado) que coincida exactamente */
async function findSingleOpenOrderUID(params: {
  orderDay: string;
  categoryId: string;
  variantKey: string;
  quantity: number;
  totalAmount: number;
}): Promise<string | undefined> {
  const month = orderMonthOf(params.orderDay);
  const col = collection(
    db,
    "payments_monthly",
    month,
    "entries"
  ) as CollectionReference<PaymentsMonthlyEntry>;
  const snap = await getDocs(col);

  const matches = snap.docs
    .map((d) => ({ id: d.id, data: d.data() }))
    .filter(({ data }) => {
      if (data.kind !== "payment") return false;
      if (data.orderDay !== params.orderDay) return false;
      if (data.categoryId !== params.categoryId) return false;
      if (data.variantKey !== params.variantKey) return false;
      if (Number(data.quantity) !== Number(params.quantity)) return false;
      if (Number(data.totalAmountCOP) !== Number(params.totalAmount))
        return false;
      // abierto = no totalPayment true
      return !data.totalPayment;
    });

  if (matches.length === 1) {
    return matches[0].data.orderUID || undefined;
  }
  // 0 o >1: no reutilizamos para evitar mezclar pedidos iguales
  return undefined;
}

/** Asegura un orderUID robusto: usa el de input, luego reusa si hay 1 match, si no genera nuevo */
async function ensureOrderUID(input: RegisterPaymentInput): Promise<string> {
  if (input.orderUID) return input.orderUID;

  const existing = await findSingleOpenOrderUID({
    orderDay: input.orderDate,
    categoryId: input.categoryId,
    variantKey: input.variantKey,
    quantity: input.quantity,
    totalAmount: input.totalAmount,
  });
  if (existing) return existing;

  // Genera UID único (no determinista → separa pedidos idénticos)
  return `ord_${input.orderDate}_${shortId()}`;
}

/** Registrar pago/abono (100% genérico + orderUID) */
export async function registerPayment(
  input: RegisterPaymentInput
): Promise<void> {
  const {
    today,
    categoryId,
    categoryName,
    selections,
    variantKey,
    quantity,
    totalAmount,
    paidAmountToday,
    paymentMethod,
    totalPayment,
    deductedFromStock,
    orderDate,
  } = input;

  const orderUID = await ensureOrderUID(input);

  // 1) Diario: sales/{today}
  const salesRef = doc(db, "sales", today);
  const salesSnap = await getDoc(salesRef);
  const item = {
    id: Date.now().toString(),
    categoryId,
    categoryName,
    variantKey,
    selections,
    quantity,
    amount: totalAmount,
    partialAmount: paidAmountToday,
    paymentMethod,
    isPayment: true,
    deductedFromStock,
    totalPayment,
    orderDate,
    orderUID, // NUEVO
  };
  if (salesSnap.exists()) {
    await updateDoc(salesRef, { sales: arrayUnion(item) });
  } else {
    await setDoc(salesRef, {
      date: today,
      sales: [item],
      expenses: [],
    } as DocumentData);
  }

  // 2) payments/{orderDate}
  const paymentsRef = doc(db, "payments", orderDate);
  const paymentsSnap = await getDoc(paymentsRef);
  if (paymentsSnap.exists()) {
    await updateDoc(paymentsRef, { payments: arrayUnion(item) });
  } else {
    await setDoc(paymentsRef, {
      date: orderDate,
      payments: [item],
    } as DocumentData);
  }

  // 3) sales_monthly/{month}/entries
  const salesMonth = today.slice(0, 7);
  await setDoc(
    doc(db, "sales_monthly", salesMonth),
    { month: salesMonth },
    { merge: true }
  );
  const salesEntryRef = doc(
    collection(db, "sales_monthly", salesMonth, "entries")
  );
  const salesEntry: SalesMonthlyPaymentEntry = {
    kind: "payment",
    day: today,
    amountCOP: paidAmountToday,
    paymentMethod,
    deductedFromStock,
    totalPayment,
    orderDate,
    categoryId,
    categoryName,
    variantKey,
    selections,
    quantity,
    orderUID, // NUEVO
  };
  await setDoc(salesEntryRef, {
    ...salesEntry,
    createdAt: serverTimestamp(),
  } as DocumentData);

  // 4) payments_monthly/{orderMonth}/entries
  const orderMonth = orderMonthOf(orderDate);
  await setDoc(
    doc(db, "payments_monthly", orderMonth),
    { month: orderMonth },
    { merge: true }
  );
  const pEntryRef = doc(
    collection(db, "payments_monthly", orderMonth, "entries")
  );
  const pEntry: PaymentsMonthlyEntry = {
    kind: "payment",
    orderDay: orderDate,
    paidDay: today,
    amountCOP: paidAmountToday,
    totalAmountCOP: totalAmount,
    paymentMethod,
    categoryId,
    categoryName,
    variantKey,
    selections,
    quantity,
    totalPayment,
    deductedFromStock,
    orderUID, // NUEVO
  };
  await setDoc(pEntryRef, {
    ...pEntry,
    createdAt: serverTimestamp(),
  } as DocumentData);
}

/** Lectura mensual (genérico) */
export async function fetchPaymentsEntriesForMonth(
  month: string
): Promise<PaymentsMonthlyRow[]> {
  const col = collection(
    db,
    "payments_monthly",
    month,
    "entries"
  ) as CollectionReference<PaymentsMonthlyEntry>;
  const snap = await getDocs(col);
  const out: PaymentsMonthlyRow[] = [];
  snap.forEach((d: QueryDocumentSnapshot<PaymentsMonthlyEntry>) => {
    const data = d.data();
    if (data.kind !== "payment") return;
    out.push({ id: d.id, month, data });
  });
  return out;
}

/** Agrupa por pedido y calcula estado (usa orderUID si existe) */
export function groupPayments(
  rows: PaymentsMonthlyRow[]
): PendingPaymentGroup[] {
  const map = new Map<
    string,
    {
      entries: PaymentsMonthlyRow[];
      base: Omit<
        PendingPaymentGroup,
        "abonado" | "restante" | "anchorEntryId" | "anchorEntryMonth"
      >;
      total: number;
      abonado: number;
      hasTotalPayment: boolean;
    }
  >();

  for (const r of rows) {
    const e = r.data;

    // Clave robusta: orderUID si existe; si no, clave “tradicional”
    const fallbackKey = `${e.orderDay}|${e.categoryId}|${e.variantKey}|${e.quantity}|${e.totalAmountCOP}`;
    const key = e.orderUID || fallbackKey;

    const g = map.get(key);
    if (!g) {
      map.set(key, {
        entries: [r],
        base: {
          groupKey: key,
          orderDay: e.orderDay,
          categoryId: e.categoryId,
          categoryName: e.categoryName,
          variantKey: e.variantKey,
          selections: (e.selections ?? {}) as Record<string, string>,
          quantity: e.quantity,
          totalAmountCOP: e.totalAmountCOP,
          paymentMethod: e.paymentMethod,
          deductedFromStock: !!e.deductedFromStock,
          hasTotalPayment: !!e.totalPayment,
          orderUID: e.orderUID, // NUEVO
        },
        total: e.totalAmountCOP,
        abonado: e.amountCOP,
        hasTotalPayment: !!e.totalPayment,
      });
    } else {
      g.entries.push(r);
      g.abonado += e.amountCOP;
      if (e.deductedFromStock) g.base.deductedFromStock = true;
      if (e.totalPayment) {
        g.hasTotalPayment = true;
        g.base.hasTotalPayment = true;
      }
      g.base.paymentMethod = e.paymentMethod;
    }
  }

  const out: PendingPaymentGroup[] = [];

  map.forEach((g) => {
    // Anchor = la entrada más reciente por paidDay/orderDay
    const sorted = [...g.entries].sort((a, b) => {
      const ats = Date.parse(a.data.paidDay || a.data.orderDay);
      const bts = Date.parse(b.data.paidDay || b.data.orderDay);
      return bts - ats;
    });
    const anchor = sorted[0];

    // Total: usa el máximo observado por si varió
    const maxTotal = Math.max(...g.entries.map((e) => e.data.totalAmountCOP));
    const finalTotal = Number.isFinite(maxTotal) ? maxTotal : g.total;

    const abonado = g.abonado;
    const restante = Math.max(0, finalTotal - abonado);

    const paidDays = g.entries
      .map((e) => e.data.paidDay)
      .filter(Boolean)
      .sort();

    out.push({
      ...g.base,
      totalAmountCOP: finalTotal,
      abonado,
      restante,
      anchorEntryId: anchor.id,
      anchorEntryMonth: anchor.month,
      entriesCount: g.entries.length,
      entryPaidDays: paidDays,
    });
  });

  // Pendientes primero
  return out.sort((a, b) => {
    const afinal = a.hasTotalPayment || a.restante <= 0 ? 1 : 0;
    const bfinal = b.hasTotalPayment || b.restante <= 0 ? 1 : 0;
    return afinal - bfinal;
  });
}

/** Finaliza el pago (marca total y registra restante como venta del día) */
export async function finalizePaymentGroup(
  g: PendingPaymentGroup,
  today: string,
  opts?: { didDeductFromStock?: boolean }
): Promise<void> {
  const salesMonth = today.slice(0, 7);
  const didDeduct = opts?.didDeductFromStock ?? true; // default: se considera descontado

  // 1) Actualizar “anchor” en payments_monthly
  const anchorRef = doc(
    db,
    "payments_monthly",
    g.anchorEntryMonth,
    "entries",
    g.anchorEntryId
  );
  await updateDoc(anchorRef, {
    totalPayment: true,
    paid: true,
    deductedFromStock: didDeduct,
    finalizedAt: serverTimestamp(),
  });

  // 2) Crear venta del restante en sales_monthly (si aplica)
  if (g.restante > 0) {
    await setDoc(
      doc(db, "sales_monthly", salesMonth),
      { month: salesMonth },
      { merge: true }
    );
    const saleRef = doc(collection(db, "sales_monthly", salesMonth, "entries"));
    const saleEntry: SalesMonthlyPaymentEntry = {
      kind: "payment",
      finalization: true,
      day: today,
      amountCOP: g.restante,
      paymentMethod: g.paymentMethod,
      categoryId: g.categoryId,
      categoryName: g.categoryName,
      variantKey: g.variantKey,
      selections: g.selections,
      quantity: g.quantity,
      orderDate: g.orderDay,
      totalAmountCOP: g.totalAmountCOP,
      deductedFromStock: didDeduct,
      totalPayment: true,
    };
    await setDoc(saleRef, {
      ...saleEntry,
      createdAt: serverTimestamp(),
    } as DocumentData);
  }
}
