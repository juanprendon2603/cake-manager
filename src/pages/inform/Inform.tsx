import { collection, getDocs } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FullScreenLoader } from "../../components/FullScreenLoader";
import { db } from "../../lib/firebase";
import { parseISO, getDate, lastDayOfMonth, format } from "date-fns";
import {
BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  ResponsiveContainer,
  CartesianGrid,
  Line,
  Legend,
  Area,
  RadialBarChart,
  RadialBar,
  Cell,
  ComposedChart,
} from "recharts";

// ===== Types =====
interface Sale {
  valor?: number;
  amount?: number;
  partialAmount: number;
  paymentMethod: string;
  cantidad?: number;
  quantity?: number;
  flavor: string;
  id: string;
  size: string;
  type: string;
  isPayment?: boolean;
  isPaymentFinalization?: boolean;
  totalPayment?: boolean;
}

interface Expense {
  value: number;
  paymentMethod: string;
  description: string;
}

interface DayDoc {
  date: string;
  sales: Sale[];
  expenses: Expense[];
}

// ===== Color Palettes =====
const COLORS = {
  primary: ['#8E2DA8', '#A855F7', '#C084FC', '#DDD6FE', '#EDE9FE'],
  success: ['#059669', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0'],
  danger: ['#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#FED7D7'],
  warning: ['#D97706', '#F59E0B', '#FBBF24', '#FDE68A', '#FEF3C7'],
  info: ['#0284C7', '#0EA5E9', '#38BDF8', '#7DD3FC', '#BAE6FD'],
  gradient: {
    purple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    blue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    green: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    orange: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    pink: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  }
};

const PIE_COLORS = ['#8E2DA8', '#A855F7', '#C084FC', '#DDD6FE', '#EDE9FE', '#F3E8FF'];

// ===== Enhanced UI Components =====
function AnimatedKpiCard({ 
  label, 
  value, 
  accent = "neutral", 
  icon, 
  trend, 
  subtitle 
}: { 
  label: string; 
  value: string; 
  accent?: "positive" | "negative" | "neutral" | "primary" | "warning" | "info";
  icon?: string;
  trend?: "up" | "down" | "stable";
  subtitle?: string;
}) {
  const styles: Record<string, string> = {
    positive: "bg-gradient-to-br from-green-50 to-emerald-100 border-green-300 text-green-800 shadow-green-100",
    negative: "bg-gradient-to-br from-red-50 to-rose-100 border-red-300 text-red-800 shadow-red-100",
    primary: "bg-gradient-to-br from-purple-50 to-violet-100 border-purple-300 text-[#8E2DA8] shadow-purple-100",
    warning: "bg-gradient-to-br from-yellow-50 to-amber-100 border-yellow-300 text-yellow-800 shadow-yellow-100",
    info: "bg-gradient-to-br from-blue-50 to-sky-100 border-blue-300 text-blue-800 shadow-blue-100",
    neutral: "bg-gradient-to-br from-gray-50 to-slate-100 border-gray-300 text-gray-800 shadow-gray-100",
  };

  const trendIcons = {
    up: "📈",
    down: "📉", 
    stable: "➡️"
  };

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

function GradientCard({ title, children, gradient = "purple" }: { title: string; children: React.ReactNode; gradient?: string }) {
  const gradients = {
    purple: "bg-gradient-to-br from-purple-500 to-pink-500",
    blue: "bg-gradient-to-br from-blue-500 to-cyan-500", 
    green: "bg-gradient-to-br from-green-500 to-teal-500",
    orange: "bg-gradient-to-br from-orange-500 to-red-500",
    pink: "bg-gradient-to-br from-pink-500 to-rose-500",
  };

  return (
    <div className="bg-white border-2 border-purple-200 shadow-xl rounded-3xl overflow-hidden transform hover:shadow-2xl transition-all duration-300">
<div className={`${gradients[gradient as keyof typeof gradients]} p-4`}>
            <h3 className="text-xl font-bold text-white mb-0 flex items-center">
          <span className="mr-2">📊</span>
          {title}
        </h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

function StatsGrid({ stats }: { stats: Array<{label: string, value: string, icon: string, color: string}> }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <div key={idx} className={`${stat.color} rounded-xl p-4 text-center shadow-lg transform hover:scale-105 transition-all duration-300`}>
          <div className="text-2xl mb-2">{stat.icon}</div>
          <div className="text-sm font-medium opacity-80">{stat.label}</div>
          <div className="text-lg font-bold">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}

// ===== Helpers =====
function money(n: number) {
  return `$${Math.round(n).toLocaleString()}`;
}

function getQty(s: Sale) {
  return s.cantidad ?? s.quantity ?? 1;
}

function getAmount(s: Sale) {
  return s.valor ?? s.partialAmount ?? s.amount ?? 0;
}

function isValidSaleItem(s: Sale) {
  return (s.valor ?? s.partialAmount ?? s.amount ?? 0) > 0;
}

// ===== Main Component =====
export function Inform() {
  const [docs, setDocs] = useState<DayDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFortnight, setSelectedFortnight] = useState<"Q1" | "Q2">("Q1");
  const [generalExpensesCash, setGeneralExpensesCash] = useState(0);
  const [generalExpensesTransfer, setGeneralExpensesTransfer] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const salesCol = collection(db, "sales");
        const snapshot = await getDocs(salesCol);

        const result: DayDoc[] = [];
        snapshot.forEach((docSnap) => {
            const d = docSnap.data() as { fecha?: string; sales?: Sale[]; expenses?: Expense[] };
                      const date: string = d.fecha || docSnap.id;
          const sales: Sale[] = Array.isArray(d.sales) ? d.sales : [];
          const expenses: Expense[] = Array.isArray(d.expenses) ? d.expenses : [];

          const parsed = parseISO(date);
          const day = getDate(parsed);
          const lastDay = getDate(lastDayOfMonth(parsed));
          const inFortnight = selectedFortnight === "Q1" ? day >= 1 && day <= 15 : day >= 16 && day <= lastDay;
          if (!inFortnight) return;

          result.push({ date, sales, expenses });
        });

        result.sort((a, b) => (a.date < b.date ? -1 : 1));
        setDocs(result);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedFortnight]);

  useEffect(() => {
    async function fetchGeneralExpenses() {
      try {
        const snapshot = await getDocs(collection(db, "generalExpenses"));

        let cash = 0;
        let transfer = 0;

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
            const date = e?.date || "";

            const d = new Date(date);
            const day = d.getDate();

            const isInFortnight =
              selectedFortnight === "Q1" ? day >= 1 && day <= 15 : day >= 16;
            if (!isInFortnight) return;

            if (pm === "cash") cash += value;
            if (pm === "transfer") transfer += value;
          });
        });

        setGeneralExpensesCash(cash);
        setGeneralExpensesTransfer(transfer);
      } catch (e) {
        setGeneralExpensesCash(0);
        setGeneralExpensesTransfer(0);
        console.error(e);
      }
    }

    fetchGeneralExpenses();
  }, [selectedFortnight]);

  // ===== Enhanced Aggregations =====
  const {
    totalIncome,
    totalExpenses,
    netTotal,
    totalCash,
    totalTransfer,
    saleCount,
    avgTicket,
    bySizeRevenue,
    bestDay,
    worstDay,
    topFlavorsQty,
    dailyStats,
    profitMargin,
    avgDailySales,
    totalDaysWithSales,
    paymentMethodStats,
    flavorDiversity,
  } = useMemo(() => {
    const allSales = docs.flatMap((d) => d.sales).filter(isValidSaleItem);
    const allExpenses = docs.flatMap((d) => d.expenses);

    let totalCash = 0;
    let totalTransfer = 0;
    let totalExpensesCash = 0;
    let totalExpensesTransfer = 0;

    const byFlavorQty = new Map<string, number>();
    const byFlavorRevenue = new Map<string, number>();
    const bySizeQty = new Map<string, number>();
    const bySizeRevenue = new Map<string, number>();
    const byDayRevenue = new Map<string, number>();

    let saleCount = 0;

    for (const s of allSales) {
      const amount = getAmount(s);
      const qty = getQty(s);

      if (s.paymentMethod === "cash") totalCash += amount;
      if (s.paymentMethod === "transfer") totalTransfer += amount;

      byFlavorQty.set(s.flavor, (byFlavorQty.get(s.flavor) || 0) + qty);
      byFlavorRevenue.set(s.flavor, (byFlavorRevenue.get(s.flavor) || 0) + amount);

      bySizeQty.set(s.size, (bySizeQty.get(s.size) || 0) + qty);
      bySizeRevenue.set(s.size, (bySizeRevenue.get(s.size) || 0) + amount);

      saleCount += 1;
    }

    for (const d of docs) {
      const dayRevenue = d.sales.filter(isValidSaleItem).reduce((acc, s) => acc + getAmount(s), 0);
      byDayRevenue.set(d.date, (byDayRevenue.get(d.date) || 0) + dayRevenue);
    }

    for (const e of allExpenses) {
      if (e.paymentMethod === "cash") totalExpensesCash += e.value || 0;
      if (e.paymentMethod === "transfer") totalExpensesTransfer += e.value || 0;
    }

    const totalIncome = totalCash + totalTransfer;
    const totalExpenses = totalExpensesCash + totalExpensesTransfer + generalExpensesCash + generalExpensesTransfer;
    const netTotal = totalIncome - totalExpenses;


    const avgTicket = saleCount > 0 ? totalIncome / saleCount : 0;

    // Best and worst days
    let bestDay: { date: string; revenue: number } | null = null;
    let worstDay: { date: string; revenue: number } | null = null;
    
    for (const [date, revenue] of byDayRevenue.entries()) {
      if (revenue > 0) {
        if (!bestDay || revenue > bestDay.revenue) bestDay = { date, revenue };
        if (!worstDay || revenue < worstDay.revenue) worstDay = { date, revenue };
      }
    }

    // Additional stats
    const profitMargin = totalIncome > 0 ? ((netTotal / totalIncome) * 100) : 0;
    const totalDaysWithSales = Array.from(byDayRevenue.values()).filter(r => r > 0).length;
    const avgDailySales = totalDaysWithSales > 0 ? totalIncome / totalDaysWithSales : 0;
    const flavorDiversity = byFlavorQty.size;

    const paymentMethodStats = [
      { method: "Efectivo", amount: totalCash, percentage: totalIncome > 0 ? (totalCash / totalIncome * 100) : 0 },
      { method: "Transferencia", amount: totalTransfer, percentage: totalIncome > 0 ? (totalTransfer / totalIncome * 100) : 0 }
    ];

    const dailyStats = Array.from(byDayRevenue.entries())
      .map(([date, revenue]) => {
        const dayExpenses = docs.find(d => d.date === date)?.expenses.reduce((acc, e) => acc + (e.value || 0), 0) || 0;
        return {
          date,
          revenue,
          expenses: dayExpenses,
          profit: revenue - dayExpenses,
          formattedDate: format(parseISO(date), "dd/MM")
        };
      })
      .sort((a, b) => (a.date < b.date ? -1 : 1));

    const topFlavorsQty = Array.from(byFlavorQty.entries())
      .map(([name, qty]) => ({ name, qty, revenue: byFlavorRevenue.get(name) || 0 }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 8);

    const topSizesQty = Array.from(bySizeQty.entries())
      .map(([name, qty]) => ({ name, qty, revenue: bySizeRevenue.get(name) || 0 }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 8);

    return {
      totalIncome,
      totalExpenses,
      netTotal,
      totalCash,
      totalTransfer,
      saleCount,
      avgTicket,
      byFlavorQty,
      byFlavorRevenue,
      bySizeQty,
      bySizeRevenue,
      byDayRevenue,
      bestDay,
      worstDay,
      topFlavorsQty,
      topSizesQty,
      dailyStats,
      profitMargin,
      avgDailySales,
      totalDaysWithSales,
      paymentMethodStats,
      flavorDiversity,
    };
  }, [docs, generalExpensesCash, generalExpensesTransfer]);


  const paymentPie = [
    { name: "Efectivo", value: totalCash, color: COLORS.success[1] },
    { name: "Transferencia", value: totalTransfer, color: COLORS.info[1] },
  ];

  if (loading) return <FullScreenLoader message="Generando Informe Súper Mejorado... 🚀" />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100">
      <main className="p-6 sm:p-12 max-w-7xl mx-auto w-full">
        {/* Enhanced Header */}
        <header className="mb-12 text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl opacity-10"></div>
          <div className="relative z-10 py-8">
            <h1 className="text-6xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              📊 Dashboard Súper Mejorado
            </h1>
            <p className="text-xl text-gray-700 font-medium">Análisis completo con más estadísticas y visualizaciones</p>
            <div className="flex justify-center mt-4">
              <div className="bg-white rounded-full px-6 py-2 shadow-lg border-2 border-purple-200">
                <span className="text-purple-600 font-bold">🎯 Quincena {selectedFortnight === "Q1" ? "1" : "2"}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Fortnight Selector */}
        <div className="mb-8 flex flex-col sm:flex-row items-center gap-4 justify-center">
          <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-purple-200">
            <select
              value={selectedFortnight}
              onChange={(e) => setSelectedFortnight(e.target.value as "Q1" | "Q2")}
                            className="border-2 border-purple-300 rounded-xl px-4 py-3 shadow-sm focus:ring-purple-500 focus:border-purple-500 font-semibold text-purple-700"
            >
              <option value="Q1">🗓️ Quincena 1 (1 - 15)</option>
              <option value="Q2">🗓️ Quincena 2 (16 - fin)</option>
            </select>
          </div>
        </div>

        {/* Enhanced KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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
subtitle={`Diarios: ${money(totalExpenses - generalExpensesCash - generalExpensesTransfer)} · Generales: ${money(generalExpensesCash + generalExpensesTransfer)}`}/>
          <AnimatedKpiCard 
            label="🎯 Ganancia Neta" 
            value={`${netTotal >= 0 ? "+" : ""}${money(netTotal)}`} 
            accent="primary" 
            icon="💎"
            trend={netTotal >= 0 ? "up" : "down"}
            subtitle={`${profitMargin.toFixed(1)}% margen`}
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

        {/* Additional Stats Grid */}
        <div className="mb-12">
          <StatsGrid stats={[
            { label: "Mejor Día", value: bestDay ? format(parseISO(bestDay.date), "dd/MM") : "N/A", icon: "🏆", color: "bg-gradient-to-br from-yellow-400 to-orange-500 text-white" },
            { label: "Peor Día", value: worstDay ? format(parseISO(worstDay.date), "dd/MM") : "N/A", icon: "📉", color: "bg-gradient-to-br from-red-400 to-pink-500 text-white" },
            { label: "Sabores Únicos", value: flavorDiversity.toString(), icon: "🎨", color: "bg-gradient-to-br from-purple-400 to-indigo-500 text-white" },
            { label: "Venta Diaria Promedio", value: money(avgDailySales), icon: "📈", color: "bg-gradient-to-br from-green-400 to-teal-500 text-white" },
          ]} />
        </div>

        {/* Enhanced Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Daily Revenue with Expenses */}
          <GradientCard title="📈 Ventas vs Gastos Diarios" gradient="blue">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="formattedDate" 
                    tick={{ fontSize: 12 }}
                    stroke="#6B7280"
                  />
                  <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
                  <Tooltip 
formatter={(v: number | string, name: string) => [money(Number(v)), name]}                    labelStyle={{ color: '#374151' }}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '2px solid #8B5CF6',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    name="Ingresos" 
                    fill="url(#revenueGradient)"
                    stroke="#8B5CF6"
                    strokeWidth={3}
                  />
                  <Bar dataKey="expenses" name="Gastos" fill="#EF4444" opacity={0.7} />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    name="Ganancia" 
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  />
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-green-100 rounded-xl p-3 text-center">
                <div className="text-green-800 font-bold">🏆 Mejor Día</div>
                <div className="text-sm text-green-600">
                  {bestDay ? `${format(parseISO(bestDay.date), "dd/MM")} - ${money(bestDay.revenue)}` : "N/A"}
                </div>
              </div>
              <div className="bg-red-100 rounded-xl p-3 text-center">
                <div className="text-red-800 font-bold">📉 Peor Día</div>
                <div className="text-sm text-red-600">
                  {worstDay ? `${format(parseISO(worstDay.date), "dd/MM")} - ${money(worstDay.revenue)}` : "N/A"}
                </div>
              </div>
            </div>
          </GradientCard>

          {/* Enhanced Payment Methods */}
          <GradientCard title="💳 Métodos de Pago" gradient="green">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={paymentPie} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={5}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}                  >
                    {paymentPie.map((index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index.value % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
formatter={(v: number | string, name: string) => [money(Number(v)), name]}                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '2px solid #10B981',
                      borderRadius: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {paymentMethodStats.map((stat, idx) => (
                <div key={idx} className="bg-gradient-to-r from-green-100 to-teal-100 rounded-xl p-4 text-center">
                  <div className="text-green-800 font-bold">{stat.method}</div>
                  <div className="text-2xl font-bold text-green-700">{money(stat.amount)}</div>
                  <div className="text-sm text-green-600">{stat.percentage.toFixed(1)}%</div>
                </div>
              ))}
            </div>
          </GradientCard>

          {/* Top Flavors with Enhanced Styling */}
          <GradientCard title="🍰 Top Sabores por Cantidad" gradient="pink">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topFlavorsQty.map((f, idx) => ({ 
                    name: f.name, 
                    qty: f.qty,
                    revenue: f.revenue,
                    color: PIE_COLORS[idx % PIE_COLORS.length]
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3E8FF" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    interval={0} 
                    height={80}
                    tick={{ fontSize: 11 }}
                    stroke="#8B5CF6"
                  />
                  <YAxis tick={{ fontSize: 12 }} stroke="#8B5CF6" />
                  <Tooltip 
                    formatter={(v:  number | string, name) => [v, name === "qty" ? "Cantidad" : "Ingresos"]}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '2px solid #EC4899',
                      borderRadius: '12px'
                    }}
                  />
                  <Bar dataKey="qty" name="Cantidad" radius={[8, 8, 0, 0]}>
                    {topFlavorsQty.map((index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index.qty % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GradientCard>

          {/* Size Revenue with Radial Chart */}
          <GradientCard title="📏 Ingresos por Tamaño" gradient="orange">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="20%" 
                  outerRadius="80%" 
                  data={Array.from(bySizeRevenue.entries())
                    .map(([name, value], idx) => ({ 
                      name, 
                      value, 
                      fill: PIE_COLORS[idx % PIE_COLORS.length] 
                    }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5)
                  }
                >
                  <RadialBar dataKey="value" cornerRadius={10} fill="#8884d8" />
                  <Tooltip 
                    formatter={(v: number | string) => money(Number(v))}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '2px solid #F59E0B',
                      borderRadius: '12px'
                    }}
                  />
                  <Legend />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </GradientCard>
        </div>

        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-6 shadow-xl text-white text-center transform hover:scale-105 transition-all duration-300">
            <div className="text-4xl mb-2">💰</div>
            <p className="text-lg font-semibold opacity-90">Total Ingresos</p>
            <p className="text-3xl font-bold">{money(totalIncome)}</p>
            <p className="text-sm opacity-80 mt-1">+{((totalIncome / (totalIncome + totalExpenses)) * 100).toFixed(1)}% del total</p>
          </div>

          <div className="bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl p-6 shadow-xl text-white text-center transform hover:scale-105 transition-all duration-300">
            <div className="text-4xl mb-2">💸</div>
            <p className="text-lg font-semibold opacity-90">Total Gastos</p>
            <p className="text-3xl font-bold">{money(totalExpenses)}</p>
            <p className="text-sm opacity-80 mt-1">{((totalExpenses / (totalIncome + totalExpenses)) * 100).toFixed(1)}% del total</p>
          </div>

          <div className={`rounded-2xl p-6 shadow-xl text-white text-center transform hover:scale-105 transition-all duration-300 ${
            netTotal >= 0 
              ? "bg-gradient-to-br from-purple-500 to-indigo-600" 
              : "bg-gradient-to-br from-yellow-500 to-orange-600"
          }`}>
            <div className="text-4xl mb-2">{netTotal >= 0 ? "🎯" : "⚠️"}</div>
            <p className="text-lg font-semibold opacity-90">Ganancia Neta</p>
            <p className="text-3xl font-bold">
              {netTotal >= 0 ? "+" : ""}{money(netTotal)}
            </p>
            <p className="text-sm opacity-80 mt-1">Margen: {profitMargin.toFixed(1)}%</p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link 
            to="/" 
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <span className="mr-2">🏠</span>
            Volver al Inicio
          </Link>
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="text-center py-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="text-lg font-semibold">🎂 CakeManager Pro Dashboard</div>
        <div className="text-sm opacity-80 mt-1">© 2025 - Análisis Avanzado de Ventas</div>
      </footer>
    </div>
  );
}

