// src/hooks/useInformeData.ts
import { useMemo } from "react";
import { format, parseISO } from "date-fns";

// 🔴 Usa SIEMPRE los tipos/helpers del mismo módulo:
import type { DayDoc, Sale, Expense, PaymentMethod } from "../types/informs";
import { isValidSaleItem, getAmount, getQty } from "../types/informs";

// 🔧 Importa los tipos reales del hook (ajusta path si difiere)
import type {
  DailyRaw as HookDailyRaw,
  SaleLike as HookSaleLike,
  ExpenseLike as HookExpenseLike,
} from "./useRangeSummary";

export function useInformeData(
  rawDocs: HookDailyRaw[],
  geTotals: { generalExpensesTotal: number }
) {
  return useMemo(() => {
    const mapSale = (s: HookSaleLike): Sale => ({
      id: s.id,
      paymentMethod: (s.paymentMethod as PaymentMethod) ?? "cash",
      valor: s.valor,
      cantidad: s.cantidad ?? undefined,
      flavor: s.flavor ?? "Sin sabor",
      size: s.size ?? "N/A",
      type: s.type ?? "N/A",
      isPayment: s.isPayment,
    });

    const mapExpense = (e: HookExpenseLike): Expense => ({
      value: e.value,
      paymentMethod: (e.paymentMethod as PaymentMethod) ?? "cash",
      description: e.description ?? "-",
    });

    const docs: DayDoc[] = (rawDocs as HookDailyRaw[]).map(d => ({
      date: d.fecha,
      sales: d.sales.map(mapSale),
      expenses: d.expenses.map(mapExpense),
    }));

    const allSales: Sale[] = docs.flatMap(d => d.sales).filter(isValidSaleItem);
    const allExpenses: Expense[] = docs.flatMap(d => d.expenses);

    let totalCash = 0, totalTransfer = 0, totalExpensesCash = 0, totalExpensesTransfer = 0;
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

    const totalDaysWithSales = Array.from(byDayRevenue.values()).filter(r => r > 0).length;

    const dailyStats = Array.from(byDayRevenue.entries())
      .map(([date, revenue]) => {
        const dayExpenses = docs
          .find(d => d.date === date)
          ?.expenses.reduce((acc, e) => acc + (e.value || 0), 0) ?? 0;
        return {
          date,
          revenue,
          expenses: dayExpenses,
          profit: revenue - dayExpenses,
          formattedDate: format(parseISO(date), "dd/MM"),
        };
      })
      .sort((a,b) => (a.date < b.date ? -1 : 1));

    const flavorTotals = Array.from(byFlavorQty.entries())
      .map(([name, qty]) => ({ name, qty, revenue: byFlavorRevenue.get(name) ?? 0 }))
      .sort((a,b) => b.qty - a.qty)
      .slice(0, 8);

    return {
      totals: {
        totalIncome, totalExpenses, netTotal, saleCount, avgTicket,
        totalDaysWithSales, generalExpensesTotal,
      },
      bySizeRevenue,
      topFlavorsQty: flavorTotals,
      dailyStats,
      paymentPie: [
        { name: "Efectivo", value: totalCash },
        { name: "Transferencia", value: totalTransfer },
      ],
    };
  }, [rawDocs, geTotals]);
}
