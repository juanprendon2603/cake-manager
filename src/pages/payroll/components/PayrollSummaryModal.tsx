// src/pages/payroll/components/PayrollSummaryModal.tsx
import React, { useMemo, useState } from "react";
import BaseModal from "../../../components/BaseModal";
import type { Fortnight, Person } from "../../../types/payroll";
import {
  calculateFortnightTotal,
  calculateGeneralTotal,
} from "../payroll.service";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  month: string; // "YYYY-MM"
  people: Person[];
};

type ViewMode = "fortnight" | "month";
type ModeKey = "fixed" | "per_day" | "per_hour";

const fmtMoney = (n: number) =>
  n.toLocaleString("es-CO", { minimumFractionDigits: 0 });

function isFirstFortnight(dateYYYYMMDD: string) {
  const day = parseInt(dateYYYYMMDD.slice(8, 10), 10);
  return day <= 15;
}
function inFortnight(dateYYYYMMDD: string, f: Fortnight) {
  return f === 1
    ? isFirstFortnight(dateYYYYMMDD)
    : !isFirstFortnight(dateYYYYMMDD);
}

// Tipos y detectores para valores de asistencia
type DayHours = { kind: "hours"; hours: number; from?: string; to?: string };

function isHoursDay(day: unknown): day is DayHours {
  if (typeof day !== "object" || day === null) return false;
  const d = day as Partial<DayHours>;
  return d.kind === "hours" && typeof d.hours === "number";
}
function isStringDay(day: unknown): day is "completo" | "medio" {
  return day === "completo" || day === "medio";
}

// Botón tab simple
const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={[
      "px-4 py-2 rounded-xl text-sm font-semibold border",
      active
        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent"
        : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200",
    ].join(" ")}
  >
    {children}
  </button>
);

const ModePill: React.FC<{ mode: ModeKey }> = ({ mode }) => {
  if (mode === "fixed")
    return (
      <span className="px-2.5 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700 font-semibold">
        Fijo
      </span>
    );
  if (mode === "per_hour")
    return (
      <span className="px-2.5 py-1 text-xs rounded-full bg-fuchsia-100 text-fuchsia-700 font-semibold">
        Por hora
      </span>
    );
  return (
    <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 font-semibold">
      Por día
    </span>
  );
};

const SectionCard: React.FC<{
  title: string;
  total: number;
  children: React.ReactNode;
}> = ({ title, total, children }) => (
  <div className="bg-white/80 backdrop-blur border border-white/60 rounded-2xl overflow-hidden shadow-sm">
    <div className="flex items-center justify-between px-5 py-3 border-b bg-gradient-to-r from-purple-50 to-pink-50">
      <h4 className="font-bold text-gray-800">{title}</h4>
      <div className="text-sm">
        <span className="text-gray-500 mr-1">Total</span>
        <span className="font-extrabold text-[#8E2DA8]">
          ${fmtMoney(total)}
        </span>
      </div>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

function personPayMode(p: Person): ModeKey {
  return p.paymentMode === "fixed_fortnight" ||
    p.paymentMode === "fixed_monthly"
    ? "fixed"
    : p.paymentMode === "per_hour"
    ? "per_hour"
    : "per_day";
}

// Construye detalles por persona según rango (quincena o mes)
function buildPersonDetailRange(
  p: Person,
  month: string,
  range: { kind: "fortnight"; value: Fortnight } | { kind: "month" }
): {
  mode: ModeKey;
  total: number;
  fullDays?: number;
  halfDays?: number;
  hoursSum?: number;
} {
  const mode = personPayMode(p);

  // Totales: usa tus funciones para asegurar coherencia con reglas de negocio
  const total =
    range.kind === "fortnight"
      ? calculateFortnightTotal(p, month, range.value)
      : // mes = suma de ambas quincenas
        calculateFortnightTotal(p, month, 1) +
        calculateFortnightTotal(p, month, 2);

  // Detalles por modo (para etiquetas)
  if (mode === "per_day") {
    let fullDays = 0;
    let halfDays = 0;
    const m = p.attendance?.[month] || {};
    for (const [date, day] of Object.entries(m)) {
      if (range.kind === "fortnight" && !inFortnight(date, range.value))
        continue;
      if (isStringDay(day)) {
        if (day === "completo") fullDays += 1;
        else if (day === "medio") halfDays += 1;
      }
    }
    return { mode, total, fullDays, halfDays };
  }

  if (mode === "per_hour") {
    let hoursSum = 0;
    const m = p.attendance?.[month] || {};
    for (const [date, day] of Object.entries(m)) {
      if (range.kind === "fortnight" && !inFortnight(date, range.value))
        continue;
      if (isHoursDay(day) && day.hours > 0) hoursSum += day.hours;
    }
    return { mode, total, hoursSum: Number(hoursSum.toFixed(2)) };
  }

  // Fijos: sin detalle de días/horas
  return { mode, total };
}

const Row: React.FC<{
  p: Person;
  detail: ReturnType<typeof buildPersonDetailRange>;
}> = ({ p, detail }) => {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-b-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold grid place-items-center text-xs">
          {p.firstName?.[0]?.toUpperCase()}
          {p.lastName?.[0]?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-gray-800 truncate">
            {p.firstName} {p.lastName}
          </div>
          <div className="text-xs text-gray-500 flex gap-2 items-center">
            <ModePill mode={detail.mode} />
            {detail.mode === "per_day" && (
              <span>
                {detail.fullDays ?? 0} completo(s) · {detail.halfDays ?? 0}{" "}
                medio(s)
              </span>
            )}
            {detail.mode === "per_hour" && (
              <span>{detail.hoursSum ?? 0} h</span>
            )}
            {detail.mode === "fixed" && (
              <span>
                {p.paymentMode === "fixed_fortnight"
                  ? "Fijo quincenal"
                  : "Fijo mensual (prorrateado)"}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="font-extrabold text-[#8E2DA8]">
        ${fmtMoney(detail.total)}
      </div>
    </div>
  );
};

const PayrollSummaryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  month,
  people,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>("fortnight"); // "fortnight" | "month"
  const [fortnight, setFortnight] = useState<Fortnight>(1);
  const [modeTab, setModeTab] = useState<ModeKey>("fixed");

  // Solo activos
  const activePeople = useMemo(
    () => people.filter((p) => p.active !== false),
    [people]
  );

  // Rango actual (memo para no romper exhaust-deps por identidad)
  const range = useMemo<
    { kind: "fortnight"; value: Fortnight } | { kind: "month" }
  >(
    () =>
      viewMode === "fortnight"
        ? { kind: "fortnight", value: fortnight }
        : { kind: "month" },
    [viewMode, fortnight]
  );

  // Agrupar por modo + totales por grupo
  const groups = useMemo(() => {
    const fixed: Array<{
      p: Person;
      d: ReturnType<typeof buildPersonDetailRange>;
    }> = [];
    const perDay: Array<{
      p: Person;
      d: ReturnType<typeof buildPersonDetailRange>;
    }> = [];
    const perHour: Array<{
      p: Person;
      d: ReturnType<typeof buildPersonDetailRange>;
    }> = [];

    for (const p of activePeople) {
      const d = buildPersonDetailRange(p, month, range);
      const mode = d.mode;
      if (mode === "fixed") fixed.push({ p, d });
      else if (mode === "per_day") perDay.push({ p, d });
      else perHour.push({ p, d });
    }

    const byName = (a: { p: Person }, b: { p: Person }) =>
      (a.p.firstName + a.p.lastName).localeCompare(
        b.p.firstName + b.p.lastName,
        "es"
      );

    fixed.sort(byName);
    perDay.sort(byName);
    perHour.sort(byName);

    const totals = {
      fixed: fixed.reduce((s, x) => s + x.d.total, 0),
      perDay: perDay.reduce((s, x) => s + x.d.total, 0),
      perHour: perHour.reduce((s, x) => s + x.d.total, 0),
    };

    return { fixed, perDay, perHour, totals };
  }, [activePeople, month, range]);

  // Total general
  const grandTotal = useMemo(() => {
    if (viewMode === "fortnight") {
      return calculateGeneralTotal(activePeople, month, fortnight);
    }
    // Mes completo = suma 1ª + 2ª quincena para mantener reglas existentes
    return (
      calculateGeneralTotal(activePeople, month, 1) +
      calculateGeneralTotal(activePeople, month, 2)
    );
  }, [activePeople, month, fortnight, viewMode]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      headerAccent="purple"
      title="Resumen de nómina"
      description={
        <div className="flex flex-col gap-3">
          {/* Selector de vista */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Vista:</span>
            <TabButton
              active={viewMode === "fortnight"}
              onClick={() => setViewMode("fortnight")}
            >
              Por quincena
            </TabButton>
            <TabButton
              active={viewMode === "month"}
              onClick={() => setViewMode("month")}
            >
              Por mes
            </TabButton>
          </div>

          {/* Selector de quincena (solo cuando corresponde) */}
          {viewMode === "fortnight" ? (
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <TabButton
                  active={fortnight === 1}
                  onClick={() => setFortnight(1)}
                >
                  1ª quincena (1–15)
                </TabButton>
                <TabButton
                  active={fortnight === 2}
                  onClick={() => setFortnight(2)}
                >
                  2ª quincena (16–fin)
                </TabButton>
              </div>
              <div className="text-sm">
                <span className="text-gray-500 mr-1">Total general</span>
                <span className="font-extrabold text-[#8E2DA8]">
                  ${fmtMoney(grandTotal)}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-end">
              <div className="text-sm">
                <span className="text-gray-500 mr-1">Total mes</span>
                <span className="font-extrabold text-[#8E2DA8]">
                  ${fmtMoney(grandTotal)}
                </span>
              </div>
            </div>
          )}
        </div>
      }
      primaryAction={undefined}
      secondaryAction={{ label: "Cerrar", onClick: onClose }}
      size="3xl"
      bodyClassName="space-y-4"
    >
      {/* Tabs por modo */}
      <div className="flex gap-2">
        <TabButton
          active={modeTab === "fixed"}
          onClick={() => setModeTab("fixed")}
        >
          Fijos
        </TabButton>
        <TabButton
          active={modeTab === "per_day"}
          onClick={() => setModeTab("per_day")}
        >
          Por día
        </TabButton>
        <TabButton
          active={modeTab === "per_hour"}
          onClick={() => setModeTab("per_hour")}
        >
          Por hora
        </TabButton>
      </div>

      {/* Contenido según tab */}
      {modeTab === "fixed" && (
        <SectionCard
          title={
            viewMode === "fortnight"
              ? "Pagos fijos (quincena)"
              : "Pagos fijos (mes)"
          }
          total={groups.totals.fixed}
        >
          {groups.fixed.length === 0 ? (
            <div className="text-sm text-gray-500">
              No hay trabajadores fijos.
            </div>
          ) : (
            <div className="divide-y">
              {groups.fixed.map(({ p, d }) => (
                <Row key={p.id} p={p} detail={d} />
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {modeTab === "per_day" && (
        <SectionCard
          title={
            viewMode === "fortnight"
              ? "Pago por día (quincena)"
              : "Pago por día (mes)"
          }
          total={groups.totals.perDay}
        >
          {groups.perDay.length === 0 ? (
            <div className="text-sm text-gray-500">
              No hay trabajadores por día.
            </div>
          ) : (
            <div className="divide-y">
              {groups.perDay.map(({ p, d }) => (
                <Row key={p.id} p={p} detail={d} />
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {modeTab === "per_hour" && (
        <SectionCard
          title={
            viewMode === "fortnight"
              ? "Pago por hora (quincena)"
              : "Pago por hora (mes)"
          }
          total={groups.totals.perHour}
        >
          {groups.perHour.length === 0 ? (
            <div className="text-sm text-gray-500">
              No hay trabajadores por hora.
            </div>
          ) : (
            <div className="divide-y">
              {groups.perHour.map(({ p, d }) => (
                <Row key={p.id} p={p} detail={d} />
              ))}
            </div>
          )}
        </SectionCard>
      )}
    </BaseModal>
  );
};

export default PayrollSummaryModal;
