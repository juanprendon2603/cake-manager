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
];

const flavors = ["Naranja", "Vainilla Chips", "Vainilla Chocolate", "Negra"];
const spongeSizes = ["Media", "Libra"];

type CakeEntry = { flavor: string; quantity: string };
type CakesBySize = Record<string, CakeEntry[]>;
type SpongesBySize = Record<string, string>;

interface FormValues {
  cakes: CakesBySize;
  sponges: SpongesBySize;
}

function CakeSizeFields({ size, control, register }: { size: string; control: Control<FormValues>; register: UseFormRegister<FormValues> }) {
  const key = size.toLowerCase().replace(/ /g, "_");
  const { fields, append } = useFieldArray<FormValues>({
    control,
    name: `cakes.${key}` as const,
  });



  return (
    <div className="rounded-xl border border-[#E8D4F2] bg-[#FDF8FF] p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="font-semibold text-lg text-gray-800">{size}</p>
        <button
          type="button"
          onClick={() => append({ flavor: "", quantity: "" })}
          className="inline-flex items-center gap-2 text-[#8E2DA8] hover:text-[#7a2391] font-medium"
        >
          <span className="text-xl leading-none">＋</span>
          Agregar sabor
        </button>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-1 sm:grid-cols-[1fr_160px] gap-3">
            <select
              {...register(`cakes.${key}.${index}.flavor` as const)}
              className="border border-[#E8D4F2] rounded-lg p-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#8E2DA8] focus:border-transparent"
            >
              <option value="">Seleccionar sabor</option>
              {flavors.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>

            <input
              type="number"
              min={0}
              {...register(`cakes.${key}.${index}.quantity` as const)}
              placeholder="Cantidad"
              className="border border-[#E8D4F2] rounded-lg p-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#8E2DA8] focus:border-transparent"
            />
          </div>
        ))}
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
      sponges: {},
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
      setLoading(true)
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

      for (const size of spongeSizes) {
        const key = size.toLowerCase().replace(/ /g, "_");
        const qty = parseInt(formData?.sponges?.[key] ?? "0", 10);
        if (qty <= 0) continue;

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
      setLoading(false)
      addToast({
        type: "success",
        title: "Stock actualizado!",
        message: "Stock actualizado exitosamente.",
        duration: 5000,
      });
      setTimeout(() => navigate("/sales"), 800);
    } catch (error) {
      console.error("Error al guardar:", error);
      setLoading(false)
      addToast({
        type: "error",
        title: "Ups, algo salió mal",
        message: (error as Error).message ?? "Error al actualizar el stock.",
        duration: 5000,
      });
    }
  };

  if (loading) {
    return <FullScreenLoader message="Cargando inventario..." />;
  }

  return (
    <div className="min-h-screen bg-[#FDF8FF] flex flex-col">
      <main className="flex-grow p-6 sm:p-12 max-w-6xl mx-auto w-full">


        <header className="mb-6 sm:mb-8">
          <div className="sm:hidden mb-3">
            <BackButton />
          </div>

          <div className="relative">
            <div className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2">
              <BackButton />
            </div>

            <div className="text-left sm:text-center">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-[#8E2DA8]">
                Inventario de Productos
              </h2>
              <p className="text-gray-700 mt-1 sm:mt-2">
                Agrega o incrementa el stock de tortas y bizcochos.
              </p>
            </div>
          </div>
        </header>



        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="bg-white border border-[#E8D4F2] shadow-md rounded-2xl p-6 sm:p-8 space-y-10"
        >
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#8E2DA8]">Tortas</h3>
              <span className="text-sm text-gray-500">
                Selecciona sabor y cantidad por tamaño
              </span>
            </div>

            <div className="space-y-8">
              {cakeSizes.map((size) => (
                <CakeSizeFields key={size} size={size} control={control} register={register} />
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#8E2DA8]">Bizcochos</h3>
              <span className="text-sm text-gray-500">Ingresa la cantidad por tamaño</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {spongeSizes.map((size) => {
                const key = size.toLowerCase().replace(/ /g, "_");
                return (
                  <div
                    key={size}
                    className="rounded-xl border border-[#E8D4F2] bg-[#FDF8FF] p-4 sm:p-5"
                  >
                    <label className="block font-semibold text-gray-800 mb-2">{size}</label>
                    <input
                      type="number"
                      min={0}
                      {...register(`sponges.${key}` as const)}
                      placeholder="Cantidad"
                      className="w-full border border-[#E8D4F2] rounded-lg p-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#8E2DA8] focus:border-transparent"
                    />
                  </div>
                );
              })}
            </div>
          </section>

          <div className="flex items-center justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white py-3.5 px-10 rounded-xl hover:opacity-95 transition shadow-md font-semibold disabled:opacity-60"
            >
              {isSubmitting ? "Guardando..." : "Guardar Productos"}
            </button>
          </div>
        </form>

        <div className="mt-8">
          <div className="bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white rounded-xl p-5 shadow-lg text-center">
            <p className="text-sm opacity-90">Tip</p>
            <p className="text-base">Puedes agregar varios sabores por tamaño antes de guardar.</p>
          </div>
        </div>
      </main>

      <footer className="text-center text-sm text-gray-400 py-6">
        © 2025 CakeManager. Todos los derechos reservados.
      </footer>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold text-[#8E2DA8] mb-4">
              ¿Confirmar actualización de inventario?
            </h3>
            <div className="mb-6 space-y-4 max-h-80 overflow-auto pr-1">
              {!pendingFormData ? (
                <p className="text-gray-600">No hay datos para mostrar.</p>
              ) : (
                <>
                  {cakeSizes.some((size) => {
                    const key = size.toLowerCase().replace(/ /g, "_");
                    const entries = pendingFormData?.cakes?.[key] || [];
                    return entries.some(e => e.flavor && parseInt(e.quantity || "0", 10) > 0);
                  }) && (
                      <div>
                        <h4 className="font-semibold text-[#8E2DA8] mb-2">Tortas</h4>
                        <ul className="space-y-1 text-sm text-gray-700">
                          {cakeSizes.map((size) => {
                            const key = size.toLowerCase().replace(/ /g, "_");
                            const entries = pendingFormData?.cakes?.[key] || [];
                            const valid = entries
                              .filter(e => e.flavor && parseInt(e.quantity || "0", 10) > 0)
                              .map((e, idx) => (
                                <li key={`${key}-${idx}`} className="flex items-center justify-between">
                                  <span>{size} — {e.flavor}</span>
                                  <span className="font-medium">+{parseInt(e.quantity, 10)}</span>
                                </li>
                              ));
                            return valid.length ? (
                              <div key={key} className="mb-2">
                                <div className="text-xs uppercase tracking-wide text-gray-500">{size}</div>
                                <ul className="pl-2 border-l border-violet-200 space-y-1 mt-1">
                                  {valid}
                                </ul>
                              </div>
                            ) : null;
                          })}
                        </ul>
                      </div>
                    )}

                  {spongeSizes.some((size) => {
                    const key = size.toLowerCase().replace(/ /g, "_");
                    const qty = parseInt(pendingFormData?.sponges?.[key] || "0", 10);
                    return qty > 0;
                  }) && (
                      <div>
                        <h4 className="font-semibold text-[#8E2DA8] mb-2">Bizcochos</h4>
                        <ul className="space-y-1 text-sm text-gray-700">
                          {spongeSizes.map((size) => {
                            const key = size.toLowerCase().replace(/ /g, "_");
                            const qty = parseInt(pendingFormData?.sponges?.[key] || "0", 10);
                            return qty > 0 ? (
                              <li key={key} className="flex items-center justify-between">
                                <span>{size}</span>
                                <span className="font-medium">+{qty}</span>
                              </li>
                            ) : null;
                          })}
                        </ul>
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
                      <p className="text-gray-600">No hay cantidades válidas para agregar.</p>
                    )}
                </>
              )}
            </div>
            <p className="text-gray-600 mb-6">
              Esta acción agregará los productos al inventario existente. ¿Estás seguro de continuar?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingFormData(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  if (pendingFormData) onSubmit(pendingFormData);
                }}
                className="px-4 py-2 bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white rounded-lg hover:opacity-95 transition"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}