import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState, useCallback } from "react";
import { db } from "../../lib/firebase";
import { FullScreenLoader } from "../../components/FullScreenLoader";

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const getLocalTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

type Shift = "morning" | "afternoon";

interface TemperatureRecord {
  morning?: number;
  afternoon?: number;
}

interface MonthlyRecord extends TemperatureRecord {
  date: string; // yyyy-mm-dd
}

const FridgeTemperature: React.FC = () => {
  const today = getLocalTodayString();
  const [loading, setLoading] = useState(false);
  const [temperatures, setTemperatures] = useState<TemperatureRecord>({});
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [monthlyRecords, setMonthlyRecords] = useState<MonthlyRecord[]>([]);

  const loadTemperatures = useCallback(async () => {
    setLoading(true);
    try {
      const ref = doc(db, "fridgeTemperatures", today);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setTemperatures(snap.data() as TemperatureRecord);
      }
    } catch (err) {
      console.error("Error cargando temperaturas:", err);
    } finally {
      setLoading(false);
    }
  }, [today]);

  const loadMonthlyRecords = async () => {
    setLoading(true);
    try {
      const ref = collection(db, "fridgeTemperatures");
      const snaps = await getDocs(ref);
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;

      const data: MonthlyRecord[] = [];
      snaps.forEach((docSnap) => {
        const id = docSnap.id; // yyyy-mm-dd
        if (id.startsWith(currentMonth)) {
          const record = docSnap.data() as TemperatureRecord;
          data.push({ date: id, ...record });
        }
      });

      // ordenar por fecha ascendente
      data.sort((a, b) => (a.date < b.date ? -1 : 1));
      setMonthlyRecords(data);
      setShowHistory(true);
    } catch (err) {
      console.error("Error cargando registros del mes:", err);
    } finally {
      setLoading(false);
    }
  };


  // ✅ Ahora el warning desaparece
  useEffect(() => {
    loadTemperatures();
  }, [loadTemperatures]);


  const handleSave = async () => {
    if (!currentShift || !inputValue) return;
    setLoading(true);
    try {
      const ref = doc(db, "fridgeTemperatures", today);
      const tempValue = parseFloat(inputValue);

      if (!temperatures.morning && !temperatures.afternoon) {
        await setDoc(ref, { [currentShift]: tempValue });
      } else {
        await updateDoc(ref, { [currentShift]: tempValue });
      }

      setTemperatures((prev) => ({ ...prev, [currentShift]: tempValue }));
      setInputValue("");
      setCurrentShift(null);
    } catch (err) {
      console.error("Error guardando temperatura:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <FullScreenLoader message="Cargando temperatura..." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex flex-col items-center py-10">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-3xl shadow-lg">
            ❄️
          </div>
        </div>
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
          Registro de Temperatura
        </h1>
        <p className="text-gray-600 max-w-md mx-auto">
          Registra la temperatura del enfriador en la mañana y en la tarde
        </p>
      </div>

      {/* Botón historial */}
      <button
        onClick={loadMonthlyRecords}
        className="mb-8 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow-lg hover:shadow-xl transition-all"
      >
        📊 Ver registros del mes
      </button>

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
      {showHistory && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-3xl w-full overflow-y-auto max-h-[80vh]">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📅 Registros del mes</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                  <th className="p-2 rounded-l-lg">Fecha</th>
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
              </tbody>
            </table>
            <div className="text-right mt-4">
              <button
                onClick={() => setShowHistory(false)}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md hover:shadow-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FridgeTemperature;
