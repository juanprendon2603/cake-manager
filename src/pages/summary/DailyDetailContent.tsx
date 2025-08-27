import type { Sale, Expense } from "../../types/finance";
import { motion, cubicBezier } from "framer-motion";
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
const getAmount = (s: Sale) => s.valor ?? s.partialAmount ?? 0;

const easeM3 = cubicBezier(0.4, 0, 0.2, 1);

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

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.3, ease: easeM3 }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            <motion.h2
                variants={itemVariants}
                id="daily-detail-title"
                className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-8 text-center"
            >
                Detalle del día {fecha}
            </motion.h2>

            <motion.section variants={itemVariants} className="mb-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Ventas Card */}
                    <motion.div 
                        whileHover={{ scale: 1.02, y: -4 }}
                        className="relative p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 overflow-hidden group shadow-lg"
                    >
                        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-green-500 to-emerald-500 opacity-10"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-lg">
                                    💰
                                </div>
                                <h4 className="text-green-700 font-bold text-lg">Ventas</h4>
                            </div>
                            <div className="space-y-2">
                                <p className="text-gray-700 flex justify-between">
                                    <span className="flex items-center gap-1">💵 Efectivo:</span>
                                    <strong className="text-gray-800">{currency.format(totalSalesCash)}</strong>
                                </p>
                                <p className="text-gray-700 flex justify-between">
                                    <span className="flex items-center gap-1">🏦 Transferencia:</span>
                                    <strong className="text-gray-800">{currency.format(totalSalesTransfer)}</strong>
                                </p>
                                <div className="h-px bg-green-200 my-3"></div>
                                <p className="flex justify-between items-center">
                                    <span className="text-green-700 font-bold">Total ventas:</span>
                                    <span className="font-bold text-green-700 text-xl">{currency.format(totalSales)}</span>
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Gastos Card */}
                    <motion.div 
                        whileHover={{ scale: 1.02, y: -4 }}
                        className="relative p-6 rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 overflow-hidden group shadow-lg"
                    >
                        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-red-500 to-rose-500 opacity-10"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center text-white text-lg">
                                    💸
                                </div>
                                <h4 className="text-red-700 font-bold text-lg">Gastos</h4>
                            </div>
                            <div className="space-y-2">
                                <p className="text-gray-700 flex justify-between">
                                    <span className="flex items-center gap-1">💵 Efectivo:</span>
                                    <strong className="text-gray-800">{currency.format(totalExpensesCash)}</strong>
                                </p>
                                <p className="text-gray-700 flex justify-between">
                                    <span className="flex items-center gap-1">🏦 Transferencia:</span>
                                    <strong className="text-gray-800">{currency.format(totalExpensesTransfer)}</strong>
                                </p>
                                <div className="h-px bg-red-200 my-3"></div>
                                <p className="flex justify-between items-center">
                                    <span className="text-red-700 font-bold">Total gastos:</span>
                                    <span className="font-bold text-red-700 text-xl">{currency.format(totalExpenses)}</span>
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Disponibles y Neto Card */}
                    <motion.div 
                        whileHover={{ scale: 1.02, y: -4 }}
                        className={`relative p-6 rounded-2xl border-2 overflow-hidden group shadow-lg ${
                            net >= 0 
                                ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200" 
                                : "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200"
                        }`}
                    >
                        <div className={`absolute inset-x-0 top-0 h-16 opacity-10 ${
                            net >= 0 
                                ? "bg-gradient-to-r from-blue-500 to-indigo-500" 
                                : "bg-gradient-to-r from-orange-500 to-amber-500"
                        }`}></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg ${
                                    net >= 0 
                                        ? "bg-gradient-to-br from-blue-500 to-indigo-500" 
                                        : "bg-gradient-to-br from-orange-500 to-amber-500"
                                }`}>
                                    {net >= 0 ? "📈" : "📉"}
                                </div>
                                <h4 className={`font-bold text-lg ${
                                    net >= 0 ? "text-blue-700" : "text-orange-700"
                                }`}>Disponibles y Neto</h4>
                            </div>
                            <div className="space-y-2">
                                <p className="text-gray-700 flex justify-between">
                                    <span className="flex items-center gap-1">💵 Disponible Efectivo:</span>
                                    <strong className="text-gray-800">{currency.format(disponibleEfectivo)}</strong>
                                </p>
                                <p className="text-gray-700 flex justify-between">
                                    <span className="flex items-center gap-1">🏦 Disponible Transferencia:</span>
                                    <strong className="text-gray-800">{currency.format(disponibleTransfer)}</strong>
                                </p>
                                <div className={`h-px my-3 ${net >= 0 ? "bg-blue-200" : "bg-orange-200"}`}></div>
                                <p className="flex justify-between items-center">
                                    <span className={`font-bold ${net >= 0 ? "text-blue-700" : "text-orange-700"}`}>Neto:</span>
                                    <span className={`font-extrabold text-xl ${net >= 0 ? "text-blue-700" : "text-orange-700"}`}>
                                        {net >= 0 ? "+" : ""}{currency.format(net)}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.section>

            <motion.section variants={itemVariants} className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm">
                        🛒
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Ventas y abonos ({sales.length})
                    </h3>
                </div>

                {sales.length === 0 ? (
                    <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200">
                        <div className="text-4xl mb-4">📭</div>
                        <p className="text-gray-500 font-medium">No hay ventas registradas para este día</p>
                    </div>
                ) : (
                    <>
                        <div className="hidden sm:block overflow-x-auto bg-white/80 backdrop-blur rounded-2xl border-2 border-purple-200 shadow-lg">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                        <th className="p-4 text-left font-semibold">Cantidad</th>
                                        <th className="p-4 text-left font-semibold">Sabor</th>
                                        <th className="p-4 text-left font-semibold">Tamaño</th>
                                        <th className="p-4 text-left font-semibold">Tipo</th>
                                        <th className="p-4 text-left font-semibold">Método</th>
                                        <th className="p-4 text-right font-semibold">Valor</th>
                                        <th className="p-4 text-center font-semibold">Tipo Registro</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sales.map((s, index) => (
                                        <motion.tr 
                                            key={s.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05, duration: 0.3, ease: easeM3 }}
                                            className="border-b border-purple-100 hover:bg-purple-50/50 transition-colors"
                                        >
                                            <td className="p-4 font-semibold text-gray-800">{getQty(s)}</td>
                                            <td className="p-4 text-gray-700 capitalize">{s.flavor}</td>
                                            <td className="p-4 text-gray-700 capitalize">{s.size?.replace(/_/g, " ")}</td>
                                            <td className="p-4 text-gray-700 capitalize">{s.type}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    s.paymentMethod === "cash" 
                                                        ? "bg-green-100 text-green-700" 
                                                        : "bg-blue-100 text-blue-700"
                                                }`}>
                                                    {s.paymentMethod === "cash" ? "💵 Efectivo" : "🏦 Transferencia"}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right font-bold text-gray-800">{currency.format(getAmount(s))}</td>
                                            <td className="p-4 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    s.isPayment 
                                                        ? "bg-orange-100 text-orange-700" 
                                                        : "bg-purple-100 text-purple-700"
                                                }`}>
                                                    {s.isPayment ? "💳 Abono" : "🛒 Venta"}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="sm:hidden grid grid-cols-1 gap-4">
                            {sales.map((s, index) => (
                                <motion.div 
                                    key={s.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.3, ease: easeM3 }}
                                    className="p-4 bg-white/80 backdrop-blur border-2 border-purple-200 rounded-2xl shadow-sm"
                                >
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-gray-500 block">Cantidad</span>
                                            <span className="font-semibold text-gray-800">{getQty(s)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block">Valor</span>
                                            <span className="font-bold text-purple-700">{currency.format(getAmount(s))}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block">Sabor</span>
                                            <span className="font-medium text-gray-800 capitalize">{s.flavor}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block">Tamaño</span>
                                            <span className="font-medium text-gray-800 capitalize">{s.size?.replace(/_/g, " ")}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block">Tipo</span>
                                            <span className="font-medium text-gray-800 capitalize">{s.type}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block">Método</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                s.paymentMethod === "cash" 
                                                    ? "bg-green-100 text-green-700" 
                                                    : "bg-blue-100 text-blue-700"
                                            }`}>
                                                {s.paymentMethod === "cash" ? "💵" : "🏦"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-purple-100">
                                        <span className="text-gray-500 text-sm block mb-1">Tipo Registro</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            s.isPayment 
                                                ? "bg-orange-100 text-orange-700" 
                                                : "bg-purple-100 text-purple-700"
                                        }`}>
                                            {s.isPayment ? "💳 Abono" : "🛒 Venta"}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}
            </motion.section>

            <motion.section variants={itemVariants}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center text-white text-sm">
                        💸
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                        Gastos ({expenses.length})
                    </h3>
                </div>

                {expenses.length === 0 ? (
                    <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200">
                        <div className="text-4xl mb-4">💰</div>
                        <p className="text-gray-500 font-medium">No hay gastos registrados para este día</p>
                    </div>
                ) : (
                    <>
                        <div className="hidden sm:block overflow-x-auto bg-white/80 backdrop-blur rounded-2xl border-2 border-red-200 shadow-lg">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gradient-to-r from-red-500 to-rose-500 text-white">
                                        <th className="p-4 text-left font-semibold">Descripción</th>
                                        <th className="p-4 text-center font-semibold">Método</th>
                                        <th className="p-4 text-right font-semibold">Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.map((e, idx) => (
                                        <motion.tr 
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05, duration: 0.3, ease: easeM3 }}
                                            className="border-b border-red-100 hover:bg-red-50/50 transition-colors"
                                        >
                                            <td className="p-4 text-gray-800 font-medium">{e.description}</td>
                                            <td className="p-4 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    e.paymentMethod === "cash" 
                                                        ? "bg-green-100 text-green-700" 
                                                        : "bg-blue-100 text-blue-700"
                                                }`}>
                                                    {e.paymentMethod === "cash" ? "💵 Efectivo" : "🏦 Transferencia"}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right font-bold text-gray-800">{currency.format(e.value)}</td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="sm:hidden grid grid-cols-1 gap-4">
                            {expenses.map((e, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1, duration: 0.3, ease: easeM3 }}
                                    className="p-4 bg-white/80 backdrop-blur border-2 border-red-200 rounded-2xl shadow-sm"
                                >
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-gray-500 text-sm block">Descripción</span>
                                            <span className="font-semibold text-gray-800">{e.description}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="text-gray-500 text-sm block">Método</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    e.paymentMethod === "cash" 
                                                        ? "bg-green-100 text-green-700" 
                                                        : "bg-blue-100 text-blue-700"
                                                }`}>
                                                    {e.paymentMethod === "cash" ? "💵" : "🏦"}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-gray-500 text-sm block">Valor</span>
                                                <span className="font-bold text-red-700 text-lg">{currency.format(e.value)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}
            </motion.section>
        </motion.div>
    );
}



