// src/pages/payments/services/payments.service.ts
import {
    arrayUnion,
    collection,
    doc,
    getDoc,
    getDocs,
    runTransaction,
    setDoc,
    updateDoc,
    serverTimestamp,
    type CollectionReference,
    type DocumentData,
    type QueryDocumentSnapshot,
  } from "firebase/firestore";
  import { db } from "../../lib/firebase";
  import type {
    RegisterPaymentInput,
    LegacyPaymentItem,
    SalesMonthlyPaymentEntry,
    PaymentsMonthlyEntry,
    PaymentsMonthlyRow,
    PendingPaymentGroup,
    ProductType,
  } from "../../types/payments";
  
  /** ===== Stock ===== */
  export async function deductStockIfRequested(
    productType: ProductType,
    size: string,
    flavorOrSponge: string,
    quantity: number,
    shouldDeduct: boolean
  ): Promise<void> {
    if (!shouldDeduct) return;
    const stockRef = doc(db, "stock", `${productType}_${size}`);
  
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(stockRef);
      if (!snap.exists()) throw new Error("El producto no se encuentra en el inventario.");
      const data = snap.data() as Record<string, unknown>;
  
      if (productType === "cake") {
        const flavors = (data.flavors as Record<string, number> | undefined) ?? {};
        const current = Number(flavors[flavorOrSponge] ?? 0);
        if (current < quantity) throw new Error("No hay suficiente stock para este sabor.");
        const updated = { ...flavors, [flavorOrSponge]: current - quantity };
        tx.update(stockRef, { flavors: updated } as DocumentData);
      } else {
        const current = Number((data.quantity as number | undefined) ?? 0);
        if (current < quantity) throw new Error("No hay suficiente stock para este tamaño.");
        tx.update(stockRef, { quantity: current - quantity } as DocumentData);
      }
    });
  }
  
  /** ===== Registrar pago/abono (AddPayment) ===== */
  export async function registerPayment(input: RegisterPaymentInput): Promise<void> {
    const {
      today,
      productType,
      size,
      flavorOrSponge,
      quantity,
      totalAmount,
      paidAmountToday,
      paymentMethod,
      totalPayment,
      deductedFromStock,
      orderDate,
    } = input;
  
    // 1) Legacy daily: sales/{today}
    const salesRef = doc(db, "sales", today);
    const salesSnap = await getDoc(salesRef);
    const paymentItem: LegacyPaymentItem = {
      id: Date.now().toString(),
      type: productType,
      size,
      flavor: flavorOrSponge,
      quantity,
      amount: totalAmount,
      partialAmount: paidAmountToday,
      paymentMethod,
      isPayment: true,
      deductedFromStock,
      totalPayment,
      orderDate,
    };
    if (salesSnap.exists()) {
      await updateDoc(salesRef, { sales: arrayUnion(paymentItem) });
    } else {
      await setDoc(salesRef, { date: today, sales: [paymentItem], expenses: [] } as DocumentData);
    }
  
    // 2) payments/{orderDate}
    const paymentsRef = doc(db, "payments", orderDate);
    const paymentsSnap = await getDoc(paymentsRef);
    if (paymentsSnap.exists()) {
      await updateDoc(paymentsRef, { payments: arrayUnion(paymentItem) });
    } else {
      await setDoc(paymentsRef, { date: orderDate, payments: [paymentItem] } as DocumentData);
    }
  
    // 3) sales_monthly/{yyyy-MM}/entries (index por day=today)
    const monthKey = today.slice(0, 7);
    await setDoc(doc(db, "sales_monthly", monthKey), { month: monthKey }, { merge: true });
    const entryRef = doc(collection(db, "sales_monthly", monthKey, "entries"));
    const monthlyEntry: SalesMonthlyPaymentEntry = {
      kind: "payment",
      day: today,
      type: productType,
      size,
      flavor: flavorOrSponge,
      quantity,
      amountCOP: paidAmountToday,
      paymentMethod,
      deductedFromStock,
      totalPayment,
      orderDate,
    };
    await setDoc(entryRef, monthlyEntry as DocumentData);
  
    // 4) payments_monthly/{orderMonth}/entries (index por mes del pedido)
    const orderMonth = orderDate.slice(0, 7);
    await setDoc(doc(db, "payments_monthly", orderMonth), { month: orderMonth }, { merge: true });
    const pEntryRef = doc(collection(db, "payments_monthly", orderMonth, "entries"));
    const paymentEntry: PaymentsMonthlyEntry = {
      kind: "payment",
      orderDay: orderDate,
      paidDay: today,
      amountCOP: paidAmountToday,
      totalAmountCOP: totalAmount,
      paymentMethod,
      type: productType,
      size,
      flavor: flavorOrSponge,
      quantity,
      totalPayment,
      deductedFromStock,
    };
    await setDoc(pEntryRef, paymentEntry as DocumentData);
  }
  
  /** ===== FinalizePayment: lectura mensual ===== */
  export async function fetchPaymentsEntriesForMonth(month: string): Promise<PaymentsMonthlyRow[]> {
    const entriesCol = collection(
      db,
      "payments_monthly",
      month,
      "entries"
    ) as CollectionReference<PaymentsMonthlyEntry>;
  
    const snap = await getDocs(entriesCol);
    const list: PaymentsMonthlyRow[] = [];
    snap.forEach((d: QueryDocumentSnapshot<PaymentsMonthlyEntry>) => {
      const data = d.data();
      if (data.kind !== "payment") return;
      list.push({ id: d.id, month, data });
    });
    return list;
  }
  
  /** Agrupa por pedido y calcula restante, estado finalizado y ancla */
  export function groupPayments(rows: PaymentsMonthlyRow[]): PendingPaymentGroup[] {
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
      const key = `${e.orderDay}|${e.type}|${e.size}|${e.flavor ?? ""}|${e.quantity}`;
      const g = map.get(key);
      if (!g) {
        map.set(key, {
          entries: [r],
          base: {
            groupKey: key,
            orderDay: e.orderDay,
            type: e.type,
            size: e.size,
            flavor: e.flavor ?? null,
            quantity: e.quantity,
            totalAmountCOP: e.totalAmountCOP,
            paymentMethod: e.paymentMethod,
            deductedFromStock: !!e.deductedFromStock,
            hasTotalPayment: !!e.totalPayment,
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
      const restante = Math.max(0, g.total - g.abonado);
  
      const sorted = [...g.entries].sort((a, b) => {
        const ats = Date.parse(a.data.paidDay || a.data.orderDay);
        const bts = Date.parse(b.data.paidDay || b.data.orderDay);
        return bts - ats;
      });
      const anchor = sorted[0];
  
      out.push({
        ...g.base,
        abonado: g.abonado,
        restante,
        anchorEntryId: anchor.id,
        anchorEntryMonth: anchor.month,
      });
    });
  
    // Pendientes primero
    return out.sort((a, b) => {
      const afinal = a.hasTotalPayment || a.restante <= 0 ? 1 : 0;
      const bfinal = b.hasTotalPayment || b.restante <= 0 ? 1 : 0;
      return afinal - bfinal;
    });
  }
  
  /** Asegura descuento de inventario si aún no se había hecho */
  export async function ensureStockDiscountForGroup(g: PendingPaymentGroup): Promise<void> {
    if (g.deductedFromStock) return;
  
    const stockRef = doc(db, "stock", `${g.type}_${g.size}`);
    const stockSnap = await getDoc(stockRef);
    if (!stockSnap.exists()) return;
  
    const data = stockSnap.data() as
      | { type: "cake"; flavors: Record<string, number> }
      | { type: "sponge"; quantity: number };
  
    if (g.type === "cake" && "flavors" in data) {
      const cur = data.flavors?.[g.flavor || ""] ?? 0;
      await updateDoc(stockRef, {
        flavors: { ...(data.flavors || {}), [g.flavor || ""]: cur - g.quantity },
      });
    } else if (g.type === "sponge" && "quantity" in data) {
      const cur = data.quantity ?? 0;
      await updateDoc(stockRef, { quantity: cur - g.quantity });
    }
  }
  
  /** Finaliza el pago: marca totalPayment y crea venta del restante (si aplica) */
  export async function finalizePaymentGroup(g: PendingPaymentGroup, today: string): Promise<void> {
    const salesMonth = today.slice(0, 7);
  
    // 1) Inventario si faltaba
    await ensureStockDiscountForGroup(g);
  
    // 2) Actualizar “anchor” en payments_monthly
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
      deductedFromStock: true,
      finalizedAt: serverTimestamp(),
    });
  
    // 3) Crear venta del restante en sales_monthly (si hay restante)
    if (g.restante > 0) {
      await setDoc(doc(db, "sales_monthly", salesMonth), { month: salesMonth }, { merge: true });
      const saleRef = doc(collection(db, "sales_monthly", salesMonth, "entries"));
      // OJO: flavor como null si no viene
      const saleEntry: SalesMonthlyPaymentEntry = {
        kind: "payment",
        finalization: true,
        day: today,
        amountCOP: g.restante,
        paymentMethod: g.paymentMethod,
        type: g.type,
        size: g.size,
        flavor: g.flavor ?? null,        // si tu tipo es string | null
        quantity: g.quantity,
        orderDate: g.orderDay,
        totalAmountCOP: g.totalAmountCOP,
        deductedFromStock: true,         // ya se aseguró el descuento
        totalPayment: true,              // este asiento cierra el pago
      };
      await setDoc(saleRef, { ...saleEntry, createdAt: serverTimestamp() } as DocumentData);
    }
  }
  