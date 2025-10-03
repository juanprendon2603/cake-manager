// src/pages/sales/DailySummary.tsx
import { useState } from "react";
import type {
  ExpenseLike,
  DailyRaw as RangeDailyRaw,
  SaleLike,
} from "../../hooks/useRangeSummary";
import type { Expense, Sale } from "../../types/finance";

import { Link } from "react-router-dom";
import { FullScreenLoader } from "../../components/FullScreenLoader";
import { RangeControls } from "../../components/RangeControls";
import { useGeneralExpenses } from "../../hooks/useGeneralExpenses";
import { useRangeSummaryOptimized as useRangeSummary } from "../../hooks/useRangeSummary";
import { quincenaRange } from "../../utils/dateRanges";
import { DailyDetail } from "./DailyDetail";

// ✨ UI consistente con el resto de la app
import { AppFooter } from "../../components/AppFooter";
import { PageHero } from "../../components/ui/PageHero";
import { ProTipBanner } from "../../components/ui/ProTipBanner";

import type { ComponentPropsWithoutRef } from "react";
import { BackButton } from "../../components/BackButton";
import { CalendarDays, CalendarRange } from "lucide-react";

type ThProps = ComponentPropsWithoutRef<"th">;
type TdProps = ComponentPropsWithoutRef<"td">;

export function DailySummary() {
  const today = new Date();
  const ymDefault = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}`;

  // Rango controlado por RangeControls (por defecto: Q1 del mes actual)
  const [range, setRange] = useState<{ start: string; end: string }>(() =>
    quincenaRange(ymDefault, "Q1")
  );

  const { loading, daily, rawDocs, totals } = useRangeSummary(range);
  const {
    loading: loadingGE,
    totals: geTotals,
    items: geItems,
  } = useGeneralExpenses(range);

  // Para el modal detalle
  const [selected, setSelected] = useState<RangeDailyRaw | null>(null);

  if (loading || loadingGE) {
    return <FullScreenLoader message="Cargando resumen..." />;
  }

  // Helpers UI
  const formatCurrency = (n: number) =>
    "$" +
    (n || 0).toLocaleString("es-CO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const {
    totalSalesCash,
    totalSalesTransfer,
    totalExpensesCash,
    totalExpensesTransfer,
    totalNet,

    totalIngresos,
    totalGastosDiarios,
  } = totals;

  // ➕ Totales de gastos generales
  const { generalExpensesCash, generalExpensesTransfer, generalExpensesTotal } =
    geTotals;

  // Neto global que incluye gastos generales
  const netoGlobal = totalNet - generalExpensesTotal;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex flex-col">
      <main className="flex-grow p-6 sm:p-12 max-w-6xl mx-auto w-full">
        <div className="relative">
          <PageHero
  icon={<CalendarRange className="w-10 h-10" />}
  title="Resumen por Rango"
            subtitle="Consulta ventas, abonos y gastos entre fechas (mensual, quincenal o personalizado)"
          />
          <div className="absolute top-4 left-4">
            <BackButton fallback="/admin" />
          </div>
        </div>

        {/* Controles de rango */}
        <section className="rounded-3xl border-2 border-white/60 bg-white/80 backdrop-blur-xl shadow-2xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col gap-3">
            <RangeControls
              start={range.start}
              end={range.end}
              onChange={setRange}
            />
            <p className="text-xs text-gray-500 text-center">
              Rango activo: <strong>{range.start}</strong> →{" "}
              <strong>{range.end}</strong>
            </p>
          </div>
        </section>

        {/* KPIs del rango */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KpiCard
            title="Total Ingresos"
            value={formatCurrency(totalIngresos)}
            tone="green"
            sub={`Efec: ${formatCurrency(
              totalSalesCash
            )} · Transf: ${formatCurrency(totalSalesTransfer)}`}
          />
          <KpiCard
            title="Gastos Diarios"
            value={formatCurrency(totalGastosDiarios)}
            tone="red"
            sub={`Efec: ${formatCurrency(
              totalExpensesCash
            )} · Transf: ${formatCurrency(totalExpensesTransfer)}`}
          />
          <KpiCard
            title="Gastos Generales"
            value={formatCurrency(generalExpensesTotal)}
            tone="red"
            sub={`Efec: ${formatCurrency(
              generalExpensesCash
            )} · Transf: ${formatCurrency(generalExpensesTransfer)}`}
          />
          <KpiCard
            title="Neto Global"
            value={
              (netoGlobal >= 0 ? "+" : "-") +
              formatCurrency(Math.abs(netoGlobal))
            }
            tone={netoGlobal >= 0 ? "purple" : "yellow"}
            sub={`Neto (solo diarios): ${
              (totalNet >= 0 ? "+" : "-") + formatCurrency(Math.abs(totalNet))
            }`}
          />
        </section>

        {/* Bloque compacto con el desglose de generales */}
        <section className="mb-8">
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
                          {formatCurrency(g.value)}
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
                        {formatCurrency(generalExpensesTotal)}
                      </Td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </details>
        </section>

        {/* Tabla desktop (ventas/diarios) */}
        {daily.length === 0 ? (
          <p className="text-center text-gray-500">No hay datos en el rango.</p>
        ) : (
          <div className="hidden sm:block rounded-2xl overflow-hidden border border-white/60 bg-white/80 backdrop-blur shadow">
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
                  {daily.map((row, idx) => {
                    const positive = row.net >= 0;
                    return (
                      <tr
                        key={row.fecha}
                        className="even:bg-white/60 odd:bg-white/90 hover:bg-purple-50/70 transition-colors"
                      >
                        <Td className="font-semibold text-gray-800">
                          {row.fecha}
                        </Td>
                        <Td className="text-right">
                          {formatCurrency(row.totalSalesCash)}
                        </Td>
                        <Td className="text-right">
                          {formatCurrency(row.totalSalesTransfer)}
                        </Td>
                        <Td className="text-right text-red-700">
                          {formatCurrency(row.totalExpensesCash)}
                        </Td>
                        <Td className="text-right text-red-700">
                          {formatCurrency(row.totalExpensesTransfer)}
                        </Td>
                        <Td className="text-right font-semibold text-emerald-700">
                          {formatCurrency(row.disponibleEfectivo)}
                        </Td>
                        <Td className="text-right font-semibold text-emerald-700">
                          {formatCurrency(row.disponibleTransfer)}
                        </Td>
                        <Td
                          className={`text-right font-bold ${
                            positive ? "text-green-700" : "text-red-700"
                          }`}
                        >
                          {positive ? "+" : ""}
                          {formatCurrency(row.net)}
                        </Td>
                        <Td className="text-center">
                          <button
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow hover:shadow-md transition"
                            onClick={() => setSelected(rawDocs[idx])}
                          >
                            Ver
                          </button>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Móvil (ventas/diarios) */}
        <div className="grid grid-cols-1 gap-4 sm:hidden mt-6">
          {daily.map((row, idx) => {
            const positive = row.net >= 0;
            return (
              <div
                key={row.fecha}
                className="p-4 rounded-2xl shadow border border-white/60 bg-white/85 backdrop-blur"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-purple-700">
                    {row.fecha}
                  </h3>
                  <Badge tone={positive ? "green" : "red"}>
                    {positive ? "Ganancia" : "Pérdida"}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-y-1 text-sm">
                  <span className="text-gray-600">Efectivo</span>
                  <span className="text-right">
                    {formatCurrency(row.totalSalesCash)}
                  </span>
                  <span className="text-gray-600">Transfer</span>
                  <span className="text-right">
                    {formatCurrency(row.totalSalesTransfer)}
                  </span>
                  <span className="text-gray-600">Gastos Ef.</span>
                  <span className="text-right text-red-700">
                    {formatCurrency(row.totalExpensesCash)}
                  </span>
                  <span className="text-gray-600">Gastos Tr.</span>
                  <span className="text-right text-red-700">
                    {formatCurrency(row.totalExpensesTransfer)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p
                    className={`font-bold ${
                      positive ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {positive ? "+" : ""}
                    {formatCurrency(row.net)}
                  </p>
                  <button
                    className="mt-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1.5 rounded-lg text-sm shadow"
                    onClick={() => setSelected(rawDocs[idx])}
                  >
                    Ver detalle
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal detalle (ventas/diarios) */}
        {selected && (
          <DailyDetail
            fecha={selected.fecha}
            sales={selected.sales.map(
              (s: SaleLike): Sale => ({
                id: s.id,
                type: s.type ?? "",
                size: s.size ?? "",
                flavor: s.flavor ?? "",
                cantidad: s.cantidad ?? 0,
                paymentMethod: s.paymentMethod as Sale["paymentMethod"],
                valor: s.valor ?? 0,
                isPayment: !!s.isPayment,
              })
            )}
            expenses={selected.expenses.map(
              (e: ExpenseLike): Expense => ({
                description: e.description ?? "",
                paymentMethod: e.paymentMethod,
                value: e.value,
              })
            )}
            onClose={() => setSelected(null)}
          />
        )}

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg hover:shadow-xl"
          >
            <span>🏠</span> Volver al inicio
          </Link>
        </div>

        {/* Tip */}
        <div className="mt-8">
          <ProTipBanner
            title="Tip de caja"
            text="Compárate por quincenas y revisa el ‘Neto Global’ para incluir los gastos generales del período."
          />
        </div>
      </main>

      <AppFooter appName="InManager" />
    </div>
  );
}

/* ---------- UI helpers ---------- */
function Th({ children, className = "", ...rest }: ThProps) {
  return (
    <th
      {...rest}
      className={`p-3 text-left font-semibold text-xs uppercase tracking-wide ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = "", ...rest }: TdProps) {
  return (
    <td {...rest} className={`p-3 align-middle ${className}`}>
      {children}
    </td>
  );
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
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ring-1 ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

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
  const toneMap: Record<
    string,
    { bg: string; text: string; ring: string; icon: string }
  > = {
    green: {
      bg: "from-emerald-50 to-green-50",
      text: "text-emerald-800",
      ring: "ring-emerald-100",
      icon: "fa-coins",
    },
    red: {
      bg: "from-rose-50 to-red-50",
      text: "text-rose-800",
      ring: "ring-rose-100",
      icon: "fa-wallet",
    },
    purple: {
      bg: "from-purple-50 to-pink-50",
      text: "text-purple-800",
      ring: "ring-purple-100",
      icon: "fa-chart-line",
    },
    yellow: {
      bg: "from-yellow-50 to-amber-50",
      text: "text-amber-800",
      ring: "ring-amber-100",
      icon: "fa-scale-balanced",
    },
  };
  const t = toneMap[tone];
  return (
    <div
      className={`rounded-2xl bg-gradient-to-br ${t.bg} ${t.text} p-4 ring-1 ${t.ring} shadow-sm`}
    >
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

export default DailySummary;
