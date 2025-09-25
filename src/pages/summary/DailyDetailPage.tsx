import { collectionGroup, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { BackButton } from "../../components/BackButton";
import { FullScreenLoader } from "../../components/FullScreenLoader";
import { db } from "../../lib/firebase";
import type { Expense, Sale } from "../../types/finance";
import { DailyDetailContent } from "./DailyDetailContent";

type PaymentMethod = "cash" | "transfer";

/** 🔑 Claves posibles para tamaño y sabor en selections (genérico) */
const SIZE_KEYS = ["tamaño", "tamano", "size"];
const FLAVOR_KEYS = ["sabor", "flavor"];

/** Utils */
function ucFirst(s: string) {
  const t = (s ?? "").trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : "";
}
function cleanLabel(s?: string | null) {
  return (s ?? "").toString().replace(/_/g, " ").trim();
}
function readFromSelections(
  selections: Record<string, unknown> | null | undefined,
  keys: string[]
): string {
  if (!selections) return "";
  const entries = Object.entries(selections);

  // exact match
  for (const k of keys) {
    const hit = entries.find(([kk]) => kk.toLowerCase() === k.toLowerCase());
    if (hit) return String(hit[1] ?? "");
  }
  // includes
  for (const k of keys) {
    const hit = entries.find(([kk]) =>
      kk.toLowerCase().includes(k.toLowerCase())
    );
    if (hit) return String(hit[1] ?? "");
  }
  return "";
}

/** Doc shape: soporta legacy y genérico */
type EntryDoc = {
  kind: "sale" | "payment";
  day: string; // "YYYY-MM-DD"

  // Legacy
  type?: string | null;
  size?: string | null;
  flavor?: string | null;
  amountCOP?: number | null;

  // Comunes
  quantity?: number | null;
  paymentMethod?: PaymentMethod;

  // Genérico
  categoryId?: string | null;
  variantKey?: string | null;
  unitPriceCOP?: number | null;
  selections?: Record<string, unknown> | null;
};

type ExpenseDoc = {
  day: string; // "YYYY-MM-DD"
  description?: string | null;
  paymentMethod?: PaymentMethod;
  valueCOP?: number | null;
  value?: number | null;
};

export function DailyDetailPage() {
  const { fecha } = useParams<{ fecha: string }>();
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDay() {
      if (!fecha) return;
      setLoading(true);
      try {
        // 🔁 Entradas y gastos por día (collectionGroup cubre cualquier mes)
        const qEntries = query(
          collectionGroup(db, "entries"),
          where("day", "==", fecha)
        );
        const qExpenses = query(
          collectionGroup(db, "expenses"),
          where("day", "==", fecha)
        );

        // ⚠️ Si el índice de entries no está listo, Firestore lanzará error.
        // Puedes envolver en try/catch si lo necesitas.
        const [entriesSnap, expensesSnapOrNull] = await Promise.all([
          getDocs(qEntries),
          (async () => {
            try {
              return await getDocs(qExpenses);
            } catch (e: unknown) {
              const msg = e instanceof Error ? e.message : String(e);
              if (msg.includes("index is not ready yet")) {
                console.warn(
                  "Expenses index not ready yet; rendering without expenses."
                );
                return null;
              }
              throw e;
            }
          })(),
        ]);

        // 🔄 Mapear entradas (legacy + genérico) → Sale
        const entries = entriesSnap.docs.map((d) => {
          const data = d.data() as EntryDoc & { id?: string };
          data.id = d.id;
          return data;
        });

        const mappedSales: Sale[] = entries.map((e): Sale => {
          // type: legacy(type) -> genérico(categoryId)
          const type = ucFirst(cleanLabel(e.type ?? e.categoryId ?? ""));

          // size/flavor: legacy(top-level) -> genérico(selections)
          const size =
            cleanLabel(e.size) ||
            cleanLabel(readFromSelections(e.selections, SIZE_KEYS));

          const flavor =
            cleanLabel(e.flavor) ||
            cleanLabel(readFromSelections(e.selections, FLAVOR_KEYS));

          // cantidad
          const cantidad = Number.isFinite(e.quantity as number)
            ? Number(e.quantity)
            : 0;

          // valor: amountCOP || (unitPriceCOP * cantidad)
          const valor = Number(
            e.amountCOP ??
              (Number.isFinite(e.unitPriceCOP as number) &&
              Number.isFinite(cantidad)
                ? Number(e.unitPriceCOP) * cantidad
                : 0)
          );

          const paymentMethod = (e.paymentMethod ??
            "cash") as Sale["paymentMethod"];
          const isPayment = e.kind === "payment";

          return {
            id: e.id as string,
            type,
            size,
            flavor,
            cantidad,
            paymentMethod,
            valor,
            isPayment,
          };
        });

        // 🔄 Mapear gastos
        const expensesDocs: ExpenseDoc[] = (expensesSnapOrNull?.docs ?? []).map(
          (d) => d.data() as ExpenseDoc
        );
        const mappedExpenses: Expense[] = expensesDocs.map((ex) => ({
          description: ex.description ?? "",
          paymentMethod: (ex.paymentMethod ??
            "cash") as Expense["paymentMethod"],
          value: Number(ex.valueCOP ?? ex.value ?? 0),
        }));

        setSales(mappedSales);
        setExpenses(mappedExpenses);
      } finally {
        setLoading(false);
      }
    }
    fetchDay();
  }, [fecha]);

  if (loading) return <FullScreenLoader message="Cargando detalle..." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex flex-col">
      <main className="flex-grow px-6 py-8 sm:py-12 max-w-6xl mx-auto w-full">
        <header className="mb-6 sm:mb-8">
          <div className="sm:hidden mb-3">
            <BackButton />
          </div>
          <div className="relative">
            <div className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2">
              <BackButton />
            </div>
            <div className="text-left sm:text-center relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 opacity-10" />
              <div className="relative py-4">
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl shadow-lg">
                    📅
                  </div>
                </div>
                <h1 className="text-3xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Detalle del día {fecha}
                </h1>
                <p className="text-gray-700 mt-2">
                  Ventas, abonos y gastos del día seleccionado (esquema
                  mensual).
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="bg-white/80 backdrop-blur-xl border-2 border-white/60 shadow-2xl rounded-3xl p-6 sm:p-8">
          <DailyDetailContent
            fecha={fecha ?? ""}
            sales={sales}
            expenses={expenses}
          />
        </section>

        <div className="mt-8">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-5 shadow-lg text-center">
            <p className="text-sm opacity-90">Tip</p>
            <p className="text-base">
              Toca una fila para ver mejor el detalle en móvil. Usa
              descripciones claras en gastos.
            </p>
          </div>
        </div>
      </main>

      <footer className="text-center text-sm text-gray-400 py-6">
        © 2025 CakeManager. Todos los derechos reservados.
      </footer>
    </div>
  );
}
