import React from "react";
import type { KpiAccent, Trend, GradientKey, ThProps, TdProps } from "../../../types/informs";

export function AnimatedKpiCard({
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

export function GradientCard({
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

export function Th({ className = "", children, ...rest }: ThProps) {
  return (
    <th
      {...rest}
      className={`p-3 text-left font-semibold text-xs uppercase tracking-wide ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({ className = "", children, ...rest }: TdProps) {
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
export function Badge({ children, tone = "gray" }: { children: React.ReactNode; tone?: BadgeTone }) {
  const tones: Record<BadgeTone, string> = {
    green: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    red: "bg-rose-100 text-rose-700 ring-rose-200",
    purple: "bg-purple-100 text-purple-700 ring-purple-200",
    yellow: "bg-amber-100 text-amber-700 ring-amber-200",
    gray: "bg-gray-100 text-gray-700 ring-gray-200",
  };
  return <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ring-1 ${tones[tone]}`}>{children}</span>;
}
