import { useMemo } from "react";
import { BackButton } from "../../components/BackButton";
import { FullScreenLoader } from "../../components/FullScreenLoader";
import { useStock } from "../../hooks/useStock";
import {
  isCakeStock,
  isSpongeStock,
  sizeEmoji,
  type LocalStockDoc,
} from "./stock.model";

function Header() {
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
            Inventario por Tamaño
          </h2>
          <p className="text-lg text-gray-700 mt-2">
            Consulta y gestiona los sabores disponibles por tamaño.
          </p>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {[
              { icon: "🎂", title: "Tortas", desc: "Por tamaño" },
              { icon: "🧁", title: "Bizcochos", desc: "Por cantidad" },
              { icon: "⚡", title: "Gestión", desc: "Rápida" },
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

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center text-2xl shadow-lg">
        0
      </div>
      <p className="mt-4 text-gray-600">No hay productos registrados.</p>
    </div>
  );
}

function StockCard({
  item,
  onClear,
  isClearing,
}: {
  item: LocalStockDoc;
  onClear: (id: string) => void;
  isClearing: boolean;
}) {
  const isCake = item.type === "cake";
  const title = item.id.replaceAll("_", " ");
  const emoji = sizeEmoji[item.id] || (isCake ? "🎂" : "🧁");

  return (
    <div
      className={`group relative rounded-2xl bg-white/80 backdrop-blur-xl border-2 border-white/60 shadow-[0_12px_30px_rgba(0,0,0,0.08)] p-5 transition-all duration-300 hover:shadow-[0_16px_45px_rgba(142,45,168,0.25)] hover:-translate-y-0.5 ${
        isClearing ? "ring-2 ring-red-300 scale-[0.99]" : ""
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-2xl opacity-10" />
      <div className="relative z-10 flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl shadow">
            {emoji}
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-[#8E2DA8] capitalize">
              {title}
            </h3>
            <p className="text-xs text-gray-500">
              {isCake ? "Sabores por tamaño" : "Cantidad disponible"}
            </p>
          </div>
        </div>

        {isCake && (
          <button
            onClick={() => onClear(item.id)}
            className="inline-flex items-center gap-1 bg-gradient-to-r from-red-500 to-rose-500 hover:opacity-95 text-white px-3 py-1.5 rounded-lg shadow-sm text-sm transition-colors"
            title="Vaciar todos los sabores"
          >
            {/* trash icon */}
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
            Vaciar
          </button>
        )}
      </div>

      {/* Content */}
      {isCakeStock(item) && Object.keys(item.flavors).length > 0 ? (
        <ul className="mt-3 space-y-2">
          {Object.entries(item.flavors).map(([flavor, quantity]) => (
            <li
              key={flavor}
              className="flex items-center justify-between bg-[#FDF8FF] border border-[#E8D4F2] rounded-lg px-3 py-2"
            >
              <span className="capitalize text-gray-800">
                {flavor.replaceAll("_", " ")}
              </span>
              <span className="inline-flex items-center justify-center min-w-10 px-2 py-0.5 rounded-md text-sm font-semibold bg-[#8E2DA8]/10 text-[#8E2DA8]">
                {Number(quantity)}
              </span>
            </li>
          ))}
        </ul>
      ) : isSpongeStock(item) ? (
        <div className="mt-3 bg-[#FDF8FF] border border-[#E8D4F2] rounded-lg p-4 text-center">
          <p className="text-gray-800 font-semibold">
            Cantidad: {item.quantity}
          </p>
        </div>
      ) : (
        <div className="mt-3 bg-[#FDF8FF] border border-dashed border-[#E8D4F2] rounded-lg p-4 text-center">
          <p className="text-gray-500 italic">Sin sabores registrados</p>
        </div>
      )}

      <div className="mt-3 text-right text-xs text-gray-500">
        Última actualización:{" "}
        {item.last_update?.toDate
          ? item.last_update.toDate().toLocaleString()
          : "N/A"}
      </div>
    </div>
  );
}

function StatsBar({
  cakeSizes,
  totalFlavors,
  spongeSizes,
  totalSponges,
}: {
  cakeSizes: number;
  totalFlavors: number;
  spongeSizes: number;
  totalSponges: number;
}) {
  const cards = useMemo(
    () => [
      { icon: "🎂", title: "Tamaños de torta", value: cakeSizes },
      { icon: "🎨", title: "Unidades en sabores", value: totalFlavors },
      { icon: "🧁", title: "Tamaños de bizcocho", value: spongeSizes },
      { icon: "📦", title: "Unidades de bizcocho", value: totalSponges },
    ],
    [cakeSizes, totalFlavors, spongeSizes, totalSponges]
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

export function ProductList() {
  const { stocks, loading, clearingId, clearFlavorsById, stats } = useStock({
    realtime: true,
  });

  if (loading) return <FullScreenLoader message="Cargando inventario..." />;

  const handleClear = async (id: string) => {
    if (
      !window.confirm("¿Seguro que quieres vaciar los sabores de este tamaño?")
    )
      return;
    await clearFlavorsById(id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex flex-col">
      <main className="flex-grow p-6 sm:p-12 max-w-7xl mx-auto w-full">
        <Header />
        <StatsBar {...stats} />

        <section className="rounded-3xl p-6 sm:p-8 bg-white/70 backdrop-blur-xl border-2 border-white/60 shadow-2xl">
          {stocks.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {stocks.map((item) => (
                <StockCard
                  key={item.id}
                  item={item}
                  onClear={handleClear}
                  isClearing={clearingId === item.id}
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
