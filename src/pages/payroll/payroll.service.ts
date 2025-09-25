// src/pages/payroll/payroll.service.ts
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import type {
  AttendanceByMonth,
  Fortnight,
  Person,
  ShiftKind,
} from "../../types/payroll";

/* -------------------------------------------------------------------------- */
/*                                  CACHE                                     */
/* -------------------------------------------------------------------------- */
const PAYROLL_CACHE_TTL = 60_000; // 60s (ajústalo si quieres)
let payrollCache: Person[] | null = null;
let payrollCacheTime = 0;
let payrollInflight: Promise<Person[]> | null = null;

export function invalidatePayrollCache() {
  payrollCache = null;
  payrollCacheTime = 0;
  payrollInflight = null;
}

/* -------------------------------------------------------------------------- */
/*                              CARGA DE PERSONAS                             */
/* -------------------------------------------------------------------------- */
export async function loadPeopleFromDb(opts?: {
  force?: boolean;
}): Promise<Person[]> {
  const now = Date.now();

  if (
    !opts?.force &&
    payrollCache &&
    now - payrollCacheTime < PAYROLL_CACHE_TTL
  ) {
    return payrollCache;
  }
  if (payrollInflight) {
    return payrollInflight; // dedupe concurrente
  }

  payrollInflight = (async () => {
    const qs = await getDocs(collection(db, "payroll"));
    const items: Person[] = [];
    qs.forEach((d) => {
      items.push({ id: d.id, ...(d.data() as Omit<Person, "id">) });
    });
    payrollCache = items;
    payrollCacheTime = Date.now();
    payrollInflight = null;
    return items;
  })();

  return payrollInflight;
}

export async function loadPeopleWithNancy(opts?: {
  force?: boolean;
}): Promise<Person[]> {
  // Alias simple: ya no se inyecta Nancy local
  return loadPeopleFromDb(opts);
}

export async function loadPeopleWithoutNancy(opts?: {
  force?: boolean;
}): Promise<Person[]> {
  // Mantén este helper si tu UI lo invoca; ya no filtra a Nancy
  const people = await loadPeopleFromDb(opts);
  return people;
}

/* -------------------------- Realtime (opcional) --------------------------- */
export function watchPeopleWithNancy(
  cb: (items: Person[]) => void
): Unsubscribe {
  // UI en tiempo real sin inyección de Nancy local
  const unsub = onSnapshot(collection(db, "payroll"), (qs) => {
    const items: Person[] = [];
    qs.forEach((d) =>
      items.push({ id: d.id, ...(d.data() as Omit<Person, "id">) })
    );
    payrollCache = items;
    payrollCacheTime = Date.now();
    cb(items);
  });
  return unsub;
}

/* -------------------------------------------------------------------------- */
/*                                ASISTENCIAS                                 */
/* -------------------------------------------------------------------------- */
/**
 * Marca asistencia para un día. Optimizado:
 * - Actualiza con dot-path: attendance.<month>.<date> = (AttendanceDay)
 * - No manda el objeto attendance completo (menos payload / menos riesgo de pisar datos)
 * - No hace lecturas; Firestore crea mapas intermedios si no existen
 * - Devuelve el objeto AttendanceByMonth actualizado para tu estado local
 *
 * Soporta:
 * - shift = "completo" | "medio"
 * - shift = "hours" con {hours, from?, to?}
 */
export async function markAttendanceForPerson(args: {
  person: Person;
  month: string; // YYYY-MM
  date: string; // YYYY-MM-DD
  shift: ShiftKind; // "completo" | "medio" | "hours"
  hours?: number; // requerido si shift === "hours" (si no calculas por UI)
  from?: string; // HH:mm (opcional)
  to?: string; // HH:mm (opcional)
}): Promise<AttendanceByMonth> {
  const { person, month, date, shift, hours, from, to } = args;

  // 0) Bloquea marcación para pagos fijos (no escribe nada)
  if (
    person.paymentMode === "fixed_fortnight" ||
    person.paymentMode === "fixed_monthly"
  ) {
    // simplemente devuelve la asistencia actual sin cambios
    return person.attendance ?? {};
  }

  // 1) Decide el valor a guardar según el modo del trabajador
  //    - per_day  -> string ("completo" | "medio")
  //    - per_hour -> objeto { kind:"hours", ... }
  let value: any;

  if (person.paymentMode === "per_day") {
    // Mantener formato antiguo (string plano)
    // Asegura que solo se guarden "completo" | "medio"
    value = shift === "completo" ? "completo" : "medio";
  } else if (person.paymentMode === "per_hour") {
    // Solo tiene sentido "hours" en este modo
    const h =
      shift === "hours" && typeof hours === "number" ? Math.max(0, hours) : 0;
    if (h <= 0) {
      // si llega sin horas válidas, no escribir
      return person.attendance ?? {};
    }
    value = { kind: "hours", hours: h, from, to };
  } else {
    // fallback por si aparecen modos nuevos
    return person.attendance ?? {};
  }

  // 2) Actualiza local (retorno) sin mutar el original
  const updated: AttendanceByMonth = {
    ...(person.attendance || {}),
    [month]: {
      ...(person.attendance?.[month] || {}),
      [date]: value,
    },
  };

  // 3) Escribe (si no es "local-*")
  if (!person.id.startsWith("local-")) {
    const ref = doc(db, "payroll", person.id);
    await updateDoc(ref, {
      [`attendance.${month}.${date}`]: value,
    });
  }

  // 4) Actualiza cache en memoria
  if (payrollCache) {
    payrollCache = payrollCache.map((p) =>
      p.id === person.id ? { ...p, attendance: updated } : p
    );
    payrollCacheTime = Date.now();
  }

  return updated;
}

/* -------------------------------------------------------------------------- */
/*                               CÁLCULOS                                     */
/* -------------------------------------------------------------------------- */

// Medio turno (ajústalo si tu regla cambia)
const HALF_SHIFT_RATE = 0.5;

function daysInMonthStr(monthYYYYMM: string): number {
  // monthYYYYMM: "YYYY-MM"
  const [y, m] = monthYYYYMM.split("-").map(Number);
  // new Date(year, monthIndex+1, 0) → último día del mes anterior
  return new Date(y, m, 0).getDate();
}

function isDateInFortnight(dateYYYYMMDD: string, fortnight: Fortnight) {
  // "YYYY-MM-DD" → día
  const day = parseInt(dateYYYYMMDD.slice(8, 10), 10);
  return fortnight === 1 ? day <= 15 : day >= 16;
}

export function calculateFortnightTotal(
  p: Person,
  month: string, // "YYYY-MM"
  fortnight: Fortnight // 1 | 2
): number {
  const mode =
    p.paymentMode ??
    (p.fixedFortnightPay
      ? "fixed_fortnight"
      : p.fixedMonthlyPay
      ? "fixed_monthly"
      : p.valuePerHour
      ? "per_hour"
      : "per_day");

  // 1) Pago fijo por quincena → ignora asistencia
  if (mode === "fixed_fortnight") {
    return Math.max(0, p.fixedFortnightPay ?? 0);
  }

  // 2) Pago fijo mensual prorrateado por días reales del mes
  if (mode === "fixed_monthly") {
    const monthDays = daysInMonthStr(month);
    const firstHalfDays = 15;
    const secondHalfDays = monthDays - 15;
    const daysThisFortnight = fortnight === 1 ? firstHalfDays : secondHalfDays;
    const monthly = Math.max(0, p.fixedMonthlyPay ?? 0);
    return Math.round((monthly * daysThisFortnight) / monthDays);
  }

  const monthData = p.attendance?.[month] || {};

  // 3) Por hora → suma (horas * tarifa)
  if (mode === "per_hour") {
    const rate = Math.max(0, p.valuePerHour ?? 0);
    if (!rate) return 0;

    let totalHours = 0;
    for (const [date, att] of Object.entries(monthData)) {
      if (!isDateInFortnight(date, fortnight)) continue;
      if (att?.kind === "hours" && att.hours > 0) {
        totalHours += att.hours;
      }
    }
    return Math.round(totalHours * rate);
  }

  // 4) Por día → suma asistencia de la quincena
  const valuePerDay = Math.max(0, p.valuePerDay ?? 0);
  if (!valuePerDay) return 0;

  let total = 0;

  for (const [date, att] of Object.entries(monthData)) {
    if (!isDateInFortnight(date, fortnight)) continue;
    if (!att) continue;

    if (att.kind === "completo") total += valuePerDay;
    else if (att.kind === "medio")
      total += Math.round(valuePerDay * HALF_SHIFT_RATE);
    // Si hubiera un registro "hours" por error en un trabajador por día, lo ignoramos
  }

  return total;
}

export function calculateGeneralTotal(
  people: Person[],
  month: string,
  fortnight: Fortnight
): number {
  return people.reduce(
    (sum, p) => sum + calculateFortnightTotal(p, month, fortnight),
    0
  );
}
