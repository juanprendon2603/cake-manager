// src/pages/payroll/PayrollSimple.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmAttendanceModal from "../../components/ConfirmAttendanceModal";
import { FullScreenLoader } from "../../components/FullScreenLoader";
import PayrollSummaryModal from "../../components/PayrollSummaryModal";
import type { Person, ShiftKind } from "../../types/payroll";
import { getLocalMonthString, getLocalTodayString } from "../../utils/dates";
import {
  loadPeopleWithoutNancy,
  markAttendanceForPerson,
} from "./payroll.service";

// Helpers para horas
function hhmmToMinutes(hhmm?: string) {
  if (!hhmm) return undefined;
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return undefined;
  return h * 60 + m;
}
function diffHours(from?: string, to?: string) {
  const a = hhmmToMinutes(from);
  const b = hhmmToMinutes(to);
  if (a === undefined || b === undefined) return undefined;
  const d = (b - a) / 60;
  return d > 0 ? d : undefined;
}

type PerHourDraft = { from?: string; to?: string; hours?: string };
type DraftByPerson = Record<string, PerHourDraft>;

// Type guards para pintar correctamente el badge
function isHoursDay(
  day: any
): day is { kind: "hours"; hours: number; from?: string; to?: string } {
  return day && typeof day === "object" && day.kind === "hours";
}
function isStringDay(day: any): day is "completo" | "medio" {
  return typeof day === "string";
}

const PayrollSimple: React.FC = () => {
  const [month] = useState<string>(getLocalMonthString());
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedShift, setSelectedShift] = useState<ShiftKind | null>(null);

  // borrador de horas por persona (solo para modo por hora)
  const [draft, setDraft] = useState<DraftByPerson>({});
  const dForSelected = selectedPerson ? draft[selectedPerson.id] ?? {} : {};
  const computedPreview = diffHours(dForSelected.from, dForSelected.to);
  const hoursPreview =
    selectedShift === "hours"
      ? computedPreview ??
        (dForSelected.hours ? Number(dForSelected.hours) : undefined)
      : undefined;

  const navigate = useNavigate();
  const today = getLocalTodayString();

  const load = async () => {
    setLoading(true);
    try {
      const items = await loadPeopleWithoutNancy(); // ya devuelve solo activos
      setPeople(items.filter((p) => p.active !== false));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleConfirmClick = (person: Person, shift: ShiftKind) => {
    setSelectedPerson(person);
    setSelectedShift(shift);
    setShowConfirmModal(true);
  };

  const markAttendance = async () => {
    if (!selectedPerson || !selectedShift) return;
    setLoading(true);
    try {
      // 1) Bloquear marcación para fijos (por seguridad extra)
      if (
        selectedPerson.paymentMode === "fixed_fortnight" ||
        selectedPerson.paymentMode === "fixed_monthly"
      ) {
        // No debería pasar porque no renderizamos botones, pero por si acaso:
        setLoading(false);
        setShowConfirmModal(false);
        setSelectedPerson(null);
        setSelectedShift(null);
        return;
      }

      let hours: number | undefined;
      let from: string | undefined;
      let to: string | undefined;

      // 2) Si es por hora, calcular/validar horas
      if (selectedShift === "hours") {
        const d = draft[selectedPerson.id] ?? {};
        // prioriza cálculo por rango si ambos están
        const calc = diffHours(d.from, d.to);
        const manual = d.hours ? Number(d.hours) : undefined;
        hours = calc ?? (manual && manual > 0 ? manual : undefined);
        from = d.from || undefined;
        to = d.to || undefined;
        if (!hours || hours <= 0) {
          setLoading(false);
          setShowConfirmModal(false);
          setSelectedPerson(null);
          setSelectedShift(null);
          alert("Ingresa horas válidas o un rango desde–hasta.");
          return;
        }
      }

      // 3) IMPORTANTE: mantener formato:
      // - per_day  => string ("completo" | "medio")
      // - per_hour => objeto (hours/from/to)
      // Esto se decide en el servicio con base en person.paymentMode,
      // pero envío los datos para que pueda escribir correctamente.
      const updated = await markAttendanceForPerson({
        person: selectedPerson,
        month,
        date: today,
        shift: selectedShift,
        hours,
        from,
        to,
      });

      setPeople((curr) =>
        curr.map((p) =>
          p.id === selectedPerson.id ? { ...p, attendance: updated } : p
        )
      );
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
      setSelectedPerson(null);
      setSelectedShift(null);
    }
  };

  if (loading) {
    return <FullScreenLoader message="Guardando asistencia..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex flex-col items-center py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl shadow-lg">
            👥
          </div>
        </div>
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Registro de Asistencia
        </h1>
        <p className="text-gray-600 max-w-md mb-2">
          Marca la asistencia diaria del equipo de trabajo
        </p>
      </div>

      {/* Actions */}
      <div className="mb-8 flex flex-wrap justify-center gap-4">
        <button
          onClick={() => setShowSummaryModal(true)}
          className="group flex items-center gap-3 px-8 py-4 rounded-2xl font-medium text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <span className="text-xl group-hover:scale-110 transition-transform duration-200">
            📊
          </span>
          Ver resumen por quincenas
        </button>

        <button
          onClick={() => navigate("/fridgeTemperature")}
          className="group flex items-center gap-3 px-8 py-4 rounded-2xl font-medium text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
        >
          <span className="text-xl group-hover:scale-110 transition-transform duration-200">
            ❄️
          </span>
          Registrar temperatura
        </button>
      </div>

      {/* People (solo activos) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl px-4">
        {people
          .filter((p) => p.active !== false)
          .map((p) => {
            const day = p.attendance?.[month]?.[today];
            const hasMarkedToday = day !== undefined;

            // Badge según tipo de valor guardado hoy
            const badge = (() => {
              if (!day) return null;
              if (isStringDay(day)) {
                return day === "completo"
                  ? {
                      text: "🕐 Turno Completo",
                      cls: "bg-green-100 text-green-700",
                    }
                  : {
                      text: "⏰ Medio Turno",
                      cls: "bg-yellow-100 text-yellow-700",
                    };
              }
              if (isHoursDay(day)) {
                const extra =
                  day.from && day.to ? ` (${day.from}–${day.to})` : "";
                return {
                  text: `🕒 ${day.hours} h${extra}`,
                  cls: "bg-blue-100 text-blue-700",
                };
              }
              return null;
            })();

            const d = draft[p.id] ?? {};
            const computed = diffHours(d.from, d.to);

            // ¿Se puede marcar? Solo per_day y per_hour
            const isFixed =
              p.paymentMode === "fixed_fortnight" ||
              p.paymentMode === "fixed_monthly";

            return (
              <div
                key={p.id}
                className={`relative bg-white/80 backdrop-blur-xl shadow-lg rounded-2xl p-6 flex flex-col items-center border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  hasMarkedToday
                    ? "border-green-200 bg-gradient-to-br from-green-50/50 to-emerald-50/50"
                    : "border-white/60 hover:border-purple-200"
                }`}
              >
                {hasMarkedToday && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm shadow-lg">
                    ✓
                  </div>
                )}

                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xl font-bold mb-4 shadow-lg">
                  {p.firstName[0]}
                  {p.lastName[0]}
                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">
                  {p.firstName} {p.lastName}
                </h2>

                {hasMarkedToday ? (
                  <div className="mb-4">
                    {badge && (
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${badge.cls}`}
                      >
                        {badge.text}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm mb-4">
                    {isFixed
                      ? "Pago fijo — no requiere marcar"
                      : "Pendiente de marcar"}
                  </p>
                )}

                {/* UI según modo de pago */}
                {isFixed ? null : p.paymentMode === "per_hour" ? (
                  // ====== UI MODO POR HORA ======
                  <div className="w-full grid grid-cols-3 gap-2 items-end">
                    <label className="col-span-1 text-xs text-gray-600">
                      Desde
                      <input
                        type="time"
                        value={d.from ?? ""}
                        onChange={(e) =>
                          setDraft((cur) => ({
                            ...cur,
                            [p.id]: { ...cur[p.id], from: e.target.value },
                          }))
                        }
                        disabled={hasMarkedToday}
                        className="mt-1 w-full rounded-lg border px-3 py-2"
                      />
                    </label>
                    <label className="col-span-1 text-xs text-gray-600">
                      Hasta
                      <input
                        type="time"
                        value={d.to ?? ""}
                        onChange={(e) =>
                          setDraft((cur) => ({
                            ...cur,
                            [p.id]: { ...cur[p.id], to: e.target.value },
                          }))
                        }
                        disabled={hasMarkedToday}
                        className="mt-1 w-full rounded-lg border px-3 py-2"
                      />
                    </label>
                    <label className="col-span-1 text-xs text-gray-600">
                      Horas
                      <input
                        type="number"
                        step="0.25"
                        min={0}
                        value={
                          computed !== undefined
                            ? String(Number(computed.toFixed(2)))
                            : d.hours ?? ""
                        }
                        onChange={(e) =>
                          setDraft((cur) => ({
                            ...cur,
                            [p.id]: { ...cur[p.id], hours: e.target.value },
                          }))
                        }
                        disabled={hasMarkedToday}
                        className="mt-1 w-full rounded-lg border px-3 py-2"
                      />
                    </label>

                    <button
                      onClick={() => handleConfirmClick(p, "hours")}
                      disabled={hasMarkedToday}
                      className={`col-span-3 mt-2 w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                        hasMarkedToday
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                      }`}
                    >
                      <span>✅</span>
                      Guardar horas de hoy
                    </button>
                  </div>
                ) : (
                  // ====== UI MODO POR DÍA ======
                  <div className="flex gap-3 flex-wrap justify-center w-full">
                    <button
                      onClick={() => handleConfirmClick(p, "completo")}
                      disabled={hasMarkedToday}
                      className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                        hasMarkedToday
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                      }`}
                    >
                      <span>🕐</span>
                      Turno Completo
                    </button>
                    <button
                      onClick={() => handleConfirmClick(p, "medio")}
                      disabled={hasMarkedToday}
                      className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                        hasMarkedToday
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                      }`}
                    >
                      <span>⏰</span>
                      Medio Turno
                    </button>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Modales */}
      {selectedPerson && selectedShift && (
        <ConfirmAttendanceModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={markAttendance}
          person={selectedPerson}
          shift={selectedShift}
          // NUEVO: solo para horas
          hoursPreview={selectedShift === "hours" ? hoursPreview : undefined}
          fromPreview={
            selectedShift === "hours" ? dForSelected.from : undefined
          }
          toPreview={selectedShift === "hours" ? dForSelected.to : undefined}
        />
      )}

      <PayrollSummaryModal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        month={month}
        people={people}
      />
    </div>
  );
};

export default PayrollSimple;
