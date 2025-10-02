// src/pages/inform/Inform.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { FullScreenLoader } from "../../components/FullScreenLoader";
import { format } from "date-fns";
import { RangeControls } from "../../components/RangeControls";
import { useRangeSummaryOptimized as useRangeSummary } from "../../hooks/useRangeSummary";
import { useGeneralExpenses } from "../../hooks/useGeneralExpenses";
import {
  AnimatedKpiCard,
  GradientCard,
  Th,
  Td,
  Badge,
} from "./components/Kpi";
import {
  DailyRevenueChart,
  PaymentPie,
  TopFlavorsBar,
  RevenueBySizeRadial,
} from "./components/Charts";
import { money } from "../../types/informs"; // ✅ import normal (no "import type")
import { useInformeData } from "../../hooks/useInformeData";

// ✨ Nuevo: UI consistente
import { PageHero } from "../../components/ui/PageHero";
import { ProTipBanner } from "../../components/ui/ProTipBanner";
import { AppFooter } from "../../components/AppFooter";

export function Inform() {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const [range, setRange] = useState<{ start: string; end: string }>({
    start: `${todayStr.slice(0, 7)}-01`,
    end: todayStr,
  });

  const { loading, rawDocs, totals } = useRangeSummary(range);
  const {
    loading: loadingGE,
    totals: geTotals,
    items: geItems,
  } = useGeneralExpenses(range);

  // ✅ Llama el hook directamente (sin require y sin meterlo en un useMemo)
  const {
    totals: computed,
    bySizeRevenue,
    topFlavorsQty,
    dailyStats,
    paymentPie, // ✅ usado abajo
  } = useInformeData(rawDocs, geTotals);

  if (loading || loadingGE)
    return <FullScreenLoader message="Generando Informe... 🚀" />;

  const {
    totalIncome,
    totalExpenses,
    netTotal,
    saleCount,
    avgTicket,
    totalDaysWithSales,
    generalExpensesTotal,
  } = computed;

  // ✅ tipado explícito para evitar unknown[]
  const bySizeData: { name: string; value: number }[] = Array.from(
    bySizeRevenue.entries() as IterableIterator<[string, number]>
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex flex-col">
      <main className="flex-grow p-6 sm:p-12 max-w-7xl mx-auto w-full">
        <PageHero
          icon="📊"
          title="Dashboard con Rangos"
          subtitle="Filtra por mes/quincena o elige cualquier rango de fechas"
        />

        {/* Controles de rango */}
        <section className="bg-white/80 backdrop-blur-xl border-2 border-white/60 shadow-2xl rounded-3xl p-6 sm:p-8 mb-10">
          <div className="mb-4">
            <RangeControls
              start={range.start}
              end={range.end}
              onChange={(r) => setRange(r)}
            />
          </div>
          <p className="text-center text-sm text-gray-600">
            Rango: <span className="font-semibold">{range.start}</span> —{" "}
            <span className="font-semibold">{range.end}</span>
          </p>
        </section>

        {/* KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <AnimatedKpiCard
            label="💰 Total Ingresos"
            value={money(totalIncome)}
            accent="positive"
            icon="💵"
            trend="up"
            subtitle={`${saleCount} ventas`}
          />
          <AnimatedKpiCard
            label="💸 Total Gastos"
            value={money(totalExpenses)}
            accent="negative"
            icon="📉"
            trend="down"
            subtitle={`Generales: ${money(generalExpensesTotal)}`}
          />
          <AnimatedKpiCard
            label="🎯 Ganancia Neta"
            value={`${netTotal >= 0 ? "+" : ""}${money(netTotal)}`}
            accent="primary"
            icon="💎"
            trend={netTotal >= 0 ? "up" : "down"}
            subtitle={`${
              totals.totalSalesCash + totals.totalSalesTransfer
                ? (
                    (netTotal /
                      (totals.totalSalesCash + totals.totalSalesTransfer)) *
                    100
                  ).toFixed(1)
                : "0"
            }% margen`}
          />
          <AnimatedKpiCard
            label="🎫 Ticket Promedio"
            value={money(avgTicket)}
            accent="info"
            icon="🧾"
            trend="stable"
            subtitle={`${totalDaysWithSales} días activos`}
          />
        </section>

        {/* Gráficas */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <GradientCard title="📈 Ventas vs Gastos Diarios" gradient="blue">
            <DailyRevenueChart data={dailyStats} />
          </GradientCard>

          <GradientCard title="💳 Métodos de Pago" gradient="green">
            <PaymentPie data={paymentPie} />
          </GradientCard>

          <GradientCard title="🍰 Top Sabores por Cantidad" gradient="pink">
            <TopFlavorsBar
              data={topFlavorsQty.map(
                (f: { name: string; qty: number; revenue: number }) => ({
                  name: f.name,
                  qty: f.qty,
                  revenue: f.revenue,
                })
              )}
            />
          </GradientCard>

          <GradientCard title="📏 Ingresos por Tamaño" gradient="orange">
            <RevenueBySizeRadial data={bySizeData} />
          </GradientCard>
        </section>

        {/* Tarjetas resumen rápidas */}
        <section className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-6 shadow-xl text-white text-center">
            <div className="text-4xl mb-2">💰</div>
            <p className="text-lg font-semibold opacity-90">Total Ingresos</p>
            <p className="text-3xl font-bold">{money(totalIncome)}</p>
          </div>

          <div className="bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl p-6 shadow-xl text-white text-center">
            <div className="text-4xl mb-2">💸</div>
            <p className="text-lg font-semibold opacity-90">Gastos Diarios</p>
            <p className="text-3xl font-bold">
              {money(totals.totalExpensesCash + totals.totalExpensesTransfer)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-rose-400 to-red-500 rounded-2xl p-6 shadow-xl text-white text-center">
            <div className="text-4xl mb-2">🧾</div>
            <p className="text-lg font-semibold opacity-90">
              Gastos Generales
            </p>
            <p className="text-3xl font-bold">{money(generalExpensesTotal)}</p>
          </div>

          <div
            className={`rounded-2xl p-6 shadow-xl text-white text-center ${
              netTotal >= 0
                ? "bg-gradient-to-br from-purple-500 to-indigo-600"
                : "bg-gradient-to-br from-yellow-500 to-orange-600"
            }`}
          >
            <div className="text-4xl mb-2">{netTotal >= 0 ? "🎯" : "⚠️"}</div>
            <p className="text-lg font-semibold opacity-90">Ganancia Neta</p>
            <p className="text-3xl font-bold">
              {netTotal >= 0 ? "+" : ""}
              {money(netTotal)}
            </p>
          </div>
        </section>

        {/* Tabla de gastos generales */}
        <section className="mb-10">
          <details className="bg-white/80 backdrop-blur rounded-xl border border-white/60 shadow p-4">
            <summary className="cursor-pointer font-semibold text-purple-700">
              Ver gastos generales del rango ({geItems.length})
            </summary>
            {geItems.length === 0 ? (
              <p className="text-sm text-gray-500 mt-2">
                No hay gastos generales en el rango.
              </p>
            ) : (
              <div className="mt-3 rounded-xl overflow-hidden border border-purple-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-purple-50 text-purple-800">
                      <Th>Fecha</Th>
                      <Th>Descripción</Th>
                      <Th className="text-center">Método</Th>
                      <Th className="text-right">Valor</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {geItems.map((g, idx) => (
                      <tr key={idx} className="even:bg-white odd:bg-purple-50/30">
                        <Td>{g.date}</Td>
                        <Td className="text-gray-800">
                          {g.description || "-"}
                        </Td>
                        <Td className="text-center">
                          <Badge
                            tone={g.paymentMethod === "cash" ? "green" : "purple"}
                          >
                            {g.paymentMethod === "cash"
                              ? "Efectivo"
                              : "Transferencia"}
                          </Badge>
                        </Td>
                        <Td className="text-right font-medium">
                          {money(g.value)}
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-white font-bold text-purple-900">
                      <Td className="text-right" colSpan={3}>
                        Totales
                      </Td>
                      <Td className="text-right">
                        {money(generalExpensesTotal)}
                      </Td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </details>
        </section>

        {/* CTA Volver */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl"
          >
            <span className="mr-2">🏠</span> Volver al Inicio
          </Link>
        </div>

        {/* Tip */}
        <div className="mt-8">
          <ProTipBanner
            title="Tip de análisis"
            text="Combina el filtro por quincena con la vista de ‘Métodos de Pago’ para identificar rápidamente cambios en el mix de cobro."
          />
        </div>
      </main>

      <AppFooter appName="InManager" />
    </div>
  );
}

export default Inform;
