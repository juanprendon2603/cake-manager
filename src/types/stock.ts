import type { Timestamp } from "firebase/firestore";

export type StockType = "cake" | "sponge" | string;

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