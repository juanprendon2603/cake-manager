// src/types/payroll.ts

// ✅ ahora también soporta "hours" para marcación por horas
export type ShiftKind = "completo" | "medio" | "hours";
export type Fortnight = 1 | 2;

export type PaymentMode =
  | "per_day"
  | "fixed_fortnight"
  | "fixed_monthly"
  | "per_hour";

// Registro de asistencia por día:
// - "completo" / "medio" (modo por día)
// - "hours" con total de horas y (opcional) rango desde–hasta (modo por hora)
export type HoursAttendance = {
  kind: "hours";
  hours: number; // total de horas del día (puede ser decimal)
  from?: string; // "HH:mm" (opcional)
  to?: string; // "HH:mm" (opcional)
};

export type AttendanceDay =
  | { kind: "completo" }
  | { kind: "medio" }
  | HoursAttendance;

export type AttendanceByMonth = {
  // "YYYY-MM": { "YYYY-MM-DD": AttendanceDay }
  [month: string]: { [date: string]: AttendanceDay };
};

export type Person = {
  id: string; // slug único (e.g., "juan_rendon")
  firstName: string;
  lastName: string;

  paymentMode: PaymentMode;

  // por día
  valuePerDay?: number;

  // fijo
  fixedFortnightPay?: number;
  fixedMonthlyPay?: number;

  // por hora
  valuePerHour?: number;

  // otros
  active?: boolean;
  startDate?: string; // YYYY-MM-DD
  attendance?: AttendanceByMonth;
  disabled?: boolean;
};
