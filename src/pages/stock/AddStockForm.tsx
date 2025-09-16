import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../../components/BackButton";
import { FullScreenLoader } from "../../components/FullScreenLoader";
import { useToast } from "../../hooks/useToast";

import { CakeSizeFields } from "./components/CakeSizeFields";
import { ConfirmUpdateModal } from "./components/ConfirmUpdateModal";
import {
  cakeSizes,
  flavors,
  normalizeKey,
  spongeSizes,
  type FormValues,
} from "./stock.model";
import { persistStockUpdate } from "./stock.service";

// --- Form principal ---
export function AddStockForm() {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      cakes: Object.fromEntries(
        cakeSizes.map((size) => [
          normalizeKey(size),
          [{ flavor: "", quantity: "" }],
        ])
      ) as FormValues["cakes"],
      sponges: Object.fromEntries(
        spongeSizes.map((size) => [normalizeKey(size), ""])
      ) as FormValues["sponges"],
    },
  });

  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormValues | null>(
    null
  );

  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleFormSubmit = (formData: FormValues) => {
    setPendingFormData(formData);
    setShowConfirmModal(true);
  };

  const onConfirmSubmit = async () => {
    if (!pendingFormData) return;
    try {
      setLoading(true);
      await persistStockUpdate(pendingFormData);
      reset();
      addToast({
        type: "success",
        title: "¡Stock actualizado! 🎉",
        message: "Inventario actualizado exitosamente.",
        duration: 5000,
      });
      setTimeout(() => navigate("/sales"), 800);
    } catch (error) {
      console.error("Error al guardar:", error);
      addToast({
        type: "error",
        title: "Ups, algo salió mal 😞",
        message: (error as Error).message ?? "Error al actualizar el stock.",
        duration: 5000,
      });
    } finally {
      setLoading(false);
      setPendingFormData(null);
    }
  };

  if (loading)
    return <FullScreenLoader message="🚀 Actualizando inventario..." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex flex-col">
      <main className="flex-grow p-6 sm:p-12 max-w-7xl mx-auto w-full">
        <header className="mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl opacity-10" />
          <div className="relative z-10 py-8">
            <div className="sm:hidden mb-4">
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
              <h2 className="text-4xl sm:text-6xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Inventario de Productos
              </h2>
              <p className="text-xl text-gray-700 font-medium">
                Agrega o incrementa el stock de tortas y bizcochos
              </p>

              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
                <div className="rounded-xl px-4 py-3 text-center bg-white/60 backdrop-blur border border-white/60 shadow">
                  <div className="text-2xl">🎂</div>
                  <div className="text-xs text-gray-600">Tortas</div>
                  <div className="text-sm font-semibold text-purple-600">
                    {cakeSizes.length} tamaños
                  </div>
                </div>
                <div className="rounded-xl px-4 py-3 text-center bg-white/60 backdrop-blur border border-white/60 shadow">
                  <div className="text-2xl">🎨</div>
                  <div className="text-xs text-gray-600">Sabores</div>
                  <div className="text-sm font-semibold text-purple-600">
                    {flavors.length} opciones
                  </div>
                </div>
                <div className="rounded-xl px-4 py-3 text-center bg-white/60 backdrop-blur border border-white/60 shadow">
                  <div className="text-2xl">🧁</div>
                  <div className="text-xs text-gray-600">Bizcochos</div>
                  <div className="text-sm font-semibold text-purple-600">
                    {spongeSizes.length} tamaños
                  </div>
                </div>
                <div className="rounded-xl px-4 py-3 text-center bg-white/60 backdrop-blur border border-white/60 shadow">
                  <div className="text-2xl">⚡</div>
                  <div className="text-xs text-gray-600">Rápido</div>
                  <div className="text-sm font-semibold text-purple-600">
                    Fácil uso
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-12">
          <section className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl opacity-5" />
            <div className="relative z-10 p-8 rounded-3xl bg-white/70 backdrop-blur-xl border-2 border-white/60 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl shadow-lg">
                    🎂
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Tortas
                    </h3>
                    <p className="text-gray-600">
                      Selecciona sabor y cantidad por tamaño
                    </p>
                  </div>
                </div>
                <div className="hidden sm:block px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl border border-purple-200">
                  <span className="text-sm font-semibold text-purple-700">
                    {cakeSizes.length} tamaños disponibles
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {cakeSizes.map((size) => (
                  <CakeSizeFields
                    key={size}
                    size={size}
                    control={control}
                    register={register}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl opacity-5" />
            <div className="relative z-10 p-8 rounded-3xl bg-white/70 backdrop-blur-xl border-2 border-white/60 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-2xl shadow-lg">
                    🧁
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      Bizcochos
                    </h3>
                    <p className="text-gray-600">
                      Ingresa la cantidad por tamaño
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {spongeSizes.map((size) => {
                  const key = normalizeKey(size);
                  return (
                    <div
                      key={size}
                      className="group relative rounded-2xl border-2 border-amber-200/50 bg-gradient-to-br from-white/80 to-amber-50/50 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-amber-300"
                    >
                      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-t-2xl opacity-10" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xl shadow-lg">
                            🧁
                          </div>
                          <div>
                            <label className="block font-bold text-xl text-gray-800">
                              {size}
                            </label>
                            <p className="text-sm text-gray-600">
                              Bizcochos disponibles
                            </p>
                          </div>
                        </div>

                        <input
                          type="number"
                          onWheel={(e) => e.currentTarget.blur()}
                          min={0}
                          {...register(`sponges.${key}` as const)}
                          placeholder="Cantidad a agregar"
                          className="w-full border-2 border-amber-200 rounded-xl p-4 bg-white/90 backdrop-blur focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 font-medium text-center text-lg"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <div className="flex items-center justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-bold text-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center gap-3">
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <span className="text-xl">💾</span>
                    Guardar Productos
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
        </form>

        <div className="mt-12">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600" />
            <div className="relative z-10 p-6 text-white text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-2xl">💡</span>
                <p className="text-lg font-bold">Tip Profesional</p>
              </div>
              <p className="text-purple-100">
                Puedes agregar varios sabores por tamaño antes de guardar. ¡El
                sistema sumará todo automáticamente!
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="text-lg font-semibold">🎂 CakeManager Pro</div>
        <div className="text-sm opacity-80 mt-1">
          © 2025 - Sistema de Inventario Avanzado
        </div>
      </footer>

      <ConfirmUpdateModal
        open={showConfirmModal}
        pendingFormData={pendingFormData}
        onCancel={() => {
          setShowConfirmModal(false);
          setPendingFormData(null);
        }}
        onConfirm={() => {
          setShowConfirmModal(false);
          onConfirmSubmit();
        }}
      />
    </div>
  );
}
