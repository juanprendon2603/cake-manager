import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FullScreenLoader } from "../../components/FullScreenLoader";
import { parseISO, format } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie,
  ResponsiveContainer, CartesianGrid, Line, Legend, Area,
  RadialBarChart, RadialBar, Cell, ComposedChart,
} from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";

import { RangeControls } from "../../components/RangeControls";
import { useRangeSummaryOptimized as useRangeSummary } from "../../hooks/useRangeSummary";
import { useGeneralExpenses } from "../../hooks/useGeneralExpenses";
import type {
  DailyRaw as HookDailyRaw,
  SaleLike as HookSaleLike,
  ExpenseLike as HookExpenseLike,
} from "../../hooks/useRangeSummary";
import type { ComponentPropsWithoutRef } from "react";

type TdProps = ComponentPropsWithoutRef<"td">;
type ThProps = ComponentPropsWithoutRef<"th">;

type PaymentMethod = "cash" | "transfer";

interface Sale {
  valor?: number;
  amount?: number;
  partialAmount?: number;
  paymentMethod: PaymentMethod;
  cantidad?: number;
  quantity?: number;
  flavor: string;
  id: string;
  size: string;
  type: string;
  isPayment?: boolean;
}
interface Expense {
  value: number;
  paymentMethod: PaymentMethod;
  description: string;
}
interface DayDoc { date: string; sales: Sale[]; expenses: Expense[]; }

const COLORS = {
  primary: ['#8E2DA8','#A855F7','#C084FC','#DDD6FE','#EDE9FE'],
  success: ['#059669','#10B981','#34D399','#6EE7B7','#A7F3D0'],
  info: ['#0284C7','#0EA5E9','#38BDF8','#7DD3FC','#BAE6FD'],
} as const;

const PIE_COLORS = ['#8E2DA8','#A855F7','#C084FC','#DDD6FE','#EDE9FE','#F3E8FF'] as const;

type KpiAccent = "positive" | "negative" | "neutral" | "primary" | "warning" | "info";
type Trend = "up" | "down" | "stable";

function AnimatedKpiCard({
  label, value, accent = "neutral", icon, trend, subtitle,
}: {
  label: string;
  value: string;
  accent?: KpiAccent;
  icon?: string;
  trend?: Trend;
  subtitle?: string;
}) {
  const styles: Record<KpiAccent, string> = {
    positive:"bg-gradient-to-br from-green-50 to-emerald-100 border-green-300 text-green-800 shadow-green-100",
    negative:"bg-gradient-to-br from-red-50 to-rose-100 border-red-300 text-red-800 shadow-red-100",
    primary:"bg-gradient-to-br from-purple-50 to-violet-100 border-purple-300 text-[#8E2DA8] shadow-purple-100",
    warning:"bg-gradient-to-br from-yellow-50 to-amber-100 border-yellow-300 text-yellow-800 shadow-yellow-100",
    info:"bg-gradient-to-br from-blue-50 to-sky-100 border-blue-300 text-blue-800 shadow-blue-100",
    neutral:"bg-gradient-to-br from-gray-50 to-slate-100 border-gray-300 text-gray-800 shadow-gray-100",
  };
  const trendIcons: Record<Trend, string> = { up:"📈", down:"📉", stable:"➡️" };
  return (
    <div className={`rounded-2xl p-6 shadow-lg text-center border-2 transform hover:scale-105 transition-all duration-300 ${styles[accent]}`}>
      <div className="flex items-center justify-center mb-2">
        {icon && <span className="text-2xl mr-2">{icon}</span>}
        <p className="text-sm font-semibold opacity-80">{label}</p>
        {trend && <span className="ml-2 text-lg">{trendIcons[trend]}</span>}
      </div>
      <p className="text-3xl font-bold mt-2 mb-1">{value}</p>
      {subtitle && <p className="text-xs opacity-70">{subtitle}</p>}
    </div>
  );
}

type GradientKey = "purple" | "blue" | "green" | "orange" | "pink";

function GradientCard({
  title, children, gradient = "purple",
}: {
  title: string;
  children: React.ReactNode;
  gradient?: GradientKey;
}) {
  const gradients: Record<GradientKey, string> = {
    purple:"bg-gradient-to-br from-purple-500 to-pink-500",
    blue:"bg-gradient-to-br from-blue-500 to-cyan-500",
    green:"bg-gradient-to-br from-green-500 to-teal-500",
    orange:"bg-gradient-to-br from-orange-500 to-red-500",
    pink:"bg-gradient-to-br from-pink-500 to-rose-500",
  };
  return (
    <div className="bg-white border-2 border-purple-200 shadow-xl rounded-3xl overflow-hidden transform hover:shadow-2xl transition-all duration-300">
      <div className={`${gradients[gradient]} p-4`}>
        <h3 className="text-xl font-bold text-white mb-0 flex items-center">
          <span className="mr-2">📊</span>{title}
        </h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function money(n: number){ return `$${Math.round(n).toLocaleString()}`; }
function getQty(s: Sale){ return s.cantidad ?? s.quantity ?? 1; }
function getAmount(s: Sale){ return s.valor ?? s.partialAmount ?? s.amount ?? 0; }
function isValidSaleItem(s: Sale){ return (s.valor ?? s.partialAmount ?? s.amount ?? 0) > 0; }

export function Inform() {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const [range, setRange] = useState<{start:string; end:string}>({
    start: `${todayStr.slice(0,7)}-01`,
    end: todayStr
  });

  const { loading, rawDocs, totals } = useRangeSummary(range);
  const { loading: loadingGE, totals: geTotals, items: geItems } = useGeneralExpenses(range);

  const {
    totalIncome, totalExpenses, netTotal,
    saleCount, avgTicket, bySizeRevenue, topFlavorsQty,
    dailyStats, totalDaysWithSales, generalExpensesTotal,
  } = useMemo(() => {
    // Mapear tipos del hook -> tipos locales sin usar any
    const mapSale = (s: HookSaleLike): Sale => ({
      id: s.id,
      paymentMethod: (s.paymentMethod as PaymentMethod) ?? "cash",
      valor: s.valor,
      cantidad: s.cantidad ?? undefined,
      // los siguientes campos los normalizamos a string legible
      flavor: s.flavor ?? "Sin sabor",
      size: s.size ?? "N/A",
      type: s.type ?? "N/A",
      isPayment: s.isPayment,
    });

    const mapExpense = (e: HookExpenseLike): Expense => ({
      value: e.value,
      paymentMethod: (e.paymentMethod as PaymentMethod) ?? "cash",
      description: e.description ?? "-",
    });

    const docs: DayDoc[] = (rawDocs as HookDailyRaw[]).map(d => ({
      date: d.fecha,
      sales: d.sales.map(mapSale),
      expenses: d.expenses.map(mapExpense),
    }));

    const allSales: Sale[] = docs.flatMap(d => d.sales).filter(isValidSaleItem);
    const allExpenses: Expense[] = docs.flatMap(d => d.expenses);

    let totalCash = 0, totalTransfer = 0, totalExpensesCash = 0, totalExpensesTransfer = 0;
    const byFlavorQty = new Map<string, number>();
    const byFlavorRevenue = new Map<string, number>();
    const bySizeRevenue = new Map<string, number>();
    const byDayRevenue = new Map<string, number>();
    let saleCount = 0;

    for (const s of allSales) {
      const amount = getAmount(s);
      const qty = getQty(s);
      if (s.paymentMethod === "cash") totalCash += amount;
      if (s.paymentMethod === "transfer") totalTransfer += amount;

      const flavorKey = s.flavor || "Sin sabor";
      const sizeKey = s.size || "N/A";

      byFlavorQty.set(flavorKey, (byFlavorQty.get(flavorKey) ?? 0) + qty);
      byFlavorRevenue.set(flavorKey, (byFlavorRevenue.get(flavorKey) ?? 0) + amount);
      bySizeRevenue.set(sizeKey, (bySizeRevenue.get(sizeKey) ?? 0) + amount);
      saleCount += 1;
    }

    for (const d of docs) {
      const dayRevenue = d.sales
        .filter(isValidSaleItem)
        .reduce((acc, s) => acc + getAmount(s), 0);
      byDayRevenue.set(d.date, (byDayRevenue.get(d.date) ?? 0) + dayRevenue);
    }

    for (const e of allExpenses) {
      if (e.paymentMethod === "cash") totalExpensesCash += e.value || 0;
      if (e.paymentMethod === "transfer") totalExpensesTransfer += e.value || 0;
    }

    const generalExpensesTotal = geTotals.generalExpensesTotal;
    const totalIncome = totalCash + totalTransfer;
    const dailyExpenses = totalExpensesCash + totalExpensesTransfer;
    const totalExpenses = dailyExpenses + generalExpensesTotal;
    const netTotal = totalIncome - totalExpenses;
    const avgTicket = saleCount > 0 ? totalIncome / saleCount : 0;

    let bestDay: {date:string; revenue:number} | null = null;
    let worstDay: {date:string; revenue:number} | null = null;
    for (const [date, revenue] of byDayRevenue.entries()) {
      if (revenue > 0) {
        if (!bestDay || revenue > bestDay.revenue) bestDay = { date, revenue };
        if (!worstDay || revenue < worstDay.revenue) worstDay = { date, revenue };
      }
    }

    const totalDaysWithSales = Array.from(byDayRevenue.values()).filter(r => r > 0).length;

    const dailyStats = Array.from(byDayRevenue.entries())
      .map(([date, revenue]) => {
        const dayExpenses = docs
          .find(d => d.date === date)
          ?.expenses.reduce((acc, e) => acc + (e.value || 0), 0) ?? 0;
        return {
          date,
          revenue,
          expenses: dayExpenses,
          profit: revenue - dayExpenses,
          formattedDate: format(parseISO(date), "dd/MM"),
        };
      })
      .sort((a,b) => (a.date < b.date ? -1 : 1));

    const flavorTotals = Array.from(byFlavorQty.entries())
      .map(([name, qty]) => ({ name, qty, revenue: byFlavorRevenue.get(name) ?? 0 }))
      .sort((a,b) => b.qty - a.qty)
      .slice(0, 8);

    return {
      totalIncome, totalExpenses, netTotal,
      saleCount, avgTicket, bySizeRevenue,
      bestDay, worstDay, topFlavorsQty: flavorTotals,
      dailyStats, totalDaysWithSales, generalExpensesTotal,
    };
  }, [rawDocs, geTotals]);

  const paymentPie = [
    { name: "Efectivo", value: totals.totalSalesCash, color: COLORS.success[1] },
    { name: "Transferencia", value: totals.totalSalesTransfer, color: COLORS.info[1] },
  ];

  if (loading || loadingGE) return <FullScreenLoader message="Generando Informe... 🚀" />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100">
      <main className="p-6 sm:p-12 max-w-7xl mx-auto w-full">
        <header className="mb-8 text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl opacity-10" />
          <div className="relative z-10 py-6">
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              📊 Dashboard con Rangos
            </h1>
            <p className="text-gray-700">Filtra por mes/quincena o elige cualquier rango de fechas.</p>
          </div>
        </header>

        <div className="mb-8">
          <RangeControls start={range.start} end={range.end} onChange={(r) => setRange(r)} />
          <p className="text-center text-sm text-gray-600 mt-2">
            Rango: <span className="font-semibold">{range.start}</span> — <span className="font-semibold">{range.end}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
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
            subtitle={`${(totals.totalSalesCash + totals.totalSalesTransfer) ? ((netTotal/(totals.totalSalesCash + totals.totalSalesTransfer))*100).toFixed(1) : "0"}% margen`}
          />
          <AnimatedKpiCard
            label="🎫 Ticket Promedio"
            value={money(avgTicket)}
            accent="info"
            icon="🧾"
            trend="stable"
            subtitle={`${totalDaysWithSales} días activos`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <GradientCard title="📈 Ventas vs Gastos Diarios" gradient="blue">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="formattedDate" tick={{ fontSize: 12 }} stroke="#6B7280" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
                  <Tooltip
                    formatter={(v: ValueType, name: NameType) => [money(Number(v)), String(name)]}
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{ backgroundColor: 'white', border: '2px solid #8B5CF6', borderRadius: '12px' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" name="Ingresos" fill="url(#revenueGradient)" stroke="#8B5CF6" strokeWidth={3} />
                  <Bar dataKey="expenses" name="Gastos" fill="#EF4444" opacity={0.7} />
                  <Line type="monotone" dataKey="profit" name="Ganancia" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }} />
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </GradientCard>

          <GradientCard title="💳 Métodos de Pago" gradient="green">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentPie} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={5}
                    label={(d: { name: string; percent?: number }) =>
                      `${d.name} ${((d.percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {paymentPie.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: ValueType, name: NameType) => [money(Number(v)), String(name)]}
                    contentStyle={{ backgroundColor: 'white', border: '2px solid #10B981', borderRadius: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </GradientCard>

          <GradientCard title="🍰 Top Sabores por Cantidad" gradient="pink">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topFlavorsQty.map((f) => ({ name: f.name, qty: f.qty, revenue: f.revenue }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3E8FF" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={80} tick={{ fontSize: 11 }} stroke="#8B5CF6" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#8B5CF6" />
                  <Tooltip
                    formatter={(v: ValueType, name: NameType) => [String(v), String(name) === "qty" ? "Cantidad" : "Ingresos"]}
                    contentStyle={{ backgroundColor: 'white', border: '2px solid #EC4899', borderRadius: '12px' }}
                  />
                  <Bar dataKey="qty" name="Cantidad" radius={[8, 8, 0, 0]}>
                    {topFlavorsQty.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GradientCard>

          <GradientCard title="📏 Ingresos por Tamaño" gradient="orange">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%" cy="50%" innerRadius="20%" outerRadius="80%"
                  data={Array.from(bySizeRevenue.entries())
                    .map(([name, value]) => ({ name, value }))
                    .sort((a,b)=>b.value-a.value)
                    .slice(0,5)}
                >
                  <RadialBar dataKey="value" cornerRadius={10} fill="#8884d8" />
                  <Tooltip
                    formatter={(v: ValueType) => money(Number(v))}
                    contentStyle={{ backgroundColor: 'white', border: '2px solid #F59E0B', borderRadius: '12px' }}
                  />
                  <Legend />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </GradientCard>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
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
            <p className="text-lg font-semibold opacity-90">Gastos Generales</p>
            <p className="text-3xl font-bold">{money(generalExpensesTotal)}</p>
          </div>

          <div className={`rounded-2xl p-6 shadow-xl text-white text-center ${netTotal>=0 ? "bg-gradient-to-br from-purple-500 to-indigo-600" : "bg-gradient-to-br from-yellow-500 to-orange-600"}`}>
            <div className="text-4xl mb-2">{netTotal>=0 ? "🎯" : "⚠️"}</div>
            <p className="text-lg font-semibold opacity-90">Ganancia Neta</p>
            <p className="text-3xl font-bold">{netTotal>=0?"+":""}{money(netTotal)}</p>
          </div>
        </div>

        <details className="bg-white/80 backdrop-blur rounded-xl border border-white/60 shadow p-4 mb-10">
          <summary className="cursor-pointer font-semibold text-purple-700">
            Ver gastos generales del rango ({geItems.length})
          </summary>
          {geItems.length === 0 ? (
            <p className="text-sm text-gray-500 mt-2">No hay gastos generales en el rango.</p>
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
                      <Td className="text-gray-800">{g.description || "-"}</Td>
                      <Td className="text-center">
                        <Badge tone={g.paymentMethod === "cash" ? "green" : "purple"}>
                          {g.paymentMethod === "cash" ? "Efectivo" : "Transferencia"}
                        </Badge>
                      </Td>
                      <Td className="text-right font-medium">{money(g.value)}</Td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-white font-bold text-purple-900">
                    <Td className="text-right" colSpan={3}>Totales</Td>
                    <Td className="text-right">{money(generalExpensesTotal)}</Td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </details>

        <div className="text-center">
          <Link to="/" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl">
            <span className="mr-2">🏠</span> Volver al Inicio
          </Link>
        </div>
      </main>

      <footer className="text-center py-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="text-lg font-semibold">🎂 CakeManager Pro Dashboard</div>
        <div className="text-sm opacity-80 mt-1">© 2025 - Análisis Avanzado de Ventas</div>
      </footer>
    </div>
  );
}

function Th({ className = "", children, ...rest }: ThProps) {
  return (
    <th
      {...rest}
      className={`p-3 text-left font-semibold text-xs uppercase tracking-wide ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ className = "", children, ...rest }: TdProps) {
  return (
    <td
      {...rest}
      className={`p-3 align-middle ${className}`}
    >
      {children}
    </td>
  );
}

type BadgeTone = "green" | "red" | "purple" | "yellow" | "gray";
function Badge({ children, tone = "gray" }: { children: React.ReactNode; tone?: BadgeTone }) {
  const tones: Record<BadgeTone, string> = {
    green: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    red: "bg-rose-100 text-rose-700 ring-rose-200",
    purple: "bg-purple-100 text-purple-700 ring-purple-200",
    yellow: "bg-amber-100 text-amber-700 ring-amber-200",
    gray: "bg-gray-100 text-gray-700 ring-gray-200",
  };
  return <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ring-1 ${tones[tone]}`}>{children}</span>;
}
