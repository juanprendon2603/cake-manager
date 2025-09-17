// src/pages/payroll/Payroll.tsx
import React, { useEffect, useState } from "react";
import type { Fortnight, Person } from "../../types/payroll";
import {
  loadPeopleWithNancy,
  markAttendanceForPerson,
  calculateFortnightTotal,
  calculateGeneralTotal,
} from "./payroll.service";

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
      const items = await loadPeopleWithNancy();
      setPeople(items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markAttendance = async (personId: string, shift: "completo" | "medio") => {
    const today = new Date().toISOString().slice(0, 10);
    const person = people.find((p) => p.id === personId);
    if (!person) return;

    const updated = await markAttendanceForPerson({
      person,
      month,
      date: today,
      shift,
    });

    setPeople((curr) =>
      curr.map((p) => (p.id === personId ? { ...p, attendance: updated } : p))
    );
  };

  return (
    <div className="min-h-screen bg-[#FDF8FF] flex flex-col">
      <main className="flex-grow p-6 sm:p-12 max-w-6xl mx-auto w-full">
        <header className="mb-10 text-center">
          <h1 className="text-5xl font-extrabold text-[#8E2DA8] mb-4">
            Nómina
          </h1>
          <p className="text-lg text-gray-700">
            Gestión de asistencia y pagos del personal
          </p>
        </header>

        <div className="bg-white border border-[#E8D4F2] shadow-md rounded-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <label className="text-lg font-semibold text-[#8E2DA8]">
              Seleccionar mes:
            </label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border border-[#E8D4F2] p-3 rounded-lg text-center"
            />

            <select
              value={fortnight}
              onChange={(e) => setFortnight(Number(e.target.value) as 1 | 2)}
              className="border border-[#E8D4F2] p-3 rounded-lg"
            >
              <option value={1}>Primera Quincena (1-15)</option>
              <option value={2}>Segunda Quincena (16-fin)</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#8E2DA8]" />
            <p className="mt-4 text-lg text-gray-600">Cargando personal...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {people.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-[#E8D4F2] shadow-md rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-[#8E2DA8] mb-2">
                      {p.firstName} {p.lastName}
                    </h3>
                    <div className="space-y-1 mb-4">
                      <p className="text-gray-600">
                        {p.fixedFortnightPay && p.fixedFortnightPay > 0 ? (
                          <>
                            <span className="font-semibold">
                              Pago fijo quincenal:
                            </span>{" "}
                            ${p.fixedFortnightPay.toLocaleString()}
                          </>
                        ) : (
                          <>
                            <span className="font-semibold">
                              Valor por día:
                            </span>{" "}
                            ${p.valuePerDay.toLocaleString()}
                          </>
                        )}
                      </p>
                      <p className="text-lg font-bold text-[#8E2DA8]">
                        <span className="font-semibold">
                          Total {month} ({fortnight === 1 ? "1-15" : "16-fin"}):
                        </span>{" "}
                        ${calculateFortnightTotal(p, month, fortnight).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {p.id !== "local-nancy-canas" && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => markAttendance(p.id, "completo")}
                        className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-semibold shadow-md"
                      >
                        Turno Completo
                      </button>
                      <button
                        onClick={() => markAttendance(p.id, "medio")}
                        className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors font-semibold shadow-md"
                      >
                        Medio Turno
                      </button>
                    </div>
                  )}
                </div>

                {p.attendance?.[month] &&
                  Object.keys(p.attendance[month]).length > 0 && (
                    <div className="mt-6 pt-4 border-t border-[#E8D4F2]">
                      <h4 className="font-bold text-[#8E2DA8] mb-3">
                        Asistencias de {month} (
                        {fortnight === 1 ? "1-15" : "16-fin"}):
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {Object.entries(p.attendance[month])
                          .filter(([date]) => {
                            const day = parseInt(date.split("-")[2], 10);
                            return fortnight === 1 ? day <= 15 : day > 15;
                          })
                          .map(([date, shift]) => (
                            <div
                              key={date}
                              className="bg-[#FDF8FF] border border-[#E8D4F2] rounded-lg p-3"
                            >
                              <p className="font-semibold text-gray-800">
                                {date}
                              </p>
                              <p
                                className={`text-sm font-medium ${
                                  shift === "completo"
                                    ? "text-green-600"
                                    : "text-yellow-600"
                                }`}
                              >
                                {shift === "completo"
                                  ? "Turno Completo"
                                  : "Medio Turno"}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
              </div>
            ))}

            <div className="bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white rounded-xl p-6 shadow-lg">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Total a Pagar</h2>
                <p className="text-lg mb-2">
                  Mes: {month} ({fortnight === 1 ? "1-15" : "16-fin"})
                </p>
                <p className="text-4xl font-extrabold">
                  ${calculateGeneralTotal(people, month, fortnight).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="text-center text-sm text-gray-400 py-4">
        © 2025 CakeManager. Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default Payroll;
