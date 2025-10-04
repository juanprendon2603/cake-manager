import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { PIE_COLORS } from "../types";
import { money } from "../utils";

export function DailyRevenueChart({
  data,
}: {
  data: Array<{
    date: string;
    revenue: number;
    expenses: number;
    profit: number;
    formattedDate: string;
  }>;
}) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="formattedDate"
            tick={{ fontSize: 12 }}
            stroke="#6B7280"
          />
          <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
          <Tooltip
            formatter={(v: ValueType, name: NameType) => [
              money(Number(v)),
              String(name),
            ]}
            labelStyle={{ color: "#374151" }}
            contentStyle={{
              backgroundColor: "white",
              border: "2px solid #8B5CF6",
              borderRadius: "12px",
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
            dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
          />
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
            label={(d: { name: string; percent?: number }) =>
              `${d.name} ${((d.percent ?? 0) * 100).toFixed(0)}%`
            }
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: ValueType, name: NameType) => [
              money(Number(v)),
              String(name),
            ]}
            contentStyle={{
              backgroundColor: "white",
              border: "2px solid #10B981",
              borderRadius: "12px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryAttributeBar({
  data,
  yLabel = "Opción",
  valueKey = "revenue",
  valueName = "Ingresos",
}: {
  attribute: string;
  data: Array<{ option: string; revenue: number; qty: number }>;
  yLabel?: string;
  valueKey?: "revenue" | "qty";
  valueName?: string;
}) {
  const chartData = data.map((d) => ({ name: d.option, value: d[valueKey] }));
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
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
            formatter={(v: ValueType) =>
              valueKey === "revenue" ? money(Number(v)) : String(v)
            }
            labelFormatter={(l) => `${yLabel}: ${l}`}
            contentStyle={{
              backgroundColor: "white",
              border: "2px solid #EC4899",
              borderRadius: "12px",
            }}
          />
          <Legend />
          <Bar dataKey="value" name={valueName} radius={[8, 8, 0, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
