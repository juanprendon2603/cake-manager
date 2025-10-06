// src/pages/sales/steps/Step1Category.tsx
import { motion } from "framer-motion";
import type { ProductCategory } from "../../../types/catalog";
import type { SVGProps, ComponentType, ReactNode } from "react";
import * as L from "lucide-react";

/**
 * Variants (puedes moverlos a un archivo central si ya los tienes)
 */
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18 } },
} as const;

const containerStagger = {
  hidden: { opacity: 1 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.22 } },
} as const;

type Props = {
  categories: ProductCategory[];
  onSelect: (cat: ProductCategory) => void;
};

/**
 * Helpers de icono seguros (evitan errores si tu versión no trae algún ícono)
 */
type IconCmp = ComponentType<SVGProps<SVGSVGElement>>;

// Type guard simple para validar que lo que obtenemos del diccionario es un componente
function isIconComponent(x: unknown): x is IconCmp {
  return typeof x === "function";
}

function pickIcon(name: string): IconCmp {
  // Usamos el diccionario como Record tipado, sin `any`
  const lib: Record<string, unknown> = L as unknown as Record<string, unknown>;
  const candidate = lib[name];

  if (isIconComponent(candidate)) {
    return candidate;
  }

  // Fallback seguro
  return L.Package2 as IconCmp;
}

function IconBadge({
  name,
  className = "w-6 h-6",
  color = "from-purple-500 to-pink-500",
}: {
  name: string;
  className?: string;
  color?: string;
}) {
  const Cmp = pickIcon(name);
  return (
    <div
      className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg text-white bg-gradient-to-br ${color}`}
    >
      <Cmp className={className} />
    </div>
  );
}

/**
 * Tema visual por categoría (ícono lucide + gradientes)
 * - Usa nombres de íconos comunes y seguros; si no existen en tu versión,
 *   pickIcon cae en Package2 sin romper.
 */
function themeFor(cat: ProductCategory): {
  iconNode: ReactNode;
  gradient: string;
  bgGradient: string;
} {
  const id = (cat.id || "").toLowerCase();
  const name = (cat.name || "").toLowerCase();

  // Tortas / cakes
  if (id.includes("torta") || name.includes("torta") || id.includes("cake") || name.includes("cake")) {
    return {
      iconNode: <IconBadge name="Cake" color="from-fuchsia-500 to-pink-500" />, // fallback -> Package2 si no existe
      gradient: "from-fuchsia-500 to-pink-500",
      bgGradient: "from-fuchsia-50 to-pink-50",
    };
  }

  // Bizcochos / sponge
  if (id.includes("bizcocho") || name.includes("bizcocho") || id.includes("sponge") || name.includes("sponge")) {
    return {
      iconNode: <IconBadge name="Cupcake" color="from-amber-500 to-orange-500" />, // fallback -> Package2 si no existe
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-50 to-orange-50",
    };
  }

  // Postres / dulces
  if (id.includes("postre") || name.includes("postre") || id.includes("dessert") || name.includes("dessert")) {
    return {
      iconNode: <IconBadge name="IceCream" color="from-rose-500 to-red-500" />,
      gradient: "from-rose-500 to-red-500",
      bgGradient: "from-rose-50 to-red-50",
    };
  }

  // Panadería
  if (id.includes("pan") || name.includes("pan") || id.includes("bakery") || name.includes("bakery")) {
    return {
      iconNode: <IconBadge name="Croissant" color="from-yellow-500 to-amber-500" />,
      gradient: "from-yellow-500 to-amber-500",
      bgGradient: "from-yellow-50 to-amber-50",
    };
  }

  // Bebidas
  if (id.includes("bebida") || name.includes("bebida") || id.includes("drink") || name.includes("drink")) {
    return {
      iconNode: <IconBadge name="CupSoda" color="from-cyan-500 to-sky-500" />,
      gradient: "from-cyan-500 to-sky-500",
      bgGradient: "from-cyan-50 to-sky-50",
    };
  }

  // Default
  return {
    iconNode: <IconBadge name="Package2" color="from-indigo-500 to-cyan-500" />,
    gradient: "from-indigo-500 to-cyan-500",
    bgGradient: "from-indigo-50 to-cyan-50",
  };
}

export default function Step1Category({ categories, onSelect }: Props) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit">
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
              {/* Fondos sutiles */}
              <div className={`absolute inset-0 bg-gradient-to-br ${t.bgGradient} opacity-50`} />
              <div className={`absolute inset-x-0 top-0 h-16 bg-gradient-to-r ${t.gradient} opacity-20`} />

              <div className="relative z-10 space-y-3 flex flex-col items-center">
                {t.iconNode}
                <h3 className="text-xl font-extrabold text-gray-800">{c.name}</h3>
                <p className="text-sm text-gray-600">Opciones: {(c.steps || []).length}</p>
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
