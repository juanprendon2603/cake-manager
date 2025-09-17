// src/pages/payroll/payroll.service.ts
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import type {
  AttendanceByMonth,
  Fortnight,
  Person,
  ShiftKind,
} from "../../types/payroll";

/** Nancy local (siempre presente en la vista Payroll grande) */
const LOCAL_NANCY_ID = "local-nancy-canas";
const LOCAL_NANCY: Person = {
  id: LOCAL_NANCY_ID,
  firstName: "Nancy",
  lastName: "Cañas",
  valuePerDay: 0,
  attendance: {},
  fixedFortnightPay: 500_000,
};

export async function loadPeopleFromDb(): Promise<Person[]> {
  const qs = await getDocs(collection(db, "payroll"));
  const items: Person[] = [];
  qs.forEach((d) => {
    items.push({ id: d.id, ...(d.data() as Omit<Person, "id">) });
  });
  return items;
}

export async function loadPeopleWithNancy(): Promise<Person[]> {
  const people = await loadPeopleFromDb();
  const exists = people.some((p) => p.id === LOCAL_NANCY_ID);
  return exists ? people : [LOCAL_NANCY, ...people];
}

export async function loadPeopleWithoutNancy(): Promise<Person[]> {
  const people = await loadPeopleFromDb();
  // Mantiene la lógica original (ocultar Nancy por nombre)
  return people.filter((p) => p.firstName !== "Nancy");
}

/** Marca asistencia para un día (actualiza firestore si no es local-*) */
export async function markAttendanceForPerson(args: {
  person: Person;
  month: string;     // YYYY-MM
  date: string;      // YYYY-MM-DD
  shift: ShiftKind;
}): Promise<AttendanceByMonth> {
  const { person, month, date, shift } = args;

  const updated: AttendanceByMonth = {
    ...person.attendance,
    [month]: {
      ...(person.attendance?.[month] || {}),
      [date]: shift,
    },
  };

  if (!person.id.startsWith("local-")) {
    const ref = doc(db, "payroll", person.id);
    await updateDoc(ref, { attendance: updated });
  }

  return updated;
}

/** Total quincenal por persona */
export function calculateFortnightTotal(
  p: Person,
  month: string,
  fortnight: Fortnight
): number {
  if (p.fixedFortnightPay && p.fixedFortnightPay > 0) {
    return p.fixedFortnightPay;
  }
  const monthData = p.attendance?.[month] || {};
  let total = 0;

  for (const [date, shift] of Object.entries(monthData)) {
    const day = parseInt(date.split("-")[2], 10);
    const inFirst = day <= 15;
    if ((fortnight === 1 && inFirst) || (fortnight === 2 && !inFirst)) {
      total += shift === "completo" ? p.valuePerDay : p.valuePerDay / 2;
    }
  }
  return total;
}

/** Total general a pagar */
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
