import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type Toast, ToastContext, alertColors } from "../types/toast";

function ToastCard({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const colors = alertColors[toast.type];
  const durationSec = (toast.duration ?? 4000) / 1000;

  React.useEffect(() => {
    const t = setTimeout(onClose, toast.duration ?? 4000);
    return () => clearTimeout(t);
  }, [toast.duration, onClose]);

  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: -50, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, x: 50, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`relative max-w-sm w-full flex items-start gap-3 ${colors.bg} ${colors.border} border px-4 py-3 rounded-xl shadow-lg`}
    >
      <div className={`flex-shrink-0 ${colors.icon}`}>
        {toast.type === "success" && (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mt-0.5">
            <path
              fillRule="evenodd"
              d="M12 2.25a9.75 9.75 0 1 0 0 19.5 9.75 9.75 0 0 0 0-19.5Zm4.03 7.28a.75.75 0 0 0-1.06-1.06l-4.72 4.72-1.72-1.72a.75.75 0 1 0-1.06 1.06l2.25 2.25c.3.3.77.3 1.06 0l5.25-5.25Z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {toast.type === "error" && (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mt-0.5">
            <path
              fillRule="evenodd"
              d="M12 2.25a9.75 9.75 0 1 0 0 19.5 9.75 9.75 0 0 0 0-19.5Zm-1.03 5.97a.75.75 0 1 1 1.06-1.06l1.97 1.97 1.97-1.97a.75.75 0 1 1 1.06 1.06L15.06 9.19l1.97 1.97a.75.75 0 0 1-1.06 1.06l-1.97-1.97-1.97 1.97a.75.75 0 0 1-1.06-1.06l1.97-1.97-1.97-1.97Z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {toast.type === "warning" && (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mt-0.5">
            <path
              fillRule="evenodd"
              d="M10.88 2.67a1.5 1.5 0 0 1 2.24 0l8.16 9.52c.9 1.05.14 2.66-1.12 2.66H3.84c-1.26 0-2.02-1.61-1.12-2.66l8.16-9.52ZM12 8.25a.75.75 0 0 1 .75.75v3a.75.75 0 1 1-1.5 0v-3A.75.75 0 0 1 12 8.25Zm0 7.5a.938.938 0 1 0 0-1.875.938.938 0 0 0 0 1.875Z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {toast.type === "info" && (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mt-0.5">
            <path
              fillRule="evenodd"
              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm0 3a1.125 1.125 0 1 1 0 2.25 1.125 1.125 0 0 1 0-2.25ZM10.875 9A1.125 1.125 0 0 0 9.75 10.125v6a1.125 1.125 0 1 0 2.25 0v-6A1.125 1.125 0 0 0 10.875 9Z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>

      <div className="flex-1">
        {toast.title && (
          <div className={`font-semibold ${alertColors[toast.type].text} mb-1`}>
            {toast.title}
          </div>
        )}
        <div className={`text-sm ${alertColors[toast.type].text}`}>
          {toast.message}
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="ml-2 rounded-md p-1 text-gray-400 hover:text-gray-600 hover:bg-black/10 transition-colors"
        aria-label="Cerrar"
      >
        ✕
      </button>

      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-current opacity-20 rounded-b-xl"
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: durationSec, ease: "linear" }}
      />
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((t: Omit<Toast, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { ...t, id }]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = React.useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-[9999] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastCard key={t.id} toast={t} onClose={() => removeToast(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
