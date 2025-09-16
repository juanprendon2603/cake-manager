import {
  useFieldArray,
  type Control,
  type UseFormRegister,
} from "react-hook-form";
import {
  flavorIcons,
  flavors,
  normalizeKey,
  sizeIcons,
  type FlavorKey,
  type FormValues,
  type SizeKey,
} from "../stock.model";

interface Props {
  size: string;
  control: Control<FormValues>;
  register: UseFormRegister<FormValues>;
}

export function CakeSizeFields({ size, control, register }: Props) {
  const key = normalizeKey(size);
  const { fields, append, remove } = useFieldArray<FormValues>({
    control,
    name: `cakes.${key}` as const,
  });

  return (
    <div className="group relative rounded-2xl border-2 border-purple-200/50 bg-gradient-to-br from-white/80 to-purple-50/50 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-purple-300">
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-2xl opacity-10" />

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
                      {flavorIcons[f as FlavorKey]} {f}
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
