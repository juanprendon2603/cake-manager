import { format, parseISO, isValid } from "date-fns";
import { useMemo } from "react";
import type { DailyRaw } from "./useRangeSummary";

/* ---------------------- Helpers de tipo/seguridad ---------------------- */

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function safeNumber(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function safeString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

/** Lee el monto desde distintas variantes de objeto venta/gasto */
function getAmountFromAny(s: unknown): number {
  if (!isRecord(s)) return 0;

  // Variantes comunes de campo de monto
  const byField = safeNumber(s.amountCOP ?? s.amount ?? s.valor);
  if (byField > 0) return byField;

  // Alternativa por (quantity * unitPrice)
  const q = safeNumber(s.quantity);
  const up = safeNumber(s.unitPriceCOP ?? s.unitPrice);
  if (q > 0 && up > 0) return q * up;

  return 0;
}

/** Lee cantidad con fallback a 1 */
function getQtyFromAny(s: unknown): number {
  if (!isRecord(s)) return 1;
  const q = safeNumber(s.quantity);
  return q > 0 ? q : 1;
}

/** paymentMethod “cash” | “transfer” (u otro), con default "cash" */
function getPaymentMethodFromAny(s: unknown): string {
  if (!isRecord(s)) return "cash";
  return safeString(s.paymentMethod, "cash");
}

/** Categoria por nombre o id, con “—” como fallback */
function getCategoryFromAny(s: unknown): string {
  if (!isRecord(s)) return "—";
  return (
    safeString(s.categoryName).trim() ||
    safeString(s.categoryId).trim() ||
    "—"
  );
}

/** Selecciones como Record<string, unknown> (o vacío) */
function getSelectionsFromAny(s: unknown): Record<string, unknown> {
  if (!isRecord(s)) return {};
  const sel = (s as Record<string, unknown>).selections;
  return isRecord(sel) ? (sel as Record<string, unknown>) : {};
}

/** Valor de gasto (value|amount) */
function getExpenseValue(e: unknown): number {
  if (!isRecord(e)) return 0;
  return safeNumber(e.value ?? e.amount ?? 0);
}

/* --------------------------- Tipos de salida --------------------------- */

export type CategoryAttributeCards = Array<{
  category: string;
  attributes: Array<{
    attribute: string;
    data: Array<{ option: string; revenue: number; qty: number }>;
  }>;
}>;

/* ------------------------------- Hook --------------------------------- */

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

    // --- Agregación de ventas ---
    for (const s of allSales) {
      const amount = getAmountFromAny(s);
      if (amount <= 0) continue;

      const qty = getQtyFromAny(s);
      const pm = getPaymentMethodFromAny(s);
      const category = getCategoryFromAny(s);
      const selections = getSelectionsFromAny(s);

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
        const attr = safeString(attrRaw).trim();
        const opt =
          (typeof optRaw === "string" ? optRaw : String(optRaw ?? "—")).trim();
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

    // --- Ingresos/Gastos por día ---
    const byDayRevenue = new Map<string, number>();
    const byDayExpenses = new Map<string, number>();

    for (const d of rawDocs || []) {
      const dayRevenue = (d.sales || []).reduce(
        (acc, s) => acc + getAmountFromAny(s),
        0
      );
      const dayExpenses = (d.expenses || []).reduce(
        (acc, e) => acc + getExpenseValue(e),
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
        const parsed = parseISO(date);
        const formattedDate =
          typeof date === "string" && isValid(parsed)
            ? format(parsed, "dd/MM")
            : date;
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

    // --- Gastos por método de pago ---
    let totalExpensesCash = 0;
    let totalExpensesTransfer = 0;
    for (const e of allExpenses) {
      const val = getExpenseValue(e);
      const pm = getPaymentMethodFromAny(e);
      if (pm === "cash") totalExpensesCash += val;
      else totalExpensesTransfer += val;
    }

    // --- Totales ---
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

    // --- Cartas por categoría/atributo ---
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
