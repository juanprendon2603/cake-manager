import { useEffect, useMemo, useState } from "react";
import { BackButton } from "../../components/BackButton";
import { FullScreenLoader } from "../../components/FullScreenLoader";
import { useStock } from "../../hooks/useStock";
import { listCategories } from "../catalog/catalog.service";
import type { ProductCategory } from "./stock.model";

/* ------------------------------ Helpers UI ------------------------------ */
function parseVariantParts(
  variantKey: string
): Array<{ stepKey: string; optKey: string }> {
  // "tamano:libra|sabor:chocolate"  ó  "tamano=libra|sabor=chocolate"
  if (!variantKey) return [];
  return variantKey.split("|").map((pair) => {
    const idx = pair.indexOf(":") >= 0 ? pair.indexOf(":") : pair.indexOf("=");
    if (idx < 0) return { stepKey: pair.trim(), optKey: "" };
    return {
      stepKey: pair.slice(0, idx).trim(),
      optKey: pair.slice(idx + 1).trim(),
    };
  });
}

function chipsFromVariant(
  variantKey: string,
  category: ProductCategory | null
) {
  const pairs = parseVariantParts(variantKey);
  const steps = category?.steps || [];
  return pairs.map(({ stepKey, optKey }) => {
    const step = steps.find((s) => s.key === stepKey);
    const opt = step?.options?.find((o) => o.key === optKey);
    const label = `${step?.label ?? stepKey}: ${opt?.label ?? optKey}`;
    return (
      <span
        key={`${stepKey}:${optKey}`}
        className="inline-flex items-center px-2.5 py-1 rounded-lg border border-purple-200 bg-purple-50 text-purple-700"
      >
        {label}
      </span>
    );
  });
}

/* -------------------------------- Header -------------------------------- */
function Header({
  categories,
  category,
  setCategory,
}: {
  categories: ProductCategory[];
  category: ProductCategory | null;
  setCategory: (c: ProductCategory | null) => void;
}) {
  return (
    <header className="mb-10 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl opacity-10" />
      <div className="relative z-10 py-6">
        <div className="sm:hidden mb-3">
          <BackButton />
        </div>
        <div className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2">
          <BackButton />
        </div>
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl shadow-lg">
              📦
            </div>
          </div>
          <h2 className="text-4xl sm:text-6xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Inventario por Variantes
          </h2>
          <p className="text-lg text-gray-700 mt-2">
            Consulta y gestiona el stock por combinación de opciones.
          </p>

          {/* Selector de categoría */}
          <div className="mt-6 max-w-xl mx-auto">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Categoría
            </label>
            <select
              className="w-full rounded-xl border-2 border-purple-200 bg-white/80 p-3"
              value={category?.id || ""}
              onChange={(e) => {
                const next =
                  categories.find((c) => c.id === e.target.value) || null;
                setCategory(next);
              }}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {[
              { icon: "🧩", title: "Variantes", desc: "Por combinación" },
              { icon: "⚡", title: "Gestión", desc: "Rápida" },
              { icon: "📊", title: "Resumen", desc: "Al instante" },
              { icon: "🔒", title: "Acciones", desc: "Seguras" },
            ].map((b, i) => (
              <div
                key={i}
                className="rounded-xl px-4 py-3 text-center bg-white/60 backdrop-blur border border-white/60 shadow"
              >
                <div className="text-2xl">{b.icon}</div>
                <div className="text-xs text-gray-600">{b.title}</div>
                <div className="text-sm font-semibold text-purple-600">
                  {b.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------- EmptyState ------------------------------- */
function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center text-2xl shadow-lg">
        0
      </div>
      <p className="mt-4 text-gray-600">No hay variantes registradas.</p>
    </div>
  );
}

/* -------------------------------- StockCard ------------------------------- */
function StockCard({
  variantKey,
  stock,
  onReset,
  isResetting,
  category,
}: {
  variantKey: string;
  stock: number;
  onReset: (variantKey: string) => void;
  isResetting: boolean;
  category: ProductCategory | null;
}) {
  const chips = chipsFromVariant(variantKey, category);

  return (
    <div
      className={`group relative rounded-2xl bg-white/80 backdrop-blur-xl border-2 border-white/60 shadow-[0_12px_30px_rgba(0,0,0,0.08)] p-5 transition-all duration-300 hover:shadow-[0_16px_45px_rgba(142,45,168,0.25)] hover:-translate-y-0.5 ${
        isResetting ? "ring-2 ring-red-300 scale-[0.99]" : ""
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-2xl opacity-10" />
      <div className="relative z-10 flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl shadow">
            🧩
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-[#8E2DA8]">Variante</h3>
            <p className="text-xs text-gray-500">Combinación seleccionada</p>
          </div>
        </div>
        <button
          onClick={() => onReset(variantKey)}
          className="inline-flex items-center gap-1 bg-gradient-to-r from-red-500 to-rose-500 hover:opacity-95 text-white px-3 py-1.5 rounded-lg shadow-sm text-sm transition-colors"
          title="Reiniciar a 0"
        >
          {/* trash/reset icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 100 2h.278l.863 10.356A2 2 0 007.134 18h5.732a2 2 0 001.993-1.644L15.722 6H16a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0010 2H9zM8 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          Reset
        </button>
      </div>

      <div className="mt-2">
        {chips.length ? (
          <div className="flex flex-wrap gap-2">{chips}</div>
        ) : (
          <em className="text-gray-500">—</em>
        )}
      </div>

      <div className="mt-3 bg-[#FDF8FF] border border-[#E8D4F2] rounded-lg p-4 text-center">
        <p className="text-gray-800 font-semibold">Stock: {Number(stock)}</p>
      </div>
    </div>
  );
}

/* --------------------------------- StatsBar -------------------------------- */
function StatsBar({
  totalVariants,
  totalUnits,
}: {
  totalVariants: number;
  totalUnits: number;
}) {
  const cards = useMemo(
    () => [
      { icon: "🧩", title: "Variantes", value: totalVariants },
      { icon: "📦", title: "Unidades totales", value: totalUnits },
    ],
    [totalVariants, totalUnits]
  );
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {cards.map((c, i) => (
        <div
          key={i}
          className="rounded-xl px-4 py-3 text-center bg-white/60 backdrop-blur border border-white/60 shadow"
        >
          <div className="text-2xl">{c.icon}</div>
          <div className="text-xs text-gray-600">{c.title}</div>
          <div className="text-sm font-semibold text-purple-600">{c.value}</div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------- ProductList ------------------------------- */
export function ProductList() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [loadingCats, setLoadingCats] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const all = await listCategories();
        setCategories(all);
        setCategory(all[0] || null);
      } finally {
        setLoadingCats(false);
      }
    })();
  }, []);

  const { stocks, loading, pendingVariant, resetVariant, stats } = useStock({
    categoryId: category?.id || "",
    realtime: true,
  });

  if (loadingCats || (loading && !category)) {
    return <FullScreenLoader message="Cargando inventario..." />;
  }

  const handleReset = async (variantKey: string) => {
    if (
      !window.confirm(
        "¿Seguro que quieres reiniciar el stock de esta variante a 0?"
      )
    )
      return;
    await resetVariant(variantKey, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex flex-col">
      <main className="flex-grow p-6 sm:p-12 max-w-7xl mx-auto w-full">
        <Header
          categories={categories}
          category={category}
          setCategory={setCategory}
        />
        <StatsBar
          totalVariants={stats.totalVariants}
          totalUnits={stats.totalUnits}
        />

        <section className="rounded-3xl p-6 sm:p-8 bg-white/70 backdrop-blur-xl border-2 border-white/60 shadow-2xl">
          {loading ? (
            <FullScreenLoader message="Cargando variantes..." />
          ) : stocks.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {stocks.map((v) => (
                <StockCard
                  key={v.variantKey}
                  variantKey={v.variantKey}
                  stock={v.stock}
                  onReset={handleReset}
                  isResetting={pendingVariant === v.variantKey}
                  category={category}
                />
              ))}
            </div>
          )}
        </section>

        <div className="mt-10">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#8E2DA8] to-[#A855F7]" />
            <div className="relative z-10 p-6 text-white text-center">
              <p className="text-sm opacity-90">Resumen visual</p>
              <p className="text-xl font-bold">Inventario actualizado</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center text-sm text-white py-6 bg-gradient-to-r from-[#7a1f96] via-[#8E2DA8] to-[#a84bd1]">
        © 2025 CakeManager. Todos los derechos reservados.
      </footer>
    </div>
  );
}
