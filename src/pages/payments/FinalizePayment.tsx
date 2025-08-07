import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs, updateDoc, doc, getDoc, setDoc, arrayUnion } from "firebase/firestore";

export function FinalizePayment() {
  const [payments, setPayments] = useState([]);
  const [paymentModal, setPaymentModal] = useState(null);
  const [showPartialInput, setShowPartialInput] = useState(false);
  const [partialAmount, setPartialAmount] = useState("");

  // Cargar pagos
  useEffect(() => {
    async function fetchPayments() {
      const paymentsCol = collection(db, "payments");
      const paymentsSnap = await getDocs(paymentsCol);
      let allPayments = [];
      paymentsSnap.forEach((doc) => {
        const data = doc.data();
        if (data.payments) {
          allPayments = allPayments.concat(data.payments.map((p) => ({ ...p, date: data.date })));
        }
      });
      setPayments(allPayments);
    }
    fetchPayments();
  }, []);

  const handleFinalize = (payment) => {
    setPaymentModal(payment);
    setShowPartialInput(false);
    setPartialAmount("");
  };

  // Descontar stock si no se ha descontado
  const handleStockDiscount = async (payment) => {
    if (payment.deductedFromStock) return; // Ya descontó

    const stockRef = doc(db, "stock", `${payment.type}_${payment.size}`);
    const stockSnap = await getDoc(stockRef);

    if (!stockSnap.exists()) return;

    const stockData = stockSnap.data();

    if (payment.type === "cake") {
      const currentQuantity = stockData.flavors?.[payment.flavor] || 0;
      const updatedFlavors = {
        ...stockData.flavors,
        [payment.flavor]: currentQuantity - payment.quantity,
      };
      await updateDoc(stockRef, { flavors: updatedFlavors });
    } else if (payment.type === "sponge") {
      const currentQuantity = stockData.quantity || 0;
      await updateDoc(stockRef, { quantity: currentQuantity - payment.quantity });
    }
  };

  // Finalizar pago completo
  const confirmFinalizeFull = async () => {
    if (!paymentModal) return;
    // Descontar stock si no se ha descontado
    await handleStockDiscount(paymentModal);

    // Actualizar el pago como finalizado
    const paymentDocRef = doc(db, "payments", paymentModal.orderDate);
    const docSnap = await getDoc(paymentDocRef);
    if (docSnap.exists()) {
      const currentPayments = docSnap.data().payments;
      const updatedPayments = currentPayments.map((p) =>
        p.id === paymentModal.id
          ? { ...p, paid: true, remaining: 0, status: "finalizado", deductedFromStock: true }
          : p
      );
      await updateDoc(paymentDocRef, { payments: updatedPayments });
    }

    alert("Pago finalizado correctamente.");
    setPaymentModal(null);
    reloadPayments();
  };

  // Finalizar pago parcial
  const confirmFinalizePartial = async () => {
    if (!paymentModal) return;
    const restante = parseFloat(partialAmount);
    if (isNaN(restante) || restante <= 0 || restante > paymentModal.amount) {
      alert("Ingresa un valor válido para el restante.");
      return;
    }

    // Descontar stock si no se ha descontado
    await handleStockDiscount(paymentModal);

    // Actualizar el pago como finalizado y remaining en 0
    const paymentDocRef = doc(db, "payments", paymentModal.orderDate);
    const docSnap = await getDoc(paymentDocRef);
    if (docSnap.exists()) {
      const currentPayments = docSnap.data().payments;
      const updatedPayments = currentPayments.map((p) =>
        p.id === paymentModal.id
          ? { ...p, paid: true, remaining: 0, status: "finalizado", deductedFromStock: true }
          : p
      );
      await updateDoc(paymentDocRef, { payments: updatedPayments });
    }

    // Agregar el restante como venta del día (sin descontar stock)
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const salesRef = doc(db, "sales", todayStr);
    const salesSnap = await getDoc(salesRef);

    const saleItem = {
      id: Date.now().toString(),
      type: paymentModal.type,
      size: paymentModal.size,
      flavor: paymentModal.flavor,
      quantity: paymentModal.quantity,
      monto: restante,
      paymentMethod: paymentModal.paymentMethod,
      isPaymentFinalization: true,
    };

    if (salesSnap.exists()) {
      await updateDoc(salesRef, {
        sales: arrayUnion(saleItem),
      });
    } else {
      await setDoc(salesRef, {
        fecha: todayStr,
        sales: [saleItem],
        expenses: [],
      });
    }

    alert("Pago finalizado y restante registrado como venta.");
    setPaymentModal(null);
    reloadPayments();
  };

  // Recargar pagos
  const reloadPayments = async () => {
    const paymentsCol = collection(db, "payments");
    const paymentsSnap = await getDocs(paymentsCol);
    let allPayments = [];
    paymentsSnap.forEach((doc) => {
      const data = doc.data();
      if (data.payments) {
        allPayments = allPayments.concat(data.payments.map((p) => ({ ...p, date: data.date })));
      }
    });
    setPayments(allPayments);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-2">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-green-700 text-center">List of Payments</h2>
        <ul className="divide-y divide-gray-200">
          {payments.length === 0 && (
            <li className="text-gray-500 text-center py-8">No payments found.</li>
          )}
          {payments.map((payment) => (
            <li
              key={payment.id}
              className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
            >
              <div>
                <span className="font-semibold text-gray-700">{payment.date}</span>
                <span className="mx-2 text-gray-400">|</span>
                <span className="capitalize">{payment.type}</span>
                <span className="mx-1">{payment.size}</span>
                <span className="mx-1">{payment.flavor}</span>
                <span className="mx-2 text-gray-400">|</span>
                <span className="text-green-700 font-bold">${payment.amount}</span>
                {payment.remaining > 0 && (
                  <span className="ml-2 text-yellow-600 font-semibold">
                    (Remaining: ${payment.remaining})
                  </span>
                )}
              </div>
              <div>
                {!payment.paid ? (
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition"
                    onClick={() => handleFinalize(payment)}
                  >
                    Finalize
                  </button>
                ) : (
                  <span className="text-green-600 font-semibold">Finalizado</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal */}
      {paymentModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-green-700">Finalize Payment</h3>
            <div className="mb-4 text-gray-700">
              <div>
                <span className="font-semibold">Total Amount:</span> ${paymentModal.amount}
              </div>
              <div>
                <span className="font-semibold">Current Remaining:</span> ${paymentModal.remaining ?? 0}
              </div>
              <div className="mt-2 text-sm text-gray-500">
                ¿El cliente pagó el valor completo o solo una parte?
              </div>
            </div>
            {!showPartialInput ? (
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold transition"
                  onClick={confirmFinalizeFull}
                >
                  Pagó todo
                </button>
                <button
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded font-semibold transition"
                  onClick={() => setShowPartialInput(true)}
                >
                  Pagó solo una parte
                </button>
                <button
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded font-semibold transition"
                  onClick={() => setPaymentModal(null)}
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div>
                <label className="block font-semibold mb-2">¿Cuánto pagó?</label>
                <input
                  type="number"
                  min="1"
                  max={paymentModal.amount}
                  value={partialAmount}
                  onChange={(e) => setPartialAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
                  placeholder="Valor pagado"
                />
                <div className="flex gap-2">
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold transition"
                    onClick={confirmFinalizePartial}
                  >
                    Guardar y finalizar
                  </button>
                  <button
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded font-semibold transition"
                    onClick={() => {
                      setShowPartialInput(false);
                      setPartialAmount("");
                    }}
                  >
                    Volver
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}