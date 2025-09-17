// Tipos compartidos para pagos

import type { Timestamp } from "firebase/firestore";

export type ProductType = "cake" | "sponge";
export type PaymentMethod = "cash" | "transfer";

export interface PaymentFormState {
  productType: ProductType;
  selectedSize: string;
  selectedFlavor: string;      // para cake
  selectedSpongeType: string;  // para sponge
  quantity: string;            // input controlado
  totalAmount: string;         // input controlado
  partialAmount: string;       // input controlado (abono)
  paymentMethod: PaymentMethod;
  deductFromStock: boolean;
  isTotalPayment: boolean;
  orderDate: string;           // yyyy-MM-dd
}

export interface LegacyPaymentItem {
  id: string; // Date.now().toString()
  type: ProductType;
  size: string;
  flavor: string;          // flavor o tipo de bizcocho
  quantity: number;
  amount: number;          // total del pedido
  partialAmount: number;   // lo pagado hoy
  paymentMethod: PaymentMethod;
  isPayment: true;
  deductedFromStock: boolean;
  totalPayment: boolean;
  orderDate: string;       // yyyy-MM-dd
}

export interface SalesMonthlyPaymentEntry {
  kind: "payment";
  day: string;                 // día en que se registra el pago (yyyy-MM-dd)
  type: ProductType;
  size: string;
  flavor: string | null;   // ✅ permite null
  quantity: number;
  amountCOP: number;           // lo que entra hoy
  paymentMethod: PaymentMethod;
  deductedFromStock: boolean;
  totalPayment: boolean;
  orderDate: string;           // fecha del pedido
  finalization?: boolean;      // asiento de finalización (opcional)
  totalAmountCOP?: number;     // útil en finalización
  createdAt?: Timestamp;
}

export interface PaymentsMonthlyEntry {
  kind: "payment";
  orderDay: string;            // fecha del pedido
  paidDay: string;             // fecha en la que se registra este asiento
  amountCOP: number;           // lo que entra hoy
  totalAmountCOP: number;      // total del pedido
  paymentMethod: PaymentMethod;
  type: ProductType;
  size: string;
  flavor: string | null;   // ✅ alinear con el resto
  quantity: number;
  totalPayment?: boolean;      // true si ya quedó finalizado
  deductedFromStock?: boolean; // true si ya se descontó inventario
  createdAt?: Timestamp;
  paid?: boolean;              // flag auxiliar
}

/** Fila cruda leída del mes en payments_monthly/{month}/entries */
export interface PaymentsMonthlyRow {
  id: string;
  month: string; // YYYY-MM
  data: PaymentsMonthlyEntry;
}

/** Grupo calculado por pedido (orderDay + type + size + flavor + qty) */
export interface PendingPaymentGroup {
  groupKey: string; // orderDay|type|size|flavor|quantity
  orderDay: string;
  type: ProductType;
  size: string;
  flavor: string | null;
  quantity: number;
  totalAmountCOP: number;
  abonado: number;
  restante: number;
  paymentMethod: PaymentMethod;
  deductedFromStock: boolean;
  hasTotalPayment: boolean;
  anchorEntryId: string;     // id de entries (pivote a actualizar)
  anchorEntryMonth: string;  // YYYY-MM
}

export interface RegisterPaymentInput {
  today: string;               // yyyy-MM-dd (día de registro del pago)
  productType: ProductType;
  size: string;
  flavorOrSponge: string;      // flavor (cake) o tipo de bizcocho (sponge)
  quantity: number;
  totalAmount: number;
  paidAmountToday: number;     // abono o total si es pago total
  paymentMethod: PaymentMethod;
  totalPayment: boolean;
  deductedFromStock: boolean;
  orderDate: string;           // yyyy-MM-dd
}
