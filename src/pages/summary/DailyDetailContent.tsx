import type { Sale, Expense } from "../../types/finance";

interface DailyDetailContentProps {
    fecha: string;
    sales: Sale[];
    expenses: Expense[];
}

const currency = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
});

const getQty = (s: Sale) => s.cantidad ?? s.quantity ?? 0;
const getAmount = (s: Sale) => s.valor ?? s.amount ?? 0;

export function DailyDetailContent({ fecha, sales, expenses }: DailyDetailContentProps) {
    const totalSalesCash = sales
        .filter((s) => s.paymentMethod === "cash")
        .reduce((sum, s) => sum + getAmount(s), 0);

    const totalSalesTransfer = sales
        .filter((s) => s.paymentMethod === "transfer")
        .reduce((sum, s) => sum + getAmount(s), 0);

    const totalExpensesCash = expenses
        .filter((e) => e.paymentMethod === "cash")
        .reduce((sum, e) => sum + (e.value || 0), 0);

    const totalExpensesTransfer = expenses
        .filter((e) => e.paymentMethod === "transfer")
        .reduce((sum, e) => sum + (e.value || 0), 0);

    const totalSales = totalSalesCash + totalSalesTransfer;
    const totalExpenses = totalExpensesCash + totalExpensesTransfer;

    const disponibleEfectivo = totalSalesCash - totalExpensesCash;
    const disponibleTransfer = totalSalesTransfer - totalExpensesTransfer;

    const net = totalSales - totalExpenses;

    return (
        <div>
            <h2
                id="daily-detail-title"
                className="text-3xl font-extrabold text-[#8E2DA8] mb-6 text-center"
            >
                Detalle del día {fecha}
            </h2>

            <section className="mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border border-[#E8D4F2] bg-white">
                        <h4 className="text-[#8E2DA8] font-semibold mb-2">Ventas</h4>
                        <p className="text-gray-700">
                            Efectivo: <strong>{currency.format(totalSalesCash)}</strong>
                        </p>
                        <p className="text-gray-700">
                            Transferencia: <strong>{currency.format(totalSalesTransfer)}</strong>
                        </p>
                        <p className="mt-2 text-gray-900 font-bold">
                            Total ventas: {currency.format(totalSales)}
                        </p>
                    </div>

                    <div className="p-4 rounded-xl border border-[#E8D4F2] bg-white">
                        <h4 className="text-[#8E2DA8] font-semibold mb-2">Gastos</h4>
                        <p className="text-gray-700">
                            Efectivo: <strong>{currency.format(totalExpensesCash)}</strong>
                        </p>
                        <p className="text-gray-700">
                            Transferencia: <strong>{currency.format(totalExpensesTransfer)}</strong>
                        </p>
                        <p className="mt-2 text-gray-900 font-bold">
                            Total gastos: {currency.format(totalExpenses)}
                        </p>
                    </div>

                    <div className="p-4 rounded-xl border border-[#E8D4F2] bg-white">
                        <h4 className="text-[#8E2DA8] font-semibold mb-2">Disponibles y Neto</h4>
                        <p className="text-gray-700">
                            Disponible Efectivo: <strong>{currency.format(disponibleEfectivo)}</strong>
                        </p>
                        <p className="text-gray-700">
                            Disponible Transferencia: <strong>{currency.format(disponibleTransfer)}</strong>
                        </p>
                        <p className={`mt-2 font-extrabold ${net >= 0 ? "text-green-700" : "text-red-700"}`}>
                            Neto: {net >= 0 ? "+" : ""}
                            {currency.format(net)}
                        </p>
                    </div>
                </div>
            </section>

            <section className="mb-8">
                <h3 className="text-xl font-semibold mb-3 text-[#8E2DA8]">Ventas y abonos</h3>

                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full border border-[#E8D4F2] rounded-lg text-sm">
                        <thead>
                            <tr className="bg-[#E8D4F2] text-[#8E2DA8]">
                                <th className="p-2">Cantidad</th>
                                <th className="p-2">Sabor</th>
                                <th className="p-2">Tamaño</th>
                                <th className="p-2">Tipo</th>
                                <th className="p-2">Método</th>
                                <th className="p-2">Valor</th>
                                <th className="p-2">Tipo Registro</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.map((s) => (
                                <tr key={s.id} className="odd:bg-white even:bg-[#FAF5FF] text-gray-800">
                                    <td className="p-2 text-center">{getQty(s)}</td>
                                    <td className="p-2 text-center">{s.flavor}</td>
                                    <td className="p-2 text-center">{s.size}</td>
                                    <td className="p-2 text-center">{s.type}</td>
                                    <td className="p-2 text-center">{s.paymentMethod}</td>
                                    <td className="p-2 text-right">{currency.format(getAmount(s))}</td>
                                    <td className="p-2 text-center">{s.isPayment ? "Abono" : "Venta"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="sm:hidden grid grid-cols-1 gap-4">
                    {sales.map((s) => (
                        <div key={s.id} className="p-4 border border-[#E8D4F2] rounded-lg shadow-sm bg-white">
                            <p><strong>Cantidad:</strong> {getQty(s)}</p>
                            <p><strong>Sabor:</strong> {s.flavor}</p>
                            <p><strong>Tamaño:</strong> {s.size}</p>
                            <p><strong>Tipo:</strong> {s.type}</p>
                            <p><strong>Método:</strong> {s.paymentMethod}</p>
                            <p><strong>Valor:</strong> {currency.format(getAmount(s))}</p>
                            <p><strong>Tipo Registro:</strong> {s.isPayment ? "Abono" : "Venta"}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h3 className="text-xl font-semibold mb-3 text-[#8E2DA8]">Gastos</h3>

                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full border border-[#E8D4F2] rounded-lg text-sm">
                        <thead>
                            <tr className="bg-[#E8D4F2] text-[#8E2DA8]">
                                <th className="p-2">Descripción</th>
                                <th className="p-2">Método</th>
                                <th className="p-2 text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map((e, idx) => (
                                <tr key={idx} className="odd:bg-white even:bg-[#F0F5FF] text-gray-800">
                                    <td className="p-2">{e.description}</td>
                                    <td className="p-2 text-center">{e.paymentMethod}</td>
                                    <td className="p-2 text-right">{currency.format(e.value)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="sm:hidden grid grid-cols-1 gap-4">
                    {expenses.map((e, idx) => (
                        <div key={idx} className="p-4 border border-[#E8D4F2] rounded-lg shadow-sm bg-white">
                            <p><strong>Descripción:</strong> {e.description}</p>
                            <p><strong>Método:</strong> {e.paymentMethod}</p>
                            <p><strong>Valor:</strong> {currency.format(e.value)}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}