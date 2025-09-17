// src/pages/payroll/PayrollSimple.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Person, ShiftKind } from "../../types/payroll";
import {
  loadPeopleWithoutNancy,
  markAttendanceForPerson,
} from "./payroll.service";
import { FullScreenLoader } from "../../components/FullScreenLoader";
import ConfirmAttendanceModal from "../../components/ConfirmAttendanceModal";
import PayrollSummaryModal from "../../components/PayrollSummaryModal";
import { getLocalMonthString, getLocalTodayString } from "../../utils/dates";

const PayrollSimple: React.FC = () => {
  const [month] = useState<string>(getLocalMonthString());
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedShift, setSelectedShift] = useState<ShiftKind | null>(null);

  const navigate = useNavigate();
  const today = getLocalTodayString();

  const load = async () => {
    setLoading(true);
    try {
      const items = await loadPeopleWithoutNancy();
      setPeople(items);
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
      const updated = await markAttendanceForPerson({
        person: selectedPerson,
        month,
        date: today,
        shift: selectedShift,
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

      {/* People */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl px-4">
        {people.map((p) => {
          const hasMarkedToday = p.attendance?.[month]?.[today] !== undefined;
          const todayShift = p.attendance?.[month]?.[today];

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
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      todayShift === "completo"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {todayShift === "completo"
                      ? "🕐 Turno Completo"
                      : "⏰ Medio Turno"}
                  </span>
                </div>
              ) : (
                <p className="text-gray-500 text-sm mb-4">
                  Pendiente de marcar
                </p>
              )}

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
