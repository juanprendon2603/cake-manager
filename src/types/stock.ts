import type { Timestamp } from "firebase/firestore";

export type StockType = "cake" | "sponge" | string;
export type PaymentMethod = "cash" | "transfer";

export interface StockDocBase {
  type: StockType;
  size: string;
  last_update?: Timestamp;
}

export interface CakeStockDoc extends StockDocBase {
  type: "cake";
  flavors: Record<string, number>;
}

export interface SpongeStockDoc extends StockDocBase {
  type: "sponge";
  quantity: number;
}

export type StockDoc = (CakeStockDoc | SpongeStockDoc) & { id: string };

export type ProductType = "cake" | "sponge";
export interface SaleEntry {
kind: "sale";
day: string; 
createdAt: Timestamp | ReturnType<typeof import("firebase/firestore").serverTimestamp>;
type: ProductType;
size: string;
flavor: string | null;
quantity: number;
amountCOP: number;
paymentMethod: PaymentMethod;
}


export type PendingSale = {
productType: ProductType;
size: string;
flavor: string;
quantityNumber: number;
amountCOP: number;
dayKey: string;
monthKey: string;
paymentMethod: PaymentMethod;
};

export interface GeneralExpenseItem {
  description: string;
  value: number;                // mantiene el nombre 'value' para compatibilidad
  paymentMethod: PaymentMethod; // usa tu tipo compartido
  date: string;                 // yyyy-MM-dd
}
