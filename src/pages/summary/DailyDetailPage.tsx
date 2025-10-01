// src/pages/daily/DailyDetailPage.tsx
import { collectionGroup, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { AppFooter } from "../../components/AppFooter";
import { FullScreenLoader } from "../../components/FullScreenLoader";
import { PageHero } from "../../components/ui/PageHero";
import { ProTipBanner } from "../../components/ui/ProTipBanner";
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
  for (const k of keys) {
    const hit = entries.find(([kk]) => kk.toLowerCase() === k.toLowerCase());
    if (hit) return String(hit[1] ?? "");
  }
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
  type?: string | null;
  size?: string | null;
  flavor?: string | null;
  amountCOP?: number | null;
  quantity?: number | null;
  paymentMethod?: PaymentMethod;
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
        const qEntries = query(
          collectionGroup(db, "entries"),
          where("day", "==", fecha)
        );
        const qExpenses = query(
          collectionGroup(db, "expenses"),
          where("day", "==", fecha)
        );

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

        const entries = entriesSnap.docs.map((d) => {
          const data = d.data() as EntryDoc & { id?: string };
          data.id = d.id;
          return data;
        });

        const mappedSales: Sale[] = entries.map((e): Sale => {
          const type = ucFirst(cleanLabel(e.type ?? e.categoryId ?? ""));
          const size =
            cleanLabel(e.size) ||
            cleanLabel(readFromSelections(e.selections, SIZE_KEYS));
          const flavor =
            cleanLabel(e.flavor) ||
            cleanLabel(readFromSelections(e.selections, FLAVOR_KEYS));

          const cantidad = Number.isFinite(e.quantity as number)
            ? Number(e.quantity)
            : 0;

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
        {/* BackButton + PageHero */}
        <div className="mb-6 sm:mb-8 relative">
          <PageHero
            icon="📅"
            title={`Detalle del día ${fecha}`}
            subtitle="Ventas, abonos y gastos del día seleccionado (esquema mensual)."
            gradientClass="from-[#7a1f96] via-[#8E2DA8] to-[#a84bd1]"
            iconGradientClass="from-[#8E2DA8] to-[#A855F7]"
          />
        </div>

        <section className="bg-white/80 backdrop-blur-xl border-2 border-white/60 shadow-2xl rounded-3xl p-6 sm:p-8">
          <DailyDetailContent
            fecha={fecha ?? ""}
            sales={sales}
            expenses={expenses}
          />
        </section>

        <ProTipBanner
          title="Tip"
          text="Toca una fila para ver mejor el detalle en móvil. Usa descripciones claras en gastos."
          gradientClass="from-[#7a1f96] via-[#8E2DA8] to-[#a84bd1]"
        />
      </main>

      <AppFooter appName="InManager" />
    </div>
  );
}
