import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Link } from "react-router-dom";

interface Sale {
  valor: number;
}

interface Expense {
  value: number;
}

interface DailyData {
    fecha: string;
    totalSalesCash: number;
    totalSalesTransfer: number;
    totalExpensesCash: number;
    totalExpensesTransfer: number;
    net: number;
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
      
        const net = (totalSalesCash + totalSalesTransfer) - (totalExpensesCash + totalExpensesTransfer);
      
        data.push({
          fecha,
          totalSalesCash,
          totalSalesTransfer,
          totalExpensesCash,
          totalExpensesTransfer,
          net,
        });
      });

      // Ordenar por fecha descendente (más reciente primero)
      data.sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

      setDailyData(data);
      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading) return <p>Cargando resumen diario...</p>;

  return (
    <main className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-6">Resumen Diario</h1>
      {dailyData.length === 0 ? (
        <p>No hay datos disponibles.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
  <tr className="bg-gray-200">
    <th className="border border-gray-300 p-2 text-left">Fecha</th>
    <th className="border border-gray-300 p-2 text-right">Total Vendido (Efectivo)</th>
    <th className="border border-gray-300 p-2 text-right">Total Vendido (Transferencia)</th>
    <th className="border border-gray-300 p-2 text-right">Total Gastado (Efectivo)</th>
    <th className="border border-gray-300 p-2 text-right">Total Gastado (Transferencia)</th>
    <th className="border border-gray-300 p-2 text-right">Ganancia / Pérdida</th>
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
      net,
    }) => (
      <tr key={fecha} className={net >= 0 ? "text-green-700" : "text-red-700"}>
        <td className="border border-gray-300 p-2">{fecha}</td>
        <td className="border border-gray-300 p-2 text-right">${totalSalesCash.toFixed(2)}</td>
        <td className="border border-gray-300 p-2 text-right">${totalSalesTransfer.toFixed(2)}</td>
        <td className="border border-gray-300 p-2 text-right">${totalExpensesCash.toFixed(2)}</td>
        <td className="border border-gray-300 p-2 text-right">${totalExpensesTransfer.toFixed(2)}</td>
        <td className="border border-gray-300 p-2 text-right">${net.toFixed(2)}</td>
      </tr>
    )
  )}
</tbody>
        </table>
      )}
      <div className="mt-6">
        <Link to="/" className="text-blue-600 hover:underline">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}