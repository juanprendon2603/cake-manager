import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import BaseModal from "../../../../components/BaseModal";
import type { CategoryOption, CategoryStep } from "../../../../utils/catalog";
import { generateCombos, slugify, type DraftCat } from "../utils";
import PriceTable from "./PriceTable";

type SetDraft = Dispatch<SetStateAction<DraftCat>>;

type StepKey = "basic" | "attrs" | "prices";
const STEPS: { key: StepKey; label: string; help: string }[] = [
  {
    key: "basic",
    label: "Datos básicos",
    help: "Ponle nombre claro y decide si estará activa para ventas.",
  },
  {
    key: "attrs",
    label: "Atributos",
    help: "Crea atributos (select). Marca “Afecta stock” solo en los que deben partir inventario (p. ej. Tamaño).",
  },
  {
    key: "prices",
    label: "Precios",
    help: "Define el precio de cada combinación de opciones activas (usa todos los atributos).",
  },
];

function Stepper({ current }: { current: number }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      {STEPS.map((s, i) => {
        const done = i < current,
          active = i === current;
        return (
          <div key={s.key} className="flex items-center gap-3">
            <div
              className={[
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border",
                active
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow"
                  : done
                  ? "bg-green-100 text-green-700 border-green-200"
                  : "bg-white text-gray-600 border-gray-200",
              ].join(" ")}
            >
              {i + 1}
            </div>
            <div className="text-sm">
              <div
                className={
                  active
                    ? "font-semibold text-gray-900"
                    : "font-medium text-gray-600"
                }
              >
                {s.label}
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div className="w-10 sm:w-16 h-[2px] bg-gray-200" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Explainer({ title, children }: { title: string; children: any }) {
  return (
    <div className="rounded-xl border bg-blue-50/60 border-blue-100 p-3 text-sm text-blue-900 mb-4">
      <div className="font-semibold mb-1">{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

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
  const [stepIndex, setStepIndex] = useState(0);
  useEffect(() => {
    if (open) setStepIndex(0);
  }, [open]);

  const combos = useMemo(
    () => generateCombos(draft.steps || []),
    [draft.steps]
  );

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

  const basicValid = (draft.name || "").trim().length > 0;
  const attrsValid = (() => {
    const steps = draft.steps || [];
    if (steps.length === 0) return false;
    const anyAffect = steps.some((s) => s.affectsStock !== false);
    if (!anyAffect) return false;
    for (const s of steps) {
      if (!s.label?.trim()) return false;
      const activeOpts = (s.options || []).filter(
        (o) => o.active !== false && !!o.label?.trim()
      );
      if (activeOpts.length === 0) return false;
    }
    return true;
  })();
  const pricesValid = combos.length > 0;

  function next() {
    if (stepIndex === 0 && !basicValid) return;
    if (stepIndex === 1 && !attrsValid) return;
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }
  function prev() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  useEffect(() => {
    const el = document.querySelector(
      ".modal-body-scroll"
    ) as HTMLElement | null;
    el?.scrollTo?.({ top: 0, behavior: "smooth" });
  }, [stepIndex]);

  const primaryAction =
    stepIndex === STEPS.length - 1
      ? { label: "Guardar", onClick: onSave }
      : undefined;

  return (
    <BaseModal
      isOpen={open}
      onClose={onClose}
      headerAccent="purple"
      title={draft.id ? "Editar categoría" : "Nueva categoría"}
      description={`${STEPS.map((s, i) => `${i + 1}. ${s.label}`).join(" • ")}`}
      primaryAction={primaryAction}
      secondaryAction={{ label: "Cancelar", onClick: onClose }}
      size="6xl"
      bodyClassName="modal-body-scroll max-h-[75vh] overflow-y-auto"
    >
      <Stepper current={stepIndex} />

      <Explainer title={STEPS[stepIndex].label}>
        <p>{STEPS[stepIndex].help}</p>
        {stepIndex === 1 && (
          <ul className="list-disc ml-5">
            <li>
              Ejemplo: <b>Tamaño</b> (libra / media) <b>afecta stock = Sí</b>.
            </li>
            <li>
              Ejemplo: <b>Tipo</b> (fría / genovesa) <b>afecta stock = No</b>{" "}
              para compartir inventario.
            </li>
          </ul>
        )}
      </Explainer>

      {/* Paso 1 */}
      {stepIndex === 0 && (
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="text-sm font-semibold text-gray-700">
            Nombre *
            <input
              value={draft.name}
              onChange={(e) =>
                setDraft((d) => ({ ...d, name: e.target.value }))
              }
              className={`mt-1 w-full rounded-xl border px-4 py-3 ${
                basicValid ? "border-gray-300" : "border-rose-300"
              }`}
              placeholder="Bizcochos"
            />
            {!basicValid && (
              <div className="text-xs text-rose-600 mt-1">
                Ingresa un nombre para continuar.
              </div>
            )}
          </label>

          <label className="text-sm font-semibold text-gray-700 inline-flex items-center gap-2">
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
      )}

      {/* Paso 2 */}
      {stepIndex === 1 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Atributos (select)</h3>
            <button
              onClick={addStep}
              className="px-3 py-2 rounded-lg bg-white border hover:bg-gray-50"
            >
              ➕ Añadir atributo
            </button>
          </div>

          {(draft.steps || []).map((s) => {
            const labelOk = !!s.label?.trim();
            const activeOpts = (s.options || []).filter(
              (o) => o.active !== false && !!o.label?.trim()
            );
            const hasActive = activeOpts.length > 0;

            return (
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
                                }
                              : x
                          ),
                        }))
                      }
                      className={`mt-1 w-full rounded-xl border px-3 py-2 ${
                        labelOk ? "border-gray-300" : "border-rose-300"
                      }`}
                      placeholder="Tamaño"
                    />
                    {!labelOk && (
                      <div className="text-xs text-rose-600 mt-1">
                        Escribe un nombre para el atributo.
                      </div>
                    )}
                  </label>

                  <div className="text-xs text-gray-700">
                    <div className="px-3 py-3 rounded-lg bg-purple-50 border border-purple-100 space-y-2">
                      <div className="font-semibold text-purple-700">
                        Configuración
                      </div>
                      <div>
                        • Tipo: <b>select</b> (fijo)
                      </div>
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={s.affectsStock !== false}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              steps: d.steps.map((x) =>
                                x.id === s.id
                                  ? { ...x, affectsStock: e.target.checked }
                                  : x
                              ),
                            }))
                          }
                        />
                        Afecta stock
                      </label>
                      <div className="text-[11px] text-gray-500">
                        Si está activo, el inventario se llevará por este
                        atributo.
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

                  {(s.options || []).map((o, j) => {
                    const labelValid = !!o.label?.trim();
                    return (
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
                          className={`rounded border px-2 py-1 ${
                            labelValid ? "border-gray-300" : "border-rose-300"
                          }`}
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
                    );
                  })}

                  {!hasActive && (
                    <div className="text-xs text-rose-600 mt-2">
                      Agrega al menos <b>una opción activa</b>.
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div className="text-xs text-gray-600">
            <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-100">
              {combos.length} combinaciones generadas (para precios)
            </span>
            {!attrsValid && (
              <span className="ml-2 text-rose-600">
                • Debe haber al menos un atributo que afecte stock.
              </span>
            )}
          </div>
        </div>
      )}

      {stepIndex === 2 && (
        <div>
          <h3 className="font-bold mb-2">Precios por combinación</h3>
          {!pricesValid ? (
            <div className="rounded-xl border-2 border-dashed p-6 text-center text-gray-500 bg-gray-50">
              Crea atributos con opciones activas para ver las combinaciones.
            </div>
          ) : (
            <PriceTable
              steps={draft.steps}
              prices={draft.variantPrices || {}}
              onChange={(next) =>
                setDraft((d) => ({ ...d, variantPrices: next }))
              }
            />
          )}
          <div className="text-xs text-gray-600 mt-3">
            {combos.length} combinaciones activas actualmente.
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="text-sm text-gray-600">
          Paso {stepIndex + 1} de {STEPS.length}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={prev}
            disabled={stepIndex === 0}
            className={`px-4 py-2 rounded-lg border ${
              stepIndex === 0
                ? "opacity-50 cursor-not-allowed"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            ← Anterior
          </button>
          {stepIndex < STEPS.length - 1 && (
            <button
              type="button"
              onClick={next}
              disabled={
                (stepIndex === 0 && !basicValid) ||
                (stepIndex === 1 && !attrsValid)
              }
              className={`px-4 py-2 rounded-lg text-white font-semibold ${
                (stepIndex === 0 && !basicValid) ||
                (stepIndex === 1 && !attrsValid)
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-600"
              }`}
            >
              Siguiente →
            </button>
          )}
        </div>
      </div>
    </BaseModal>
  );
}
