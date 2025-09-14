import { parseISO, format } from "date-fns";
import type { DayDoc, Expense, RangeSummaryDocRaw, Sale } from "./types";


export function money(n: number): string {
return `$${Math.round(n).toLocaleString()}`;
}


export function getQty(s: Sale): number {
return s.cantidad ?? s.quantity ?? 1;
}


export function getAmount(s: Sale): number {
return s.valor ?? s.partialAmount ?? s.amount ?? 0;
}


export function isValidSaleItem(s: Sale): boolean {
return getAmount(s) > 0;
}


export function sumExpensesByMethod(expenses: Expense[]): { cash: number; transfer: number } {
let cash = 0;
let transfer = 0;
for (const e of expenses) {
if (e.paymentMethod === "cash") cash += e.value || 0;
if (e.paymentMethod === "transfer") transfer += e.value || 0;
}
return { cash, transfer };
}


function isSaleArray(u: unknown): u is Sale[] {
return Array.isArray(u);
}
function isExpenseArray(u: unknown): u is Expense[] {
return Array.isArray(u);
}


export function parseRangeDocs(raw: RangeSummaryDocRaw[]): DayDoc[] {
return raw.map((d) => ({
date: d.fecha,
sales: isSaleArray(d.sales) ? d.sales : [],
expenses: isExpenseArray(d.expenses) ? d.expenses : [],
}));
}


export function toDailyStats(docs: DayDoc[]) {
const byDayRevenue = new Map<string, number>();
for (const d of docs) {
const rev = d.sales.filter(isValidSaleItem).reduce((acc, s) => acc + getAmount(s), 0);
byDayRevenue.set(d.date, (byDayRevenue.get(d.date) || 0) + rev);
}
return Array.from(byDayRevenue.entries())
.map(([date, revenue]) => {
const dayExpenses = docs.find((x) => x.date === date)?.expenses.reduce((a, e) => a + (e.value || 0), 0) ?? 0;
return { date, revenue, expenses: dayExpenses, profit: revenue - dayExpenses, formattedDate: format(parseISO(date), "dd/MM") };
})
.sort((a, b) => (a.date < b.date ? -1 : 1));
}