import React, { useMemo } from "react";
import type { ProductCategory, VariantRow } from "../stock.model";

type Props = {
  open: boolean;
  category: ProductCategory | null; // categoría actual (ej. "tortas")
  date: string; // YYYY-MM-DD (para mostrar)
  rows: VariantRow[]; // [{ variantKey, parts, qty }]
  onCancel: () => void;
  onConfirm: () => void;
};

// Iconos opcionales según el step/option (puedes ajustarlos a tu gusto)
const stepIconByKey: Record<string, React.ReactNode> = {
  tamano: <span className="text-lg">📏</span>,
  sabor: <span className="text-lg">🎨</span>,
};
const categoryIcon: Record<string, React.ReactNode> = {
  tortas: <span className="text-xl">🎂</span>,
  bizcochos: <span className="text-xl">🧁</span>,
};

export function ConfirmUpdateModal({
  open,
  category,
  date,
  rows,
  onCancel,
  onConfirm,
}: Props) {
  if (!open) return null;

  // Filtra solo filas con cantidad válida
  const lines = useMemo(
    () => (rows || []).filter((r) => Number(r.qty) > 0),
    [rows]
  );
  const hasLines = lines.length > 0;

  // Helper para mostrar “chips” bonitos de la variante usando las labels de la categoría
  const renderVariantChips = (parts: Record<string, string>) => {
    // parts = { tamano: "libra", sabor: "chocolate" }
    const steps = category?.steps || [];
    return (
      <div className="flex flex-wrap gap-2">
        {Object.entries(parts).map(([stepKey, optKey]) => {
          const step = steps.find((s) => s.key === stepKey);
          const opt = step?.options?.find((o) => o.key === optKey);
          const label = `${step?.label ?? stepKey}: ${opt?.label ?? optKey}`;
          return (
            <span
              key={`${stepKey}:${optKey}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-purple-200 bg-purple-50 text-purple-700"
            >
              {stepIconByKey[stepKey] ?? null}
              {label}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[80vh] overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-purple-500 to-pink-500 opacity-10" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl">
              ✅
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ¿Confirmar actualización de inventario?
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {categoryIcon[category?.id ?? ""]}{" "}
                <strong>{category?.name ?? "—"}</strong> • Fecha:{" "}
                <strong>{date}</strong>
              </p>
            </div>
          </div>

          <div className="mb-8 space-y-6 max-h-80 overflow-auto pr-2">
            {!hasLines ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">⚠️</div>
                <p className="font-medium">
                  No hay cantidades válidas para agregar.
                </p>
                <p className="text-sm">
                  Verifica que hayas ingresado cantidades.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">
                        Variante
                      </th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-700 w-28">
                        Cantidad
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((r) => (
                      <tr key={r.variantKey} className="border-t">
                        <td className="px-3 py-2">
                          {renderVariantChips(r.parts)}
                        </td>
                        <td className="px-3 py-2 text-right font-semibold">
                          +{Number(r.qty)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 mb-6 border border-blue-200">
            <div className="flex items-center gap-2 text-blue-700">
              <span className="text-lg">ℹ️</span>
              <p className="font-medium">
                Esta acción agregará los productos al inventario existente.
                ¿Estás seguro de continuar?
              </p>
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <button
              onClick={onCancel}
              className="px-6 py-3 text-gray-600 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={!hasLines}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold disabled:opacity-60"
            >
              ✅ Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
