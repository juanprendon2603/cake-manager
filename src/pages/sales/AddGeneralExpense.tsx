import { format } from "date-fns";
import { arrayUnion, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../../components/BackButton";
import { FullScreenLoader } from "../../components/FullScreenLoader";
import { useToast } from "../../hooks/useToast";
import { db } from "../../lib/firebase";

export function AddGeneralExpense() {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [message, setMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { addToast } = useToast();
  const navigate = useNavigate();

  const paymentLabel = (pm: string) =>
    pm === "cash" ? "Efectivo" : pm === "transfer" ? "Transferencia" : pm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!description.trim() || !amount || Number(amount) <= 0) {
      setMessage(
        "Todos los campos son obligatorios y el valor debe ser mayor a 0."
      );
      return;
    }

    setLoading(true);
    try {
      const currentMonth = format(new Date(), "yyyy-MM");
      const docRef = doc(db, "generalExpenses", currentMonth);
      const docSnap = await getDoc(docRef);

      const expense = {
        description: description.trim(),
        value: Number(amount),
        paymentMethod,
        date: format(new Date(), "yyyy-MM-dd"),
      };

      if (docSnap.exists()) {
        await updateDoc(docRef, { expenses: arrayUnion(expense) });
      } else {
        await setDoc(docRef, { month: currentMonth, expenses: [expense] });
      }

      addToast({
        type: "success",
        title: "Gasto general registrado!",
        message: "Gasto registrado correctamente.",
        duration: 5000,
      });

      setDescription("");
      setAmount("");
      setTimeout(() => navigate("/general-expenses"), 800);
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
    "w-full border border-[#E8D4F2] rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#8E2DA8] focus:border-transparent placeholder:text-gray-400";

  if (loading) {
    return <FullScreenLoader message="Guardando gasto general..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex flex-col">
      <main className="flex-grow p-6 sm:p-12 max-w-6xl mx-auto w-full">
        <header className="mb-12 text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl opacity-10"></div>
          
          <div className="relative z-10 py-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl shadow-xl ring-4 ring-purple-200">
                💸
              </div>
            </div>
            
            <h1 className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-[#8E2DA8] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent mb-4 drop-shadow-[0_2px_12px_rgba(142,45,168,0.25)]">
              Registrar Gasto General
            </h1>
            <p className="text-xl text-gray-700 font-medium mb-8">
              Añade un gasto general del mes
            </p>
            
            <div className="absolute top-4 left-4">
              <BackButton />
            </div>
          </div>
        </header>

        <section className="max-w-xl mx-auto bg-white border border-[#E8D4F2] shadow-md rounded-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Método de pago
              </label>
              <select
                className={inputBase}
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="cash">Efectivo</option>
                <option value="transfer">Transferencia</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Descripción
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Servicios públicos, arriendo, insumos generales..."
                className={inputBase}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Valor
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) =>
                    setAmount(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className={`${inputBase} pl-8`}
                  placeholder="0"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Ingresa el valor en pesos colombianos.
              </p>
            </div>

            <button
              type="button"
              className="w-full bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white py-3.5 rounded-xl font-semibold shadow-md hover:opacity-95 transition disabled:opacity-60"
              onClick={() => {
                if (!description.trim() || !amount || Number(amount) <= 0) {
                  setMessage(
                    "Todos los campos son obligatorios y el valor debe ser mayor a 0."
                  );
                  return;
                }
                setShowConfirmModal(true);
              }}
              disabled={loading}
            >
              Guardar gasto
            </button>
          </form>

          {message && (
            <div
              className={`mt-4 rounded-lg px-4 py-3 text-sm ${
                message.includes("correctamente")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}
        </section>

        <div className="mt-8 max-w-xl mx-auto">
          <div className="bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white rounded-xl p-5 shadow-lg text-center">
            <p className="text-sm opacity-90">Tip</p>
            <p className="text-base">
              Usa descripciones claras para facilitar tu resumen mensual.
            </p>
          </div>
        </div>
      </main>

      <footer className="text-center text-sm text-gray-400 py-6">
        © 2025 CakeManager. Todos los derechos reservados.
      </footer>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-[#8E2DA8]">
                Confirmar gasto general
              </h3>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Revisa los detalles antes de registrar:
              </p>

              <div className="space-y-3 text-sm text-gray-800">
                <div className="flex justify-between">
                  <span className="text-gray-500">Método de pago</span>
                  <span className="font-medium">
                    {paymentLabel(paymentMethod)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Descripción</span>
                  <span className="font-medium text-right">
                    {description || "-"}
                  </span>
                </div>

                <div className="h-px bg-gray-200 my-2" />

                <div className="flex justify-between text-base">
                  <span className="text-gray-700 font-semibold">Valor</span>
                  <span className="font-bold text-[#8E2DA8]">
                    ${Number(amount || 0).toLocaleString("es-CO")}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  const fakeEvent = {
                    preventDefault: () => {},
                  } as unknown as React.FormEvent;
                  handleSubmit(fakeEvent);
                }}
                className="px-4 py-2 bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white rounded-lg hover:opacity-95 transition disabled:opacity-60"
                disabled={loading}
              >
                Registrar gasto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}