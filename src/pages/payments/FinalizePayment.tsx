import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs, updateDoc, doc, getDoc, setDoc, arrayUnion, Timestamp } from "firebase/firestore";

type PaymentType = "cake" | "sponge";

interface BasePayment {
  id: string;
  type: PaymentType;
  size: string;                 // ej: "cuarto_redondo"
  amount: number;               // valor total del pedido
  remaining?: number;           // pendiente por pagar
  paid?: boolean;               // ya finalizado?
  deductedFromStock?: boolean;  // ya descontó del stock?
  paymentMethod: string;        // "cash", "transfer", etc.
  orderDate: string;            // ID del doc (yyyy-mm-dd)
  date?: string;                // fecha del grupo del doc que contenía este pago
  isPayment?: boolean;
  totalPayment?: boolean;
}

interface CakePayment extends BasePayment {
  type: "cake";
  flavor: string;               // ej: "vainilla_chips"
  quantity: number;
}

interface SpongePayment extends BasePayment {
  type: "sponge";
  quantity: number;
  // sin flavor para sponge
}

type Payment = CakePayment | SpongePayment;

interface PaymentsDoc {
  date: string;
  payments: Payment[];
  last_update?: Timestamp;
}

interface SaleItem {
  id: string;
  type: PaymentType;
  size: string;
  flavor?: string;
  quantity: number;
  monto: number;
  paymentMethod: string;
  isPaymentFinalization: true;
}

export function FinalizePayment() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentModal, setPaymentModal] = useState<Payment | null>(null);
  const [showPartialInput, setShowPartialInput] = useState(false);
  const [partialAmount, setPartialAmount] = useState("");

  useEffect(() => {
    async function fetchPayments() {
      const paymentsCol = collection(db, "payments");
      const paymentsSnap = await getDocs(paymentsCol);

      const allPayments: Payment[] = [];
      paymentsSnap.forEach((snap) => {
        const data = snap.data() as Partial<PaymentsDoc>;
        const docDate = data.date;
        const list = Array.isArray(data.payments) ? data.payments : [];

        for (const p of list) {
          if (p && (p as Payment).type === "cake") {
            const cp = {
              id: String((p as Payment).id),
              type: "cake" as const,
              size: String((p as Payment).size),
              flavor: String((p as CakePayment).flavor),
              quantity: Number((p as CakePayment).quantity),
              amount: Number((p as Payment).amount),
              remaining: (p as Payment).remaining !== undefined ? Number((p as Payment).remaining) : undefined,
              paid: (p as Payment).paid,
              deductedFromStock: (p as Payment).deductedFromStock,
              paymentMethod: String((p as Payment).paymentMethod ?? ""),
              orderDate: String((p as Payment).orderDate ?? ""),
              date: docDate,
              isPayment: (p as Payment).isPayment,
              totalPayment: (p as Payment).totalPayment,
            } satisfies CakePayment;
            allPayments.push(cp);
          } else if (p && (p as Payment).type === "sponge") {
            const sp = {
              id: String((p as Payment).id),
              type: "sponge" as const,
              size: String((p as Payment).size),
              quantity: Number((p as SpongePayment).quantity),
              amount: Number((p as Payment).amount),
              remaining: (p as Payment).remaining !== undefined ? Number((p as Payment).remaining) : undefined,
              paid: (p as Payment).paid,
              deductedFromStock: (p as Payment).deductedFromStock,
              paymentMethod: String((p as Payment).paymentMethod ?? ""),
              orderDate: String((p as Payment).orderDate ?? ""),
              date: docDate,
              isPayment: (p as Payment).isPayment,
              totalPayment: (p as Payment).totalPayment,
            } satisfies SpongePayment;
            allPayments.push(sp);
          }
        }
      });

      setPayments(allPayments);
    }
    fetchPayments();
  }, []);

  const handleFinalize = (payment: Payment) => {
    setPaymentModal(payment);
    setShowPartialInput(false);
    setPartialAmount("");
  };

  // helpers de type guard
  const isCake = (p: Payment): p is CakePayment => p.type === "cake";
  const isSponge = (p: Payment): p is SpongePayment => p.type === "sponge";

  // Descontar stock si no se ha descontado
  const handleStockDiscount = async (payment: Payment) => {
    if (payment.deductedFromStock) return;

    const stockRef = doc(db, "stock", `${payment.type}_${payment.size}`);
    const stockSnap = await getDoc(stockRef);
    if (!stockSnap.exists()) return;

    const stockData = stockSnap.data() as
      | { type: "cake"; flavors: Record<string, number> }
      | { type: "sponge"; quantity: number };

    if (isCake(payment) && "flavors" in stockData) {
      const currentQuantity = stockData.flavors?.[payment.flavor] ?? 0;
      const updatedFlavors = {
        ...stockData.flavors,
        [payment.flavor]: currentQuantity - payment.quantity,
      };
      await updateDoc(stockRef, { flavors: updatedFlavors });
    } else if (isSponge(payment) && "quantity" in stockData) {
      const currentQuantity = stockData.quantity ?? 0;
      await updateDoc(stockRef, { quantity: currentQuantity - payment.quantity });
    }
  };

  // Finalizar pago completo
  const confirmFinalizeFull = async () => {
    if (!paymentModal) return;

    await handleStockDiscount(paymentModal);

    const paymentDocRef = doc(db, "payments", paymentModal.orderDate);
    const docSnap = await getDoc(paymentDocRef);
    if (docSnap.exists()) {
      const currentPayments = (docSnap.data() as PaymentsDoc).payments;
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
    if (Number.isNaN(restante) || restante <= 0 || restante > paymentModal.amount) {
      alert("Ingresa un valor válido para el restante.");
      return;
    }

    await handleStockDiscount(paymentModal);

    const paymentDocRef = doc(db, "payments", paymentModal.orderDate);
    const docSnap = await getDoc(paymentDocRef);
    if (docSnap.exists()) {
      const currentPayments = (docSnap.data() as PaymentsDoc).payments;
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

    const saleItem: SaleItem = {
      id: Date.now().toString(),
      type: paymentModal.type,
      size: paymentModal.size,
      flavor: isCake(paymentModal) ? paymentModal.flavor : undefined,
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

    const allPayments: Payment[] = [];
    paymentsSnap.forEach((snap) => {
      const data = snap.data() as Partial<PaymentsDoc>;
      const docDate = data.date;
      const list = Array.isArray(data.payments) ? data.payments : [];
      for (const p of list) {
        if (p && (p as Payment).type === "cake") {
          const cp = {
            id: String((p as Payment).id),
            type: "cake" as const,
            size: String((p as Payment).size),
            flavor: String((p as CakePayment).flavor),
            quantity: Number((p as CakePayment).quantity),
            amount: Number((p as Payment).amount),
            remaining: (p as Payment).remaining !== undefined ? Number((p as Payment).remaining) : undefined,
            paid: (p as Payment).paid,
            deductedFromStock: (p as Payment).deductedFromStock,
            paymentMethod: String((p as Payment).paymentMethod ?? ""),
            orderDate: String((p as Payment).orderDate ?? ""),
            date: docDate,
            isPayment: (p as Payment).isPayment,
            totalPayment: (p as Payment).totalPayment,
          } satisfies CakePayment;
          allPayments.push(cp);
        } else if (p && (p as Payment).type === "sponge") {
          const sp = {
            id: String((p as Payment).id),
            type: "sponge" as const,
            size: String((p as Payment).size),
            quantity: Number((p as SpongePayment).quantity),
            amount: Number((p as Payment).amount),
            remaining: (p as Payment).remaining !== undefined ? Number((p as Payment).remaining) : undefined,
            paid: (p as Payment).paid,
            deductedFromStock: (p as Payment).deductedFromStock,
            paymentMethod: String((p as Payment).paymentMethod ?? ""),
            orderDate: String((p as Payment).orderDate ?? ""),
            date: docDate,
            isPayment: (p as Payment).isPayment,
            totalPayment: (p as Payment).totalPayment,
          } satisfies SpongePayment;
          allPayments.push(sp);
        }
      }
    });

    setPayments(allPayments);
  };

  const pretty = (s: string) => s?.replaceAll("_", " ") || "";

  return (
    <div className="min-h-screen bg-[#FDF8FF] flex flex-col">
      <main className="flex-grow p-6 sm:p-12 max-w-6xl mx-auto w-full">
        <header className="mb-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[#8E2DA8]">
            Gestión de Abonos
          </h2>
          <p className="text-gray-700 mt-2">
            Finaliza los pagos pendientes y actualiza el inventario.
          </p>
        </header>

        <section className="bg-white border border-[#E8D4F2] shadow-md rounded-2xl p-6 sm:p-8">
          {payments.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-16 h-16 rounded-full bg-[#FDF8FF] border border-[#E8D4F2] flex items-center justify-center text-[#8E2DA8] text-2xl font-bold mb-4">
                💳
              </div>
              <p className="text-gray-500 text-lg">No hay pagos pendientes.</p>
              <p className="text-gray-400 text-sm mt-1">Los abonos aparecerán aquí cuando se registren.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="bg-[#FDF8FF] border border-[#E8D4F2] rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#8E2DA8]/10 text-[#8E2DA8]">
                          {payment.date}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="capitalize font-medium text-gray-800">
                          {payment.type === "cake" ? "Torta" : "Bizcocho"}
                        </span>
                      </div>
                      
                      <div className="text-lg font-semibold text-gray-900 mb-1">
  {pretty(payment.size)}
  {isCake(payment) ? ` - ${pretty(payment.flavor)}` : ""}
</div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Cantidad: {payment.quantity}</span>
                        <span>•</span>
                        <span className="font-semibold text-[#8E2DA8]">
                          ${payment.amount?.toLocaleString()}
                        </span>
                        {(() => {
  const remaining = payment.remaining ?? 0;
  return remaining > 0 ? (
    <>
      <span>•</span>
      <span className="text-yellow-600 font-medium">
        Pendiente: ${remaining.toLocaleString()}
      </span>
    </>
  ) : null;
})()}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {!payment.paid ? (
                        <button
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white px-6 py-2.5 rounded-lg font-semibold shadow-md hover:opacity-95 transition"
                          onClick={() => handleFinalize(payment)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                          </svg>
                          Finalizar
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                          </svg>
                          <span className="font-semibold">Finalizado</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="mt-8">
          <div className="bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white rounded-xl p-5 shadow-lg text-center">
            <p className="text-sm opacity-90">Tip</p>
            <p className="text-base">
              Al finalizar un pago, se actualizará automáticamente el inventario si no se había descontado antes.
            </p>
          </div>
        </div>
      </main>

      {/* Modal */}
      {paymentModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-[#E8D4F2]">
            <div className="p-6 border-b border-[#E8D4F2]">
              <h3 className="text-2xl font-bold text-[#8E2DA8] mb-2">Finalizar Pago</h3>
              <div className="text-sm text-gray-600">
  {pretty(paymentModal.size)}
  {paymentModal && isCake(paymentModal) ? ` - ${pretty(paymentModal.flavor)}` : ""}
</div>
            </div>
            
            <div className="p-6">
              <div className="bg-[#FDF8FF] border border-[#E8D4F2] rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Valor total:</span>
                    <div className="font-bold text-[#8E2DA8]">${paymentModal.amount?.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Pendiente:</span>
                    <div className="font-bold text-yellow-600">${(paymentModal.remaining ?? 0).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-6 text-center">
                ¿El cliente pagó el valor completo o solo una parte?
              </p>

              {!showPartialInput ? (
                <div className="space-y-3">
                  <button
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold shadow-md hover:opacity-95 transition"
                    onClick={confirmFinalizeFull}
                  >
                    Pagó todo el valor
                  </button>
                  <button
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 rounded-xl font-semibold shadow-md hover:opacity-95 transition"
                    onClick={() => setShowPartialInput(true)}
                  >
                    Pagó solo una parte
                  </button>
                  <button
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition"
                    onClick={() => setPaymentModal(null)}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ¿Cuánto pagó el cliente?
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        min="1"
                        max={paymentModal.amount}
                        value={partialAmount}
                        onChange={(e) => setPartialAmount(e.target.value)}
                        className="w-full border border-[#E8D4F2] rounded-lg px-4 py-3 pl-8 bg-white focus:outline-none focus:ring-2 focus:ring-[#8E2DA8] focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      className="flex-1 bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white py-3 rounded-xl font-semibold shadow-md hover:opacity-95 transition"
                      onClick={confirmFinalizePartial}
                    >
                      Guardar y finalizar
                    </button>
                    <button
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition"
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
        </div>
      )}

      <footer className="text-center text-sm text-gray-400 py-6">
        © 2025 CakeManager. Todos los derechos reservados.
      </footer>
    </div>
  );
}