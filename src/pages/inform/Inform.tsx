import { format } from "date-fns";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FullScreenLoader } from "../../components/FullScreenLoader";
import { RangeControls } from "../../components/RangeControls";
import { useGeneralExpenses } from "../../hooks/useGeneralExpenses";
import { useInformeData } from "../../hooks/useInformeData";
import { useRangeSummaryOptimized as useRangeSummary } from "../../hooks/useRangeSummary";
import { money } from "../../types/informs";

import {
  CategoryAttributeBar,
  DailyRevenueChart,
  PaymentPie,
} from "./components/Charts";

import { BarChart3 } from "lucide-react";
import { AppFooter } from "../../components/AppFooter";
import { BackButton } from "../../components/BackButton";
import { PageHero } from "../../components/ui/PageHero";
import { ProTipBanner } from "../../components/ui/ProTipBanner";
import { AnimatedKpiCard, Badge, GradientCard, Td, Th } from "./components/Kpi";

function ucFirst(s: string) {
  if (!s) return "";
  const t = s.trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

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

  const {
    totals: computed,
    dailyStats,
    paymentPie,
    categoryTotals,
    categoryAttributeCards,
  } = useInformeData(rawDocs, geTotals);

  const categoriesBlocks = useMemo(
    () => categoryAttributeCards,
    [categoryAttributeCards]
  );

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex flex-col">
      <main className="flex-grow p-6 sm:p-12 max-w-7xl mx-auto w-full">
        <div className="relative">
          <PageHero
            icon={<BarChart3 className="w-10 h-10" />}
            title="Dashboard con Rangos"
            subtitle="KPIs generales y, luego, gráficos por categoría → atributos"
          />
          <div className="absolute top-4 left-4">
            <BackButton fallback="/admin" />
          </div>
        </div>

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

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <GradientCard title="📈 Ventas vs Gastos Diarios" gradient="blue">
            <DailyRevenueChart data={dailyStats} />
          </GradientCard>

          <GradientCard title="💳 Métodos de Pago" gradient="green">
            <PaymentPie data={paymentPie} />
          </GradientCard>
        </section>

        {categoriesBlocks.map((cat) => (
          <section key={cat.category} className="mb-12">
            <h3 className="text-xl font-bold text-purple-700 mb-4">
              📦 {ucFirst(cat.category)}
            </h3>
            {cat.attributes.length === 0 ? (
              <div className="bg-white/80 backdrop-blur rounded-xl border border-white/60 shadow p-4 text-sm text-gray-600">
                No hay atributos con ventas en esta categoría para el rango.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {cat.attributes.map((attr) => (
                  <GradientCard
                    key={`${cat.category}-${attr.attribute}`}
                    title={`Ingresos por ${ucFirst(attr.attribute)} (${ucFirst(
                      cat.category
                    )})`}
                    gradient="orange"
                  >
                    <CategoryAttributeBar
                      attribute={attr.attribute}
                      data={attr.data}
                      valueKey="revenue"
                      valueName="Ingresos"
                    />
                  </GradientCard>
                ))}
              </div>
            )}
          </section>
        ))}

        {categoryTotals.length > 0 && (
          <section className="mb-10">
            <div className="bg-white/80 backdrop-blur rounded-xl border border-white/60 shadow p-4">
              <h4 className="font-semibold text-purple-700 mb-3">
                Totales por Categoría
              </h4>
              <div className="mt-3 rounded-xl overflow-hidden border border-purple-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-purple-50 text-purple-800">
                      <Th>Categoría</Th>
                      <Th className="text-right">Ingresos</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryTotals.map((c, idx) => (
                      <tr
                        key={idx}
                        className="even:bg-white odd:bg-purple-50/30"
                      >
                        <Td className="text-gray-800">{c.category}</Td>
                        <Td className="text-right font-medium">
                          {money(c.value)}
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

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
                      <tr
                        key={idx}
                        className="even:bg-white odd:bg-purple-50/30"
                      >
                        <Td>{g.date}</Td>
                        <Td className="text-gray-800">
                          {g.description || "-"}
                        </Td>
                        <Td className="text-center">
                          <Badge
                            tone={
                              g.paymentMethod === "cash" ? "green" : "purple"
                            }
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

        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl"
          >
            <span className="mr-2">🏠</span> Volver al Inicio
          </Link>
        </div>

        <div className="mt-8">
          <ProTipBanner
            title="Tip de análisis"
            text="Explora cada categoría y revisa cuál atributo explica más ingresos; así priorizas inventario/marketing por categoría."
          />
        </div>
      </main>

      <AppFooter appName="InManager" />
    </div>
  );
}

export default Inform;
