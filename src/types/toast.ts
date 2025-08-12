import React from "react";

export type AlertType = "success" | "error" | "warning" | "info";

export type Toast = {
  id: string;
  type: AlertType;
  title?: string;
  message: string;
  duration?: number;
};

export type ToastContextValue = {
  addToast: (t: Omit<Toast, "id">) => void;
};

export const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export const alertColors: Record<AlertType, { bg: string; border: string; text: string; icon: string }> = {
  success: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", icon: "text-emerald-500" },
  error: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-800", icon: "text-rose-500" },
  warning: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", icon: "text-amber-500" },
  info: { bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-800", icon: "text-sky-500" },
};
