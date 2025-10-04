import {
  AlertTriangle,
  ArrowLeft,
  BadgePercent,
  Banknote,
  CircleCheck,
  ClipboardList,
  Landmark,
  Package2,
  ShoppingCart,
  X,
} from "lucide-react";
import type { ReactNode } from "react";

function getInitials(label: string): string {
  if (!label) return "?";
  const words = label.trim().split(/\s+/);
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase();
}

function AttrIcon({ label, color }: { label: string; color: string }) {
  return (
    <div
      className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${color}`}
    >
      {getInitials(label)}
    </div>
  );
}

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

export function PaymentIcon(pm: string): ReactNode {
  if (pm === "cash") return <Banknote className="w-5 h-5" />;
  if (pm === "transfer") return <Landmark className="w-5 h-5" />;
  return <BadgePercent className="w-5 h-5" />;
}

export function StepOptionIcon(stepKey: string, label: string): ReactNode {
  const sk = stepKey.toLowerCase();
  let color = "bg-gradient-to-br from-gray-400 to-gray-600";
  if (sk.includes("sabor"))
    color = "bg-gradient-to-br from-red-400 to-pink-500";
  if (sk.includes("tamano") || sk.includes("tamaño") || sk.includes("size"))
    color = "bg-gradient-to-br from-teal-400 to-cyan-500";
  return <AttrIcon label={label} color={color} />;
}

export const Ui = {
  ArrowLeft: (props?: any) => <ArrowLeft {...props} />,
  Confirm: (props?: any) => <CircleCheck {...props} />,
  Cancel: (props?: any) => <X {...props} />,
  Warn: (props?: any) => <AlertTriangle {...props} />,
};
