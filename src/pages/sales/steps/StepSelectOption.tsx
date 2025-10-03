import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { CategoryStep } from "../../../types/catalog";
import { StepOptionIcon, Ui } from "../../../components/ui/icons";
import type { ReactNode } from "react";

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18 } },
};
const containerStagger = {
  hidden: { opacity: 1 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.22 } },
};

function ucFirst(s: string) {
  if (!s) return "";
  const t = s.trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

type Props = {
  step: CategoryStep;
  value: string | null;
  onSelect: (optKey: string) => void;
  onBack: () => void;
};

function OptionCard({
  selected,
  label,
  icon,
  onClick,
  onKeyDown,
}: {
  selected: boolean;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
}) {
  return (
    <motion.button
      variants={itemVariants}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role="radio"
      aria-checked={selected}
      className={`relative rounded-2xl p-6 text-center font-semibold transition-all duration-300 min-h-[120px] flex flex-col items-center justify-center overflow-hidden group focus:outline-none focus-visible:ring-4 ${
        selected
          ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-xl focus-visible:ring-pink-200"
          : "bg-white/70 backdrop-blur border-2 border-purple-200 text-gray-800 hover:border-purple-400 focus-visible:ring-purple-200"
      }`}
    >
      {selected && (
        <div className="absolute top-2 right-2 text-white/90">✓</div>
      )}

      <div className="mb-2">{icon}</div>
      <span className="text-sm font-bold leading-tight">{ucFirst(label)}</span>
    </motion.button>
  );
}

export default function StepSelectOption({ step, value, onSelect, onBack }: Props) {
  const [q, setQ] = useState("");

  const options = useMemo(
    () => (step.options || []).filter((o) => o.active !== false),
    [step.options]
  );

  const filtered = useMemo(() => {
    if (!q.trim()) return options;
    const t = q.trim().toLowerCase();
    return options.filter(
      (o) =>
        o.key.toLowerCase().includes(t) ||
        (o.label || "").toLowerCase().includes(t)
    );
  }, [options, q]);

  const niceStepLabel = useMemo(
    () => ucFirst(step.label || step.key || ""),
    [step.label, step.key]
  );

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      className="max-w-5xl mx-auto"
    >
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          {niceStepLabel}
        </h3>
        <div className="mt-2 flex justify-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 border border-purple-200 text-xs text-gray-700">
            <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
            {filtered.length} opciones
          </span>
        </div>

        {options.length > 8 && (
          <div className="mt-4 max-w-md mx-auto">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar opciones..."
              className="w-full rounded-xl border-2 border-purple-200 bg-white/80 p-2 text-sm focus:outline-none focus:ring-4 focus:ring-purple-200/70 transition"
            />
          </div>
        )}
      </div>

      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
        role="radiogroup"
        aria-label={niceStepLabel}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {filtered.map((o) => {
          const selected = value === o.key;
          const label = o.label || o.key;
          const icon = StepOptionIcon(step.key, o.key, label); // ← iniciales por atributo
          const handleKey = (e: React.KeyboardEvent<HTMLButtonElement>) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect(o.key);
            }
          };
          return (
            <OptionCard
              key={o.key}
              selected={selected}
              label={label}
              icon={icon}
              onClick={() => onSelect(o.key)}
              onKeyDown={handleKey}
            />
          );
        })}
      </motion.div>

      <div className="mt-8 flex justify-center gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          <Ui.ArrowLeft className="w-5 h-5" />
          Volver
        </button>

        {value && (
          <button
            onClick={() => onSelect("")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/80 border-2 border-purple-200 text-gray-700 font-semibold hover:border-purple-400 transition-all"
          >
            <Ui.Cancel className="w-5 h-5" />
            Limpiar
          </button>
        )}
      </div>
    </motion.div>
  );
}
