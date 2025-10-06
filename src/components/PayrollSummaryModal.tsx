import React, { useMemo, useState } from "react";
import type { Person } from "../types/payroll";
import BaseModal from "./BaseModal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  month: string;
  people: Person[];
}

type Fortnight = 1 | 2;
type ModeKey = "fixed" | "per_day" | "per_hour";

type DayString = "completo" | "medio";
type DayHours = { kind: "hours"; hours: number; from?: string; to?: string };
type AttendanceValue = DayString | DayHours;


function isStringDay(day: unknown): day is DayString {
  return day === "completo" || day === "medio";
}

function isHoursDay(day: unknown): day is DayHours {
  return (
    typeof day === "object" &&
    day !== null &&
    "kind" in day &&
    (day as { kind?: unknown }).kind === "hours" &&
    "hours" in day &&
    typeof (day as { hours?: unknown }).hours === "number"
  );
}


function personMode(p: Person): ModeKey {
  if (p.paymentMode === "fixed_fortnight" || p.paymentMode === "fixed_monthly")
    return "fixed";
  if (p.paymentMode === "per_hour") return "per_hour";
  return "per_day";
}
function isInFortnight(dateYYYYMMDD: string, f: Fortnight) {
  const day = parseInt(dateYYYYMMDD.slice(8, 10), 10);
  return f === 1 ? day <= 15 : day >= 16;
}
const fmtH = (n: number) => (n % 1 === 0 ? `${n} h` : `${n.toFixed(2)} h`);

function buildPerDayData(
  p: Person,
  month: string,
  fortnight: Fortnight
): { qDays: number; mDays: number; qList: number[]; mList: number[] } {
  const m = (p.attendance?.[month] ?? {}) as Record<string, AttendanceValue>;
  const qList: number[] = [];
  const mList: number[] = [];

  for (const [date, value] of Object.entries(m)) {
    if (!isStringDay(value)) continue;
    const dayNo = parseInt(date.slice(8, 10), 10);
    mList.push(dayNo);
    if (isInFortnight(date, fortnight)) qList.push(dayNo);
  }

  qList.sort((a, b) => a - b);
  mList.sort((a, b) => a - b);

  return { qDays: qList.length, mDays: mList.length, qList, mList };
}

function buildPerHourData(
  p: Person,
  month: string,
  fortnight: Fortnight
): { qHours: number; mHours: number; qList: number[]; mList: number[] } {
  const m = (p.attendance?.[month] ?? {}) as Record<string, AttendanceValue>;
  let qHours = 0;
  let mHours = 0;
  const qList: number[] = [];
  const mList: number[] = [];

  for (const [date, value] of Object.entries(m)) {
    if (!isHoursDay(value) || !(value.hours > 0)) continue;
    const dayNo = parseInt(date.slice(8, 10), 10);
    mHours += value.hours;
    mList.push(dayNo);
    if (isInFortnight(date, fortnight)) {
      qHours += value.hours;
      qList.push(dayNo);
    }
  }

  qHours = Number(qHours.toFixed(2));
  mHours = Number(mHours.toFixed(2));
  qList.sort((a, b) => a - b);
  mList.sort((a, b) => a - b);

  return { qHours, mHours, qList, mList };
}

const GroupCard: React.FC<{
  title: string;
  accent: "emerald" | "sky" | "indigo";
  children: React.ReactNode;
}> = ({ title, accent, children }) => {
  const headerBg =
    accent === "emerald"
      ? "from-emerald-50 to-green-50"
      : accent === "sky"
        ? "from-sky-50 to-blue-50"
        : "from-indigo-50 to-purple-50";
  const border =
    accent === "emerald"
      ? "border-emerald-100"
      : accent === "sky"
        ? "border-sky-100"
        : "border-indigo-100";

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border ${border} overflow-hidden`}
    >
      <div className={`px-5 py-3 border-b bg-gradient-to-r ${headerBg}`}>
        <h4 className="font-bold text-gray-800">{title}</h4>
      </div>
      <div className="p-4 divide-y">{children}</div>
    </div>
  );
};

const NameAvatar: React.FC<{
  first: string;
  last: string;
  className?: string;
}> = ({ first, last, className = "" }) => (
  <div
    className={`w-9 h-9 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold grid place-items-center text-xs ${className}`}
    title={`${first} ${last}`}
  >
    {first?.[0]?.toUpperCase()}
    {last?.[0]?.toUpperCase()}
  </div>
);

const Pill: React.FC<{
  color: "green" | "blue" | "indigo";
  children: React.ReactNode;
}> = ({ color, children }) => {
  const cls =
    color === "green"
      ? "bg-emerald-100 text-emerald-700"
      : color === "blue"
        ? "bg-sky-100 text-sky-700"
        : "bg-indigo-100 text-indigo-700";
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {children}
    </span>
  );
};

const TinyLabel: React.FC<{
  color: "green" | "blue";
  children: React.ReactNode;
}> = ({ color, children }) => {
  const cls =
    color === "green"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-sky-50 text-sky-700 border-sky-200";
  return (
    <span
      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${cls}`}
    >
      {children}
    </span>
  );
};

const DayChip: React.FC<{ color: "green" | "blue"; n: number }> = ({
  color,
  n,
}) => {
  const cls =
    color === "green"
      ? "bg-gradient-to-r from-green-100 to-emerald-100 text-emerald-700 border-emerald-200"
      : "bg-gradient-to-r from-blue-100 to-sky-100 text-sky-700 border-sky-200";
  return (
    <span
      className={`px-2 py-1 rounded-md text-[11px] font-medium border ${cls}`}
    >
      {n}
    </span>
  );
};

export default function PayrollSummaryModal({
  isOpen,
  onClose,
  month,
  people,
}: Props) {
  const [fortnight, setFortnight] = useState<Fortnight>(1);

  const activePeople = useMemo(
    () => people.filter((p) => p.active !== false),
    [people]
  );

  const groups = useMemo(() => {
    const fixed: Person[] = [];
    const perDay: Array<{
      p: Person;
      qDays: number;
      mDays: number;
      qList: number[];
      mList: number[];
    }> = [];
    const perHour: Array<{
      p: Person;
      qHours: number;
      mHours: number;
      qList: number[];
      mList: number[];
    }> = [];

    for (const p of activePeople) {
      const mode = personMode(p);
      if (mode === "fixed") {
        fixed.push(p);
      } else if (mode === "per_day") {
        const d = buildPerDayData(p, month, fortnight);
        perDay.push({ p, ...d });
      } else {
        const d = buildPerHourData(p, month, fortnight);
        perHour.push({ p, ...d });
      }
    }

    const byName = (a: { p: Person }, b: { p: Person }) =>
      (a.p.firstName + a.p.lastName).localeCompare(
        b.p.firstName + b.p.lastName,
        "es"
      );

    perDay.sort(byName);
    perHour.sort(byName);
    fixed.sort((a, b) =>
      (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName, "es")
    );

    const totals = {
      perDayQ: perDay.reduce((s, x) => s + x.qDays, 0),
      perDayM: perDay.reduce((s, x) => s + x.mDays, 0),
      perHourQ: Number(perHour.reduce((s, x) => s + x.qHours, 0).toFixed(2)),
      perHourM: Number(perHour.reduce((s, x) => s + x.mHours, 0).toFixed(2)),
    };

    return { fixed, perDay, perHour, totals };
  }, [activePeople, month, fortnight]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      headerAccent="indigo"
      title="Resumen"
      description={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-gray-600">Mes: {month}</div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Quincena:</span>
            <button
              onClick={() => setFortnight(1)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${fortnight === 1
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent"
                  : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
                }`}
            >
              1ª (1–15)
            </button>
            <button
              onClick={() => setFortnight(2)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${fortnight === 2
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent"
                  : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
                }`}
            >
              2ª (16–fin)
            </button>
          </div>
        </div>
      }
      secondaryAction={{ label: "Cerrar", onClick: onClose }}
      size="4xl"
      bodyClassName="max-h-[70vh] overflow-y-auto space-y-6"
    >
      <GroupCard title="Fijos" accent="indigo">
        {groups.fixed.length === 0 ? (
          <div className="text-sm text-gray-500 py-2">
            No hay trabajadores fijos.
          </div>
        ) : (
          groups.fixed.map((p) => (
            <div key={p.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <NameAvatar first={p.firstName} last={p.lastName} />
                <div className="truncate">
                  <div className="font-semibold text-gray-800 truncate">
                    {p.firstName} {p.lastName}
                  </div>
                </div>
              </div>
              <Pill color="indigo">
                {p.paymentMode === "fixed_fortnight"
                  ? "Fijo quincenal"
                  : "Fijo mensual"}
              </Pill>
            </div>
          ))
        )}
      </GroupCard>

      <GroupCard title="Por día" accent="emerald">
        {groups.perDay.length === 0 ? (
          <div className="text-sm text-gray-500 py-2">
            No hay trabajadores por día.
          </div>
        ) : (
          groups.perDay.map(({ p, qDays, mDays, qList, mList }) => (
            <div key={p.id} className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <NameAvatar first={p.firstName} last={p.lastName} />
                  <div className="truncate">
                    <div className="font-semibold text-gray-800 truncate">
                      {p.firstName} {p.lastName}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Pill color="green">Quincena: {qDays} día(s)</Pill>
                  <Pill color="green">Mes: {mDays} día(s)</Pill>
                </div>
              </div>

              <div className="mt-2 space-y-1">
                <div className="flex flex-wrap items-center gap-1">
                  <TinyLabel color="green">Q</TinyLabel>
                  {qList.length > 0 ? (
                    qList.map((n, i) => (
                      <DayChip key={`q-${p.id}-${i}`} color="green" n={n} />
                    ))
                  ) : (
                    <span className="text-[11px] text-gray-400">—</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <TinyLabel color="green">Mes</TinyLabel>
                  {mList.length > 0 ? (
                    mList.map((n, i) => (
                      <DayChip key={`m-${p.id}-${i}`} color="green" n={n} />
                    ))
                  ) : (
                    <span className="text-[11px] text-gray-400">—</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </GroupCard>

      <GroupCard title="Por hora" accent="sky">
        {groups.perHour.length === 0 ? (
          <div className="text-sm text-gray-500 py-2">
            No hay trabajadores por hora.
          </div>
        ) : (
          groups.perHour.map(({ p, qHours, mHours, qList, mList }) => (
            <div key={p.id} className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <NameAvatar first={p.firstName} last={p.lastName} />
                  <div className="truncate">
                    <div className="font-semibold text-gray-800 truncate">
                      {p.firstName} {p.lastName}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Pill color="blue">Quincena: {fmtH(qHours)}</Pill>
                  <Pill color="blue">Mes: {fmtH(mHours)}</Pill>
                </div>
              </div>

              <div className="mt-2 space-y-1">
                <div className="flex flex-wrap items-center gap-1">
                  <TinyLabel color="blue">Q</TinyLabel>
                  {qList.length > 0 ? (
                    qList.map((n, i) => (
                      <DayChip key={`qh-${p.id}-${i}`} color="blue" n={n} />
                    ))
                  ) : (
                    <span className="text-[11px] text-gray-400">—</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <TinyLabel color="blue">Mes</TinyLabel>
                  {mList.length > 0 ? (
                    mList.map((n, i) => (
                      <DayChip key={`mh-${p.id}-${i}`} color="blue" n={n} />
                    ))
                  ) : (
                    <span className="text-[11px] text-gray-400">—</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </GroupCard>
    </BaseModal>
  );
}
