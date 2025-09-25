// src/pages/payments/FinalizePayment.tsx
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const FridgeTemperature: React.FC = () => {
  const navigate = useNavigate();
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

  // Cargar neveras activas
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const items = await listFridges(); // solo activas
        setFridges(items);
        setFridgeId((prev) => prev ?? items[0]?.id ?? null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /** 1) Cargar temperaturas del día para la nevera seleccionada */
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

  /** 2) Cargar historial mensual (por nevera) */
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

  /** 3) Guardar temperatura (diario + mensual) */
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

  if (loading) return <FullScreenLoader message="Cargando temperatura..." />;

  if (!fridges.length) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow p-6 text-center">
          <div className="text-4xl mb-2">❄️</div>
          <h2 className="text-xl font-bold mb-2">No hay enfriadores</h2>
          <p className="text-gray-600 mb-4">
            Aún no has creado ningún enfriador. Debes crear al menos uno para
            registrar temperaturas.
          </p>
          <button
            onClick={() => navigate("/admin/fridges")}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold"
          >
            Ir al panel de Enfriadores
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex flex-col items-center py-10">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-3xl shadow-lg">
            ❄️
          </div>
        </div>
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-1">
          Registro de Temperatura
        </h1>
        {selectedFridge && (
          <>
            <p className="text-gray-600 max-w-md mx-auto">
              Registra la temperatura de tus enfriadores en la mañana y en la
              tarde.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Nevera actual:{" "}
              <span className="font-semibold">{selectedFridge.name}</span>
              {selectedFridge.brand ? <> • {selectedFridge.brand}</> : null}
            </p>
          </>
        )}
      </div>

      {/* Controles */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="text-sm text-gray-600">Nevera</label>
        <select
          value={fridgeId ?? ""}
          onChange={(e) => setFridgeId(e.target.value)}
          className="px-3 py-2 rounded-xl border border-blue-200 bg-white text-sm font-medium text-blue-700"
        >
          {fridges.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
              {f.brand ? ` — ${f.brand}` : ""}
            </option>
          ))}
        </select>

        <label className="text-sm text-gray-600 ml-2">Mes</label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-2 rounded-xl border border-blue-200 bg-white text-sm font-medium text-blue-700"
        />
        <button
          onClick={handleOpenMonthly}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow-lg hover:shadow-xl transition-all"
        >
          📊 Ver registros del mes
        </button>
      </div>

      {/* Grid turnos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl px-4">
        {(["morning", "afternoon"] as Shift[]).map((shift) => {
          const label = shift === "morning" ? "🌅 Mañana" : "🌇 Tarde";
          const value = temperatures[shift];
          return (
            <div
              key={shift}
              className={`relative bg-white/80 backdrop-blur-xl shadow-lg rounded-2xl p-6 flex flex-col items-center border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                value !== undefined
                  ? "border-green-200 bg-gradient-to-br from-green-50/50 to-emerald-50/50"
                  : "border-white/60 hover:border-blue-200"
              }`}
            >
              {value !== undefined && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm shadow-lg">
                  ✓
                </div>
              )}

              <h2 className="text-xl font-bold text-gray-800 mb-4">{label}</h2>

              {value !== undefined ? (
                <p className="text-green-700 font-semibold text-lg">
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
                    className="w-full border rounded-xl px-4 py-2 text-center text-lg focus:ring-2 focus:ring-blue-400"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setCurrentShift(null);
                        setInputValue("");
                      }}
                      className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-lg"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setCurrentShift(shift)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  Registrar temperatura
                </button>
              )}
            </div>
          );
        })}
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
        secondaryAction={{
          label: "Cerrar",
          onClick: () => setShowHistory(false),
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                <th className="p-2 rounded-l-lg text-left">Fecha</th>
                <th className="p-2">Mañana</th>
                <th className="p-2 rounded-r-lg">Tarde</th>
              </tr>
            </thead>
            <tbody>
              {monthlyRecords.map((rec) => (
                <tr
                  key={rec.date}
                  className="odd:bg-gray-50 even:bg-white hover:bg-blue-50 transition"
                >
                  <td className="p-2 font-medium text-gray-700">{rec.date}</td>
                  <td className="p-2 text-center">{rec.morning ?? "-"}</td>
                  <td className="p-2 text-center">{rec.afternoon ?? "-"}</td>
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
    </div>
  );
};

export default FridgeTemperature;
