import { collection, getDocs } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FullScreenLoader } from "../../components/FullScreenLoader";
import { db } from "../../lib/firebase";
import { parseISO, getDate, lastDayOfMonth } from "date-fns";
import { DailyDetail } from "./DailyDetail";

interface Sale {
  valor?: number;
  amount?: number;
  partialAmount?: number;
  paymentMethod: string;
  cantidad?: number;
  quantity?: number;
  flavor: string;
  id: string;
  size: string;
  type: string;
  deductedFromStock?: boolean;
  isPayment?: boolean;
  orderDate?: string;
  totalPayment?: boolean;
}

interface Expense {
  value: number;
  paymentMethod: string;
  description: string;
}

interface DailyData {
  fecha: string;
  totalSalesCash: number;
  totalSalesTransfer: number;
  totalExpensesCash: number;
  totalExpensesTransfer: number;
  net: number;
  disponibleEfectivo: number;
  disponibleTransfer: number;
}

export function DailySummary() {
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [rawDocs, setRawDocs] = useState<
    { fecha: string; sales: Sale[]; expenses: Expense[] }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<null | {
    fecha: string;
    sales: Sale[];
    expenses: Expense[];
  }>(null);
  const [generalExpensesCash, setGeneralExpensesCash] = useState(0);
  const [generalExpensesTransfer, setGeneralExpensesTransfer] = useState(0);
  const [selectedQuincena, setSelectedQuincena] = useState("Q1");
  const [generalExpensesList, setGeneralExpensesList] = useState<
    { description: string; paymentMethod: string; value: number; date?: string }[]
  >([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const salesCol = collection(db, "sales");
        const snapshot = await getDocs(salesCol);

        const data: DailyData[] = [];
        const docs: { fecha: string; sales: Sale[]; expenses: Expense[] }[] = [];

        snapshot.forEach((doc) => {
          const docData = doc.data();
          const fecha = docData.fecha || doc.id;
          const sales: Sale[] = docData.sales || [];
          const expenses: Expense[] = docData.expenses || [];

          docs.push({ fecha, sales, expenses });

          const totalSalesCash = sales
            .filter((s) => s.paymentMethod === "cash")
            .reduce((sum, s) => sum + (s.valor ?? s.partialAmount ?? s.amount ?? 0), 0);

          const totalSalesTransfer = sales
            .filter((s) => s.paymentMethod === "transfer")
            .reduce((sum, s) => sum + (s.valor ?? s.partialAmount ?? s.amount ?? 0), 0);

          const totalExpensesCash = expenses
            .filter((e) => e.paymentMethod === "cash")
            .reduce((sum, e) => sum + (e.value || 0), 0);

          const totalExpensesTransfer = expenses
            .filter((e) => e.paymentMethod === "transfer")
            .reduce((sum, e) => sum + (e.value || 0), 0);

          const disponibleEfectivo = totalSalesCash - totalExpensesCash;
          const disponibleTransfer = totalSalesTransfer - totalExpensesTransfer;

          const net =
            totalSalesCash +
            totalSalesTransfer -
            totalExpensesCash -
            totalExpensesTransfer;

          data.push({
            fecha,
            totalSalesCash,
            totalSalesTransfer,
            totalExpensesCash,
            totalExpensesTransfer,
            net,
            disponibleEfectivo,
            disponibleTransfer,
          });
        });

        data.sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
        docs.sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

        setDailyData(data);
        setRawDocs(docs);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchGeneralExpenses() {
      try {
        const snapshot = await getDocs(collection(db, "generalExpenses"));

        let cash = 0;
        let transfer = 0;
        const expensesList: {
          description: string;
          paymentMethod: string;
          value: number;
          date: string;
        }[] = [];

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const expenses: Array<{
            value?: number;
            paymentMethod?: string;
            description?: string;
            date?: string;
          }> = Array.isArray(data?.expenses) ? data.expenses : [];

          expenses.forEach((e) => {
            const value = Number(e?.value ?? 0);
            const pm = e?.paymentMethod || "";
            const desc = e?.description || "";
            const date = e?.date || "";

            const d = new Date(date);
            const day = d.getDate();

            const isInQuincena =
              selectedQuincena === "Q1" ? day >= 1 && day <= 15 : day >= 16;
            if (!isInQuincena) return;

            expensesList.push({ description: desc, paymentMethod: pm, value, date });

            if (pm === "cash") cash += value;
            if (pm === "transfer") transfer += value;
          });
        });

        setGeneralExpensesCash(cash);
        setGeneralExpensesTransfer(transfer);
        setGeneralExpensesList(expensesList);
      } catch (e) {
        setGeneralExpensesCash(0);
        setGeneralExpensesTransfer(0);
        setGeneralExpensesList([]);
        console.error(e);
      }
    }

    fetchGeneralExpenses();
  }, [selectedQuincena]);

  const filteredData = useMemo(() => {
    return dailyData.filter((row) => {
      const date = parseISO(row.fecha);
      const dia = getDate(date);
      const ultimoDia = getDate(lastDayOfMonth(date));
      return selectedQuincena === "Q1" ? dia >= 1 && dia <= 15 : dia >= 16 && dia <= ultimoDia;
    });
  }, [dailyData, selectedQuincena]);

  const totalSalesCash = filteredData.reduce((sum, d) => sum + d.totalSalesCash, 0);
  const totalSalesTransfer = filteredData.reduce((sum, d) => sum + d.totalSalesTransfer, 0);
  const totalExpensesCash = filteredData.reduce((sum, d) => sum + d.totalExpensesCash, 0);
  const totalExpensesTransfer = filteredData.reduce((sum, d) => sum + d.totalExpensesTransfer, 0);
  const totalNet = filteredData.reduce((sum, d) => sum + d.net, 0);

  const efectivoDisponible = totalSalesCash - totalExpensesCash;
  const transferDisponible = totalSalesTransfer - totalExpensesTransfer;

  const totalIngresos = totalSalesCash + totalSalesTransfer;
  const totalGastosDiarios = totalExpensesCash + totalExpensesTransfer;
  const totalGastosGenerales = generalExpensesCash + generalExpensesTransfer;
  const totalGastos = totalGastosDiarios + totalGastosGenerales;
  const totalNeto = totalIngresos - totalGastos;

  if (loading) {
    return <FullScreenLoader message="Cargando resumen diario..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex flex-col">
      <main className="flex-grow p-6 sm:p-10 max-w-6xl mx-auto w-full">
        {/* Hero Header */}
        <header className="mb-10 relative">
          <div className="absolute inset-0 -z-10 pointer-events-none">
            <div className="absolute -top-8 -left-8 w-48 h-48 rounded-full blur-3xl opacity-30"
              style={{ background: "radial-gradient(#E8D4F2, transparent 60%)" }} />
            <div className="absolute -bottom-10 -right-6 w-64 h-64 rounded-full blur-3xl opacity-30"
              style={{ background: "radial-gradient(#8E2DA8, transparent 60%)" }} />
          </div>

          <div className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-xl px-5 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                Resumen Diario
              </h1>
              <p className="text-gray-700 mt-1">
                Consulta las ventas, gastos y disponibilidad por día.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Quincena</span>
              <div className="relative">
                <select
                  value={selectedQuincena}
                  onChange={(e) => setSelectedQuincena(e.target.value)}
                  className="appearance-none pr-10 pl-3 py-2 rounded-lg border border-purple-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm font-medium text-purple-700"
                >
                  <option value="Q1">Q1 (1 - 15)</option>
                  <option value="Q2">Q2 (16 - fin)</option>
                </select>
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-purple-500">
                  ▼
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <KpiCard
            title="Total Ingresos"
            value={formatCurrency(totalIngresos)}
            tone="green"
            sub={`Efec: ${formatCurrency(totalSalesCash)} · Transf: ${formatCurrency(totalSalesTransfer)}`}
          />
          <KpiCard
            title="Total Gastos"
            value={formatCurrency(totalGastos)}
            tone="red"
            sub={`Diarios: ${formatCurrency(totalGastosDiarios)} · Generales: ${formatCurrency(totalGastosGenerales)}`}
          />
          <KpiCard
            title="Total Neto"
            value={(totalNeto >= 0 ? "+" : "-") + formatCurrency(Math.abs(totalNeto))}
            tone={totalNeto >= 0 ? "purple" : "yellow"}
            sub={`Disp Efec: ${formatCurrency(efectivoDisponible)} · Disp Transf: ${formatCurrency(transferDisponible)}`}
          />
        </section>

        {/* Tabla Desktop */}
        {dailyData.length === 0 ? (
          <p className="text-center text-gray-500">No hay datos disponibles.</p>
        ) : (
          <div className="hidden sm:block rounded-2xl overflow-hidden border border-white/60 bg-white/80 backdrop-blur shadow-xl">
            <div className="overflow-auto max-h-[60vh]">
              <table className="w-full table-fixed border-collapse text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800">
                    <Th>Fecha</Th>
                    <Th className="text-right">Vendido (Efec)</Th>
                    <Th className="text-right">Vendido (Transf)</Th>
                    <Th className="text-right">Gasto (Efec)</Th>
                    <Th className="text-right">Gasto (Transf)</Th>
                    <Th className="text-right">Disp Efec</Th>
                    <Th className="text-right">Disp Transf</Th>
                    <Th className="text-right">Resultado</Th>
                    <Th className="text-center">Detalle</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, idx) => {
                    const positive = row.net >= 0;
                    return (
                      <tr
                        key={row.fecha}
                        className={`even:bg-white/60 odd:bg-white/90 hover:bg-purple-50/70 transition-colors`}
                      >
                        <Td className="font-semibold text-gray-800">{row.fecha}</Td>
                        <Td className="text-right">{formatCurrency(row.totalSalesCash)}</Td>
                        <Td className="text-right">{formatCurrency(row.totalSalesTransfer)}</Td>
                        <Td className="text-right text-red-700">{formatCurrency(row.totalExpensesCash)}</Td>
                        <Td className="text-right text-red-700">{formatCurrency(row.totalExpensesTransfer)}</Td>
                        <Td className="text-right font-semibold text-emerald-700">{formatCurrency(row.disponibleEfectivo)}</Td>
                        <Td className="text-right font-semibold text-emerald-700">{formatCurrency(row.disponibleTransfer)}</Td>
                        <Td className={`text-right font-bold ${positive ? "text-green-700" : "text-red-700"}`}>
                          {positive ? "+" : ""}{formatCurrency(row.net)}
                        </Td>
                        <Td className="text-center">
                          <button
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow hover:shadow-md hover:scale-[1.02] active:scale-[0.99] transition"
                            onClick={() => setSelectedDay(rawDocs[idx])}
                          >
                            <i className="fa-solid fa-eye"></i>
                            Ver
                          </button>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-900 font-bold">
                    <Td className="text-right">Total</Td>
                    <Td className="text-right">{formatCurrency(totalSalesCash)}</Td>
                    <Td className="text-right">{formatCurrency(totalSalesTransfer)}</Td>
                    <Td className="text-right">{formatCurrency(totalExpensesCash)}</Td>
                    <Td className="text-right">{formatCurrency(totalExpensesTransfer)}</Td>
                    <Td className="text-right">{formatCurrency(efectivoDisponible)}</Td>
                    <Td className="text-right">{formatCurrency(transferDisponible)}</Td>
                    <Td className="text-right">{(totalNet >= 0 ? "+" : "") + formatCurrency(totalNet)}</Td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Modal detalle */}
        {selectedDay && (
          <DailyDetail
            fecha={selectedDay.fecha}
            sales={selectedDay.sales}
            expenses={selectedDay.expenses}
            onClose={() => setSelectedDay(null)}
          />
        )}

        {/* Móvil Cards */}
        <div className="grid grid-cols-1 gap-4 sm:hidden mt-6">
          {filteredData.map((row, idx) => {
            const positive = row.net >= 0;
            return (
              <div
                key={row.fecha}
                className="p-4 rounded-2xl shadow-md border border-white/60 bg-white/85 backdrop-blur"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-purple-700">{row.fecha}</h3>
                  <Badge tone={positive ? "green" : "red"}>
                    {positive ? "Ganancia" : "Pérdida"}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-y-1 text-sm">
                  <span className="text-gray-600">Efectivo</span>
                  <span className="text-right">{formatCurrency(row.totalSalesCash)}</span>

                  <span className="text-gray-600">Transfer</span>
                  <span className="text-right">{formatCurrency(row.totalSalesTransfer)}</span>

                  <span className="text-gray-600">Gastos Ef.</span>
                  <span className="text-right text-red-700">{formatCurrency(row.totalExpensesCash)}</span>

                  <span className="text-gray-600">Gastos Tr.</span>
                  <span className="text-right text-red-700">{formatCurrency(row.totalExpensesTransfer)}</span>

                  <span className="text-gray-600">Disp Ef.</span>
                  <span className="text-right text-emerald-700 font-semibold">{formatCurrency(row.disponibleEfectivo)}</span>

                  <span className="text-gray-600">Disp Tr.</span>
                  <span className="text-right text-emerald-700 font-semibold">{formatCurrency(row.disponibleTransfer)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className={`font-bold ${positive ? "text-green-700" : "text-red-700"}`}>
                    {positive ? "+" : ""}{formatCurrency(row.net)}
                  </p>
                  <button
                    className="mt-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1.5 rounded-lg text-sm shadow hover:shadow-md active:scale-[0.98] transition"
                    onClick={() => setSelectedDay(rawDocs[idx])}
                  >
                    Ver detalle
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Gastos Generales */}
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
              Gastos generales
            </h2>
            <div className="text-sm text-gray-600">
              Totales: <span className="font-semibold text-purple-700">{formatCurrency(generalExpensesCash + generalExpensesTransfer)}</span>
            </div>
          </div>

          {generalExpensesList.length === 0 ? (
            <p className="text-gray-500">No hay gastos generales registrados.</p>
          ) : (
            <div className="rounded-2xl overflow-hidden border border-white/60 bg-white/85 backdrop-blur shadow-xl">
              <table className="w-full table-fixed border-collapse text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-900">
                    <Th className="text-left">Descripción</Th>
                    <Th className="text-center">Método</Th>
                    <Th className="text-right">Valor</Th>
                  </tr>
                </thead>
                <tbody>
                  {generalExpensesList.map((g, idx) => (
                    <tr key={idx} className="hover:bg-purple-50/70 transition-colors">
                      <Td className="text-gray-800">{g.description}</Td>
                      <Td className="text-center">
                        <Badge tone={g.paymentMethod === "cash" ? "green" : "purple"}>
                          {g.paymentMethod === "cash" ? "Efectivo" : "Transferencia"}
                        </Badge>
                      </Td>
                      <Td className="text-right font-medium">{formatCurrency(g.value)}</Td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-white/80 font-bold text-purple-900">
                    <Td className="text-right">Totales</Td>
                    <Td className="text-center">—</Td>
                    <Td className="text-right">{formatCurrency(generalExpensesCash + generalExpensesTransfer)}</Td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </section>

        <div className="mt-10 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur border border-white/60 shadow text-purple-700 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition font-semibold"
          >
            <i className="fa-solid fa-arrow-left"></i>
            Volver al inicio
          </Link>
        </div>
      </main>

      <footer className="text-center text-sm text-gray-500 py-6">
        © 2025 CakeManager. Todos los derechos reservados.
      </footer>
    </div>
  );
}

/* ----------------- UI helpers ----------------- */

function KpiCard({
  title,
  value,
  tone,
  sub,
}: {
  title: string;
  value: string | number;
  tone: "green" | "red" | "purple" | "yellow";
  sub?: string;
}) {
  const toneMap: Record<string, { bg: string; text: string; ring: string; icon: string }> = {
    green: { bg: "from-emerald-50 to-green-50", text: "text-emerald-800", ring: "ring-emerald-100", icon: "fa-coins" },
    red: { bg: "from-rose-50 to-red-50", text: "text-rose-800", ring: "ring-rose-100", icon: "fa-wallet" },
    purple: { bg: "from-purple-50 to-pink-50", text: "text-purple-800", ring: "ring-purple-100", icon: "fa-chart-line" },
    yellow: { bg: "from-yellow-50 to-amber-50", text: "text-amber-800", ring: "ring-amber-100", icon: "fa-scale-balanced" },
  };

  const t = toneMap[tone];

  return (
    <div className={`rounded-2xl bg-gradient-to-br ${t.bg} ${t.text} p-4 ring-1 ${t.ring} shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-extrabold mt-1">{value}</p>
          {sub && <p className="text-xs opacity-70 mt-1">{sub}</p>}
        </div>
        <div className="w-11 h-11 rounded-xl bg-white/70 backdrop-blur flex items-center justify-center shadow">
          <i className={`fa-solid ${t.icon} text-lg`} />
        </div>
      </div>
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`p-3 text-left font-semibold text-xs uppercase tracking-wide ${className}`}>
      {children}
    </th>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`p-3 align-middle ${className}`}>{children}</td>;
}

function Badge({
  children,
  tone = "gray",
}: {
  children: React.ReactNode;
  tone?: "green" | "red" | "purple" | "yellow" | "gray";
}) {
  const tones: Record<string, string> = {
    green: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    red: "bg-rose-100 text-rose-700 ring-rose-200",
    purple: "bg-purple-100 text-purple-700 ring-purple-200",
    yellow: "bg-amber-100 text-amber-700 ring-amber-200",
    gray: "bg-gray-100 text-gray-700 ring-gray-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ring-1 ${tones[tone]}`}>
      {children}
    </span>
  );
}

function formatCurrency(n: number) {
  if (!isFinite(n as number)) return "$0";
  return "$" + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}