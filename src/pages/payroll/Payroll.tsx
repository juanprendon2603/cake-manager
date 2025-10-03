// src/pages/payroll/Payroll.tsx
import React, { useEffect, useMemo, useState } from "react";
import type { Fortnight, Person } from "../../types/payroll";
import { loadPeopleFromDb } from "./payroll.service";

import { PageHero } from "../../components/ui/PageHero";
import { ProTipBanner } from "../../components/ui/ProTipBanner";
import { AppFooter } from "../../components/AppFooter";
import { BackButton } from "../../components/BackButton";
import { BriefcaseBusiness } from "lucide-react";

/* ========================= Helpers generales ========================= */

const HALF_SHIFT_RATE = 0.5;

function daysInMonthStr(monthYYYYMM: string): number {
  const [y, m] = monthYYYYMM.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}
function isInFortnight(dateYYYYMMDD: string, fortnight: Fortnight) {
  const day = parseInt(dateYYYYMMDD.slice(8, 10), 10);
  return fortnight === 1 ? day <= 15 : day >= 16;
}
function isStringDay(v: any): v is "completo" | "medio" {
  return typeof v === "string";
}
function isHoursDay(
  v: any
): v is { kind: "hours"; hours: number; from?: string; to?: string } {
  return v && typeof v === "object" && v.kind === "hours";
}

/* ===== Cálculos de pago por persona (quincena y mes, todos los modos) ===== */

function calcFortnightForPerson(
  p: Person,
  month: string,
  f: Fortnight
): number {
  const mode = p.paymentMode;

  // Fijo quincenal: valor fijo directo
  if (mode === "fixed_fortnight") {
    return Math.max(0, p.fixedFortnightPay ?? 0);
  }

  // Fijo mensual: prorrateo según días reales de la quincena
  if (mode === "fixed_monthly") {
    const monthDays = daysInMonthStr(month);
    const firstHalfDays = 15;
    const secondHalfDays = monthDays - 15;
    const daysThisFortnight = f === 1 ? firstHalfDays : secondHalfDays;
    const monthly = Math.max(0, p.fixedMonthlyPay ?? 0);
    return Math.round((monthly * daysThisFortnight) / monthDays);
  }

  // Por día: suma asistencia (string "completo" | "medio")
  if (mode === "per_day") {
    const valuePerDay = Math.max(0, p.valuePerDay ?? 0);
    if (!valuePerDay) return 0;
    const monthData = p.attendance?.[month] || {};
    let total = 0;
    for (const [date, shift] of Object.entries(monthData)) {
      if (!isInFortnight(date, f)) continue;
      if (isStringDay(shift)) {
        if (shift === "completo") total += valuePerDay;
        else if (shift === "medio")
          total += Math.round(valuePerDay * HALF_SHIFT_RATE);
      }
    }
    return total;
  }

  // Por hora: suma horas * valor/hora
  if (mode === "per_hour") {
    const valuePerHour = Math.max(0, (p as any).valuePerHour ?? 0);
    if (!valuePerHour) return 0;
    const monthData = p.attendance?.[month] || {};
    let hours = 0;
    for (const [date, v] of Object.entries(monthData)) {
      if (!isInFortnight(date, f)) continue;
      if (isHoursDay(v) && v.hours > 0) hours += v.hours;
    }
    return Math.round(hours * valuePerHour);
  }

  return 0;
}

function calcMonthForPerson(p: Person, month: string): number {
  const mode = p.paymentMode;

  if (mode === "fixed_monthly") {
    return Math.max(0, p.fixedMonthlyPay ?? 0);
  }
  if (mode === "fixed_fortnight") {
    const q = Math.max(0, p.fixedFortnightPay ?? 0);
    return q * 2; // 2 quincenas
  }
  if (mode === "per_day") {
    const valuePerDay = Math.max(0, p.valuePerDay ?? 0);
    if (!valuePerDay) return 0;
    const monthData = p.attendance?.[month] || {};
    let total = 0;
    for (const v of Object.values(monthData)) {
      if (isStringDay(v)) {
        if (v === "completo") total += valuePerDay;
        else if (v === "medio")
          total += Math.round(valuePerDay * HALF_SHIFT_RATE);
      }
    }
    return total;
  }
  if (mode === "per_hour") {
    const valuePerHour = Math.max(0, (p as any).valuePerHour ?? 0);
    if (!valuePerHour) return 0;
    const monthData = p.attendance?.[month] || {};
    let hours = 0;
    for (const v of Object.values(monthData)) {
      if (isHoursDay(v) && v.hours > 0) hours += v.hours;
    }
    return Math.round(hours * valuePerHour);
  }
  return 0;
}

function formatMoney(n: number) {
  return `$${Number(n || 0).toLocaleString("es-CO")}`;
}

/* =============================== Página =============================== */

const Payroll: React.FC = () => {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [fortnight, setFortnight] = useState<Fortnight>(() => {
    const today = new Date().getDate();
    return (today <= 15 ? 1 : 2) as Fortnight;
  });
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const items = await loadPeopleFromDb();
      setPeople(items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Totales generales
  const totals = useMemo(() => {
    const quincena = people.reduce(
      (s, p) => s + calcFortnightForPerson(p, month, fortnight),
      0
    );
    const mes = people.reduce((s, p) => s + calcMonthForPerson(p, month), 0);
    return { quincena, mes };
  }, [people, month, fortnight]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex flex-col">
      <main className="flex-grow p-6 sm:p-12 max-w-6xl mx-auto w-full">
    

               <div className="relative">
                
               <PageHero
  icon={<BriefcaseBusiness className="w-10 h-10" />}
  title="Nómina"
  subtitle="Pagos por quincena y por mes"
/>
        
                          <div className="absolute top-4 left-4">
                          <BackButton fallback="/admin" />
                          </div>
                          </div>
        

        {/* Card principal */}
        <section className="bg-white/80 backdrop-blur-xl border-2 border-white/60 shadow-2xl rounded-3xl p-6 sm:p-8">
          {/* Filtros */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <label className="text-lg font-semibold text-[#8E2DA8]">
                Seleccionar mes:
              </label>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="border border-[#E8D4F2] p-3 rounded-lg text-center bg-white"
              />
              <select
                value={fortnight}
                onChange={(e) => setFortnight(Number(e.target.value) as 1 | 2)}
                className="border border-[#E8D4F2] p-3 rounded-lg bg-white"
              >
                <option value={1}>Primera Quincena (1-15)</option>
                <option value={2}>Segunda Quincena (16-fin)</option>
              </select>
            </div>
          </div>

          {/* Contenido */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#8E2DA8]" />
              <p className="mt-4 text-lg text-gray-600">Cargando personal...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {people.map((p) => {
                const fortnightTotal = calcFortnightForPerson(
                  p,
                  month,
                  fortnight
                );
                const monthTotal = calcMonthForPerson(p, month);

                const paymentBadge =
                  p.paymentMode === "per_day"
                    ? {
                        text: `Por día · ${formatMoney(p.valuePerDay || 0)}`,
                        cls: "bg-emerald-100 text-emerald-700",
                      }
                    : p.paymentMode === "per_hour"
                    ? {
                        text: `Por hora · ${formatMoney(
                          (p as any).valuePerHour || 0
                        )}`,
                        cls: "bg-sky-100 text-sky-700",
                      }
                    : p.paymentMode === "fixed_fortnight"
                    ? {
                        text: `Fijo quincenal · ${formatMoney(
                          p.fixedFortnightPay || 0
                        )}`,
                        cls: "bg-indigo-100 text-indigo-700",
                      }
                    : {
                        text: `Fijo mensual · ${formatMoney(
                          p.fixedMonthlyPay || 0
                        )}`,
                        cls: "bg-purple-100 text-purple-700",
                      };

                const monthData = p.attendance?.[month] || {};
                const entries = Object.entries(monthData).filter(([date]) =>
                  isInFortnight(date, fortnight)
                );

                return (
                  <div
                    key={p.id}
                    className="bg-white/80 backdrop-blur-xl border border-white/60 shadow rounded-2xl p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold grid place-items-center text-sm">
                            {p.firstName?.[0]?.toUpperCase()}
                            {p.lastName?.[0]?.toUpperCase()}
                          </div>
                          <h3 className="text-2xl font-bold text-[#8E2DA8] truncate">
                            {p.firstName} {p.lastName}
                            {p.active === false && (
                              <span className="ml-2 text-xs font-semibold px-2 py-1 rounded-full bg-gray-200 text-gray-700 align-middle">
                                Inactivo
                              </span>
                            )}
                          </h3>
                        </div>

                        <div className="mb-3">
                          <span
                            className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${paymentBadge.cls}`}
                          >
                            {paymentBadge.text}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="rounded-lg bg-[#FDF8FF] border border-[#E8D4F2] p-4">
                            <div className="text-sm text-gray-600">
                              Total quincena (
                              {fortnight === 1 ? "1-15" : "16-fin"})
                            </div>
                            <div className="text-2xl font-extrabold text-[#8E2DA8]">
                              {formatMoney(fortnightTotal)}
                            </div>
                          </div>
                          <div className="rounded-lg bg-[#FDF8FF] border border-[#E8D4F2] p-4">
                            <div className="text-sm text-gray-600">
                              Total mes ({month})
                            </div>
                            <div className="text-2xl font-extrabold text-[#8E2DA8]">
                              {formatMoney(monthTotal)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Asistencias del período seleccionado */}
                    {entries.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-[#E8D4F2]">
                        <h4 className="font-bold text-[#8E2DA8] mb-3">
                          Asistencias de {month} (
                          {fortnight === 1 ? "1-15" : "16-fin"}):
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {entries.map(([date, v]) => (
                            <div
                              key={date}
                              className="bg-[#FDF8FF] border border-[#E8D4F2] rounded-lg p-3"
                            >
                              <p className="font-semibold text-gray-800">
                                {date}
                              </p>
                              {/* Para días (per_day) NO mostramos texto de 'completo/medio' */}
                              {isHoursDay(v) ? (
                                <p className="text-sm font-medium text-sky-700">
                                  {v.hours} h{" "}
                                  {v.from && v.to ? (
                                    <span className="text-gray-500">
                                      ({v.from}–{v.to})
                                    </span>
                                  ) : null}
                                </p>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Totales generales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white rounded-xl p-6 shadow-lg">
                  <div className="text-center">
                    <h2 className="text-xl font-bold mb-1">
                      Total a pagar (quincena)
                    </h2>
                    <p className="text-sm mb-2">
                      Mes: {month} — {fortnight === 1 ? "1-15" : "16-fin"}
                    </p>
                    <p className="text-3xl font-extrabold">
                      {formatMoney(totals.quincena)}
                    </p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-xl p-6 shadow-lg">
                  <div className="text-center">
                    <h2 className="text-xl font-bold mb-1">
                      Total a pagar (mes)
                    </h2>
                    <p className="text-sm mb-2">Mes: {month}</p>
                    <p className="text-3xl font-extrabold">
                      {formatMoney(totals.mes)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <div className="mt-8">
          <ProTipBanner
            title="Tip de nómina"
            text="Antes de cerrar la quincena, revisa que todas las asistencias estén marcadas y corrige horas si es necesario."
          />
        </div>
      </main>

      <AppFooter appName="InManager" />
    </div>
  );
};

export default Payroll;
