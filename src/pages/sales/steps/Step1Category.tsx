import { motion } from "framer-motion";
import type { ProductCategory } from "../../../types/catalog";

/**
 * Si ya tienes estos variants centralizados (../animations),
 * puedes importarlos desde ahí y borrar los objetos de abajo.
 */
// import { pageVariants, containerStagger, itemVariants } from "../animations";

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18 } },
};

const containerStagger = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.22 } },
};

type Props = {
  categories: ProductCategory[];
  onSelect: (cat: ProductCategory) => void;
};

/** Tema visual por categoría (icono + gradientes). Extiende aquí si agregas más. */
function themeFor(cat: ProductCategory) {
  const id = (cat.id || "").toLowerCase();
  const name = (cat.name || "").toLowerCase();

  if (id.includes("torta") || name.includes("torta") || id.includes("cake")) {
    return {
      icon: "🎂",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
    };
  }
  if (
    id.includes("bizcocho") ||
    name.includes("bizcocho") ||
    id.includes("sponge")
  ) {
    return {
      icon: "🧁",
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-50 to-orange-50",
    };
  }
  // default
  return {
    icon: "🧾",
    gradient: "from-indigo-500 to-cyan-500",
    bgGradient: "from-indigo-50 to-cyan-50",
  };
}

export default function Step1Category({ categories, onSelect }: Props) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto"
      >
        {categories.map((c) => {
          const t = themeFor(c);
          return (
            <motion.button
              key={c.id}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(c)}
              className="relative rounded-2xl p-8 text-center font-bold text-lg transition-all duration-300 overflow-hidden group"
            >
              {/* fondos como en el diseño viejo */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${t.bgGradient} opacity-50`}
              />
              <div
                className={`absolute inset-x-0 top-0 h-16 bg-gradient-to-r ${t.gradient} opacity-20`}
              />
              <div className="relative z-10">
                <div className="text-4xl mb-3">{t.icon}</div>
                <h3 className="text-xl font-extrabold text-gray-800 mb-2">
                  {c.name}
                </h3>
                <p className="text-sm text-gray-600">
                  Opciones: {(c.steps || []).length}
                </p>
              </div>
              <div
                className={`absolute inset-0 bg-gradient-to-r ${t.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
              />
            </motion.button>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
