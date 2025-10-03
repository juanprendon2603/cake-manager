import type { ReactNode } from "react";
import {
  ShoppingCart,
  ClipboardList,
  Package2,
  Banknote,
  Landmark,
  BadgePercent,
  ArrowLeft,
  CircleCheck,
  X,
  AlertTriangle,
} from "lucide-react";

/** Helper: iniciales de texto (máx. 2 letras) */
function getInitials(label: string): string {
  if (!label) return "?";
  const words = label.trim().split(/\s+/);
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase();
}

/** Círculo de color para atributos/opciones */
function AttrIcon({ label, color }: { label: string; color: string }) {
  return (
    <div
      className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${color}`}
    >
      {getInitials(label)}
    </div>
  );
}

/** Ícono para páginas */
export function PageIcon(name?: string): ReactNode {
  switch ((name || "").toLowerCase()) {
    case "sales":
    case "venta":
      return <ShoppingCart className="w-7 h-7 text-purple-600" />;
    case "resumen":
      return <ClipboardList className="w-6 h-6 text-purple-600" />;
    default:
      return <Package2 className="w-7 h-7 text-purple-600" />;
  }
}

/** Ícono para método de pago */
export function PaymentIcon(pm: string): ReactNode {
  if (pm === "cash") return <Banknote className="w-5 h-5" />;
  if (pm === "transfer") return <Landmark className="w-5 h-5" />;
  return <BadgePercent className="w-5 h-5" />;
}

/** Ícono SOLO para opciones dinámicas (usa iniciales) */
export function StepOptionIcon(
  stepKey: string,
  optKey: string,
  label: string
): ReactNode {
  const sk = stepKey.toLowerCase();
  let color = "bg-gradient-to-br from-gray-400 to-gray-600";
  if (sk.includes("sabor"))
    color = "bg-gradient-to-br from-red-400 to-pink-500";
  if (sk.includes("tamano") || sk.includes("tamaño") || sk.includes("size"))
    color = "bg-gradient-to-br from-teal-400 to-cyan-500";
  return <AttrIcon label={label} color={color} />;
}

/** Íconos de UI normales */
export const Ui = {
  ArrowLeft: (props?: any) => <ArrowLeft {...props} />,
  Confirm: (props?: any) => <CircleCheck {...props} />,
  Cancel: (props?: any) => <X {...props} />,
  Warn: (props?: any) => <AlertTriangle {...props} />,
};
