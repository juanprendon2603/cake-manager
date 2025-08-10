import { useState } from "react";
import { db } from "../../lib/firebase";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { format } from "date-fns";

export function AddExpense() {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [message, setMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!description.trim() || !amount || Number(amount) <= 0) {
      setMessage("Todos los campos son obligatorios y el valor debe ser mayor a 0.");
      return;
    }

    const today = format(new Date(), "yyyy-MM-dd");
    const docRef = doc(db, "sales", today);
    const docSnap = await getDoc(docRef);

    const expense = {
      description: description.trim(),
      value: Number(amount),
      paymentMethod,
    };

    if (docSnap.exists()) {
      await updateDoc(docRef, { expenses: arrayUnion(expense) });
    } else {
      await setDoc(docRef, { fecha: today, sales: [], expenses: [expense] });
    }

    setMessage("Gasto registrado correctamente.");
    setDescription("");
    setAmount("");
  };

  const inputBase =
    "w-full border border-[#E8D4F2] rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#8E2DA8] focus:border-transparent placeholder:text-gray-400";

  return (
    <div className="min-h-screen bg-[#FDF8FF] flex flex-col">
      <main className="flex-grow p-6 sm:p-12 max-w-6xl mx-auto w-full">
        <header className="mb-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[#8E2DA8]">
            Registrar Gasto
          </h2>
          <p className="text-gray-700 mt-2">
            Añade un gasto del día con su método de pago.
          </p>
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
                placeholder="Ej: Harina, transporte, envíos…"
                className={inputBase}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Valor
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  className={`${inputBase} pl-8`}
                  placeholder="0"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Ingresa el valor en pesos colombianos.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white py-3.5 rounded-xl font-semibold shadow-md hover:opacity-95 transition disabled:opacity-60"
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
              Usa descripciones claras para facilitar tu resumen diario.
            </p>
          </div>
        </div>
      </main>

      <footer className="text-center text-sm text-gray-400 py-6">
        © 2025 CakeManager. Todos los derechos reservados.
      </footer>
    </div>
  );
}