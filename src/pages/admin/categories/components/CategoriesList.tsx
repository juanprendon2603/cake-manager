import type { ProductCategory } from "../../../../types/catalog";

export default function CategoryList({
  items,
  onEdit,
  onDelete,
}: {
  items: ProductCategory[];
  onEdit: (c: ProductCategory) => void;
  onDelete: (c: ProductCategory) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((c) => {
        const combosCount = Object.keys(c.variantPrices || {}).length;
        return (
          <div
            key={c.id}
            className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl p-5 shadow hover:shadow-lg transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xl font-extrabold text-[#8E2DA8]">
                  {c.name}
                </div>
                <div className="text-xs text-gray-500">
                  {c.steps.length} atributos • {combosCount} precio
                  {combosCount === 1 ? "" : "s"}
                </div>
              </div>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  c.active !== false
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {c.active !== false ? "Activa" : "Inactiva"}
              </span>
            </div>

            {c.steps.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {c.steps.map((s) => (
                  <span
                    key={s.id}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100"
                  >
                    {s.label}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => onEdit(c)}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-white border hover:bg-gray-50"
              >
                Editar
              </button>
              <button
                onClick={() => onDelete(c)}
                className="px-4 py-2 text-sm font-semibold rounded-lg text-rose-600 hover:bg-rose-50"
              >
                Eliminar
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
