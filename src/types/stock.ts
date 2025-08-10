import type { Timestamp } from "firebase/firestore";

export type StockType = "cake" | "sponge" | string;

// Documento general de la colección "stock"
export interface StockDocBase {
  type: StockType;
  size: string;
  last_update?: Timestamp;
}

// Para tortas: flavors como mapa (sabor -> cantidad)
export interface CakeStockDoc extends StockDocBase {
  type: "cake";
  flavors: Record<string, number>;
}

// Para bizcochos: quantity total
export interface SpongeStockDoc extends StockDocBase {
  type: "sponge";
  quantity: number;
}

// Unión de ambos
export type StockDoc = (CakeStockDoc | SpongeStockDoc) & { id: string };