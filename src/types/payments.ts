// src/types/payments.ts
import type { Timestamp } from "firebase/firestore";

export type PaymentMethod = "cash" | "transfer";

/** Estado del formulario (genérico) */
export interface PaymentFormState {
  categoryId: string;
  selections: Record<string, string>; // solo steps que afectan stock
  quantity: string; // input controlado
  totalAmount: string; // input controlado
  partialAmount: string; // input controlado
  paymentMethod: PaymentMethod;
  deductFromStock: boolean;
  isTotalPayment: boolean;
  orderDate: string; // yyyy-MM-dd
}

/** Input para registrar un pago (genérico) */
export interface RegisterPaymentInput {
  today: string; // yyyy-MM-dd
  categoryId: string;
  categoryName: string;
  selections: Record<string, string>;
  variantKey: string;
  quantity: number;
  totalAmount: number;
  paidAmountToday: number;
  paymentMethod: PaymentMethod;
  totalPayment: boolean;
  deductedFromStock: boolean;
  orderDate: string; // yyyy-MM-dd
  orderUID?: string; // <- si quieres forzar/seleccionar uno existente
}

/** Asiento mensual de ventas (genérico) */
export interface SalesMonthlyPaymentEntry {
  kind: "payment";
  day: string; // yyyy-MM-dd (fecha asiento)
  amountCOP: number; // lo que entra hoy
  paymentMethod: PaymentMethod;
  deductedFromStock: boolean;
  totalPayment: boolean;
  orderDate: string; // fecha del pedido
  categoryId: string;
  categoryName: string;
  variantKey: string;
  selections: Record<string, string>;
  quantity: number;
  finalization?: boolean;
  totalAmountCOP?: number; // útil cuando se finaliza
  createdAt?: Timestamp;
  orderUID?: string; // <- UID del pedido
}

/** Asiento mensual de pagos por mes del pedido (genérico) */
export interface PaymentsMonthlyEntry {
  kind: "payment";
  orderDay: string; // yyyy-MM-dd (pedido)
  paidDay: string; // yyyy-MM-dd (registro)
  amountCOP: number; // entra hoy
  totalAmountCOP: number; // total del pedido
  paymentMethod: PaymentMethod;
  categoryId: string;
  categoryName: string;
  variantKey: string;
  selections: Record<string, string>;
  quantity: number;
  totalPayment?: boolean;
  deductedFromStock?: boolean;
  createdAt?: Timestamp;
  paid?: boolean;
  orderUID?: string; // <- UID del pedido
}

/** Fila cruda leída del mes en payments_monthly/{month}/entries */
export interface PaymentsMonthlyRow {
  id: string;
  month: string; // YYYY-MM
  data: PaymentsMonthlyEntry;
}

/** Grupo por pedido (genérico) */
export interface PendingPaymentGroup {
  groupKey: string; // orderDay|categoryId|variantKey|quantity
  orderDay: string;
  categoryId: string;
  categoryName: string;
  variantKey: string;
  selections: Record<string, string>;
  quantity: number;
  totalAmountCOP: number;
  abonado: number;
  restante: number;
  paymentMethod: PaymentMethod;
  deductedFromStock: boolean;
  hasTotalPayment: boolean;
  anchorEntryId: string; // id del asiento “pivote”
  anchorEntryMonth: string; // YYYY-MM
  entriesCount?: number;
  entryPaidDays?: string[];
  orderUID?: string; // <- UID del pedido
}
