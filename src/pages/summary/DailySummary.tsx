import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FullScreenLoader } from "../../components/FullScreenLoader";
import { db } from "../../lib/firebase";
import { DailyDetail } from "./DailyDetail";

interface Sale {
  valor?: number;
  amount?: number;
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
    {
      fecha: string;
      sales: Sale[];
      expenses: Expense[];
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<null | {
    fecha: string;
    sales: Sale[];
    expenses: Expense[];
  }>(null);
  const [generalExpensesCash, setGeneralExpensesCash] = useState(0);
  const [generalExpensesTransfer, setGeneralExpensesTransfer] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const salesCol = collection(db, "sales");
        const snapshot = await getDocs(salesCol);

        const data: DailyData[] = [];
        const docs: { fecha: string; sales: Sale[]; expenses: Expense[] }[] =
          [];

        snapshot.forEach((doc) => {
          const docData = doc.data();
          const fecha = docData.fecha || doc.id;

          const sales: Sale[] = docData.sales || [];
          const expenses: Expense[] = docData.expenses || [];

          docs.push({ fecha, sales, expenses });

          const totalSalesCash = sales
            .filter((s) => s.paymentMethod === "cash")
            .reduce((sum, s) => sum + (s.valor ?? s.amount ?? 0), 0);

          const totalSalesTransfer = sales
            .filter((s) => s.paymentMethod === "transfer")
            .reduce((sum, s) => sum + (s.valor ?? s.amount ?? 0), 0);

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

  const [generalExpensesList, setGeneralExpensesList] = useState<
    { description: string; paymentMethod: string; value: number }[]
  >([]);

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
        }[] = [];

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const expenses: Array<{
            value?: number;
            paymentMethod?: string;
            description?: string;
          }> = Array.isArray(data?.expenses) ? data.expenses : [];

          expenses.forEach((e) => {
            const value = Number(e?.value ?? 0);
            const pm = e?.paymentMethod || "";
            const desc = e?.description || "";
            expensesList.push({ description: desc, paymentMethod: pm, value });

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
        console.error(e)
      }
    }

    fetchGeneralExpenses();
  }, []);

  const totalSalesCash = dailyData.reduce(
    (sum, d) => sum + d.totalSalesCash,
    0
  );
  const totalSalesTransfer = dailyData.reduce(
    (sum, d) => sum + d.totalSalesTransfer,
    0
  );
  const totalExpensesCash = dailyData.reduce(
    (sum, d) => sum + d.totalExpensesCash,
    0
  );
  const totalExpensesTransfer = dailyData.reduce(
    (sum, d) => sum + d.totalExpensesTransfer,
    0
  );
  const totalNet = dailyData.reduce((sum, d) => sum + d.net, 0);
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
    <div className="min-h-screen bg-[#FDF8FF] flex flex-col">
      <main className="flex-grow p-6 sm:p-12 max-w-6xl mx-auto w-full">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-[#8E2DA8] mb-4">
            Resumen Diario
          </h1>
          <p className="text-lg text-gray-700">
            Consulta las ventas, gastos y disponibilidad por día.
          </p>
        </header>

        {dailyData.length === 0 ? (
          <p className="text-center text-gray-500">No hay datos disponibles.</p>
        ) : (
          <div className="bg-white border border-[#E8D4F2] shadow-md rounded-xl p-4 w-full overflow-hidden hidden sm:block">
            <table className="w-full table-fixed border-collapse text-sm">
              <thead>
                <tr className="bg-[#E8D4F2] text-[#8E2DA8]">
                  <th className="p-3 text-left w-[100px]">Fecha</th>
                  <th className="p-3 text-right">Vendido (Efectivo)</th>
                  <th className="p-3 text-right">Vendido (Transferencia)</th>
                  <th className="p-3 text-right">Gastado (Efectivo)</th>
                  <th className="p-3 text-right">Gastado (Transferencia)</th>
                  <th className="p-3 text-right">Disponible Efectivo</th>
                  <th className="p-3 text-right">Disponible Transferencia</th>
                  <th className="p-3 text-right">Ganancia / Pérdida</th>
                  <th className="p-3 text-center w-[80px]">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {dailyData.map((row, idx) => (
                  <tr
                    key={row.fecha}
                    className={`hover:bg-[#FDF8FF] transition ${
                      row.net >= 0 ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    <td className="p-3 font-medium">{row.fecha}</td>
                    <td className="p-3 text-right">
                      ${row.totalSalesCash.toFixed(2)}
                    </td>
                    <td className="p-3 text-right">
                      ${row.totalSalesTransfer.toFixed(2)}
                    </td>
                    <td className="p-3 text-right">
                      ${row.totalExpensesCash.toFixed(2)}
                    </td>
                    <td className="p-3 text-right">
                      ${row.totalExpensesTransfer.toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-semibold">
                      ${row.disponibleEfectivo.toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-semibold">
                      ${row.disponibleTransfer.toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-bold">
                      {row.net >= 0 ? "+" : ""}${row.net.toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        className="bg-[#8E2DA8] text-white px-3 py-1 rounded hover:bg-[#701f85] transition text-xs"
                        onClick={() => setSelectedDay(rawDocs[idx])}
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#E8D4F2] font-bold text-[#8E2DA8]">
                  <td className="p-3 text-right">Total</td>
                  <td className="p-3 text-right">
                    ${totalSalesCash.toFixed(2)}
                  </td>
                  <td className="p-3 text-right">
                    ${totalSalesTransfer.toFixed(2)}
                  </td>
                  <td className="p-3 text-right">
                    ${totalExpensesCash.toFixed(2)}
                  </td>
                  <td className="p-3 text-right">
                    ${totalExpensesTransfer.toFixed(2)}
                  </td>
                  <td className="p-3 text-right">
                    ${efectivoDisponible.toFixed(2)}
                  </td>
                  <td className="p-3 text-right">
                    ${transferDisponible.toFixed(2)}
                  </td>
                  <td className="p-3 text-right">
                    {totalNet >= 0 ? "+" : ""}${totalNet.toFixed(2)}
                  </td>
                  <td className="p-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {selectedDay && (
          <DailyDetail
            fecha={selectedDay.fecha}
            sales={selectedDay.sales}
            expenses={selectedDay.expenses}
            onClose={() => setSelectedDay(null)}
          />
        )}

        <div className="grid grid-cols-1 gap-4 sm:hidden">
          {dailyData.map((row, idx) => (
            <div
              key={row.fecha}
              className={`p-4 rounded-xl shadow-md border ${
                row.net >= 0
                  ? "border-green-300 bg-green-50"
                  : "border-red-300 bg-red-50"
              }`}
            >
              <h3 className="text-lg font-bold text-[#8E2DA8]">{row.fecha}</h3>
              <p>
                <strong>Efectivo:</strong> ${row.totalSalesCash.toFixed(0)}
              </p>
              <p>
                <strong>Transfer:</strong> ${row.totalSalesTransfer.toFixed(0)}
              </p>
              <p>
                <strong>Gastos Ef.:</strong> ${row.totalExpensesCash.toFixed(0)}
              </p>
              <p>
                <strong>Gastos Tr.:</strong> $
                {row.totalExpensesTransfer.toFixed(0)}
              </p>
              <p>
                <strong>Disponible Ef.:</strong> $
                {row.disponibleEfectivo.toFixed(0)}
              </p>
              <p>
                <strong>Disponible Tr.:</strong> $
                {row.disponibleTransfer.toFixed(0)}
              </p>
              <p className="font-bold">
                Net: {row.net >= 0 ? "+" : ""}${row.net.toFixed(0)}
              </p>
              <button
                className="mt-2 bg-[#8E2DA8] text-white px-3 py-1 rounded text-sm"
                onClick={() => setSelectedDay(rawDocs[idx])}
              >
                Ver Detalle
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-[#8E2DA8] mb-4">
            Detalle de gastos generales
          </h2>
          {generalExpensesList.length === 0 ? (
            <p className="text-gray-500">
              No hay gastos generales registrados.
            </p>
          ) : (
            <div className="bg-white border border-[#E8D4F2] shadow-md rounded-xl overflow-hidden">
              <table className="w-full table-fixed border-collapse text-sm">
                <thead>
                  <tr className="bg-[#E8D4F2] text-[#8E2DA8]">
                    <th className="p-3 text-left">Descripción</th>
                    <th className="p-3 text-center">Método de pago</th>
                    <th className="p-3 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {generalExpensesList.map((g, idx) => (
                    <tr key={idx} className="hover:bg-[#FDF8FF] transition">
                      <td className="p-3">{g.description}</td>
                      <td className="p-3 text-center">
                        {g.paymentMethod === "cash"
                          ? "Efectivo"
                          : "Transferencia"}
                      </td>
                      <td className="p-3 text-right">${g.value.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#F6EAFB] font-bold text-[#8E2DA8]">
                    <td className="p-3 text-right">Totales</td>
                    <td className="p-3 text-center">—</td>
                    <td className="p-3 text-right">
                      $
                      {(generalExpensesCash + generalExpensesTransfer).toFixed(
                        2
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 shadow-sm text-center">
            <p className="text-sm text-green-700 font-medium">Total Ingresos</p>
            <p className="text-2xl font-bold text-green-800">
              ${totalIngresos.toLocaleString()}
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm text-center">
            <p className="text-sm text-red-700 font-medium">Total Gastos</p>
            <p className="text-2xl font-bold text-red-800">
              ${totalGastos.toLocaleString()}
            </p>
          </div>

          <div
            className={`rounded-xl p-4 shadow-sm text-center ${
              totalNeto >= 0
                ? "bg-purple-50 border border-purple-200"
                : "bg-yellow-50 border border-yellow-200"
            }`}
          >
            <p
              className={`text-sm font-medium ${
                totalNeto >= 0 ? "text-[#8E2DA8]" : "text-yellow-700"
              }`}
            >
              Total Neto
            </p>
            <p
              className={`text-2xl font-bold ${
                totalNeto >= 0 ? "text-[#8E2DA8]" : "text-yellow-800"
              }`}
            >
              {totalNeto >= 0 ? "+" : "-"}$
              {Math.abs(totalNeto).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-[#8E2DA8] hover:underline font-semibold">
            Volver al inicio
          </Link>
        </div>
      </main>

      <footer className="text-center text-sm text-gray-400 py-4">
        © 2025 CakeManager. Todos los derechos reservados.
      </footer>
    </div>
  );
}
