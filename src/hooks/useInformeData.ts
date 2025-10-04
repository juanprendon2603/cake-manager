import { format, parseISO } from "date-fns";
import { useMemo } from "react";
import type { DailyRaw } from "./useRangeSummary";

function safeNumber(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function getAmountFromAny(s: any): number {
  const byField = safeNumber(s?.amountCOP ?? s?.amount ?? s?.valor);
  if (byField > 0) return byField;
  const q = safeNumber(s?.quantity);
  const up = safeNumber(s?.unitPriceCOP ?? s?.unitPrice);
  if (q > 0 && up > 0) return q * up;
  return 0;
}
function getQtyFromAny(s: any): number {
  const q = safeNumber(s?.quantity);
  return q > 0 ? q : 1;
}

export type CategoryAttributeCards = Array<{
  category: string;
  attributes: Array<{
    attribute: string;
    data: Array<{ option: string; revenue: number; qty: number }>;
  }>;
}>;

export function useInformeData(
  rawDocs: DailyRaw[],
  geTotals: { generalExpensesTotal: number }
) {
  return useMemo(() => {
    const allSales = (rawDocs || []).flatMap((d) => d.sales || []);
    const allExpenses = (rawDocs || []).flatMap((d) => d.expenses || []);

    let totalCash = 0;
    let totalTransfer = 0;
    let saleCount = 0;

    const byCategoryRevenue = new Map<string, number>();

    type OptAgg = { revenue: number; qty: number };
    type AttrMap = Map<string, Map<string, OptAgg>>;
    const catMap = new Map<string, AttrMap>();

    for (const s of allSales) {
      const amount = getAmountFromAny(s);
      if (amount <= 0) continue;

      const qty = getQtyFromAny(s);
      const pm = String((s as any)?.paymentMethod ?? "cash");
      const category = String(
        (s as any)?.categoryName ?? (s as any)?.categoryId ?? "—"
      );
      const selections =
        (s as any)?.selections && typeof (s as any).selections === "object"
          ? ((s as any).selections as Record<string, unknown>)
          : {};

      if (pm === "cash") totalCash += amount;
      else totalTransfer += amount;
      saleCount += 1;

      byCategoryRevenue.set(
        category,
        (byCategoryRevenue.get(category) ?? 0) + amount
      );

      let attrMap = catMap.get(category);
      if (!attrMap) {
        attrMap = new Map<string, Map<string, OptAgg>>();
        catMap.set(category, attrMap);
      }
      for (const [attrRaw, optRaw] of Object.entries(selections)) {
        const attr = String(attrRaw || "").trim();
        const opt = String(optRaw || "—").trim();
        if (!attr) continue;
        let optMap = attrMap.get(attr);
        if (!optMap) {
          optMap = new Map<string, OptAgg>();
          attrMap.set(attr, optMap);
        }
        const agg = optMap.get(opt) ?? { revenue: 0, qty: 0 };
        agg.revenue += amount;
        agg.qty += qty;
        optMap.set(opt, agg);
      }
    }

    const byDayRevenue = new Map<string, number>();
    const byDayExpenses = new Map<string, number>();

    for (const d of rawDocs || []) {
      const dayRevenue = (d.sales || []).reduce(
        (acc, s) => acc + getAmountFromAny(s),
        0
      );
      const dayExpenses = (d.expenses || []).reduce(
        (acc, e) =>
          acc + safeNumber((e as any)?.value ?? (e as any)?.amount ?? 0),
        0
      );
      byDayRevenue.set(d.fecha, (byDayRevenue.get(d.fecha) ?? 0) + dayRevenue);
      byDayExpenses.set(
        d.fecha,
        (byDayExpenses.get(d.fecha) ?? 0) + dayExpenses
      );
    }

    const dailyStats = Array.from(byDayRevenue.entries())
      .map(([date, revenue]) => {
        const dayExpenses = byDayExpenses.get(date) ?? 0;
        let formattedDate = date;
        try {
          formattedDate = format(parseISO(date), "dd/MM");
        } catch {}
        return {
          date,
          revenue,
          expenses: dayExpenses,
          profit: revenue - dayExpenses,
          formattedDate,
        };
      })
      .sort((a, b) => (a.date < b.date ? -1 : 1));

    const totalDaysWithSales = dailyStats.filter((d) => d.revenue > 0).length;

    let totalExpensesCash = 0,
      totalExpensesTransfer = 0;
    for (const e of allExpenses) {
      const val = safeNumber((e as any)?.value ?? (e as any)?.amount ?? 0);
      const pm = String((e as any)?.paymentMethod ?? "cash");
      if (pm === "cash") totalExpensesCash += val;
      else totalExpensesTransfer += val;
    }

    const generalExpensesTotal = geTotals.generalExpensesTotal || 0;
    const totalIncome = totalCash + totalTransfer;
    const dailyExpenses = totalExpensesCash + totalExpensesTransfer;
    const totalExpenses = dailyExpenses + generalExpensesTotal;
    const netTotal = totalIncome - totalExpenses;
    const avgTicket = saleCount > 0 ? totalIncome / saleCount : 0;

    const paymentPie = [
      { name: "Efectivo", value: totalCash },
      { name: "Transferencia", value: totalTransfer },
    ];

    const categoryAttributeCards: CategoryAttributeCards = Array.from(
      catMap.entries()
    )
      .map(([category, attrMap]) => {
        const attributes = Array.from(attrMap.entries())
          .map(([attribute, optMap]) => {
            const rows = Array.from(optMap.entries()).map(([option, agg]) => ({
              option,
              revenue: agg.revenue,
              qty: agg.qty,
            }));
            const data = rows
              .sort((a, b) => b.revenue - a.revenue)
              .slice(0, 12);
            return { attribute, data };
          })
          .sort((a, b) => {
            const at = a.data.reduce((x, r) => x + r.revenue, 0);
            const bt = b.data.reduce((x, r) => x + r.revenue, 0);
            return bt - at;
          });
        return { category, attributes };
      })
      .sort((a, b) => {
        const at = a.attributes.reduce(
          (x, attr) => x + attr.data.reduce((y, r) => y + r.revenue, 0),
          0
        );
        const bt = b.attributes.reduce(
          (x, attr) => x + attr.data.reduce((y, r) => y + r.revenue, 0),
          0
        );
        return bt - at;
      });

    const categoryTotals = Array.from(byCategoryRevenue.entries())
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value);

    return {
      totals: {
        totalIncome,
        totalExpenses,
        netTotal,
        saleCount,
        avgTicket,
        totalDaysWithSales,
        generalExpensesTotal,
      },
      dailyStats,
      paymentPie,
      categoryTotals,
      categoryAttributeCards,
    };
  }, [rawDocs, geTotals]);
}
