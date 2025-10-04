import {
  collectionGroup,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { db } from "../lib/firebase";
import type { PaymentMethod } from "../types/informs";
import { getMonthMeta } from "../utils/analyticsMeta";
import { getMonthCache, setMonthCache } from "../utils/monthCache";
import { isCurrentMonth, monthsBetween } from "../utils/rangeMonths";

export type SaleLike = {
  id: string;
  paymentMethod: string;
  valor: number;
  isPayment?: boolean;
  quantity?: number | null;
  unitPriceCOP?: number | null;
  selections?: Record<string, unknown> | null;
  categoryId?: string | null;
  categoryName?: string | null;
  variantKey?: string | null;
};

export type ExpenseLike = {
  id: string;
  description: string;
  paymentMethod: string;
  value: number;
};

export type DailyData = {
  fecha: string;
  totalSalesCash: number;
  totalSalesTransfer: number;
  totalExpensesCash: number;
  totalExpensesTransfer: number;
  net: number;
  disponibleEfectivo: number;
  disponibleTransfer: number;
};

export type DailyRaw = {
  fecha: string;
  sales: SaleLike[];
  expenses: ExpenseLike[];
};

type Range = { start: string; end: string };
type MonthPayload = { raw: DailyRaw[] };

type EntryDoc = {
  kind: "sale" | "payment";
  day: string;
  amountCOP?: number | null;
  quantity?: number | null;
  paymentMethod?: PaymentMethod;
  categoryId?: string | null;
  categoryName?: string | null;
  unitPriceCOP?: number | null;
  selections?: Record<string, unknown> | null;
  variantKey?: string | null;
};

type ExpenseDoc = {
  day?: string;
  description?: string;
  paymentMethod?: string;
  valueCOP?: number;
  value?: number;
};

export function useRangeSummaryOptimized(range: Range) {
  const [loading, setLoading] = useState(true);
  const [rawDocs, setRawDocs] = useState<DailyRaw[]>([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);

      const yms = monthsBetween(range.start, range.end);
      const monthResults: DailyRaw[][] = [];

      for (const ym of yms) {
        if (!isCurrentMonth(ym)) {
          const meta = await getMonthMeta(ym);
          const cached = getMonthCache<MonthPayload>(ym);
          if (meta && cached && cached.version === meta.version) {
            monthResults.push(cached.payload.raw);
            continue;
          }
        }

        const monthStart = `${ym}-01`;
        const monthEnd = `${ym}-31`;
        const s = range.start > monthStart ? range.start : monthStart;
        const e = range.end < monthEnd ? range.end : monthEnd;

        const qEntries = query(
          collectionGroup(db, "entries"),
          where("day", ">=", s),
          where("day", "<=", e),
          orderBy("day")
        );

        let expensesSnap: Awaited<ReturnType<typeof getDocs>> | null = null;
        try {
          expensesSnap = await getDocs(
            query(
              collectionGroup(db, "expenses"),
              where("day", ">=", s),
              where("day", "<=", e),
              orderBy("day")
            )
          );
        } catch (err: unknown) {
          const msg = String((err as { message?: string })?.message ?? "");
          if (msg.includes("index is not ready yet")) {
            console.warn(
              "[useRangeSummaryOptimized] expenses index not ready;",
              ym
            );
          } else {
            throw err;
          }
        }

        const byDay: Record<
          string,
          { sales: SaleLike[]; expenses: ExpenseLike[] }
        > = {};
        const entriesSnap = await getDocs(qEntries);

        entriesSnap.forEach((d) => {
          const data = d.data() as Partial<EntryDoc>;
          const day = String(data?.day ?? "");
          if (!day) return;
          if (!byDay[day]) byDay[day] = { sales: [], expenses: [] };

          const cantidad =
            typeof data.quantity === "number" && Number.isFinite(data.quantity)
              ? data.quantity
              : 0;

          const valor = Number(
            data.amountCOP ??
              (Number.isFinite(data.unitPriceCOP as number) &&
              Number.isFinite(cantidad)
                ? (data.unitPriceCOP as number) * (cantidad as number)
                : 0) ??
              0
          );

          const sale: SaleLike = {
            id: d.id,
            paymentMethod: (data.paymentMethod ?? "cash") as string,
            valor,
            isPayment: data.kind === "payment",
            quantity: cantidad,
            unitPriceCOP: (data.unitPriceCOP as number) ?? null,
            selections: data.selections ?? null,
            categoryId: data.categoryId ?? null,
            categoryName: (data.categoryName ?? data.categoryId ?? null) as
              | string
              | null,
            variantKey: data.variantKey ?? null,
          };

          byDay[day].sales.push(sale);
        });

        expensesSnap?.forEach((d) => {
          const data = d.data() as Partial<ExpenseDoc>;
          const day = String(data?.day ?? "");
          if (!day) return;
          if (!byDay[day]) byDay[day] = { sales: [], expenses: [] };

          const expense: ExpenseLike = {
            id: d.id,
            description: data.description ?? "",
            paymentMethod: data.paymentMethod ?? "cash",
            value: Number(data.valueCOP ?? data.value ?? 0),
          };

          byDay[day].expenses.push(expense);
        });

        const rawMonth: DailyRaw[] = Object.entries(byDay)
          .map(([fecha, v]) => ({ fecha, ...v }))
          .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

        monthResults.push(rawMonth);

        if (!isCurrentMonth(ym)) {
          const meta = await getMonthMeta(ym);
          const version = Number(meta?.version ?? 0);
          setMonthCache<MonthPayload>(ym, {
            version,
            payload: { raw: rawMonth },
            cachedAt: Date.now(),
          });
        }
      }

      const joined = monthResults
        .flat()
        .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
      if (!cancelled) setRawDocs(joined);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [range.start, range.end]);

  const { daily, totals } = useMemo(() => {
    const dailyRows: DailyData[] = rawDocs.map(({ fecha, sales, expenses }) => {
      const totalSalesCash = sales
        .filter((s) => s.paymentMethod === "cash")
        .reduce((acc, s) => acc + (s.valor || 0), 0);
      const totalSalesTransfer = sales
        .filter((s) => s.paymentMethod === "transfer")
        .reduce((acc, s) => acc + (s.valor || 0), 0);
      const totalExpensesCash = expenses
        .filter((e) => e.paymentMethod === "cash")
        .reduce((a, e) => a + (e.value || 0), 0);
      const totalExpensesTransfer = expenses
        .filter((e) => e.paymentMethod === "transfer")
        .reduce((a, e) => a + (e.value || 0), 0);
      const disponibleEfectivo = totalSalesCash - totalExpensesCash;
      const disponibleTransfer = totalSalesTransfer - totalExpensesTransfer;
      const net =
        totalSalesCash +
        totalSalesTransfer -
        totalExpensesCash -
        totalExpensesTransfer;
      return {
        fecha,
        totalSalesCash,
        totalSalesTransfer,
        totalExpensesCash,
        totalExpensesTransfer,
        net,
        disponibleEfectivo,
        disponibleTransfer,
      };
    });

    const sum = (sel: (d: DailyData) => number) =>
      dailyRows.reduce((acc, d) => acc + sel(d), 0);
    const totals = {
      totalSalesCash: sum((d) => d.totalSalesCash),
      totalSalesTransfer: sum((d) => d.totalSalesTransfer),
      totalExpensesCash: sum((d) => d.totalExpensesCash),
      totalExpensesTransfer: sum((d) => d.totalExpensesTransfer),
      totalNet: sum((d) => d.net),
      efectivoDisponible:
        sum((d) => d.totalSalesCash) - sum((d) => d.totalExpensesCash),
      transferDisponible:
        sum((d) => d.totalSalesTransfer) - sum((d) => d.totalExpensesTransfer),
      totalIngresos:
        sum((d) => d.totalSalesCash) + sum((d) => d.totalSalesTransfer),
      totalGastosDiarios:
        sum((d) => d.totalExpensesCash) + sum((d) => d.totalExpensesTransfer),
    };
    return { daily: dailyRows, totals };
  }, [rawDocs]);

  return { loading, daily, rawDocs, totals };
}
