// src/pages/payments/FinalizePayment.tsx
import React, { useCallback, useEffect, useState } from "react";
import BaseModal from "../../components/BaseModal";
import { FullScreenLoader } from "../../components/FullScreenLoader";
import type {
  Fridge,
  MonthlyRecord,
  Shift,
  TemperatureRecord,
} from "../../types/fridge";
import {
  getLocalTodayString,
  listFridges,
  loadDailyTemperature,
  loadMonthlyRecords,
  monthKeyFromDateStr,
  saveTemperature,
} from "./fridge.service";

import { PageHero } from "../../components/ui/PageHero";
import { ProTipBanner } from "../../components/ui/ProTipBanner";
import { Snowflake } from "lucide-react";
import { BackButton } from "../../components/BackButton";
import { EmptyStateCTA } from "../../components/EmptyStateCTA";
import { useAuth } from "../../contexts/AuthContext";

const FridgeTemperature: React.FC = () => {
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const today = getLocalTodayString();

  const [loading, setLoading] = useState(false);
  const [temperatures, setTemperatures] = useState<TemperatureRecord>({});
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [monthlyRecords, setMonthlyRecords] = useState<MonthlyRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    monthKeyFromDateStr(today)
  ); // yyyy-MM

  const [fridges, setFridges] = useState<Fridge[]>([]);
  const [fridgeId, setFridgeId] = useState<string | null>(null);
  const selectedFridge = fridges.find((f) => f.id === fridgeId) || null;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const items = await listFridges();
        setFridges(items);
        setFridgeId((prev) => prev ?? items[0]?.id ?? null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadTemperatures = useCallback(async () => {
    if (!fridgeId) return;
    setLoading(true);
    try {
      const data = await loadDailyTemperature(today, fridgeId);
      setTemperatures(data);
    } catch (err) {
      console.error("Error cargando temperaturas:", err);
    } finally {
      setLoading(false);
    }
  }, [today, fridgeId]);

  useEffect(() => {
    loadTemperatures();
  }, [loadTemperatures]);

  const handleOpenMonthly = async () => {
    if (!fridgeId) return;
    setLoading(true);
    try {
      const data = await loadMonthlyRecords(selectedMonth, fridgeId);
      setMonthlyRecords(data);
      setShowHistory(true);
    } catch (err) {
      console.error("Error cargando registros del mes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentShift || !inputValue || !fridgeId) return;
    setLoading(true);
    try {
      const value = parseFloat(inputValue);
      await saveTemperature({
        date: today,
        fridgeId,
        shift: currentShift,
        value,
      });

      setTemperatures((prev) => ({ ...prev, [currentShift]: value }));
      setInputValue("");
      setCurrentShift(null);
    } catch (err) {
      console.error("Error guardando temperatura:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex flex-col items-center py-8 sm:py-10">
      {/* ====== Hero + Back siempre visibles ====== */}
      <div className="w-full max-w-6xl px-4">
        <div className="relative">
          <PageHero
            icon={<Snowflake className="w-10 h-10" />}
            title="Registro de Temperatura"
            subtitle="Registra la temperatura de tus enfriadores en la mañana y en la tarde."
            gradientClass="from-[#7a1f96] via-[#8E2DA8] to-[#a84bd1]"
            iconGradientClass="from-blue-600 to-cyan-600"
          />
          <div className="absolute top-4 left-4">
            <BackButton fallback="/admin" />
          </div>
        </div>
      </div>

      {/* ====== Loader debajo del hero ====== */}
      {loading ? (
        <div className="w-full max-w-6xl px-4 mt-6">
          <FullScreenLoader message="Cargando temperatura..." />
        </div>
      ) : !fridges.length ? (
        // ====== EmptyState sin contenedor extra (sin doble fondo) ======
        <div className="w-full max-w-3xl px-4 mt-6">
          <EmptyStateCTA
            title="No hay enfriadores"
            description={
              isAdmin
                ? "Aún no has creado ningún enfriador. Crea al menos uno para registrar temperaturas."
                : "No hay enfriadores disponibles. Pídele a un administrador que los cree."
            }
            to="/admin/fridges"
            buttonLabel="Ir al panel de Enfriadores"
            showButton={isAdmin}
            icon={<Snowflake className="w-8 h-8" />}
          />
        </div>
      ) : (
        <>
          {/* Subtítulo con nevera seleccionada */}
          <div className="w-full max-w-6xl px-4">
            {selectedFridge && (
              <p className="text-xs sm:text-sm text-gray-500 text-center -mt-2 sm:-mt-4">
                Nevera actual:{" "}
                <span className="font-semibold">{selectedFridge.name}</span>
                {selectedFridge.brand ? <> • {selectedFridge.brand}</> : null}
              </p>
            )}
          </div>

          {/* Controles */}
          <div className="w-full max-w-3xl px-4 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-end">
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Nevera</label>
                <select
                  value={fridgeId ?? ""}
                  onChange={(e) => setFridgeId(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-blue-200 bg-white text-sm font-medium text-blue-700 w-full"
                >
                  {fridges.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                      {f.brand ? ` — ${f.brand}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Mes</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-blue-200 bg-white text-sm font-medium text-blue-700 w-full"
                />
              </div>

              <div className="flex">
                <button
                  onClick={handleOpenMonthly}
                  className="px-4 py-2 sm:px-6 sm:py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow-lg hover:shadow-xl transition-all w-full"
                >
                  📊 Ver registros del mes
                </button>
              </div>
            </div>
          </div>

          {/* Grid turnos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full max-w-3xl px-4 mt-6">
            {(["morning", "afternoon"] as Shift[]).map((shift) => {
              const label = shift === "morning" ? "🌅 Mañana" : "🌇 Tarde";
              const value = temperatures[shift];
              return (
                <div
                  key={shift}
                  className={`relative bg-white/80 backdrop-blur-xl shadow-lg rounded-2xl p-4 sm:p-6 flex flex-col items-center border-2 transition-all duration-300 hover:shadow-xl ${
                    value !== undefined
                      ? "border-green-200 bg-gradient-to-br from-green-50/50 to-emerald-50/50"
                      : "border-white/60 hover:border-blue-200"
                  }`}
                >
                  {value !== undefined && (
                    <div className="absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm shadow-lg">
                      ✓
                    </div>
                  )}

                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
                    {label}
                  </h2>

                  {value !== undefined ? (
                    <p className="text-green-700 font-semibold text-base sm:text-lg">
                      {value.toFixed(1)} °C
                    </p>
                  ) : currentShift === shift ? (
                    <div className="flex flex-col items-center gap-3 w-full">
                      <input
                        type="number"
                        step="0.1"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ej: 4.5"
                        className="w-full border rounded-xl px-4 py-2 text-center text-base sm:text-lg focus:ring-2 focus:ring-blue-400"
                      />
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
                        <button
                          onClick={() => {
                            setCurrentShift(null);
                            setInputValue("");
                          }}
                          className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 w-full sm:w-auto"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleSave}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-lg w-full sm:w-auto"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setCurrentShift(shift)}
                      className="px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl w-full sm:w-auto"
                    >
                      Registrar temperatura
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Tip */}
          <div className="w-full max-w-3xl px-4 mt-6 sm:mt-8">
            <ProTipBanner
              title="Tip"
              text="Registra ambos turnos (mañana y tarde) para detectar variaciones. Si un valor luce atípico, espera 5 minutos y vuelve a medir. Usa “Ver registros del mes” para tendencias."
              gradientClass="from-[#7a1f96] via-[#8E2DA8] to-[#a84bd1]"
            />
          </div>

          {/* Modal historial */}
          <BaseModal
            isOpen={showHistory}
            onClose={() => setShowHistory(false)}
            headerAccent="indigo"
            title={`📅 Registros — ${selectedMonth}`}
            description={
              selectedFridge ? (
                <>
                  {selectedFridge.name}
                  {selectedFridge.brand ? <> • {selectedFridge.brand}</> : null}
                </>
              ) : null
            }
            secondaryAction={{ label: "Cerrar", onClick: () => setShowHistory(false) }}
          >
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                    <th className="p-2 rounded-l-lg text-left text-sm sm:text-base">Fecha</th>
                    <th className="p-2 text-sm sm:text-base">Mañana</th>
                    <th className="p-2 rounded-r-lg text-sm sm:text-base">Tarde</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyRecords.map((rec) => (
                    <tr key={rec.date} className="odd:bg-gray-50 even:bg-white hover:bg-blue-50 transition">
                      <td className="p-2 font-medium text-gray-700 text-sm sm:text-base">{rec.date}</td>
                      <td className="p-2 text-center text-sm sm:text-base">{rec.morning ?? "-"}</td>
                      <td className="p-2 text-center text-sm sm:text-base">{rec.afternoon ?? "-"}</td>
                    </tr>
                  ))}
                  {monthlyRecords.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-gray-500">
                        No hay registros para este mes.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </BaseModal>
        </>
      )}
    </div>
  );
};

export default FridgeTemperature;
