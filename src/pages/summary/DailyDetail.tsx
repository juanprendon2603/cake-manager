import type { Sale, Expense } from "../../types/finance";

interface DailyDetailProps {
  fecha: string;
  sales: Sale[];
  expenses: Expense[];
  onClose: () => void;
}

const currency = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function DailyDetail({ fecha, sales, expenses, onClose }: DailyDetailProps) {
  const getQty = (s: Sale) => s.cantidad ?? s.quantity ?? 0;
  const getAmount = (s: Sale) => s.valor ?? s.amount ?? 0;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="daily-detail-title"
    >
      <div
        className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8E2DA8] hover:text-[#701f85] font-bold text-xl"
          aria-label="Cerrar modal"
        >
          &times;
        </button>

        <h2 id="daily-detail-title" className="text-3xl font-extrabold text-[#8E2DA8] mb-6 text-center">
          Detalle del día {fecha}
        </h2>

        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-3 text-[#8E2DA8]">
            Ventas y abonos
          </h3>
          <table className="w-full border border-[#E8D4F2] rounded-lg text-sm">
            <thead>
              <tr className="bg-[#E8D4F2] text-[#8E2DA8]">
                <th className="p-2 border-r border-[#D6B9E4]">Cantidad</th>
                <th className="p-2 border-r border-[#D6B9E4]">Sabor</th>
                <th className="p-2 border-r border-[#D6B9E4]">Tamaño</th>
                <th className="p-2 border-r border-[#D6B9E4]">Tipo</th>
                <th className="p-2 border-r border-[#D6B9E4]">Método</th>
                <th className="p-2 border-r border-[#D6B9E4]">Valor</th>
                <th className="p-2">Tipo Registro</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr
                  key={s.id}
                  className="odd:bg-white even:bg-[#FAF5FF] text-gray-800"
                >
                  <td className="p-2 text-center">{getQty(s)}</td>
                  <td className="p-2 text-center">{s.flavor}</td>
                  <td className="p-2 text-center">{s.size}</td>
                  <td className="p-2 text-center">{s.type}</td>
                  <td className="p-2 text-center">{s.paymentMethod}</td>
                  <td className="p-2 text-right">
                    {currency.format(getAmount(s))}
                  </td>
                  <td className="p-2 text-center">
                    {s.isPayment ? "Abono" : "Venta"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3 text-[#8E2DA8]">Gastos</h3>
          <table className="w-full border border-[#E8D4F2] rounded-lg text-sm">
            <thead>
              <tr className="bg-[#E8D4F2] text-[#8E2DA8]">
                <th className="p-2 border-r border-[#D6B9E4]">Descripción</th>
                <th className="p-2 border-r border-[#D6B9E4]">Método</th>
                <th className="p-2 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e, idx) => (
                <tr
                  key={idx}
                  className="odd:bg-white even:bg-[#F0F5FF] text-gray-800"
                >
                  <td className="p-2">{e.description}</td>
                  <td className="p-2 text-center">{e.paymentMethod}</td>
                  <td className="p-2 text-right">{currency.format(e.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}