import { format } from "date-fns";
import {
  collection, addDoc, doc, setDoc,
  serverTimestamp, increment
} from "firebase/firestore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../../components/BackButton";
import { FullScreenLoader } from "../../components/FullScreenLoader";
import { useToast } from "../../hooks/useToast";
import { db } from "../../lib/firebase";
import { motion, AnimatePresence, cubicBezier } from "framer-motion";

const easeM3 = cubicBezier(0.4, 0, 0.2, 1);

export function AddExpense() {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const paymentLabel = (pm: string) =>
    pm === "cash" ? "Efectivo" : pm === "transfer" ? "Transferencia" : pm;

  const validate = () => {
    if (!description.trim() || !amount || Number(amount) <= 0) {
      addToast({
        type: "error",
        title: "Datos incompletos",
        message:
          "Todos los campos son obligatorios y el valor debe ser mayor a 0.",
        duration: 4500,
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
  
    setLoading(true);
    try {
      const now = new Date();
      const dayKey = format(now, "yyyy-MM-dd");
      const monthKey = dayKey.slice(0, 7);
  
      // refs
      const expensesColRef = collection(db, "sales_monthly", monthKey, "expenses");
      const monthRef = doc(db, "sales_monthly", monthKey);
  
      const expense = {
        day: dayKey,
        createdAt: serverTimestamp(),
        description: description.trim(),
        paymentMethod,               // 'cash' | 'transfer' | ...
        valueCOP: Number(amount),    // normalizado en COP
      };
  
      // 1) guardar gasto como documento individual
      await addDoc(expensesColRef, expense);
  
      // 2) (opcional recomendado) actualizar agregados del mes
      //    crea el doc del mes si no existe y suma con increment()
      await setDoc(
        monthRef,
        {
          month: monthKey,
          updatedAt: serverTimestamp(),
          totals: {
            expensesAmount: increment(Number(amount)),
            expensesCount: increment(1),
          },
        },
        { merge: true }
      );
  
      // listo UI
      addToast({
        type: "success",
        title: "¡Gasto registrado! 💸",
        message: "Se guardó correctamente.",
        duration: 5000,
      });
  
      setDescription("");
      setAmount("");
      setTimeout(() => navigate("/sales"), 700);
    } catch (error) {
      addToast({
        type: "error",
        title: "Ups, algo salió mal",
        message: (error as Error).message ?? "Error al registrar el gasto.",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };
  

  const inputBase =
    "w-full border-2 border-purple-200/70 rounded-xl px-4 py-3 bg-white/70 backdrop-blur focus:outline-none focus:border-purple-500 transition-all duration-200 placeholder:text-gray-400";

  if (loading) {
    return <FullScreenLoader message="💾 Guardando gasto..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex flex-col">
      <main className="flex-grow px-6 py-8 sm:py-12 max-w-5xl mx-auto w-full">
        <header className="mb-12 text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl opacity-10"></div>

          <div className="relative z-10 py-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl shadow-xl ring-4 ring-purple-200">
                💸
              </div>
            </div>

            <h1 className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-[#8E2DA8] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent mb-4 drop-shadow-[0_2px_12px_rgba(142,45,168,0.25)]">
              Registrar Gasto
            </h1>
            <p className="text-xl text-gray-700 font-medium mb-8">
              Añade un gasto del día con su método de pago.
            </p>

            <div className="absolute top-4 left-4">
              <BackButton />
            </div>
          </div>
        </header>

        <section className="max-w-xl mx-auto bg-white/80 backdrop-blur-xl border-2 border-white/60 shadow-2xl rounded-3xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: easeM3 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-lg">💳</span>
                Método de pago
              </label>
              <motion.select
                whileFocus={{ scale: 1.01, boxShadow: "0 0 0 4px rgba(142,45,168,.12)" }}
                className={inputBase}
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="cash">💵 Efectivo</option>
                <option value="transfer">🏦 Transferencia</option>
              </motion.select>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: easeM3, delay: 0.05 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-lg">📝</span>
                Descripción
              </label>
              <motion.input
                whileFocus={{ scale: 1.01, boxShadow: "0 0 0 4px rgba(142,45,168,.12)" }}
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Harina, transporte, envíos…"
                className={inputBase}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: easeM3, delay: 0.1 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-lg">💰</span>
                Valor
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 select-none">$</span>
                <motion.input
                  whileFocus={{ scale: 1.01, boxShadow: "0 0 0 4px rgba(142,45,168,.12)" }}
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^\d]/g, "");
                    setAmount(raw === "" ? "" : Number(raw));
                  }}
                  className={`${inputBase} pl-8`}
                  placeholder="0"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Ingresa el valor en pesos colombianos.
              </p>
            </motion.div>

            <div className="pt-2">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-60"
                onClick={() => {
                  if (!validate()) return;
                  setShowConfirmModal(true);
                }}
                disabled={loading}
              >
                Guardar gasto
              </motion.button>
            </div>
          </form>
        </section>

        <div className="mt-8 max-w-xl mx-auto">
          <div className="bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white rounded-xl p-5 shadow-lg text-center">
            <p className="text-sm opacity-90">Tip</p>
            <p className="text-base">
              Usa descripciones claras para facilitar tu resumen diario.
            </p>
          </div>
        </div>
      </main>

      <footer className="text-center text-sm text-gray-400 py-6">
        © 2025 CakeManager. Todos los derechos reservados.
      </footer>

      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: easeM3 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="relative p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-purple-500 to-pink-500 opacity-10"></div>
                <div className="relative z-10 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl">
                    ✅
                  </div>
                  <h3 className="text-xl font-bold text-purple-700">
                    Confirmar gasto
                  </h3>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-600 mb-6">
                  Revisa los detalles antes de registrar:
                </p>

                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 block">Método de pago</span>
                        <span className="font-semibold text-gray-800">
                          {paymentLabel(paymentMethod)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Valor</span>
                        <span className="font-bold text-purple-700">
                          ${Number(amount || 0).toLocaleString("es-CO")}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500 block">Descripción</span>
                        <span className="font-medium text-gray-800">
                          {description || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowConfirmModal(false)}
                  className="px-5 py-3 text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-100 transition font-semibold"
                  disabled={loading}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowConfirmModal(false);
                    const fakeEvent = { preventDefault: () => {} } as unknown as React.FormEvent;
                    handleSubmit(fakeEvent);
                  }}
                  className="px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition font-bold disabled:opacity-60"
                  disabled={loading}
                >
                  Registrar gasto
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}