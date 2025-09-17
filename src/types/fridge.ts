// src/types/fridge.ts
export type Shift = "morning" | "afternoon";

export interface TemperatureRecord {
  morning?: number;
  afternoon?: number;
}

export interface MonthlyRecord extends TemperatureRecord {
  date: string; // yyyy-MM-dd
}

export interface Fridge {
  id: string;
  name: string;
  brand: string;
}
