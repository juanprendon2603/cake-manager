// src/types/fridge.ts
export type Shift = "morning" | "afternoon";

export type TemperatureRecord = {
  morning?: number;
  afternoon?: number;
};

export type MonthlyRecord = {
  date: string; // YYYY-MM-DD
  morning?: number;
  afternoon?: number;
};

export type Fridge = {
  id: string; // slug único (p.ej. "nevera-pasteles")
  name: string; // nombre visible en la app
  brand?: string; // marca
  model?: string; // modelo
  serialNumber?: string; // serial
  purchaseDate?: string; // YYYY-MM-DD
  location?: string; // ubicación (p.ej. "Cocina", "Bodega")
  minTemp?: number; // umbral opcional
  maxTemp?: number; // umbral opcional
  active?: boolean; // activo/desactivado
};
