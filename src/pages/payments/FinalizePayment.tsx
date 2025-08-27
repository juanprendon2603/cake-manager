import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs, updateDoc, doc, getDoc, setDoc, arrayUnion, Timestamp } from "firebase/firestore";
import { FullScreenLoader } from "../../components/FullScreenLoader";
import { useToast } from "../../hooks/useToast";
import { BackButton } from "../../components/BackButton";

type PaymentType = "cake" | "sponge";

interface BasePayment {
  id: string;
  type: PaymentType;
  size: string;
  amount: number;
  partialAmount: number;
  remaining?: number;
  paid?: boolean;
  deductedFromStock?: boolean;
  paymentMethod: string;
  orderDate: string;
  date?: string;
  isPayment?: boolean;
  totalPayment?: boolean;
}

interface CakePayment extends BasePayment {
  type: "cake";
  flavor: string;
  quantity: number;
}

interface SpongePayment extends BasePayment {
  type: "sponge";
  quantity: number;
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
  valor: number;
  paymentMethod: string;
  isPaymentFinalization: true;
}

export function FinalizePayment() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentModal, setPaymentModal] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();


  useEffect(() => {
    async function fetchPayments() {
      try {
        setLoading(true);
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
                remaining: (p as Payment).amount - (p as Payment).partialAmount,
                partialAmount: (p as Payment).partialAmount,
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
                partialAmount: (p as Payment).partialAmount,
                remaining: (p as Payment).amount - (p as Payment).partialAmount,
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
      } catch (err) {
        console.error(err);

        addToast({
          type: "error",
          title: "Error al cargar pagos",
          message: "No se pudieron cargar los pagos pendientes.",
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    }
    fetchPayments();
  }, [addToast]);

  const handleFinalize = (payment: Payment) => {
    setPaymentModal(payment);
  };

  const isCake = (p: Payment): p is CakePayment => p.type === "cake";

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
    } else if (!isCake(payment) && "quantity" in stockData) {
      const currentQuantity = stockData.quantity ?? 0;
      await updateDoc(stockRef, { quantity: currentQuantity - payment.quantity });
    }
  };

  const confirmFinalizeFullPayment = async () => {
    if (!paymentModal) return;
    const abono = paymentModal.remaining ?? paymentModal.amount;

    try {
      setLoading(true);

      await handleStockDiscount(paymentModal);

      const paymentDocRef = doc(db, "payments", paymentModal.orderDate);
      const docSnap = await getDoc(paymentDocRef);
      if (docSnap.exists()) {
        const currentPayments = (docSnap.data() as PaymentsDoc).payments;
        const updatedPayments = currentPayments.map((p) => {
          if (p.id !== paymentModal.id) return p;
          return {
            ...p,
            paid: true,
            remaining: 0,
            status: "finalizado",
            deductedFromStock: true,
          };
        });
        await updateDoc(paymentDocRef, { payments: updatedPayments });
      }

      const todayStr = new Date().toISOString().split("T")[0];
      const salesRef = doc(db, "sales", todayStr);
      const salesSnap = await getDoc(salesRef);

      const saleItem: SaleItem = {
        id: Date.now().toString(),
        type: paymentModal.type,
        size: paymentModal.size,
        flavor: isCake(paymentModal) ? paymentModal.flavor : undefined,
        quantity: paymentModal.quantity,
        valor: abono,
        paymentMethod: paymentModal.paymentMethod,
        isPaymentFinalization: true,
      };

      if (salesSnap.exists()) {
        await updateDoc(salesRef, { sales: arrayUnion(saleItem) });
      } else {
        await setDoc(salesRef, { fecha: todayStr, sales: [saleItem], expenses: [] });
      }

      addToast({
        type: "success",
        title: "Pago registrado",
        message: "Se registró el pago completo y se actualizó el inventario.",
        duration: 5000,
      });
      setPaymentModal(null);
      await reloadPayments();
    } catch (err) {
      console.error(err);
      addToast({
        type: "error",
        title: "Error al guardar",
        message: "No pudimos guardar el pago. Inténtalo nuevamente.",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const reloadPayments = async () => {
    try {
      setLoading(true);
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
              partialAmount: (p as Payment).partialAmount,
              remaining: (p as Payment).amount - (p as Payment).partialAmount,
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
              partialAmount: (p as Payment).partialAmount,  
              remaining: (p as Payment).amount - (p as Payment).partialAmount,
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
    } catch (err) {
      console.error(err);

      addToast({
        type: "error",
        title: "Error al recargar",
        message: "No se pudo actualizar la lista de pagos.",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const pretty = (s: string) => s?.replaceAll("_", " ") || "";

  if (loading) {
    return <FullScreenLoader message="Cargando información..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex flex-col">
      <main className="flex-grow p-6 sm:p-12 max-w-6xl mx-auto w-full">
      <header className="mb-12 text-center relative"> <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl opacity-10"></div> <div className="relative z-10 py-8"> <div className="flex justify-center mb-6"> <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl shadow-xl ring-4 ring-purple-200"> 💳 </div> </div> <h1 className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-[#8E2DA8] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent mb-4 drop-shadow-[0_2px_12px_rgba(142,45,168,0.25)]"> Gestión de Abonos </h1> <p className="text-xl text-gray-700 font-medium mb-8"> Finaliza los pagos pendientes y actualiza el inventario. </p> <div className="absolute top-4 left-4"> <BackButton /> </div> </div> </header>

        <section className="bg-white border border-[#E8D4F2] shadow-md rounded-2xl p-6 sm:p-8">
          {payments.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-16 h-16 rounded-full bg-white border border-[#E8D4F2] flex items-center justify-center text-[#8E2DA8] text-2xl font-bold mb-4">
              💳
                              </div>
              <p className="text-gray-500 text-lg">No hay pagos pendientes.</p>
              <p className="text-gray-400 text-sm mt-1">Los abonos aparecer�E1n aqu�ED cuando se registren.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="bg-white border border-[#E8D4F2] rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#8E2DA8]/10 text-[#8E2DA8]">
                          {payment.date}
                        </span>
                        <span className="text-gray-400">Producto</span>
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
                        <span className="font-semibold text-[#8E2DA8]">
                          ${payment.amount?.toLocaleString()}
                        </span>
                        {!payment.paid && (() => {
                          const remaining = payment.remaining ?? 0;
                          return remaining > 0 ? (
                            <>
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

        <div className="mt-8 max-w-xl mx-auto">
          <div className="bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white rounded-xl p-5 shadow-lg text-center">
            <p className="text-sm opacity-90">Tip</p>
            <p className="text-base">
            Al finalizar un pago, se actualizará automáticamente el inventario si no se había descontado antes.            </p>
          </div>
        </div>
      </main>

      {paymentModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-[#E8D4F2]">
            <div className="p-6 border-b border-[#E8D4F2]">
              <h3 className="text-2xl font-bold text-[#8E2DA8] mb-2">Confirmar Pago</h3>
              <div className="text-sm text-gray-600">
                {pretty(paymentModal.size)}
                {isCake(paymentModal) ? ` - ${pretty(paymentModal.flavor)}` : ""}
              </div>
            </div>

            <div className="p-6">
              <div className="bg-[#FDF8FF] border border-[#E8D4F2] rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Valor total:</span>
                    <div className="font-bold text-[#8E2DA8]">${paymentModal.amount?.toLocaleString("es-CO")}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Pendiente:</span>
                    <div className="font-bold text-yellow-600">
                      ${(paymentModal.remaining ?? paymentModal.amount)?.toLocaleString("es-CO")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  className="flex-1 bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white py-3 rounded-xl font-semibold shadow-md hover:opacity-95 transition"
                  onClick={confirmFinalizeFullPayment}
                >
                  Pagar
                </button>
                <button
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition"
                  onClick={() => setPaymentModal(null)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="text-center text-sm text-gray-400 py-6">
        2025 CakeManager. Todos los derechos reservados.
      </footer>
    </div>
  );
}