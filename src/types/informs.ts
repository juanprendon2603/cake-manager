import type { ComponentPropsWithoutRef } from "react";

export type TdProps = ComponentPropsWithoutRef<"td">;
export type ThProps = ComponentPropsWithoutRef<"th">;

export type PaymentMethod = "cash" | "transfer";

export interface Sale {
  valor?: number;
  amount?: number;
  partialAmount?: number;
  paymentMethod: PaymentMethod;
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
  paymentMethod: PaymentMethod;
  description: string;
}

export interface DayDoc { date: string; sales: Sale[]; expenses: Expense[]; }

export const COLORS = {
  primary: ['#8E2DA8','#A855F7','#C084FC','#DDD6FE','#EDE9FE'],
  success: ['#059669','#10B981','#34D399','#6EE7B7','#A7F3D0'],
  info: ['#0284C7','#0EA5E9','#38BDF8','#7DD3FC','#BAE6FD'],
} as const;

export const PIE_COLORS = ['#8E2DA8','#A855F7','#C084FC','#DDD6FE','#EDE9FE','#F3E8FF'] as const;

export type KpiAccent = "positive" | "negative" | "neutral" | "primary" | "warning" | "info";
export type Trend = "up" | "down" | "stable";
export type GradientKey = "purple" | "blue" | "green" | "orange" | "pink";

// utils
export function money(n: number){ return `$${Math.round(n).toLocaleString()}`; }
export function getQty(s: Sale){ return s.cantidad ?? s.quantity ?? 1; }
export function getAmount(s: Sale){ return s.valor ?? s.partialAmount ?? s.amount ?? 0; }
export function isValidSaleItem(s: Sale){ return (s.valor ?? s.partialAmount ?? s.amount ?? 0) > 0; }
