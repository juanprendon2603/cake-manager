import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../../lib/firebase";

interface Sale {
  valor: number;
  paymentMethod: string;
}

interface Expense {
  value: number;
  paymentMethod: string;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const salesCol = collection(db, "sales");
      const snapshot = await getDocs(salesCol);

      const data: DailyData[] = [];

      snapshot.forEach((doc) => {
        const docData = doc.data();
        const fecha = docData.fecha || doc.id;

        const sales: Sale[] = docData.sales || [];
        const expenses: Expense[] = docData.expenses || [];

        const totalSalesCash = sales
          .filter((s) => s.paymentMethod === "cash")
          .reduce((sum, s) => sum + (s.valor || 0), 0);
        const totalSalesTransfer = sales
          .filter((s) => s.paymentMethod === "transfer")
          .reduce((sum, s) => sum + (s.valor || 0), 0);

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

      // Ordenar por fecha descendente (más reciente primero)
      data.sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

      setDailyData(data);
      setLoading(false);
    }

    fetchData();
  }, []);

  // Calcular totales generales
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

  if (loading) return <p>Cargando resumen diario...</p>;

  return (
    <main className="p-4 sm:p-8 w-full">
      <h1 className="text-3xl font-bold mb-6 text-center">Resumen Diario</h1>
      {dailyData.length === 0 ? (
        <p>No hay datos disponibles.</p>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="min-w-[900px] w-full border-collapse rounded-lg shadow-lg overflow-hidden">
            <thead>
              <tr className="bg-pink-100 text-pink-800">
                <th className="p-3 text-left">Fecha</th>
                <th className="p-3 text-right">Vendido (Efectivo)</th>
                <th className="p-3 text-right">Vendido (Transferencia)</th>
                <th className="p-3 text-right">Gastado (Efectivo)</th>
                <th className="p-3 text-right">Gastado (Transferencia)</th>
                <th className="p-3 text-right">Disponible Efectivo</th>
                <th className="p-3 text-right">Disponible Transferencia</th>
                <th className="p-3 text-right">Ganancia / Pérdida</th>
              </tr>
            </thead>
            <tbody>
              {dailyData.map(
                ({
                  fecha,
                  totalSalesCash,
                  totalSalesTransfer,
                  totalExpensesCash,
                  totalExpensesTransfer,
                  disponibleEfectivo,
                  disponibleTransfer,
                  net,
                }) => (
                  <tr
                    key={fecha}
                    className={`hover:bg-pink-50 transition ${
                      net >= 0 ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    <td className="p-3 font-medium">{fecha}</td>
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
                    <td className="p-3 text-right font-semibold">
                      ${disponibleEfectivo.toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-semibold">
                      ${disponibleTransfer.toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-bold">
                      {net >= 0 ? "+" : ""}${net.toFixed(2)}
                    </td>
                  </tr>
                )
              )}
            </tbody>
            <tfoot>
              <tr className="bg-pink-200 font-bold text-pink-900">
                <td className="p-3 text-right">Total</td>
                <td className="p-3 text-right">${totalSalesCash.toFixed(2)}</td>
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
              </tr>
            </tfoot>
          </table>
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="bg-green-100 text-green-800 rounded-lg p-4 flex-1 shadow">
              <span className="font-semibold">Efectivo disponible total:</span>{" "}
              <span className="text-2xl font-bold">
                ${efectivoDisponible.toFixed(2)}
              </span>
            </div>
            <div className="bg-blue-100 text-blue-800 rounded-lg p-4 flex-1 shadow">
              <span className="font-semibold">
                Transferencias disponibles total:
              </span>{" "}
              <span className="text-2xl font-bold">
                ${transferDisponible.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
      <div className="mt-6 text-center">
        <Link to="/" className="text-blue-600 hover:underline">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
