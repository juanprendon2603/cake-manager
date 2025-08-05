import { useState } from "react";
import { db } from "../../lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { format } from "date-fns";

export function AddExpense() {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description || amount <= 0) {
      setMessage("Todos los campos son obligatorios.");
      return;
    }

    const today = format(new Date(), "yyyy-MM-dd");
    const docRef = doc(db, "sales", today);
    const docSnap = await getDoc(docRef);

    const expense = {
      description: description,
      value: amount,
      paymentMethod,
    };

    if (docSnap.exists()) {
      await updateDoc(docRef, {
        expenses: arrayUnion(expense),
      });
    } else {
      await setDoc(docRef, {
        fecha: today,
        sales: [],
        expenses: [expense],
      });
    }

    setMessage("Gasto registrado correctamente.");
    setDescription("");
    setAmount(0);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6">
        <h2 className="text-3xl font-bold text-center text-green-700">Registrar gasto</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-semibold mb-1">Descripción</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Harina, transporte, etc."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Método de pago</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="cash">Efectivo</option>
              <option value="transfer">Transferencia</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Valor</label>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 transition"
          >
            Guardar gasto
          </button>
        </form>
        {message && (
          <p className="text-center font-medium text-sm text-gray-800">{message}</p>
        )}
      </div>
    </main>
  );
}