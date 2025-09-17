// src/types/payroll.ts
export type ShiftKind = "completo" | "medio";
export type Fortnight = 1 | 2;

export interface AttendanceRecord {
  [date: string]: ShiftKind;
}

export interface AttendanceByMonth {
  [month: string]: AttendanceRecord;
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  valuePerDay: number;
  attendance: AttendanceByMonth;
  fixedFortnightPay?: number;
}
