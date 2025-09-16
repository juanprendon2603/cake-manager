import { useMemo } from "react";
import {
  cakeSizes,
  flavorIcons,
  normalizeKey,
  sizeIcons,
  spongeSizes,
  type FlavorKey,
  type FormValues,
  type SizeKey,
} from "../stock.model";

type Props = {
  open: boolean;
  pendingFormData: FormValues | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmUpdateModal({
  open,
  pendingFormData,
  onCancel,
  onConfirm,
}: Props) {
  if (!open) return null;

  const { hasValidCakes, hasValidSponges } = useMemo(() => {
    const hasValidCakes = cakeSizes.some((size) => {
      const key = normalizeKey(size);
      const entries = pendingFormData?.cakes?.[key] || [];
      return entries.some(
        (e) => e.flavor && parseInt(e.quantity || "0", 10) > 0
      );
    });

    const hasValidSponges = spongeSizes.some((size) => {
      const key = normalizeKey(size);
      const qty = parseInt(pendingFormData?.sponges?.[key] || "0", 10);
      return qty > 0;
    });

    return { hasValidCakes, hasValidSponges };
  }, [pendingFormData]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[80vh] overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-purple-500 to-pink-500 opacity-10" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl">
              ✅
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ¿Confirmar actualización de inventario?
            </h3>
          </div>

          <div className="mb-8 space-y-6 max-h-80 overflow-auto pr-2">
            {!pendingFormData ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📦</div>
                <p>No hay datos para mostrar.</p>
              </div>
            ) : (
              <>
                {hasValidCakes && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                        🎂
                      </div>
                      <h4 className="font-bold text-xl text-purple-700">
                        Tortas
                      </h4>
                    </div>
                    <div className="space-y-3">
                      {cakeSizes.map((size) => {
                        const key = normalizeKey(size);
                        const entries = pendingFormData?.cakes?.[key] || [];
                        const validEntries = entries.filter(
                          (e) => e.flavor && parseInt(e.quantity || "0", 10) > 0
                        );
                        if (validEntries.length === 0) return null;

                        return (
                          <div
                            key={key}
                            className="bg-white/70 rounded-xl p-4 border border-purple-200/50"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">
                                {sizeIcons[size as SizeKey]}
                              </span>
                              <span className="font-semibold text-purple-700">
                                {size}
                              </span>
                            </div>
                            <div className="space-y-2">
                              {validEntries.map((e, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <span className="flex items-center gap-2">
                                    <span>
                                      {flavorIcons[e.flavor as FlavorKey]}
                                    </span>
                                    <span>{e.flavor}</span>
                                  </span>
                                  <span className="font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-lg">
                                    +{parseInt(e.quantity, 10)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {hasValidSponges && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white">
                        🧁
                      </div>
                      <h4 className="font-bold text-xl text-amber-700">
                        Bizcochos
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {spongeSizes.map((size) => {
                        const key = normalizeKey(size);
                        const qty = parseInt(
                          pendingFormData?.sponges?.[key] || "0",
                          10
                        );
                        return qty > 0 ? (
                          <div
                            key={key}
                            className="flex items-center justify-between bg-white/70 rounded-xl p-3 border border-amber-200/50"
                          >
                            <span className="flex items-center gap-2">
                              <span className="text-lg">🧁</span>
                              <span className="font-medium">{size}</span>
                            </span>
                            <span className="font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-lg">
                              +{qty}
                            </span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {!hasValidCakes && !hasValidSponges && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">⚠️</div>
                    <p className="font-medium">
                      No hay cantidades válidas para agregar.
                    </p>
                    <p className="text-sm">
                      Verifica que hayas ingresado sabores y cantidades.
                    </p>
                  </div>
                )}
              </>
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
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
            >
              ✅ Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
