// src/pages/admin/FridgesAdmin.tsx
import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import BaseModal from "../../components/BaseModal";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../hooks/useToast";
import type { Fridge } from "../../types/fridge";
import {
  buildFridgeId,
  deleteFridge,
  listFridges,
  upsertFridge,
} from "../payroll/fridge.service";

type FormState = {
  name: string; // * obligatorio
  brand?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate?: string;
  location?: string;
  minTemp?: string; // opcional (si ambos se dan, valido rango)
  maxTemp?: string; // opcional (si ambos se dan, valido rango)
  active: boolean;
};

const emptyForm: FormState = {
  name: "",
  brand: "",
  model: "",
  serialNumber: "",
  purchaseDate: "",
  location: "",
  minTemp: "",
  maxTemp: "",
  active: true,
};

function toNumberOrUndef(v?: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export default function FridgesAdmin() {
  const { role } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [fridges, setFridges] = useState<Fridge[]>([]);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [openForm, setOpenForm] = useState(false);
  const [openConfirmSave, setOpenConfirmSave] = useState(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);

  const [toDelete, setToDelete] = useState<Fridge | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // Para mostrar borde rojo en campos obligatorios tras intento fallido
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const items = await listFridges({ includeInactive: true });
        setFridges(items);
      } catch (err) {
        console.error(err);
        addToast({
          type: "error",
          title: "Error al cargar",
          message:
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los enfriadores.",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [addToast]);

  const title = useMemo(
    () => (editingId ? "Editar enfriador" : "Añadir enfriador"),
    [editingId]
  );

  if (role !== "admin") return <Navigate to="/" replace />;

  function openNew() {
    setErrorMsg(null);
    setInfoMsg(null);
    setShowErrors(false);
    setEditingId(null);
    setForm(emptyForm);
    setOpenForm(true);
  }

  function openEdit(f: Fridge) {
    setErrorMsg(null);
    setInfoMsg(null);
    setShowErrors(false);
    setEditingId(f.id);
    setForm({
      name: f.name,
      brand: f.brand ?? "",
      model: f.model ?? "",
      serialNumber: f.serialNumber ?? "",
      purchaseDate: f.purchaseDate ?? "",
      location: f.location ?? "",
      minTemp: typeof f.minTemp === "number" ? String(f.minTemp) : "",
      maxTemp: typeof f.maxTemp === "number" ? String(f.maxTemp) : "",
      active: f.active !== false,
    });
    setOpenForm(true);
  }

  function validate(): string | null {
    // Nombre es obligatorio
    if (!form.name.trim()) return "El nombre es requerido.";

    // Validación opcional del rango de temperatura si ambos están presentes
    const min = toNumberOrUndef(form.minTemp);
    const max = toNumberOrUndef(form.maxTemp);
    if (min !== undefined && max !== undefined && !(min < max)) {
      return "El rango de temperatura no es válido: la mínima debe ser menor que la máxima.";
    }

    return null;
  }

  function askSave() {
    const err = validate();
    if (err) {
      setErrorMsg(err);
      setShowErrors(true);
      addToast({ type: "error", title: "Campos incompletos", message: err });
      return;
    }
    setErrorMsg(null);
    setShowErrors(false);
    setOpenConfirmSave(true);
  }

  async function doSave() {
    // Construir payload SIN claves undefined (Firestore no las acepta)
    const id = editingId ?? buildFridgeId(form.name);
    const name = form.name.trim();

    const brand = form.brand?.trim();
    const model = form.model?.trim();
    const serialNumber = form.serialNumber?.trim();
    const purchaseDate = form.purchaseDate || undefined;
    const location = form.location?.trim();
    const minTemp = toNumberOrUndef(form.minTemp);
    const maxTemp = toNumberOrUndef(form.maxTemp);

    const fridge: Fridge = {
      id,
      name,
      active: form.active,
      ...(brand ? { brand } : {}),
      ...(model ? { model } : {}),
      ...(serialNumber ? { serialNumber } : {}),
      ...(purchaseDate ? { purchaseDate } : {}),
      ...(location ? { location } : {}),
      ...(minTemp !== undefined ? { minTemp } : {}),
      ...(maxTemp !== undefined ? { maxTemp } : {}),
    };

    try {
      await upsertFridge(fridge);
      const items = await listFridges({ includeInactive: true });
      setFridges(items);

      setOpenConfirmSave(false);
      setOpenForm(false);
      setEditingId(null);
      setForm(emptyForm);

      setInfoMsg("Enfriador guardado correctamente.");
      addToast({
        type: "success",
        title: "Guardado",
        message: "Enfriador guardado correctamente.",
      });
    } catch (err) {
      console.error(err);
      addToast({
        type: "error",
        title: "No se pudo guardar",
        message: err instanceof Error ? err.message : "Error desconocido.",
      });
    }
  }

  function askDelete(f: Fridge) {
    setToDelete(f);
    setOpenConfirmDelete(true);
  }

  async function doDelete() {
    if (!toDelete) return;
    try {
      await deleteFridge(toDelete.id);
      const items = await listFridges({ includeInactive: true });
      setFridges(items);
      setOpenConfirmDelete(false);
      setToDelete(null);
      addToast({
        type: "success",
        title: "Eliminado",
        message: "Enfriador eliminado.",
      });
    } catch (err) {
      console.error(err);
      addToast({
        type: "error",
        title: "No se pudo eliminar",
        message: err instanceof Error ? err.message : "Error desconocido.",
      });
    }
  }

  const nameInvalid = showErrors && !form.name.trim();

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 w-20 h-20 rounded-3xl bg-white/70 backdrop-blur border border-white/60 shadow flex items-center justify-center ring-2 ring-blue-200">
          <span className="text-3xl">❄️</span>
        </div>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
          Enfriadores
        </h1>
        <p className="text-gray-600 mt-1">
          Administra las neveras/enfriadores para el registro diario de
          temperatura.
        </p>
      </div>

      {/* Top actions */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          {fridges.length} enfriador{fridges.length === 1 ? "" : "es"}
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-white bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 hover:shadow-[0_12px_30px_rgba(37,99,235,0.35)]"
        >
          <span>➕</span> Añadir enfriador
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-600 py-10">Cargando…</div>
      ) : fridges.length === 0 ? (
        <div className="rounded-2xl p-6 bg-white/80 backdrop-blur border border-white/60 text-center text-gray-600">
          Aún no hay enfriadores. ¡Agrega el primero!
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fridges.map((f) => {
            const badge =
              f.active !== false
                ? { text: "Activo", cls: "bg-emerald-100 text-emerald-700" }
                : { text: "Inactivo", cls: "bg-gray-200 text-gray-700" };

            return (
              <div
                key={f.id}
                className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl p-5 shadow hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xl font-extrabold text-blue-700">
                      {f.name}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {f.brand || "—"} {f.model ? `· ${f.model}` : ""}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${badge.cls}`}
                      >
                        {badge.text}
                      </span>
                      {f.location && (
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700">
                          {f.location}
                        </span>
                      )}
                      {f.minTemp !== undefined && f.maxTemp !== undefined && (
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-cyan-50 text-cyan-700">
                          {f.minTemp}–{f.maxTemp} °C
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 text-white font-bold grid place-items-center">
                    {f.name?.[0]?.toUpperCase()}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => openEdit(f)}
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-white border hover:bg-gray-50"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => askDelete(f)}
                    className="px-4 py-2 text-sm font-semibold rounded-lg text-rose-600 hover:bg-rose-50"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mensajes (opcionales) */}
      {errorMsg && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">
          {errorMsg}
        </div>
      )}
      {infoMsg && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-2 text-sm">
          {infoMsg}
        </div>
      )}

      {/* Modal Form */}
      <BaseModal
        isOpen={openForm}
        onClose={() => setOpenForm(false)}
        headerAccent="blue"
        title={title}
        description="Completa la información del enfriador. Los campos con * son obligatorios."
        primaryAction={{
          label: editingId ? "Guardar" : "Añadir",
          onClick: askSave,
        }}
        secondaryAction={{
          label: "Cancelar",
          onClick: () => setOpenForm(false),
        }}
        size="lg"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Nombre (obligatorio) */}
          <label className="text-sm font-semibold text-gray-700">
            Nombre <span className="text-rose-600">*</span>
            <input
              value={form.name}
              onChange={(e) => {
                const v = e.target.value;
                setForm((f) => ({ ...f, name: v }));
                if (v.trim()) setErrorMsg(null);
              }}
              className={[
                "mt-1 w-full rounded-xl border px-4 py-3 shadow-inner focus:outline-none focus:ring-2",
                nameInvalid
                  ? "border-rose-300 focus:ring-rose-300"
                  : "border-gray-200 focus:ring-blue-300",
              ].join(" ")}
              placeholder="Nevera Pasteles"
            />
            {nameInvalid && (
              <span className="text-xs text-rose-600 mt-1 inline-block">
                Este campo es obligatorio.
              </span>
            )}
          </label>

          {/* Marca (opcional) */}
          <label className="text-sm font-semibold text-gray-700">
            Marca
            <input
              value={form.brand}
              onChange={(e) =>
                setForm((f) => ({ ...f, brand: e.target.value }))
              }
              className="mt-1 w-full rounded-xl border px-4 py-3 shadow-inner focus:outline-none focus:ring-2 border-gray-200 focus:ring-blue-300"
              placeholder="Whirlpool"
            />
          </label>

          {/* Modelo (opcional) */}
          <label className="text-sm font-semibold text-gray-700">
            Modelo
            <input
              value={form.model}
              onChange={(e) =>
                setForm((f) => ({ ...f, model: e.target.value }))
              }
              className="mt-1 w-full rounded-xl border px-4 py-3 shadow-inner focus:outline-none focus:ring-2 border-gray-200 focus:ring-blue-300"
              placeholder="WRB322"
            />
          </label>

          {/* Serie (opcional) */}
          <label className="text-sm font-semibold text-gray-700">
            Serie
            <input
              value={form.serialNumber}
              onChange={(e) =>
                setForm((f) => ({ ...f, serialNumber: e.target.value }))
              }
              className="mt-1 w-full rounded-xl border px-4 py-3 shadow-inner focus:outline-none focus:ring-2 border-gray-200 focus:ring-blue-300"
              placeholder="SN-123456"
            />
          </label>

          {/* Fecha de compra (opcional) */}
          <label className="text-sm font-semibold text-gray-700">
            Fecha de compra
            <input
              type="date"
              value={form.purchaseDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, purchaseDate: e.target.value }))
              }
              className="mt-1 w-full rounded-xl border px-4 py-3 shadow-inner focus:outline-none focus:ring-2 border-gray-200 focus:ring-blue-300"
            />
          </label>

          {/* Ubicación (opcional) */}
          <label className="text-sm font-semibold text-gray-700">
            Ubicación
            <input
              value={form.location}
              onChange={(e) =>
                setForm((f) => ({ ...f, location: e.target.value }))
              }
              className="mt-1 w-full rounded-xl border px-4 py-3 shadow-inner focus:outline-none focus:ring-2 border-gray-200 focus:ring-blue-300"
              placeholder="Cocina"
            />
          </label>

          {/* Rango temperatura (opcionales; valido si ambos) */}
          <label className="text-sm font-semibold text-gray-700">
            Temp. mínima (°C)
            <input
              type="number"
              step="0.1"
              value={form.minTemp}
              onChange={(e) =>
                setForm((f) => ({ ...f, minTemp: e.target.value }))
              }
              className="mt-1 w-full rounded-xl border px-4 py-3 shadow-inner focus:outline-none focus:ring-2 border-gray-200 focus:ring-blue-300"
              placeholder="0"
            />
          </label>
          <label className="text-sm font-semibold text-gray-700">
            Temp. máxima (°C)
            <input
              type="number"
              step="0.1"
              value={form.maxTemp}
              onChange={(e) =>
                setForm((f) => ({ ...f, maxTemp: e.target.value }))
              }
              className="mt-1 w-full rounded-xl border px-4 py-3 shadow-inner focus:outline-none focus:ring-2 border-gray-200 focus:ring-blue-300"
              placeholder="8"
            />
            {/* Aviso suave si ambos están y el rango no es válido (sin bloquear escritura) */}
            {form.minTemp?.length &&
              form.maxTemp?.length &&
              toNumberOrUndef(form.minTemp) !== undefined &&
              toNumberOrUndef(form.maxTemp) !== undefined &&
              !(
                toNumberOrUndef(form.minTemp)! < toNumberOrUndef(form.maxTemp)!
              ) && (
                <span className="text-xs text-amber-600 mt-1 inline-block">
                  La mínima debería ser menor que la máxima.
                </span>
              )}
          </label>

          {/* Activo */}
          <label className="text-sm font-semibold text-gray-700 inline-flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) =>
                setForm((f) => ({ ...f, active: e.target.checked }))
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-400"
            />
            Activo
          </label>
        </div>
      </BaseModal>

      {/* Confirmar guardado */}
      <BaseModal
        isOpen={openConfirmSave}
        onClose={() => setOpenConfirmSave(false)}
        headerAccent="green"
        title="Confirmar guardado"
        description="Revisa los datos del enfriador antes de confirmar."
        primaryAction={{ label: "Guardar", onClick: doSave }}
        secondaryAction={{
          label: "Cancelar",
          onClick: () => setOpenConfirmSave(false),
        }}
      >
        {/* Resumen de campos */}
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldRow label="Nombre *" value={form.name || "—"} strong />
          <FieldRow label="Marca" value={form.brand || "—"} />
          <FieldRow label="Modelo" value={form.model || "—"} />
          <FieldRow label="Serie" value={form.serialNumber || "—"} />
          <FieldRow label="Fecha de compra" value={form.purchaseDate || "—"} />
          <FieldRow label="Ubicación" value={form.location || "—"} />
          <FieldRow
            label="Rango Temp. (°C)"
            value={
              form.minTemp || form.maxTemp
                ? `${form.minTemp || "?"} – ${form.maxTemp || "?"} °C`
                : "—"
            }
          />
          <FieldRow
            label="Estado"
            value={form.active ? "Activo" : "Inactivo"}
          />
        </div>
      </BaseModal>

      {/* Confirmar eliminación */}
      <BaseModal
        isOpen={openConfirmDelete}
        onClose={() => setOpenConfirmDelete(false)}
        headerAccent="pink"
        title="Eliminar enfriador"
        description="Esta acción eliminará el enfriador y su ficha (no borra históricos de temperatura)."
        primaryAction={{ label: "Eliminar", onClick: doDelete }}
        secondaryAction={{
          label: "Cancelar",
          onClick: () => setOpenConfirmDelete(false),
        }}
      >
        <div className="rounded-xl border bg-white px-4 py-3 text-sm">
          {toDelete ? (
            <>
              <div className="text-gray-500">Enfriador</div>
              <div className="font-semibold">{toDelete.name}</div>
            </>
          ) : null}
        </div>
      </BaseModal>
    </div>
  );
}

/** Pequeño componente para filas del resumen en el modal */
function FieldRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border bg-white px-4 py-3">
      <div className="text-gray-500 text-sm">{label}</div>
      <div
        className={["text-sm", strong ? "font-semibold" : "font-medium"].join(
          " "
        )}
      >
        {value}
      </div>
    </div>
  );
}
