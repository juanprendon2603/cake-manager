import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { BackButton } from "../../components/BackButton";
import { FullScreenLoader } from "../../components/FullScreenLoader";
import { useToast } from "../../hooks/useToast";
import { humanize } from "../../utils/formatters";
import type { PaymentsMonthlyRow, PendingPaymentGroup } from "../../types/payments";
import PaymentFinalizeModal from "./components/PaymentFinalizeModal";
import { fetchPaymentsEntriesForMonth, groupPayments, finalizePaymentGroup } from "./payment.service";

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const localToday = () => format(new Date(), "yyyy-MM-dd");

export function FinalizePayment() {
  const { addToast } = useToast();
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;

  const [month, setMonth] = useState<string>(defaultMonth); // YYYY-MM
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<PaymentsMonthlyRow[]>([]);
  const [selected, setSelected] = useState<PendingPaymentGroup | null>(null);

  async function load(monthKey: string) {
    try {
      setLoading(true);
      const list = await fetchPaymentsEntriesForMonth(monthKey);
      setRows(list);
    } catch {
      addToast({
        type: "error",
        title: "Error al cargar",
        message: "No se pudieron cargar los pagos del mes.",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const groups = useMemo(() => groupPayments(rows), [rows]);


  const onConfirm = async () => {
    if (!selected) return;
    try {
      setLoading(true);
      const today = localToday();
      await finalizePaymentGroup(selected, today);
      addToast({
        type: "success",
        title: "Pago finalizado",
        message:
          selected.restante > 0
            ? "Se marcó el pago como finalizado y se creó la venta del restante."
            : "Se marcó el pago como finalizado.",
        duration: 5000,
      });
      setSelected(null);
      await load(month);
    } catch {
      addToast({
        type: "error",
        title: "Error al finalizar",
        message: "No pudimos actualizar el pago. Inténtalo nuevamente.",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <FullScreenLoader message="Cargando información..." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex flex-col">
      <main className="flex-grow p-6 sm:p-12 max-w-6xl mx-auto w-full">
        <header className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl opacity-10" />
          <div className="relative z-10 py-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl shadow-xl ring-4 ring-purple-200">
                  💳
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-[#8E2DA8] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent">
                    Gestión de Abonos
                  </h1>
                  <p className="text-gray-700">Filtra por mes y finaliza pagos pendientes.</p>
                </div>
              </div>

              <div className="flex items-end gap-3">
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">Mes</label>
                  <input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-purple-200 bg-white text-sm font-medium text-purple-700"
                  />
                </div>
                <div className="hidden sm:block mt-6">
                  <BackButton />
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="bg-white border border-[#E8D4F2] shadow-md rounded-2xl p-6 sm:p-8">
          {groups.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-16 h-16 rounded-full bg-white border border-[#E8D4F2] flex items-center justify-center text-[#8E2DA8] text-2xl font-bold mb-4">
                💳
              </div>
              <p className="text-gray-500 text-lg">No hay pagos en este mes.</p>
              <p className="text-gray-400 text-sm mt-1">Cambia el mes para ver otros registros.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map((g) => (
                <div
                  key={g.groupKey}
                  className="bg-white border border-[#E8D4F2] rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#8E2DA8]/10 text-[#8E2DA8]">
                          {g.orderDay}
                        </span>
                        <span className="text-gray-400">Producto</span>
                        <span className="capitalize font-medium text-gray-800">
                          {g.type === "cake" ? "Torta" : "Bizcocho"}
                        </span>
                        {(g.hasTotalPayment || g.restante <= 0) && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                            Finalizado
                          </span>
                        )}
                      </div>

                      <div className="text-lg font-semibold text-gray-900 mb-1">
                        {humanize(g.size)}
                        {g.type === "cake" ? ` - ${humanize(g.flavor || "")}` : ""}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-gray-600">
                        <span>Cantidad: {g.quantity}</span>
                        <span className="font-semibold text-[#8E2DA8]">
                          Total: ${g.totalAmountCOP.toLocaleString("es-CO")}
                        </span>
                        <span className="text-slate-600">
                          Abonado: ${g.abonado.toLocaleString("es-CO")}
                        </span>
                        <span className={(g.hasTotalPayment || g.restante <= 0) ? "text-emerald-700 font-semibold" : "text-yellow-700 font-semibold"}>
                          Pendiente: ${g.restante.toLocaleString("es-CO")}
                        </span>
                        {g.deductedFromStock ? (
                          <span className="text-emerald-700">Inventario descontado</span>
                        ) : (
                          <span className="text-orange-700">Inventario pendiente</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {(g.hasTotalPayment || g.restante <= 0) ? (
                        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200">
                          ✓ <span className="font-semibold">Finalizado</span>
                        </div>
                      ) : (
                        <button
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white px-6 py-2.5 rounded-lg font-semibold shadow-md hover:opacity-95 transition"
                          onClick={() => setSelected(g)}
                        >
                          ✓ Finalizar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <PaymentFinalizeModal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        group={selected as PendingPaymentGroup}
        onConfirm={onConfirm}
        loading={loading}
      />

      <footer className="text-center text-sm text-gray-400 py-6">
        © 2025 CakeManager. Todos los derechos reservados.
      </footer>
    </div>
  );
}

export default FinalizePayment;
