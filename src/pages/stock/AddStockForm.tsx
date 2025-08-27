import { useForm, useFieldArray, type Control, type UseFormRegister } from "react-hook-form";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { FullScreenLoader } from "../../components/FullScreenLoader";
import { useState } from "react";
import { useToast } from "../../hooks/useToast";
import { BackButton } from "../../components/BackButton";
import { useNavigate } from "react-router-dom";


const cakeSizes = [
  "Octavo",
  "Cuarto redondo", 
  "Cuarto cuadrado",
  "Por dieciocho",
  "Media",
  "Libra",
  "Libra y media",
  "Dos libras",
] as const;

type SizeKey = typeof cakeSizes[number];

const flavors = ["Naranja", "Vainilla Chips", "Vainilla Chocolate", "Negra"] as const;
type FlavorKey = typeof flavors[number];

const spongeSizes = ["Media", "Libra"];

const sizeIcons: Record<SizeKey, string> = {
  "Octavo": "🧁",
  "Cuarto redondo": "🎂", 
  "Cuarto cuadrado": "🍰",
  "Por dieciocho": "🎂",
  "Media": "🍰",
  "Libra": "🎂",
  "Libra y media": "🎂",
  "Dos libras": "🎂",
};

const flavorIcons: Record<FlavorKey, string> = {
  "Naranja": "🍊",
  "Vainilla Chips": "🍦",
  "Vainilla Chocolate": "🍫", 
  "Negra": "🖤",
};

type CakeEntry = { flavor: string; quantity: string };
type CakesBySize = Record<string, CakeEntry[]>;
type SpongesBySize = Record<string, string>;

interface FormValues {
  cakes: CakesBySize;
  sponges: SpongesBySize;
}

function CakeSizeFields({ size, control, register }: { size: string; control: Control<FormValues>; register: UseFormRegister<FormValues> }) {
  const key = size.toLowerCase().replace(/ /g, "_");
  const { fields, append, remove } = useFieldArray<FormValues>({
    control,
    name: `cakes.${key}` as const,
  });

  return (
    <div className="group relative rounded-2xl border-2 border-purple-200/50 bg-gradient-to-br from-white/80 to-purple-50/50 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-purple-300">
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-2xl opacity-10"></div>
      
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl shadow-lg">
            {sizeIcons[size as SizeKey] || "🎂"}
          </div>
          <div>
            <p className="font-bold text-xl text-gray-800">{size}</p>
            <p className="text-sm text-gray-600">Tortas disponibles</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => append({ flavor: "", quantity: "" })}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
        >
          <span className="text-lg">＋</span>
          Agregar sabor
        </button>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="relative group/item">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px_40px] gap-3 p-4 rounded-xl bg-white/70 backdrop-blur border border-purple-200/50 hover:border-purple-300 transition-all duration-200">
              <div className="relative">
                <select
                  {...register(`cakes.${key}.${index}.flavor` as const)}
                  className="w-full border-2 border-purple-200 rounded-xl p-3 bg-white/90 backdrop-blur focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 font-medium"
                >
                  <option value="">🎨 Seleccionar sabor</option>
                  {flavors.map((f) => (
                    <option key={f} value={f}>
                      {flavorIcons[f]} {f}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <input
                  type="number"
                  min={0}
                  onWheel={(e) => e.currentTarget.blur()} 
                  {...register(`cakes.${key}.${index}.quantity` as const)}
                  placeholder="Cantidad"
                  className="w-full border-2 border-purple-200 rounded-xl p-3 bg-white/90 backdrop-blur focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 font-medium text-center"
                />
              </div>

              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 transition-all duration-200 hover:scale-110"
                  title="Eliminar sabor"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
        
        {fields.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🎂</div>
            <p>No hay sabores agregados</p>
            <p className="text-sm">Haz clic en "Agregar sabor" para comenzar</p>
          </div>
        )}
      </div>
    </div>
  );
}
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
          size.toLowerCase().replace(/ /g, "_"),
          [{ flavor: "", quantity: "" }],
        ])
      ) as CakesBySize,
      sponges: Object.fromEntries(
        spongeSizes.map((size) => [
          size.toLowerCase().replace(/ /g, "_"),
          "",
        ])
      ) as SpongesBySize,
    },
  });

  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormValues | null>(null);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleFormSubmit = (formData: FormValues) => {
    setPendingFormData(formData);
    setShowConfirmModal(true);
  };

  const onSubmit = async (formData: FormValues) => {
    try {
      setLoading(true);
      
      for (const size of cakeSizes) {
        const key = size.toLowerCase().replace(/ /g, "_");
        const entries = formData?.cakes?.[key] || [];

        const docId = `cake_${key}`;
        const docRef = doc(db, "stock", docId);
        const docSnap = await getDoc(docRef);

        const savedFlavors: Record<string, number> = docSnap.exists()
          ? (docSnap.data().flavors as Record<string, number>) || {}
          : {};

        const newFlavors: Record<string, number> = { ...savedFlavors };
        let hasChanges = false;

        for (const entry of entries) {
          const qty = parseInt(entry?.quantity ?? "0", 10);
          if (!entry?.flavor || qty <= 0) continue;

          const flavorKey = entry.flavor.toLowerCase().replace(/ /g, "_");
          newFlavors[flavorKey] = (newFlavors[flavorKey] || 0) + qty;
          hasChanges = true;
        }

        if (hasChanges) {
          await setDoc(docRef, {
            type: "cake",
            size,
            flavors: newFlavors,
            last_update: Timestamp.now(),
          });
        }
      }

      // Process sponges
   // Process sponges (bizcochos)
for (const size of spongeSizes) {
  const key = size.toLowerCase().replace(/ /g, "_");
  const qty = parseInt(formData?.sponges?.[key] ?? "0", 10);

  // 👇 importante: si no hay cantidad, no hagas nada
  if (!qty || qty <= 0) continue;

  const docId = `sponge_${key}`;
  const docRef = doc(db, "stock", docId);
  const docSnap = await getDoc(docRef);

  let total = docSnap.exists() ? (docSnap.data().quantity as number) || 0 : 0;
  total += qty;

  await setDoc(docRef, {
    type: "sponge",
    size,
    quantity: total,
    last_update: Timestamp.now(),
  });
}


      reset();
      setLoading(false);
      addToast({
        type: "success",
        title: "¡Stock actualizado! 🎉",
        message: "Inventario actualizado exitosamente.",
        duration: 5000,
      });
      setTimeout(() => navigate("/sales"), 800);
    } catch (error) {
      console.error("Error al guardar:", error);
      setLoading(false);
      addToast({
        type: "error",
        title: "Ups, algo salió mal 😞",
        message: (error as Error).message ?? "Error al actualizar el stock.",
        duration: 5000,
      });
    }
  };

  if (loading) {
    return <FullScreenLoader message="🚀 Actualizando inventario..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex flex-col">
      <main className="flex-grow p-6 sm:p-12 max-w-7xl mx-auto w-full">
        <header className="mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl opacity-10"></div>
          
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
                  <div className="text-sm font-semibold text-purple-600">{cakeSizes.length} tamaños</div>
                </div>
                <div className="rounded-xl px-4 py-3 text-center bg-white/60 backdrop-blur border border-white/60 shadow">
                  <div className="text-2xl">🎨</div>
                  <div className="text-xs text-gray-600">Sabores</div>
                  <div className="text-sm font-semibold text-purple-600">{flavors.length} opciones</div>
                </div>
                <div className="rounded-xl px-4 py-3 text-center bg-white/60 backdrop-blur border border-white/60 shadow">
                  <div className="text-2xl">🧁</div>
                  <div className="text-xs text-gray-600">Bizcochos</div>
                  <div className="text-sm font-semibold text-purple-600">{spongeSizes.length} tamaños</div>
                </div>
                <div className="rounded-xl px-4 py-3 text-center bg-white/60 backdrop-blur border border-white/60 shadow">
                  <div className="text-2xl">⚡</div>
                  <div className="text-xs text-gray-600">Rápido</div>
                  <div className="text-sm font-semibold text-purple-600">Fácil uso</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-12"
        >
          <section className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl opacity-5"></div>
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
                    <p className="text-gray-600">Selecciona sabor y cantidad por tamaño</p>
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
                  <CakeSizeFields key={size} size={size} control={control} register={register} />
                ))}
              </div>
            </div>
          </section>

          <section className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl opacity-5"></div>
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
                    <p className="text-gray-600">Ingresa la cantidad por tamaño</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {spongeSizes.map((size) => {
                  const key = size.toLowerCase().replace(/ /g, "_");
                  return (
                    <div
                      key={size}
                      className="group relative rounded-2xl border-2 border-amber-200/50 bg-gradient-to-br from-white/80 to-amber-50/50 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-amber-300"
                    >
                      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-t-2xl opacity-10"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xl shadow-lg">
                            🧁
                          </div>
                          <div>
                            <label className="block font-bold text-xl text-gray-800">{size}</label>
                            <p className="text-sm text-gray-600">Bizcochos disponibles</p>
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
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <span className="text-xl">💾</span>
                    Guardar Productos
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </form>

        <div className="mt-12">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"></div>
            <div className="relative z-10 p-6 text-white text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-2xl">💡</span>
                <p className="text-lg font-bold">Tip Profesional</p>
              </div>
              <p className="text-purple-100">
                Puedes agregar varios sabores por tamaño antes de guardar. ¡El sistema sumará todo automáticamente!
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="text-lg font-semibold">🎂 CakeManager Pro</div>
        <div className="text-sm opacity-80 mt-1">© 2025 - Sistema de Inventario Avanzado</div>
      </footer>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[80vh] overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-purple-500 to-pink-500 opacity-10"></div>
            
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
                    {cakeSizes.some((size) => {
                      const key = size.toLowerCase().replace(/ /g, "_");
                      const entries = pendingFormData?.cakes?.[key] || [];
                      return entries.some(e => e.flavor && parseInt(e.quantity || "0", 10) > 0);
                    }) && (
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                            🎂
                          </div>
                          <h4 className="font-bold text-xl text-purple-700">Tortas</h4>
                        </div>
                        <div className="space-y-3">
                          {cakeSizes.map((size) => {
                            const key = size.toLowerCase().replace(/ /g, "_");
                            const entries = pendingFormData?.cakes?.[key] || [];
                            const validEntries = entries.filter(e => e.flavor && parseInt(e.quantity || "0", 10) > 0);
                            
                            if (validEntries.length === 0) return null;
                            
                            return (
                              <div key={key} className="bg-white/70 rounded-xl p-4 border border-purple-200/50">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-lg">{sizeIcons[size]}</span>
                                  <span className="font-semibold text-purple-700">{size}</span>
                                </div>
                                <div className="space-y-2">
                                  {validEntries.map((e, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                      <span className="flex items-center gap-2">
                                        <span>{flavorIcons[e.flavor as FlavorKey]}</span>
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

                    {spongeSizes.some((size) => {
                      const key = size.toLowerCase().replace(/ /g, "_");
                      const qty = parseInt(pendingFormData?.sponges?.[key] || "0", 10);
                      return qty > 0;
                    }) && (
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white">
                            🧁
                          </div>
                          <h4 className="font-bold text-xl text-amber-700">Bizcochos</h4>
                        </div>
                        <div className="space-y-2">
                          {spongeSizes.map((size) => {
                            const key = size.toLowerCase().replace(/ /g, "_");
                            const qty = parseInt(pendingFormData?.sponges?.[key] || "0", 10);
                            return qty > 0 ? (
                              <div key={key} className="flex items-center justify-between bg-white/70 rounded-xl p-3 border border-amber-200/50">
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

                    {!cakeSizes.some((size) => {
                      const key = size.toLowerCase().replace(/ /g, "_");
                      const entries = pendingFormData?.cakes?.[key] || [];
                      return entries.some(e => e.flavor && parseInt(e.quantity || "0", 10) > 0);
                    }) && !spongeSizes.some((size) => {
                      const key = size.toLowerCase().replace(/ /g, "_");
                      const qty = parseInt(pendingFormData?.sponges?.[key] || "0", 10);
                      return qty > 0;
                    }) && (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-2">⚠️</div>
                        <p className="font-medium">No hay cantidades válidas para agregar.</p>
                        <p className="text-sm">Verifica que hayas ingresado sabores y cantidades.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 mb-6 border border-blue-200">
                <div className="flex items-center gap-2 text-blue-700">
                  <span className="text-lg">ℹ️</span>
                  <p className="font-medium">
                    Esta acción agregará los productos al inventario existente. ¿Estás seguro de continuar?
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setPendingFormData(null);
                  }}
                  className="px-6 py-3 text-gray-600 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    if (pendingFormData) onSubmit(pendingFormData);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
                >
                  ✅ Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}