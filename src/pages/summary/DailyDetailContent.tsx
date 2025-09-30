import { cubicBezier, motion } from "framer-motion";
import { useMemo } from "react";
import type { Expense, Sale } from "../../types/finance";

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

/* --------------------- Columnas dinámicas por categoría -------------------- */
type ColKey = "qty" | "flavor" | "size" | "method" | "amount" | "kind";
type Column = {
  key: ColKey;
  label: string;
  align?: "left" | "right" | "center";
};

function deriveColumns(rows: Sale[]): Column[] {
  const hasFlavor = rows.some((r) => (r.flavor ?? "").toString().trim() !== "");
  const hasSize = rows.some((r) => (r.size ?? "").toString().trim() !== "");

  const cols: Column[] = [{ key: "qty", label: "Cantidad" }];
  if (hasFlavor) cols.push({ key: "flavor", label: "Sabor" });
  if (hasSize) cols.push({ key: "size", label: "Tamaño" });

  cols.push({ key: "method", label: "Método" });
  cols.push({ key: "amount", label: "Valor", align: "right" });
  cols.push({ key: "kind", label: "Tipo Registro", align: "center" });
  return cols;
}

function MethodPill({ method }: { method: Sale["paymentMethod"] }) {
  const isCash = method === "cash";
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${
        isCash ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
      }`}
    >
      {isCash ? "💵 Efectivo" : "🏦 Transferencia"}
    </span>
  );
}

function KindPill({ isPayment }: { isPayment?: boolean }) {
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${
        isPayment
          ? "bg-orange-100 text-orange-700"
          : "bg-purple-100 text-purple-700"
      }`}
    >
      {isPayment ? "💳 Abono" : "🛒 Venta"}
    </span>
  );
}

export function DailyDetailContent({
  fecha,
  sales,
  expenses,
}: DailyDetailContentProps) {
  /* ------------------------------- Totales KPI ------------------------------ */
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

  /* ----------------------- Agrupar ventas por categoría --------------------- */
  const groups = useMemo(() => {
    const map = new Map<
      string,
      {
        rows: Sale[];
        subtotal: number;
        unidades: number;
        cols: Column[];
      }
    >();
    for (const s of sales) {
      const cat = (s.type || "Sin categoría").trim();
      if (!map.has(cat))
        map.set(cat, { rows: [], subtotal: 0, unidades: 0, cols: [] });
      const g = map.get(cat)!;
      g.rows.push(s);
      g.subtotal += Number(getAmount(s)) || 0;
      g.unidades += Number(getQty(s)) || 0;
    }
    // definir columnas dinámicas por grupo
    for (const [cat, g] of map) {
      g.cols = deriveColumns(g.rows);
      map.set(cat, g);
    }
    // ordenar alfabéticamente por categoría
    return Array.from(map.entries()).sort(([a], [b]) =>
      a.localeCompare(b, "es")
    );
  }, [sales]);

  const grandTotal = useMemo(
    () => sales.reduce((acc, s) => acc + (Number(getAmount(s)) || 0), 0),
    [sales]
  );

  /* ------------------------------- Animaciones ------------------------------ */
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: easeM3 },
    },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <motion.h2
        variants={itemVariants}
        id="daily-detail-title"
        className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-8 text-center"
      >
        Detalle del día {fecha}
      </motion.h2>

      {/* ------------------------------- KPI Cards ------------------------------- */}
      <motion.section variants={itemVariants} className="mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Ventas */}
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
                  <strong className="text-gray-800">
                    {currency.format(totalSalesCash)}
                  </strong>
                </p>
                <p className="text-gray-700 flex justify-between">
                  <span className="flex items-center gap-1">
                    🏦 Transferencia:
                  </span>
                  <strong className="text-gray-800">
                    {currency.format(totalSalesTransfer)}
                  </strong>
                </p>
                <div className="h-px bg-green-200 my-3"></div>
                <p className="flex justify-between items-center">
                  <span className="text-green-700 font-bold">
                    Total ventas:
                  </span>
                  <span className="font-bold text-green-700 text-xl">
                    {currency.format(totalSales)}
                  </span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Gastos */}
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
                  <strong className="text-gray-800">
                    {currency.format(totalExpensesCash)}
                  </strong>
                </p>
                <p className="text-gray-700 flex justify-between">
                  <span className="flex items-center gap-1">
                    🏦 Transferencia:
                  </span>
                  <strong className="text-gray-800">
                    {currency.format(totalExpensesTransfer)}
                  </strong>
                </p>
                <div className="h-px bg-red-200 my-3"></div>
                <p className="flex justify-between items-center">
                  <span className="text-red-700 font-bold">Total gastos:</span>
                  <span className="font-bold text-red-700 text-xl">
                    {currency.format(totalExpenses)}
                  </span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Disponibles y Neto */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            className={`relative p-6 rounded-2xl border-2 overflow-hidden group shadow-lg ${
              net >= 0
                ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
                : "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200"
            }`}
          >
            <div
              className={`absolute inset-x-0 top-0 h-16 opacity-10 ${
                net >= 0
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                  : "bg-gradient-to-r from-orange-500 to-amber-500"
              }`}
            ></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg ${
                    net >= 0
                      ? "bg-gradient-to-br from-blue-500 to-indigo-500"
                      : "bg-gradient-to-br from-orange-500 to-amber-500"
                  }`}
                >
                  {net >= 0 ? "📈" : "📉"}
                </div>
                <h4
                  className={`font-bold text-lg ${
                    net >= 0 ? "text-blue-700" : "text-orange-700"
                  }`}
                >
                  Disponibles y Neto
                </h4>
              </div>
              <div className="space-y-2">
                <p className="text-gray-700 flex justify-between">
                  <span className="flex items-center gap-1">
                    💵 Disponible Efectivo:
                  </span>
                  <strong className="text-gray-800">
                    {currency.format(disponibleEfectivo)}
                  </strong>
                </p>
                <p className="text-gray-700 flex justify-between">
                  <span className="flex items-center gap-1">
                    🏦 Disponible Transferencia:
                  </span>
                  <strong className="text-gray-800">
                    {currency.format(disponibleTransfer)}
                  </strong>
                </p>
                <div
                  className={`h-px my-3 ${
                    net >= 0 ? "bg-blue-200" : "bg-orange-200"
                  }`}
                ></div>
                <p className="flex justify-between items-center">
                  <span
                    className={`font-bold ${
                      net >= 0 ? "text-blue-700" : "text-orange-700"
                    }`}
                  >
                    Neto:
                  </span>
                  <span
                    className={`font-extrabold text-xl ${
                      net >= 0 ? "text-blue-700" : "text-orange-700"
                    }`}
                  >
                    {net >= 0 ? "+" : ""}
                    {currency.format(net)}
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ------------------ Ventas/Abonos: una tabla por categoría ----------------- */}
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
            <p className="text-gray-500 font-medium">
              No hay ventas registradas para este día
            </p>
          </div>
        ) : (
          <>
            {/* Desktop: una tabla por categoría, con columnas dinámicas */}
            <div className="hidden sm:flex flex-col gap-6">
              {groups.map(([cat, g], gi) => (
                <div
                  key={cat || gi}
                  className="overflow-x-auto bg-white/80 backdrop-blur rounded-2xl border-2 border-purple-200 shadow-lg"
                >
                  {/* Encabezado de categoría + Subtotal */}
                  <div className="flex items-center justify-between px-4 py-3 bg-purple-50/70 border-b border-purple-200">
                    <div className="font-bold text-purple-800">
                      {cat || "Sin categoría"}{" "}
                      <span className="ml-2 text-xs font-medium text-purple-600">
                        ({g.unidades} uds)
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-purple-600 mr-2">Subtotal:</span>
                      <span className="font-bold text-purple-800">
                        {currency.format(g.subtotal)}
                      </span>
                    </div>
                  </div>

                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        {g.cols.map((c) => (
                          <th
                            key={c.key}
                            className={`p-4 font-semibold ${
                              c.align === "right"
                                ? "text-right"
                                : c.align === "center"
                                ? "text-center"
                                : "text-left"
                            }`}
                          >
                            {c.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {g.rows.map((s, idx) => (
                        <motion.tr
                          key={`${s.id}-${idx}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: idx * 0.04,
                            duration: 0.25,
                            ease: easeM3,
                          }}
                          className="border-b border-purple-100 hover:bg-purple-50/50 transition-colors"
                        >
                          {g.cols.map((c) => {
                            if (c.key === "qty")
                              return (
                                <td
                                  key={c.key}
                                  className="p-4 font-semibold text-gray-800"
                                >
                                  {getQty(s)}
                                </td>
                              );
                            if (c.key === "flavor")
                              return (
                                <td
                                  key={c.key}
                                  className="p-4 text-gray-700 capitalize"
                                >
                                  {s.flavor}
                                </td>
                              );
                            if (c.key === "size")
                              return (
                                <td
                                  key={c.key}
                                  className="p-4 text-gray-700 capitalize"
                                >
                                  {s.size?.replace(/_/g, " ")}
                                </td>
                              );
                            if (c.key === "method")
                              return (
                                <td key={c.key} className="p-4">
                                  <MethodPill method={s.paymentMethod} />
                                </td>
                              );
                            if (c.key === "amount")
                              return (
                                <td
                                  key={c.key}
                                  className="p-4 text-right font-bold text-gray-800"
                                >
                                  {currency.format(getAmount(s))}
                                </td>
                              );
                            // kind
                            return (
                              <td key={c.key} className="p-4 text-center">
                                <KindPill isPayment={s.isPayment} />
                              </td>
                            );
                          })}
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}

              {/* Total del día (desktop) */}
              <div className="bg-purple-100/70 border-2 border-purple-200 rounded-2xl px-5 py-3 flex items-center justify-end">
                <span className="mr-4 font-bold text-purple-800">
                  TOTAL DEL DÍA
                </span>
                <span className="font-extrabold text-purple-900 text-lg">
                  {currency.format(grandTotal)}
                </span>
              </div>
            </div>

            {/* Mobile: cards por categoría con atributos presentes */}
            <div className="sm:hidden grid grid-cols-1 gap-5">
              {groups.map(([cat, g], gi) => (
                <div
                  key={cat || gi}
                  className="p-4 bg-white/80 backdrop-blur border-2 border-purple-200 rounded-2xl shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-bold text-purple-800 capitalize">
                      {cat || "Sin categoría"}{" "}
                      <span className="ml-2 text-xs font-medium text-purple-600">
                        ({g.unidades} uds)
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-purple-600 mr-1">Subtotal:</span>
                      <span className="font-bold text-purple-800">
                        {currency.format(g.subtotal)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {g.rows.map((s, idx) => (
                      <motion.div
                        key={`${s.id}-${idx}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: idx * 0.05,
                          duration: 0.3,
                          ease: easeM3,
                        }}
                        className="p-3 bg-white border border-purple-100 rounded-xl"
                      >
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500 block">
                              Cantidad
                            </span>
                            <span className="font-semibold text-gray-800">
                              {getQty(s)}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-gray-500 block">Valor</span>
                            <span className="font-bold text-purple-700">
                              {currency.format(getAmount(s))}
                            </span>
                          </div>

                          {/* Solo mostrar atributos presentes en esta categoría */}
                          {g.cols.some((c) => c.key === "flavor") && (
                            <div>
                              <span className="text-gray-500 block">Sabor</span>
                              <span className="font-medium text-gray-800 capitalize">
                                {s.flavor}
                              </span>
                            </div>
                          )}

                          {g.cols.some((c) => c.key === "size") && (
                            <div>
                              <span className="text-gray-500 block">
                                Tamaño
                              </span>
                              <span className="font-medium text-gray-800 capitalize">
                                {s.size?.replace(/_/g, " ")}
                              </span>
                            </div>
                          )}

                          <div>
                            <span className="text-gray-500 block">Método</span>
                            <MethodPill method={s.paymentMethod} />
                          </div>

                          <div className="text-right">
                            <span className="text-gray-500 block">Tipo</span>
                            <span className="font-medium text-gray-800 capitalize">
                              {s.isPayment ? "Abono" : "Venta"}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-700">
                    TOTAL DEL DÍA
                  </span>
                  <span className="font-extrabold text-purple-900">
                    {currency.format(grandTotal)}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </motion.section>

      {/* ------------------------------- GASTOS -------------------------------- */}
      <GastosSection expenses={expenses} itemVariants={itemVariants} />
    </motion.div>
  );
}

/* ------------------------------ Gastos section ----------------------------- */
function GastosSection({
  expenses,
  itemVariants,
}: {
  expenses: Expense[];
  itemVariants: any;
}) {
  return (
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
          <p className="text-gray-500 font-medium">
            No hay gastos registrados para este día
          </p>
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
                    transition={{
                      delay: idx * 0.05,
                      duration: 0.3,
                      ease: easeM3,
                    }}
                    className="border-b border-red-100 hover:bg-red-50/50 transition-colors"
                  >
                    <td className="p-4 text-gray-800 font-medium">
                      {e.description}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          e.paymentMethod === "cash"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {e.paymentMethod === "cash"
                          ? "💵 Efectivo"
                          : "🏦 Transferencia"}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-gray-800">
                      {currency.format(e.value)}
                    </td>
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
                    <span className="text-gray-500 text-sm block">
                      Descripción
                    </span>
                    <span className="font-semibold text-gray-800">
                      {e.description}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-gray-500 text-sm block">
                        Método
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          e.paymentMethod === "cash"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {e.paymentMethod === "cash" ? "💵" : "🏦"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-500 text-sm block">Valor</span>
                      <span className="font-bold text-red-700 text-lg">
                        {currency.format(e.value)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </motion.section>
  );
}
