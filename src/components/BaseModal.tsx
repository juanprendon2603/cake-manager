// BaseModal.tsx
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { easeM3 } from "../pages/sales/animations";

type Accent = "purple" | "amber" | "indigo" | "pink" | "blue" | "green";
type Size = "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl";

const accentMap: Record<Accent, string> = {
  purple: "from-purple-500 to-pink-500",
  amber: "from-amber-500 to-orange-500",
  indigo: "from-indigo-500 to-blue-500",
  pink: "from-pink-500 to-rose-500",
  blue: "from-blue-500 to-cyan-500",
  green: "from-green-500 to-emerald-500",
};

const sizeMap: Record<Size, string> = {
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
};

interface Action {
  label: string;
  onClick: () => Promise<void> | void; // 👈 permite async
}

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  headerAccent?: Accent;
  title?: React.ReactNode;
  description?: React.ReactNode;
  primaryAction?: Action;
  secondaryAction?: Action;
  size?: Size;
  bodyClassName?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
}

export default function BaseModal({
  isOpen,
  onClose,
  headerAccent = "purple",
  title,
  description,
  primaryAction,
  secondaryAction,
  size = "md",
  bodyClassName,
  children,
  icon,
}: BaseModalProps) {
  const accent = accentMap[headerAccent];
  const width = sizeMap[size];
  const headerIcon = icon ?? "📌";

  const [busy, setBusy] = useState(false);

  const handlePrimaryClick = async () => {
    if (busy || !primaryAction) return;
    setBusy(true);
    try {
      await primaryAction.onClick?.();
    } finally {
      // si cierras el modal en la acción, igual se limpia al desmontar
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={busy ? undefined : onClose} // no cerrar con overlay si está procesando
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.2, ease: easeM3 }}
            className={`bg-white rounded-3xl w-full ${width} shadow-2xl overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            {(title || description) && (
              <div className="relative p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50">
                <div
                  className={`absolute inset-x-0 top-0 h-16 bg-gradient-to-r ${accent} opacity-10`}
                />
                <div className="relative z-10 flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center text-white text-lg`}
                    aria-hidden
                  >
                    {headerIcon}
                  </div>
                  <div>
                    {title && (
                      <h3 className="text-xl font-bold text-gray-800">
                        {title}
                      </h3>
                    )}
                    {description && (
                      <p className="text-gray-600 mt-1 text-sm">
                        {description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className={`p-6 ${bodyClassName ?? ""}`}>
              {children ?? (
                <div className="text-sm text-gray-500">
                  Sin contenido adicional.
                </div>
              )}
            </div>

            {(primaryAction || secondaryAction) && (
              <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                {secondaryAction && (
                  <button
                    onClick={secondaryAction.onClick}
                    disabled={busy}
                    className={`px-5 py-3 text-gray-700 border-2 border-gray-300 rounded-xl transition font-semibold ${
                      busy
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {secondaryAction.label}
                  </button>
                )}
                {primaryAction && (
                  <button
                    onClick={handlePrimaryClick}
                    disabled={busy}
                    className={`px-5 py-3 bg-gradient-to-r ${accent} text-white rounded-xl transition font-bold flex items-center justify-center gap-2 ${
                      busy ? "opacity-60 cursor-not-allowed" : "hover:shadow-lg"
                    }`}
                  >
                    {busy && (
                      <svg
                        className="h-5 w-5 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                    )}
                    {busy ? "Procesando..." : primaryAction.label}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
