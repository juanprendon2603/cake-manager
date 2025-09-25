import { useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../../components/BackButton";
import { FullScreenLoader } from "../../components/FullScreenLoader";
import { useToast } from "../../hooks/useToast";

import {
  buildVariantKey,
  listCategories,
  persistGenericStockUpdate,
} from "../../pages/catalog/catalog.service"; // <-- si buildVariantKey está en otro archivo, ajústalo
import { ConfirmUpdateModal } from "./components/ConfirmUpdateModal";
import {
  todayKey,
  type CategoryOption,
  type CategoryStep,
  type ProductCategory,
} from "./stock.model";

/* -------------------------------------------------------------------------- */
/*                               Tipos de Form                                 */
/* -------------------------------------------------------------------------- */

type LineRow = {
  /** Selecciones de TODOS los steps que afectan stock */
  selections: Record<string, string>; // { tamano: "libra", sabor: "chocolate" }
  qty: number | "";
};

type PrimaryGroup = {
  primaryOpt: string; // ej. "libra"
  rows: LineRow[]; // múltiples filas dentro del grupo
};

type PrettyForm = {
  categoryId: string;
  date: string; // YYYY-MM-DD
  groups: PrimaryGroup[];
};

type Props = { defaultCategoryId?: string };

/* -------------------------------------------------------------------------- */
/*                                Componente                                   */
/* -------------------------------------------------------------------------- */

export function AddStockForm({ defaultCategoryId }: Props) {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [cats, setCats] = useState<ProductCategory[]>([]);
  const [cat, setCat] = useState<ProductCategory | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Carga categorías
  useEffect(() => {
    (async () => {
      try {
        const all = await listCategories();
        setCats(all);
        const initial =
          all.find((c) => c.id === defaultCategoryId) || all[0] || null;
        setCat(initial || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [defaultCategoryId]);

  const affectingSteps = useMemo(
    () => (cat?.steps || []).filter((s) => s.affectsStock),
    [cat]
  );

  const primaryStep: CategoryStep | null = useMemo(() => {
    // step primario = el primer step que afecta stock
    return affectingSteps.length ? affectingSteps[0] : null;
  }, [affectingSteps]);

  const restSteps: CategoryStep[] = useMemo(() => {
    return affectingSteps.slice(1);
  }, [affectingSteps]);

  const primaryOptions: CategoryOption[] = useMemo(() => {
    return (primaryStep?.options || []).filter((o) => o.active !== false);
  }, [primaryStep]);

  // Construye valores iniciales “bonitos”
  const defaultGroups: PrimaryGroup[] = useMemo(() => {
    if (!cat || !primaryStep) return [];
    const firstPrimary = (primaryStep.options || [])
      .filter((o) => o.active !== false)
      .map((o) => o.key);

    // Para cada opción del step primario, crea una fila vacía con selecciones mínimas
    return firstPrimary.map((optKey) => ({
      primaryOpt: optKey,
      rows: [
        {
          selections: {
            // el primario se fija a esta opción
            [primaryStep.key]: optKey,
            // los demás steps se inicializan vacío
            ...Object.fromEntries(restSteps.map((s) => [s.key, ""])),
          },
          qty: "",
        },
      ],
    }));
  }, [cat, primaryStep, restSteps]);

  const { control, handleSubmit, reset, watch, setValue } = useForm<PrettyForm>(
    {
      defaultValues: {
        categoryId: cat?.id || "",
        date: todayKey(),
        groups: defaultGroups,
      },
    }
  );

  // Re-sync al cambiar categoría
  useEffect(() => {
    setValue("categoryId", cat?.id || "");
    setValue("date", todayKey());
    setValue("groups", defaultGroups);
  }, [cat, defaultGroups, setValue]);

  const watchAll = watch();

  const onSubmit = () => {
    if (!cat) return;
    setShowConfirmModal(true);
  };

  const onConfirmSubmit = async (data: PrettyForm) => {
    if (!cat) return;

    // Construir movimientos desde groups -> rows
    const movements = (data.groups || [])
      .flatMap((g) => g.rows || [])
      .filter((r) => Number(r.qty) > 0)
      .map((r) => ({
        variantKey: buildVariantKey(cat, r.selections),
        delta: Number(r.qty),
      }));

    if (movements.length === 0) {
      setShowConfirmModal(false);
      addToast({
        type: "info",
        title: "Sin cambios",
        message: "No ingresaste cantidades.",
        duration: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      await persistGenericStockUpdate({
        categoryId: cat.id,
        movements,
      });
      reset({
        categoryId: cat.id,
        date: todayKey(),
        groups: defaultGroups,
      });
      addToast({
        type: "success",
        title: "¡Stock actualizado! 🎉",
        message: "Inventario actualizado exitosamente.",
        duration: 5000,
      });
      setTimeout(() => navigate("/sales"), 800);
    } catch (e) {
      console.error(e);
      addToast({
        type: "error",
        title: "Ups, algo salió mal 😞",
        message: (e as Error).message ?? "Error al actualizar el stock.",
        duration: 5000,
      });
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  if (loading) return <FullScreenLoader message="Cargando categorías..." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex flex-col">
      <main className="flex-grow p-6 sm:p-12 max-w-7xl mx-auto w-full">
        {/* Header */}
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
                Agrega o incrementa el stock por combinación
              </p>

              {/* Selector de categoría */}
              <div className="mt-6 max-w-xl mx-auto">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  value={cat?.id || ""}
                  onChange={(e) => {
                    const next =
                      cats.find((c) => c.id === e.target.value) || null;
                    setCat(next);
                  }}
                  className="w-full rounded-xl border-2 border-purple-200 bg-white/80 p-3"
                >
                  {cats.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </header>

        {/* Form */}
        {cat && primaryStep ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
            <section className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl opacity-5" />
              <div className="relative z-10 p-6 sm:p-8 rounded-3xl bg-white/70 backdrop-blur-xl border-2 border-white/60 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {cat.name}
                    </h3>
                    <p className="text-gray-600">
                      Selecciona opciones y cantidades por{" "}
                      {primaryStep.label.toLowerCase()}
                    </p>
                  </div>
                  {/* Fecha */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Fecha (acumulado diario)
                    </label>
                    <Controller
                      control={control}
                      name="date"
                      render={({ field }) => (
                        <input
                          type="date"
                          className="rounded-xl border-2 border-purple-200 bg-white/80 p-2"
                          {...field}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Tarjetas por opción del step primario */}
                <GroupCards
                  control={control}
                  primaryStep={primaryStep}
                  restSteps={restSteps}
                  options={primaryOptions}
                />
                {/* /Tarjetas */}

                <div className="mt-6 flex items-center justify-center">
                  <button
                    type="submit"
                    className="group relative px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-bold text-lg"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      <span className="text-xl">💾</span>
                      Guardar Productos
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                </div>
              </div>
            </section>
          </form>
        ) : (
          <div className="rounded-2xl p-6 bg-white/70 border-2 border-white/60 text-center">
            <p className="text-gray-600">
              Esta categoría no tiene pasos que afecten stock.
            </p>
          </div>
        )}
      </main>

      <footer className="text-center py-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="text-lg font-semibold">🎂 CakeManager Pro</div>
        <div className="text-sm opacity-80 mt-1">
          © 2025 - Sistema de Inventario Avanzado
        </div>
      </footer>

      {/* Modal de confirmación con el shape nuevo */}
      <ConfirmUpdateModal
        open={showConfirmModal}
        category={cat}
        date={watchAll.date}
        rows={
          // Convertimos groups->rows para el modal
          (watchAll.groups || []).flatMap((g) =>
            (g.rows || []).map((r) => ({
              variantKey: buildVariantKey(cat!, r.selections),
              parts: r.selections,
              qty: Number(r.qty || 0),
            }))
          )
        }
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={() => handleSubmit(onConfirmSubmit)()}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                     Tarjetas agrupadas por step primario                    */
/* -------------------------------------------------------------------------- */

function GroupCards({
  control,
  primaryStep,
  restSteps,
  options,
}: {
  control: any;
  primaryStep: CategoryStep;
  restSteps: CategoryStep[];
  options: CategoryOption[];
}) {
  // groups es un array paralelo a options (mismo orden)
  const { fields, append, remove } = useFieldArray({
    control,
    name: "groups",
    keyName: "_k",
  });

  // Asegurar que el array groups tenga una entrada por cada opción del primario
  // (por si se cambia de categoría y RHF mantiene cosas viejas)
  // No forzamos aquí; preferimos que defaultValues ya haya creado la estructura.

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {fields.map((g, gIdx) => (
        <PrimaryGroupCard
          key={g._k}
          control={control}
          groupIndex={gIdx}
          primaryStep={primaryStep}
          restSteps={restSteps}
          options={options}
        />
      ))}
    </div>
  );
}

function PrimaryGroupCard({
  control,
  groupIndex,
  primaryStep,
  restSteps,
  options,
}: {
  control: any;
  groupIndex: number;
  primaryStep: CategoryStep;
  restSteps: CategoryStep[];
  options: CategoryOption[];
}) {
  // Acceso a rows dentro del grupo
  const { fields, append, remove } = useFieldArray({
    control,
    name: `groups.${groupIndex}.rows`,
    keyName: "_k",
  });

  // primaryOpt controlado (solo lectura visual)
  return (
    <div className="group relative rounded-2xl border-2 border-purple-200/50 bg-gradient-to-br from-white/80 to-purple-50/40 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-2xl opacity-10" />
      <div className="relative z-10">
        {/* Encabezado del grupo */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl shadow-lg">
              🎂
            </div>
            <div>
              <label className="block font-bold text-xl text-gray-800">
                {primaryStep.label}
              </label>
              <Controller
                control={control}
                name={`groups.${groupIndex}.primaryOpt`}
                render={({ field }) => {
                  const opt = options.find((o) => o.key === field.value);
                  return (
                    <div className="text-sm text-gray-600 capitalize">
                      {opt?.label || field.value}
                    </div>
                  );
                }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              append({
                selections: {
                  // Fijamos el primario al valor actual del grupo
                  [primaryStep.key]:
                    (control._formValues?.groups?.[groupIndex]
                      ?.primaryOpt as string) || "",
                  ...Object.fromEntries(restSteps.map((s) => [s.key, ""])),
                },
                qty: "",
              })
            }
            className="px-3 py-2 rounded-lg border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
            title="Agregar fila"
          >
            + Agregar
          </button>
        </div>

        {/* Filas */}
        <div className="space-y-3">
          {fields.map((row, rIdx) => (
            <div
              key={row._k}
              className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end bg-white/70 rounded-xl p-4 border border-purple-200/50"
            >
              {/* Selects de steps restantes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {restSteps.map((s) => (
                  <div key={s.key}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      {s.label}
                    </label>
                    <Controller
                      control={control}
                      name={`groups.${groupIndex}.rows.${rIdx}.selections.${s.key}`}
                      render={({ field }) => (
                        <select
                          className="w-full rounded-xl border-2 border-purple-200 bg-white/90 p-2"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        >
                          <option value="">Selecciona...</option>
                          {(s.options || [])
                            .filter((o) => o.active !== false)
                            .map((o) => (
                              <option key={o.key} value={o.key}>
                                {o.label}
                              </option>
                            ))}
                        </select>
                      )}
                    />
                  </div>
                ))}
              </div>

              {/* Cantidad + eliminar */}
              <div className="flex items-end gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Cantidad
                  </label>
                  <Controller
                    control={control}
                    name={`groups.${groupIndex}.rows.${rIdx}.qty`}
                    render={({ field }) => (
                      <input
                        type="number"
                        min={0}
                        onWheel={(e) => e.currentTarget.blur()}
                        className="w-28 text-center rounded-xl border-2 border-purple-200 bg-white/90 p-2"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const v =
                            e.target.value === "" ? "" : Number(e.target.value);
                          field.onChange(v);
                        }}
                        placeholder="0"
                      />
                    )}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => remove(rIdx)}
                  className="h-[38px] px-3 rounded-lg border-2 border-rose-300 text-rose-700 hover:bg-rose-50"
                  title="Eliminar fila"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}

          {/* Hint cuando no hay filas */}
          {fields.length === 0 && (
            <div className="text-sm text-gray-500 italic">
              No hay filas. Usa “Agregar” para crear una combinación.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
