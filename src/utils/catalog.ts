// src/utils/catalog.ts

// ✅ Asegúrate de exportar este union con el nuevo modo
export type PricingMode = "base_plus_deltas" | "fixed_per_combo";

// Ya debes tener esto, lo muestro completo para contexto
export type AttributeType = "select" | "text" | "number";

export interface CategoryOption {
  key: string; // slug auto desde label
  label: string; // visible
  active?: boolean; // default true
  // priceDelta ya NO lo usamos con fixed_per_combo, pero puedes dejarlo opcional
  priceDelta?: number | null;
}

export interface CategoryStep {
  id: string;
  key: string; // slug auto desde label
  label: string;
  type: AttributeType; // en nuestra UI siempre "select"
  required?: boolean; // siempre true en la UI
  affectsStock?: boolean; // siempre true en la UI
  multi?: boolean; // no lo usamos (siempre false)
  options?: CategoryOption[];
}

export interface ProductCategory {
  id: string;
  name: string;
  active?: boolean;

  // ✅ ahora acepta "fixed_per_combo"
  pricingMode: PricingMode;

  // Con "fixed_per_combo" no usamos basePrice; lo dejas opcional
  basePrice?: number;

  steps: CategoryStep[];

  // ✅ precios por combinación (key “stepKey=optKey|step2=opt2”)
  variantPrices?: Record<string, number>;

  createdAt?: number;
  updatedAt?: number;
}
