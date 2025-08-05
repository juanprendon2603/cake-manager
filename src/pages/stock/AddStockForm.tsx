import { useForm, useFieldArray } from "react-hook-form";
import {
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

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

const flavors = ["Naranja", "Vainilla Chips", "Vainilla Chocolate"];
const spongeSizes = ["Media", "Libra"];

export function AddStockForm() {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      cakes: Object.fromEntries(
        cakeSizes.map((size) => [
          size.toLowerCase().replace(/ /g, "_"),
          [{ flavor: "", quantity: "" }],
        ])
      ),
      sponges: {},
    },
  });

  const onSubmit = async (formData: any) => {
    try {
      for (const size of cakeSizes) {
        const key = size.toLowerCase().replace(/ /g, "_");
        const entries = formData?.cakes?.[key] || [];

        const docId = `cake_${key}`;
        const docRef = doc(db, "stock", docId);
        const docSnap = await getDoc(docRef);

        let savedFlavors = docSnap.exists() ? docSnap.data().flavors || {} : {};
        let newFlavors = { ...savedFlavors };
        let hasChanges = false;

        for (const entry of entries) {
          if (!entry?.flavor || parseInt(entry.quantity) <= 0) continue;
          const flavorKey = entry.flavor.toLowerCase().replace(/ /g, "_");
          const quantity = parseInt(entry.quantity);

          newFlavors[flavorKey] = (newFlavors[flavorKey] || 0) + quantity;
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
        const quantity = parseInt(formData?.sponges?.[key] || 0);
        if (quantity <= 0) continue;

        const docId = `sponge_${key}`;
        const docRef = doc(db, "stock", docId);
        const docSnap = await getDoc(docRef);

        let total = docSnap.exists() ? (docSnap.data().quantity || 0) : 0;
        total += quantity;

        await setDoc(docRef, {
          type: "sponge",
          size,
          quantity: total,
          last_update: Timestamp.now(),
        });
      }

      reset();
      alert("Stock actualizado correctamente.");
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Ocurrió un error al guardar el stock.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-10 space-y-12">
        <h2 className="text-4xl font-extrabold text-pink-600 text-center">Inventario de Productos</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
          <section>
            <h3 className="text-3xl font-semibold text-pink-500 mb-6">Tortas</h3>
            {cakeSizes.map((size) => {
              const key = size.toLowerCase().replace(/ /g, "_");
              const { fields, append } = useFieldArray({
                control,
                name: `cakes.${key}`,
              });

              return (
                <div key={size} className="border-b border-pink-300 pb-6 mb-6">
                  <p className="font-semibold text-lg mb-4">{size}</p>
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                      <select
                        {...register(`cakes.${key}.${index}.flavor`)}
                        className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-400"
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
                        {...register(`cakes.${key}.${index}.quantity`)}
                        placeholder="Cantidad"
                        className="w-28 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-400"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => append({ flavor: "", quantity: "" })}
                    className="text-pink-600 hover:underline font-medium"
                  >
                    + Agregar otro sabor
                  </button>
                </div>
              );
            })}
          </section>

          <section>
            <h3 className="text-3xl font-semibold text-pink-500 mb-6">Bizcochos</h3>
            <div className="space-y-4">
              {spongeSizes.map((size) => {
                const key = size.toLowerCase().replace(/ /g, "_");
                return (
                  <div key={size} className="flex items-center gap-6">
                    <label className="w-40 font-semibold">{size}</label>
                    <input
                      type="number"
                      min={0}
                      {...register(`sponges.${key}`)}
                      placeholder="Cantidad"
                      className="w-28 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>
                );
              })}
            </div>
          </section>

          <div className="text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-pink-600 text-white py-4 px-12 rounded-xl hover:bg-pink-700 transition font-semibold text-lg disabled:opacity-60"
            >
              {isSubmitting ? "Guardando..." : "Guardar Productos"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}