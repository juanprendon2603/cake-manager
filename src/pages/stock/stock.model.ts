// Centraliza constantes, tipos y helpers reutilizables

export const cakeSizes = [
  "Octavo",
  "Cuarto redondo",
  "Cuarto cuadrado",
  "Por dieciocho",
  "Media",
  "Libra",
  "Libra y media",
  "Dos libras",
] as const;
export type SizeKey = (typeof cakeSizes)[number];

export const flavors = [
  "Naranja",
  "Vainilla Chips",
  "Vainilla Chocolate",
  "Negra",
] as const;
export type FlavorKey = (typeof flavors)[number];

export const spongeSizes = ["Media", "Libra"] as const;

export const sizeIcons: Record<SizeKey, string> = {
  Octavo: "🧁",
  "Cuarto redondo": "🎂",
  "Cuarto cuadrado": "🍰",
  "Por dieciocho": "🎂",
  Media: "🍰",
  Libra: "🎂",
  "Libra y media": "🎂",
  "Dos libras": "🎂",
};

export const flavorIcons: Record<FlavorKey, string> = {
  Naranja: "🍊",
  "Vainilla Chips": "🍦",
  "Vainilla Chocolate": "🍫",
  Negra: "🖤",
};

export type CakeEntry = { flavor: string; quantity: string };
export type CakesBySize = Record<string, CakeEntry[]>;
export type SpongesBySize = Record<string, string>;

export interface FormValues {
  cakes: CakesBySize;
  sponges: SpongesBySize;
}

export function normalizeKey(label: string) {
  return label.toLowerCase().replace(/ /g, "_");
}

// …(todo lo que ya tienes aquí)…

export type CakeStock = {
  id: string;
  type: "cake";
  size: string;
  flavors: Record<string, number>;
  last_update?: any;
};

export type SpongeStock = {
  id: string;
  type: "sponge";
  size: string;
  quantity: number;
  last_update?: any;
};

export type LocalStockDoc = CakeStock | SpongeStock;

export function isCakeStock(item: LocalStockDoc): item is CakeStock {
  return item.type === "cake";
}
export function isSpongeStock(item: LocalStockDoc): item is SpongeStock {
  return item.type === "sponge";
}

// Si quieres mapear emojis por id, puedes derivarlos del size si te conviene.
// Aquí mantengo un map simple compatible con tus IDs actuales:
export const sizeEmoji: Record<string, string> = {
  octavo: "🧁",
  cuarto_redondo: "🎂",
  cuarto_cuadrado: "🍰",
  por_dieciocho: "🎉",
  media: "🍰",
  libra: "🎂",
  libra_y_media: "🎂",
  dos_libras: "🎂",
};
