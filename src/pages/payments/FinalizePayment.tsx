// src/pages/payments/FinalizePayment.tsx
import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import type {
  CollectionReference,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { FullScreenLoader } from "../../components/FullScreenLoader";
import { useToast } from "../../hooks/useToast";
import { BackButton } from "../../components/BackButton";
import { format } from "date-fns";


/** ===== Tipos ===== */
type PaymentType = "cake" | "sponge";

interface PaymentEntry {
  kind: "payment";
  orderDay: string;              // yyyy-mm-dd
  paidDay?: string;              // yyyy-mm-dd
  amountCOP: number;             // abono en ese asiento
  totalAmountCOP: number;        // total del pedido
  paymentMethod: "cash" | "transfer";
  type: PaymentType;
  size: string;
  flavor?: string | null;
  quantity: number;
  deductedFromStock?: boolean;
  totalPayment?: boolean;        // true si quedó finalizado
  finalization?: boolean;        // asiento de finalización (lectura)
  createdAt?: Timestamp;
}

interface EntryRow {
  id: string;     // id del doc en entries
  month: string;  // YYYY-MM (subcolección)
  data: PaymentEntry;
}

interface PendingGroup {
  groupKey: string; // orderDay|type|size|flavor|quantity
  orderDay: string;
  type: PaymentType;
  size: string;
  flavor?: string | null;
  quantity: number;
  totalAmountCOP: number;
  abonado: number;
  restante: number;
  paymentMethod: "cash" | "transfer";
  deductedFromStock: boolean;
  hasTotalPayment: boolean;
  anchorEntryId: string;
  anchorEntryMonth: string;
}

const localToday = () => format(new Date(), "yyyy-MM-dd");
const ym = (d: string) => d.slice(0, 7);
const pretty = (s?: string | null) => (s || "").replaceAll("_", " ");
const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

/** ===== Componente ===== */
export function FinalizePayment() {
  const { addToast } = useToast();
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;

  const [month, setMonth] = useState<string>(defaultMonth); // YYYY-MM seleccionado
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<EntryRow[]>([]);
  const [modal, setModal] = useState<PendingGroup | null>(null);

  /** 1) Cargar entries del MES: payments_monthly/{month}/entries */
 /** 1) Cargar entries del MES: payments_monthly/{month}/entries */
async function loadMonthEntries(targetMonth: string) {
  try {
    setLoading(true);

    // Colección tipada a PaymentEntry
    const entriesCol = collection(
      db,
      "payments_monthly",
      targetMonth,
      "entries"
    ) as CollectionReference<PaymentEntry>;

    const snap = await getDocs(entriesCol);

    const list: EntryRow[] = [];
    snap.forEach((d: QueryDocumentSnapshot<PaymentEntry>) => {
      const data = d.data();
      if (data.kind !== "payment") return;
      list.push({ id: d.id, month: targetMonth, data });
    });

    setRows(list);
  } catch (e: unknown) {
    console.error(e);
    addToast({
      type: "error",
      title: "Error al cargar",
      message: "No se pudieron cargar los pagos del mes.",
      duration: 5000,
    });
  } finally {
    setLoading(false);
  }
}


  useEffect(() => {
    loadMonthEntries(month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  /** 2) Agrupar por pedido, calcular restante y estado finalizado */
  const groups: PendingGroup[] = useMemo(() => {
    const map = new Map<
      string,
      {
        entries: EntryRow[];
        base: Omit<
          PendingGroup,
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

    const out: PendingGroup[] = [];
    map.forEach((g) => {
      const restante = Math.max(0, g.total - g.abonado);

      const sorted = [...g.entries].sort((a, b) => {
        const aTs =
          (a.data.createdAt?.toMillis?.() ?? 0) ||
          Date.parse(a.data.paidDay || a.data.orderDay || "1970-01-01");
        const bTs =
          (b.data.createdAt?.toMillis?.() ?? 0) ||
          Date.parse(b.data.paidDay || b.data.orderDay || "1970-01-01");
        return bTs - aTs;
      });
      const anchor = sorted[0];

      out.push({
        ...g.base,
        abonado: g.abonado,
        restante,
        anchorEntryId: anchor.id,
        anchorEntryMonth: anchor.month, // ojo: puede ser otro mes si migraste; aquí es el mismo 'month'
      });
    });

    // Pendientes primero
    return out.sort((a, b) => {
      const aFinal = a.hasTotalPayment || a.restante <= 0 ? 1 : 0;
      const bFinal = b.hasTotalPayment || b.restante <= 0 ? 1 : 0;
      return aFinal - bFinal;
    });
  }, [rows]);

  /** 3) Descontar stock si faltaba */
  async function ensureStockDiscount(g: PendingGroup) {
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

  /** 4) Finalizar: marca totalPayment=true y crea venta del restante (si > 0) */
  async function finalizePayment(g: PendingGroup) {
    const today = localToday();
    const salesMonth = ym(today);

    try {
      setLoading(true);

      // 4.1 inventario si faltaba
      await ensureStockDiscount(g);

      // 4.2 actualizar entry “anchor” (en su mes original)
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
        finalizedAt: Timestamp.now(),
      });

      // 4.3 crear venta del restante en sales_monthly (solo si hay restante)
      if (g.restante > 0) {
        await setDoc(
          doc(db, "sales_monthly", salesMonth),
          { month: salesMonth },
          { merge: true }
        );
        const saleRef = doc(
          collection(db, "sales_monthly", salesMonth, "entries")
        );
        const saleEntry = {
          kind: "payment",
          finalization: true,
          day: today,
          amountCOP: g.restante,
          paymentMethod: g.paymentMethod,
          type: g.type,
          size: g.size,
          flavor: g.flavor ?? null,
          quantity: g.quantity,
          orderDay: g.orderDay,
          totalAmountCOP: g.totalAmountCOP,
          createdAt: Timestamp.now(),
        };
        await setDoc(saleRef, saleEntry);
      }

      addToast({
        type: "success",
        title: "Pago finalizado",
        message:
          g.restante > 0
            ? "Se marcó el pago como finalizado y se creó la venta del restante."
            : "Se marcó el pago como finalizado.",
        duration: 5000,
      });

      setModal(null);
      // recargar solo el mes visible
      await loadMonthEntries(month);
    } catch (e) {
      console.error(e);
      addToast({
        type: "error",
        title: "Error al finalizar",
        message: "No pudimos actualizar el pago. Inténtalo nuevamente.",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <FullScreenLoader message="Cargando información..." />;

  const isFinalizado = (g: PendingGroup) =>
    g.hasTotalPayment || g.restante <= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex flex-col">
      <main className="flex-grow p-6 sm:p-12 max-w-6xl mx-auto w-full">
        <header className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl opacity-10" />
          <div className="relative z-10 py-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl shadow-xl ring-4 ring-purple-200">
                  💳
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-[#8E2DA8] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent">
                    Gestión de Abonos
                  </h1>
                  <p className="text-gray-700">Filtra por mes y finaliza pagos pendientes.</p>
                </div>
              </div>

              {/* Selector de mes */}
              <div className="flex items-end gap-3">
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">Mes</label>
                  <input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-purple-200 bg-white text-sm font-medium text-purple-700"
                  />
                </div>
                <div className="hidden sm:block mt-6">
                  <BackButton />
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="bg-white border border-[#E8D4F2] shadow-md rounded-2xl p-6 sm:p-8">
          {groups.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-16 h-16 rounded-full bg-white border border-[#E8D4F2] flex items-center justify-center text-[#8E2DA8] text-2xl font-bold mb-4">
                💳
              </div>
              <p className="text-gray-500 text-lg">No hay pagos en este mes.</p>
              <p className="text-gray-400 text-sm mt-1">Cambia el mes para ver otros registros.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map((g) => (
                <div
                  key={g.groupKey}
                  className="bg-white border border-[#E8D4F2] rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#8E2DA8]/10 text-[#8E2DA8]">
                          {g.orderDay}
                        </span>
                        <span className="text-gray-400">Producto</span>
                        <span className="capitalize font-medium text-gray-800">
                          {g.type === "cake" ? "Torta" : "Bizcocho"}
                        </span>
                        {isFinalizado(g) && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                            Finalizado
                          </span>
                        )}
                      </div>

                      <div className="text-lg font-semibold text-gray-900 mb-1">
                        {pretty(g.size)}
                        {g.type === "cake" ? ` - ${pretty(g.flavor || "")}` : ""}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-gray-600">
                        <span>Cantidad: {g.quantity}</span>
                        <span className="font-semibold text-[#8E2DA8]">
                          Total: ${g.totalAmountCOP.toLocaleString("es-CO")}
                        </span>
                        <span className="text-slate-600">
                          Abonado: ${g.abonado.toLocaleString("es-CO")}
                        </span>
                        <span className={isFinalizado(g) ? "text-emerald-700 font-semibold" : "text-yellow-700 font-semibold"}>
                          Pendiente: ${g.restante.toLocaleString("es-CO")}
                        </span>
                        {g.deductedFromStock ? (
                          <span className="text-emerald-700">Inventario descontado</span>
                        ) : (
                          <span className="text-orange-700">Inventario pendiente</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isFinalizado(g) ? (
                        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                          </svg>
                          <span className="font-semibold">Finalizado</span>
                        </div>
                      ) : (
                        <button
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white px-6 py-2.5 rounded-lg font-semibold shadow-md hover:opacity-95 transition"
                          onClick={() => setModal(g)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                          </svg>
                          Finalizar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-[#E8D4F2]">
            <div className="p-6 border-b border-[#E8D4F2]">
              <h3 className="text-2xl font-bold text-[#8E2DA8] mb-2">Confirmar Pago</h3>
              <div className="text-sm text-gray-600">
                {pretty(modal.size)}
                {modal.type === "cake" ? ` - ${pretty(modal.flavor || "")}` : ""}
              </div>
            </div>

            <div className="p-6">
              <div className="bg-[#FDF8FF] border border-[#E8D4F2] rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total:</span>
                    <div className="font-bold text-[#8E2DA8]">
                      ${modal.totalAmountCOP.toLocaleString("es-CO")}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Pendiente:</span>
                    <div className="font-bold text-yellow-600">
                      ${modal.restante.toLocaleString("es-CO")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  className="flex-1 bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white py-3 rounded-xl font-semibold shadow-md hover:opacity-95 transition"
                  onClick={() => finalizePayment(modal)}
                >
                  Pagar
                </button>
                <button
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition"
                  onClick={() => setModal(null)}
                >
                  Cancelar
                </button>
              </div>
            </div>

            <div className="p-4 text-center text-xs text-gray-500">
              Se marcará <code>totalPayment=true</code> en el entry del pedido y,
              si hay saldo, se creará la venta del restante en <code>sales_monthly</code> del día actual.
            </div>
          </div>
        </div>
      )}

      <footer className="text-center text-sm text-gray-400 py-6">
        © 2025 CakeManager. Todos los derechos reservados.
      </footer>
    </div>
  );
}
