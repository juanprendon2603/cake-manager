export type PaymentMethod = "cash" | "transfer";

export interface Sale {
  valor?: number;
  amount?: number;
  partialAmount?: number;
  paymentMethod: string;
  cantidad?: number;
  quantity?: number;
  flavor: string;
  id: string;
  size: string;
  type: string;
  isPayment?: boolean;
}

export interface Expense {
  value: number;
  paymentMethod: string;
  description: string;
}

export interface DayDoc {
  date: string;
  sales: Sale[];
  expenses: Expense[];
}

export interface RangeSummaryDocRaw {
  fecha: string;
  sales?: unknown;
  expenses?: unknown;
}

export interface RangeSummaryTotals {
  totalSalesCash: number;
  totalSalesTransfer: number;
  totalExpensesCash: number;
  totalExpensesTransfer: number;
}

export interface UseRangeSummaryResult {
  loading: boolean;
  rawDocs: RangeSummaryDocRaw[];
  totals: RangeSummaryTotals;
}

export const COLORS = {
  primary: ["#8E2DA8", "#A855F7", "#C084FC", "#DDD6FE", "#EDE9FE"],
  success: ["#059669", "#10B981", "#34D399", "#6EE7B7", "#A7F3D0"],
  info: ["#0284C7", "#0EA5E9", "#38BDF8", "#7DD3FC", "#BAE6FD"],
} as const;

export const PIE_COLORS = [
  "#8E2DA8",
  "#A855F7",
  "#C084FC",
  "#DDD6FE",
  "#EDE9FE",
  "#F3E8FF",
] as const;
