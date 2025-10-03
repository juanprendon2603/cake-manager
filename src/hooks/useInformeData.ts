// src/hooks/useInformeData.ts
import { useMemo } from "react";
import { format, parseISO } from "date-fns";

// ✅ Usa SIEMPRE los tipos/helpers del mismo módulo:
import type { DayDoc, Sale, Expense, PaymentMethod } from "../types/informs";
import { isValidSaleItem, getAmount, getQty } from "../types/informs";

// ✅ Importa los tipos reales del hook (ajusta path si difiere)
import type {
  DailyRaw as HookDailyRaw,
  SaleLike as HookSaleLike,
  ExpenseLike as HookExpenseLike,
} from "./useRangeSummary";

function safeNumber(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Monto desde cualquier shape (compat con genérico y legado) */
function getAmountFromAny(s: any): number {
  const byField = safeNumber(s?.amountCOP ?? s?.amount ?? s?.valor);
  if (byField > 0) return byField;

  const q = safeNumber(s?.quantity ?? s?.cantidad);
  const up = safeNumber(s?.unitPriceCOP ?? s?.unitPrice ?? s?.precioUnitario);
  if (q > 0 && up > 0) return q * up;

  // último recurso: mismo helper del dominio si ‘s’ ya es Sale mapeado
  try {
    return getAmount(s as Sale);
  } catch {
    return 0;
  }
}

/** Qty desde cualquier shape (compat) */
function getQtyFromAny(s: any): number {
  const q = safeNumber(s?.quantity ?? s?.cantidad);
  if (q > 0) return q;
  try {
    return getQty(s as Sale);
  } catch {
    return 1;
  }
}

/** Construye “selections” a partir de genérico o legado (flavor/size/type) */
function deriveSelections(s: any): Record<string, string> {
  const fromGeneric =
    (s?.selections && typeof s.selections === "object" ? s.selections : null) ||
    null;

  const out: Record<string, string> = {};
  if (fromGeneric) {
    for (const [k, v] of Object.entries(fromGeneric as Record<string, unknown>)) {
      const sv = String(v ?? "");
      if (sv) out[k] = sv;
    }
  }

  // Compat con datos viejos (si no vinieron en selections)
  const flavor = String(s?.flavor ?? "").trim();
  const size = String(s?.size ?? "").trim();
  const type = String(s?.type ?? "").trim();
  if (flavor && !out.flavor) out.flavor = flavor;
  if (size && !out.size) out.size = size;
  if (type && !out.type) out.type = type;

  return out;
}

export function useInformeData(
  rawDocs: HookDailyRaw[],
  geTotals: { generalExpensesTotal: number }
) {
  return useMemo(() => {
    // === 1) Normalización de documentos diarios ===
    const mapSale = (s: HookSaleLike): Sale => ({
      id: s.id,
      paymentMethod: (s.paymentMethod as PaymentMethod) ?? "cash",
      valor: s.valor, // compat legacy
      cantidad: s.cantidad ?? undefined,
      flavor: s.flavor ?? "Sin sabor",
      size: s.size ?? "N/A",
      type: s.type ?? "N/A",
      isPayment: s.isPayment,
      // Nota: las vistas por atributo se calculan directo desde raw (selections)
    });

    const mapExpense = (e: HookExpenseLike): Expense => ({
      value: e.value,
      paymentMethod: (e.paymentMethod as PaymentMethod) ?? "cash",
      description: e.description ?? "-",
    });

    const docs: DayDoc[] = (rawDocs as HookDailyRaw[]).map((d) => ({
      date: d.fecha,
      sales: d.sales.map(mapSale),
      expenses: d.expenses.map(mapExpense),
    }));

    // === 2) Agregaciones base para KPIs y gráficas existentes ===
    const allSales: Sale[] = docs.flatMap((d) => d.sales).filter(isValidSaleItem);
    const allExpenses: Expense[] = docs.flatMap((d) => d.expenses);

    let totalCash = 0,
      totalTransfer = 0,
      totalExpensesCash = 0,
      totalExpensesTransfer = 0;

    const byFlavorQty = new Map<string, number>();
    const byFlavorRevenue = new Map<string, number>();
    const bySizeRevenue = new Map<string, number>();
    const byDayRevenue = new Map<string, number>();
    let saleCount = 0;

    for (const s of allSales) {
      const amount = getAmount(s);
      const qty = getQty(s);

      if (s.paymentMethod === "cash") totalCash += amount;
      if (s.paymentMethod === "transfer") totalTransfer += amount;

      const flavorKey = s.flavor || "Sin sabor";
      const sizeKey = s.size || "N/A";

      byFlavorQty.set(flavorKey, (byFlavorQty.get(flavorKey) ?? 0) + qty);
      byFlavorRevenue.set(flavorKey, (byFlavorRevenue.get(flavorKey) ?? 0) + amount);
      bySizeRevenue.set(sizeKey, (bySizeRevenue.get(sizeKey) ?? 0) + amount);
      saleCount += 1;
    }

    for (const d of docs) {
      const dayRevenue = d.sales
        .filter(isValidSaleItem)
        .reduce((acc, s) => acc + getAmount(s), 0);
      byDayRevenue.set(d.date, (byDayRevenue.get(d.date) ?? 0) + dayRevenue);
    }

    for (const e of allExpenses) {
      if (e.paymentMethod === "cash") totalExpensesCash += e.value || 0;
      if (e.paymentMethod === "transfer") totalExpensesTransfer += e.value || 0;
    }

    const generalExpensesTotal = geTotals.generalExpensesTotal;
    const totalIncome = totalCash + totalTransfer;
    const dailyExpenses = totalExpensesCash + totalExpensesTransfer;
    const totalExpenses = dailyExpenses + generalExpensesTotal;
    const netTotal = totalIncome - totalExpenses;
    const avgTicket = saleCount > 0 ? totalIncome / saleCount : 0;

    const totalDaysWithSales = Array.from(byDayRevenue.values()).filter((r) => r > 0).length;

    const dailyStats = Array.from(byDayRevenue.entries())
      .map(([date, revenue]) => {
        const dayExpenses =
          docs
            .find((d) => d.date === date)
            ?.expenses.reduce((acc, e) => acc + (e.value || 0), 0) ?? 0;
        // Evita crash si hay fecha inválida
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

    const flavorTotals = Array.from(byFlavorQty.entries())
      .map(([name, qty]) => ({ name, qty, revenue: byFlavorRevenue.get(name) ?? 0 }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 8);

    // === 3) 🔥 Nuevo: ingresos por ATRIBUTO (apilado por categoría) ===
    // Recorremos los rawDocs para conservar selections y categoryName reales
    type OptRec = { total: number; byCategory: Map<string, number> };
    type AttrRec = { options: Map<string, OptRec> };
    const attrMap = new Map<string, AttrRec>();

    for (const day of rawDocs || []) {
      for (const s of day.sales || []) {
        const amount = getAmountFromAny(s);
        if (!amount) continue;

        const selections = deriveSelections(s);
        const catName = String(s?.categoryName ?? s?.categoryId ?? "—");

        for (const [attrKeyRaw, optKeyRaw] of Object.entries(selections)) {
          const attrKey = String(attrKeyRaw || "").trim();
          if (!attrKey) continue;
          const optKey = String(optKeyRaw || "—").trim();

          let attr = attrMap.get(attrKey);
          if (!attr) {
            attr = { options: new Map<string, OptRec>() };
            attrMap.set(attrKey, attr);
          }
          let opt = attr.options.get(optKey);
          if (!opt) {
            opt = { total: 0, byCategory: new Map<string, number>() };
            attr.options.set(optKey, opt);
          }
          opt.total += amount;
          opt.byCategory.set(catName, (opt.byCategory.get(catName) || 0) + amount);
        }
      }
    }

    const revenueByAttributeStacks = Array.from(attrMap.entries()).map(
      ([attribute, rec]) => {
        const categoriesSet = new Set<string>();
        rec.options.forEach((o) => {
          o.byCategory.forEach((_v, cat) => categoriesSet.add(cat));
        });
        const categories = Array.from(categoriesSet.values()).sort();

        const data = Array.from(rec.options.entries())
          .map(([option, oRec]) => {
            const row: Record<string, number | string> = {
              option,
              total: oRec.total,
            };
            for (const cat of categories) {
              row[cat] = oRec.byCategory.get(cat) || 0;
            }
            return row;
          })
          .sort((a, b) => safeNumber(b.total) - safeNumber(a.total))
          .slice(0, 12);

        return { attribute, categories, data };
      }
    );

    // === 4) Retorno ===
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
      // (legacy) lo dejamos por compat si lo sigues usando en algún lado
      bySizeRevenue,
      topFlavorsQty: flavorTotals,
      dailyStats,
      paymentPie: [
        { name: "Efectivo", value: totalCash },
        { name: "Transferencia", value: totalTransfer },
      ],
      // 🔥 nuevo para los gráficos genéricos por atributo
      revenueByAttributeStacks,
    };
  }, [rawDocs, geTotals]);
}
