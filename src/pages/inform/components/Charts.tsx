// src/pages/inform/components/Charts.tsx
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Area,
  Bar,
  Line,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  BarChart,
} from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import { PIE_COLORS, COLORS } from "../types";
import { money } from "../utils";

/* ------------------------------------------------
 * Diaria: ingresos vs gastos + línea de ganancia
 * ----------------------------------------------*/
export function DailyRevenueChart({
  data,
}: {
  data: Array<{ date: string; revenue: number; expenses: number; profit: number; formattedDate: string }>;
}) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="formattedDate" tick={{ fontSize: 12 }} stroke="#6B7280" />
          <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
          <Tooltip
            formatter={(v: ValueType, name: NameType) => [money(Number(v)), String(name)]}
            labelStyle={{ color: "#374151" }}
            contentStyle={{ backgroundColor: "white", border: "2px solid #8B5CF6", borderRadius: "12px" }}
          />
          <Legend />
          <Area type="monotone" dataKey="revenue" name="Ingresos" fill="url(#revenueGradient)" stroke="#8B5CF6" strokeWidth={3} />
          <Bar dataKey="expenses" name="Gastos" fill="#EF4444" opacity={0.7} />
          <Line type="monotone" dataKey="profit" name="Ganancia" stroke="#10B981" strokeWidth={3} dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }} />
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/* -------------------------
 * Pie: Métodos de pago
 * ------------------------*/
export function PaymentPie({
  data,
}: {
  data: Array<{ name: string; value: number }>;
}) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={40}
            paddingAngle={5}
            label={(d: { name: string; percent?: number }) => `${d.name} ${((d.percent ?? 0) * 100).toFixed(0)}%`}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: ValueType, name: NameType) => [money(Number(v)), String(name)]}
            contentStyle={{ backgroundColor: "white", border: "2px solid #10B981", borderRadius: "12px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/* -----------------------------------------
 * Barras: Top Sabores por Cantidad
 * ----------------------------------------*/
export function TopFlavorsBar({
  data,
}: {
  data: Array<{ name: string; qty: number; revenue: number }>;
}) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3E8FF" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={80} tick={{ fontSize: 11 }} stroke="#8B5CF6" />
          <YAxis tick={{ fontSize: 12 }} stroke="#8B5CF6" />
          <Tooltip
            formatter={(v: ValueType, name: NameType) => [String(v), String(name) === "qty" ? "Cantidad" : "Ingresos"]}
            contentStyle={{ backgroundColor: "white", border: "2px solid #EC4899", borderRadius: "12px" }}
          />
          <Bar dataKey="qty" name="Cantidad" radius={[8, 8, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* -----------------------------------------------------------------
 * NUEVO: Barras apiladas por categoría para cada atributo
 *   - props.data: [{ option, total, [catName]: number }]
 *   - props.categories: nombres de las categorías (series apiladas)
 * ----------------------------------------------------------------*/
export function AttributeRevenueStacked({
  attribute,
  categories,
  data,
}: {
  attribute: string;
  categories: string[];
  data: Array<{ option: string; total: number; [k: string]: number | string }>;
}) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 16, right: 24, left: 8, bottom: 56 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#F3E8FF" />
          <XAxis
            dataKey="option"
            angle={-40}
            textAnchor="end"
            interval={0}
            height={70}
            tick={{ fontSize: 11 }}
            stroke="#8B5CF6"
          />
          <YAxis tick={{ fontSize: 12 }} stroke="#8B5CF6" />
          <Tooltip
            formatter={(v: ValueType, name: NameType) => [money(Number(v)), String(name)]}
            labelFormatter={(label) => `${attribute}: ${label}`}
            contentStyle={{ backgroundColor: "white", border: "2px solid #F59E0B", borderRadius: "12px" }}
          />
          <Legend />
          {categories.map((cat, idx) => (
            <Bar
              key={cat}
              dataKey={cat}
              name={cat}
              stackId="rev"
              radius={[8, 8, 0, 0]}
              fill={PIE_COLORS[idx % PIE_COLORS.length]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* (Opcional) radial antiguo, por si lo quieres seguir usando
export function RevenueBySizeRadial({
  data,
}: {
  data: Array<{ name: string; value: number }>;
}) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={data}>
          <RadialBar dataKey="value" cornerRadius={10} fill={COLORS.primary[0]} />
          <Tooltip
            formatter={(v: ValueType) => money(Number(v))}
            contentStyle={{ backgroundColor: "white", border: "2px solid #F59E0B", borderRadius: "12px" }}
          />
          <Legend />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}
*/
