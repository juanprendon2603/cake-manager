import { useMemo, useState, type Dispatch, type SetStateAction } from "react";

import BaseModal from "../../../../components/BaseModal";
import type { CategoryOption, CategoryStep } from "../../../../utils/catalog";
import { generateCombos, slugify, type DraftCat } from "../utils";
import PriceTable from "./PriceTable";

type SetDraft = Dispatch<SetStateAction<DraftCat>>;

export default function CategoryEditor({
  open,
  draft,
  setDraft,
  onClose,
  onSave,
}: {
  open: boolean;
  draft: DraftCat;
  setDraft: SetDraft;
  onClose: () => void;
  onSave: () => void;
}) {
  const [tab, setTab] = useState<"attrs" | "prices">("attrs");
  const combos = useMemo(() => generateCombos(draft.steps), [draft.steps]);

  function addStep() {
    const s: CategoryStep = {
      id: crypto.randomUUID(),
      key: "",
      label: "",
      type: "select",
      required: true,
      affectsStock: true,
      options: [],
    };
    setDraft((d) => ({ ...d, steps: [...(d.steps || []), s] }));
  }

  function addOption(stepId: string) {
    setDraft((d) => ({
      ...d,
      steps: d.steps.map((s) =>
        s.id === stepId
          ? {
              ...s,
              options: [
                ...(s.options || []),
                { key: "", label: "", active: true } as CategoryOption,
              ],
            }
          : s
      ),
    }));
  }

  function removeStep(stepId: string) {
    setDraft((d) => ({ ...d, steps: d.steps.filter((s) => s.id !== stepId) }));
  }

  function removeOption(stepId: string, optIndex: number) {
    setDraft((d) => ({
      ...d,
      steps: d.steps.map((s) =>
        s.id === stepId
          ? {
              ...s,
              options: (s.options || []).filter((_, i) => i !== optIndex),
            }
          : s
      ),
    }));
  }

  return (
    <BaseModal
      isOpen={open}
      onClose={onClose}
      headerAccent="purple"
      title={draft.id ? "Editar categoría" : "Nueva categoría"}
      description="Paso 1: Atributos • Paso 2: Precios por combinación"
      primaryAction={{ label: "Guardar", onClick: onSave }}
      secondaryAction={{ label: "Cancelar", onClick: onClose }}
      size="6xl"
      bodyClassName="max-h-[75vh] overflow-y-auto"
    >
      {/* Básico */}
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <label className="text-sm font-semibold text-gray-700">
          Nombre *
          <input
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            className="mt-1 w-full rounded-xl border px-4 py-3"
            placeholder="Tortas"
          />
        </label>
        <label className="text-sm font-semibold text-gray-700 inline-flex items-center gap-2 mt-7 sm:mt-0">
          <input
            type="checkbox"
            checked={draft.active !== false}
            onChange={(e) =>
              setDraft((d) => ({ ...d, active: e.target.checked }))
            }
            className="rounded border-gray-300 text-purple-600"
          />
          Activa
        </label>
      </div>

      {/* Tabs */}
      <div className="mb-3 flex items-center gap-2">
        <button
          onClick={() => setTab("attrs")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold ${
            tab === "attrs"
              ? "text-white bg-gradient-to-r from-purple-600 to-pink-600"
              : "bg-white border hover:bg-gray-50 text-gray-700"
          }`}
        >
          1) Atributos
        </button>
        <button
          onClick={() => setTab("prices")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold ${
            tab === "prices"
              ? "text-white bg-gradient-to-r from-purple-600 to-pink-600"
              : "bg-white border hover:bg-gray-50 text-gray-700"
          }`}
        >
          2) Precios ({combos.length})
        </button>
      </div>

      {tab === "attrs" ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">
              Atributos (select) — requeridos, afectan stock
            </h3>
            <button
              onClick={addStep}
              className="px-3 py-2 rounded-lg bg-white border hover:bg-gray-50"
            >
              ➕ Añadir atributo
            </button>
          </div>

          {(draft.steps || []).map((s) => (
            <div key={s.id} className="rounded-xl border bg-white/80 p-4">
              <div className="grid sm:grid-cols-3 gap-3 items-end">
                <label className="text-sm font-semibold text-gray-700 sm:col-span-2">
                  Etiqueta *
                  <input
                    value={s.label}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        steps: d.steps.map((x) =>
                          x.id === s.id
                            ? {
                                ...x,
                                label: e.target.value,
                                key: slugify(e.target.value),
                                type: "select",
                                required: true,
                                affectsStock: true,
                              }
                            : x
                        ),
                      }))
                    }
                    className="mt-1 w-full rounded-xl border px-3 py-2"
                    placeholder="Tamaño"
                  />
                </label>

                <div className="text-xs text-gray-600">
                  <div className="px-2 py-2 rounded-lg bg-purple-50 border border-purple-100">
                    <div className="font-semibold text-purple-700">
                      Configuración fija
                    </div>
                    <div>
                      • Tipo: <b>select</b>
                    </div>
                    <div>
                      • Requerido: <b>sí</b>
                    </div>
                    <div>
                      • Afecta stock: <b>sí</b>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Opciones</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => addOption(s.id)}
                      className="px-2 py-1 rounded bg-white border"
                    >
                      ➕ Opción
                    </button>
                    <button
                      onClick={() => removeStep(s.id)}
                      className="px-2 py-1 rounded text-rose-600 hover:bg-rose-50"
                    >
                      Eliminar atributo
                    </button>
                  </div>
                </div>

                {(s.options || []).map((o, j) => (
                  <div key={j} className="grid sm:grid-cols-4 gap-2 mt-2">
                    <input
                      value={o.label}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          steps: d.steps.map((x) =>
                            x.id === s.id
                              ? {
                                  ...x,
                                  options: x.options!.map((y, k) =>
                                    k === j
                                      ? {
                                          ...y,
                                          label: e.target.value,
                                          key: slugify(e.target.value),
                                        }
                                      : y
                                  ),
                                }
                              : x
                          ),
                        }))
                      }
                      className="rounded border px-2 py-1"
                      placeholder="Etiqueta (p. ej. Libra)"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={o.active !== false}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            steps: d.steps.map((x) =>
                              x.id === s.id
                                ? {
                                    ...x,
                                    options: x.options!.map((y, k) =>
                                      k === j
                                        ? { ...y, active: e.target.checked }
                                        : y
                                    ),
                                  }
                                : x
                            ),
                          }))
                        }
                      />
                      <span className="text-sm text-gray-700">Activa</span>
                    </div>
                    <button
                      onClick={() => removeOption(s.id, j)}
                      className="px-2 py-1 rounded text-rose-600 hover:bg-rose-50"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="text-xs text-gray-600">
            <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-100">
              {combos.length} combinaciones generadas
            </span>
          </div>
        </div>
      ) : (
        <PriceTable
          steps={draft.steps}
          prices={draft.variantPrices || {}}
          onChange={(next) => setDraft((d) => ({ ...d, variantPrices: next }))}
        />
      )}
    </BaseModal>
  );
}
