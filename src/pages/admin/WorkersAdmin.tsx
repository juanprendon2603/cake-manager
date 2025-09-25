// src/pages/admin/WorkersAdmin.tsx
import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import BaseModal from "../../components/BaseModal";
import { useAuth } from "../../contexts/AuthContext";
import type { PaymentMode, Person } from "../../types/payroll";
import {
  buildPersonId,
  deletePerson,
  listPeople,
  upsertPerson,
} from "../payroll/payroll.people.service";

type FormState = {
  firstName: string;
  lastName: string;
  paymentMode: PaymentMode;
  valuePerDay?: string;
  fixedFortnightPay?: string;
  fixedMonthlyPay?: string;
  valuePerHour?: string; // NUEVO
  startDate?: string;
  active: boolean;
};

const emptyForm: FormState = {
  firstName: "",
  lastName: "",
  paymentMode: "per_day",
  valuePerDay: "",
  fixedFortnightPay: "",
  fixedMonthlyPay: "",
  valuePerHour: "", // NUEVO
  startDate: "",
  active: true,
};

function toNumberOrUndef(v?: string) {
  const n = Number(v);
  return isFinite(n) && n > 0 ? n : undefined;
}

export default function WorkersAdmin() {
  const { role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [people, setPeople] = useState<Person[]>([]);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [openForm, setOpenForm] = useState(false);
  const [openConfirmSave, setOpenConfirmSave] = useState(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);

  const [toDelete, setToDelete] = useState<Person | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const items = await listPeople();
      setPeople(items);
      setLoading(false);
    })();
  }, []);

  const title = useMemo(
    () => (editingId ? "Editar trabajador" : "Añadir trabajador"),
    [editingId]
  );

  if (role !== "admin") return <Navigate to="/" replace />;

  function openNew() {
    setErrorMsg(null);
    setInfoMsg(null);
    setEditingId(null);
    setForm(emptyForm);
    setOpenForm(true);
  }

  function openEdit(p: Person) {
    setErrorMsg(null);
    setInfoMsg(null);
    setEditingId(p.id);
    setForm({
      firstName: p.firstName,
      lastName: p.lastName,
      paymentMode: p.paymentMode ?? "per_day",
      valuePerDay: p.valuePerDay ? String(p.valuePerDay) : "",
      fixedFortnightPay: p.fixedFortnightPay ? String(p.fixedFortnightPay) : "",
      fixedMonthlyPay: p.fixedMonthlyPay ? String(p.fixedMonthlyPay) : "",
      valuePerHour: p.valuePerHour ? String(p.valuePerHour) : "", // NUEVO
      startDate: p.startDate ?? "",
      active: p.active ?? true,
    });
    setOpenForm(true);
  }

  function validate(): string | null {
    if (!form.firstName.trim() || !form.lastName.trim())
      return "Nombre y apellido son requeridos.";
    if (form.paymentMode === "per_day") {
      if (!toNumberOrUndef(form.valuePerDay))
        return "Debes indicar un valor por día válido.";
    } else if (form.paymentMode === "fixed_fortnight") {
      if (!toNumberOrUndef(form.fixedFortnightPay))
        return "Debes indicar un valor fijo quincenal válido.";
    } else if (form.paymentMode === "fixed_monthly") {
      if (!toNumberOrUndef(form.fixedMonthlyPay))
        return "Debes indicar un valor fijo mensual válido.";
    } else if (form.paymentMode === "per_hour") {
      if (!toNumberOrUndef(form.valuePerHour))
        return "Debes indicar un valor por hora válido.";
    }
    return null;
  }

  function askSave() {
    const err = validate();
    if (err) {
      setErrorMsg(err);
      return;
    }
    setOpenConfirmSave(true);
  }

  async function doSave() {
    const paymentMode = form.paymentMode;

    const person: Person = {
      id: editingId ?? buildPersonId(form.firstName, form.lastName),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      paymentMode,
      valuePerDay:
        paymentMode === "per_day"
          ? toNumberOrUndef(form.valuePerDay)
          : undefined,
      fixedFortnightPay:
        paymentMode === "fixed_fortnight"
          ? toNumberOrUndef(form.fixedFortnightPay)
          : undefined,
      fixedMonthlyPay:
        paymentMode === "fixed_monthly"
          ? toNumberOrUndef(form.fixedMonthlyPay)
          : undefined,
      valuePerHour:
        paymentMode === "per_hour"
          ? toNumberOrUndef(form.valuePerHour)
          : undefined, // NUEVO
      startDate: form.startDate || undefined,
      active: form.active,
    };

    await upsertPerson(person);
    const items = await listPeople();
    setPeople(items);

    setOpenConfirmSave(false);
    setOpenForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setInfoMsg("Trabajador guardado correctamente.");
  }

  function askDelete(p: Person) {
    setToDelete(p);
    setOpenConfirmDelete(true);
  }

  async function doDelete() {
    if (!toDelete) return;
    await deletePerson(toDelete.id);
    const items = await listPeople();
    setPeople(items);
    setOpenConfirmDelete(false);
    setToDelete(null);
    setInfoMsg("Trabajador eliminado.");
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 w-20 h-20 rounded-3xl bg-white/70 backdrop-blur border border-white/60 shadow flex items-center justify-center ring-2 ring-purple-200">
          <span className="text-3xl">🧑‍🍳</span>
        </div>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#8E2DA8] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent">
          Trabajadores
        </h1>
        <p className="text-gray-600 mt-1">
          Administra el personal que participa en la nómina.
        </p>
      </div>

      {/* Top actions */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          {people.length} trabajador{people.length === 1 ? "" : "es"}
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-white bg-gradient-to-r from-[#8E2DA8] via-[#A855F7] to-[#C084FC] hover:shadow-[0_12px_30px_rgba(142,45,168,0.35)]"
        >
          <span>➕</span> Añadir trabajador
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-600 py-10">Cargando…</div>
      ) : people.length === 0 ? (
        <div className="rounded-2xl p-6 bg-white/80 backdrop-blur border border-white/60 text-center text-gray-600">
          Aún no hay trabajadores. ¡Agrega el primero!
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((p) => {
            const badge =
              p.paymentMode === "per_day"
                ? {
                    text: `Por día: $${(p.valuePerDay ?? 0).toLocaleString()}`,
                    cls: "bg-emerald-100 text-emerald-700",
                  }
                : p.paymentMode === "fixed_fortnight"
                ? {
                    text: `Fijo quincenal: $${(
                      p.fixedFortnightPay ?? 0
                    ).toLocaleString()}`,
                    cls: "bg-indigo-100 text-indigo-700",
                  }
                : p.paymentMode === "fixed_monthly"
                ? {
                    text: `Fijo mensual: $${(
                      p.fixedMonthlyPay ?? 0
                    ).toLocaleString()}`,
                    cls: "bg-blue-100 text-blue-700",
                  }
                : {
                    // per_hour
                    text: `Por hora: $${(
                      p.valuePerHour ?? 0
                    ).toLocaleString()}`,
                    cls: "bg-fuchsia-100 text-fuchsia-700",
                  };

            return (
              <div
                key={p.id}
                className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl p-5 shadow hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xl font-extrabold text-[#8E2DA8]">
                      {p.firstName} {p.lastName}
                    </div>
                    <div className="mt-2">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${badge.cls}`}
                      >
                        {badge.text}
                      </span>
                      {!p.active && (
                        <span className="ml-2 text-xs font-semibold px-3 py-1 rounded-full bg-gray-200 text-gray-700">
                          Inactivo
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold grid place-items-center">
                    {p.firstName?.[0]?.toUpperCase()}
                    {p.lastName?.[0]?.toUpperCase()}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => openEdit(p)}
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-white border hover:bg-gray-50"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => askDelete(p)}
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

      {/* Mensajes */}
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
        headerAccent="purple"
        title={title}
        description="Completa la información del trabajador"
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
          <label className="text-sm font-semibold text-gray-700">
            Nombre
            <input
              value={form.firstName}
              onChange={(e) =>
                setForm((f) => ({ ...f, firstName: e.target.value }))
              }
              className="mt-1 w-full rounded-xl border border-white/70 bg-white/70 px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </label>
          <label className="text-sm font-semibold text-gray-700">
            Apellido
            <input
              value={form.lastName}
              onChange={(e) =>
                setForm((f) => ({ ...f, lastName: e.target.value }))
              }
              className="mt-1 w-full rounded-xl border border-white/70 bg-white/70 px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </label>

          <div className="sm:col-span-2">
            <div className="text-sm font-semibold text-gray-700 mb-1">
              Modo de pago
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                {
                  key: "per_day",
                  label: "Por día",
                  cls: "from-emerald-500 to-teal-500",
                },
                {
                  key: "fixed_fortnight",
                  label: "Fijo quincenal",
                  cls: "from-indigo-500 to-blue-500",
                },
                {
                  key: "fixed_monthly",
                  label: "Fijo mensual",
                  cls: "from-cyan-500 to-sky-500",
                },
                {
                  key: "per_hour",
                  label: "Por hora",
                  cls: "from-fuchsia-500 to-violet-500",
                },
              ].map((m) => (
                <button
                  type="button"
                  key={m.key}
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      paymentMode: m.key as PaymentMode,
                    }))
                  }
                  className={[
                    "px-4 py-2 rounded-xl text-sm font-semibold",
                    form.paymentMode === m.key
                      ? `text-white bg-gradient-to-r ${m.cls}`
                      : "bg-white border hover:bg-gray-50 text-gray-700",
                  ].join(" ")}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {form.paymentMode === "per_day" && (
            <label className="text-sm font-semibold text-gray-700">
              Valor por día
              <input
                type="number"
                min={0}
                value={form.valuePerDay}
                onChange={(e) =>
                  setForm((f) => ({ ...f, valuePerDay: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-white/70 bg-white/70 px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-300"
                placeholder="50000"
              />
            </label>
          )}

          {form.paymentMode === "fixed_fortnight" && (
            <label className="text-sm font-semibold text-gray-700">
              Pago fijo quincenal
              <input
                type="number"
                min={0}
                value={form.fixedFortnightPay}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fixedFortnightPay: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-white/70 bg-white/70 px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-300"
                placeholder="300000"
              />
            </label>
          )}

          {form.paymentMode === "fixed_monthly" && (
            <label className="text-sm font-semibold text-gray-700">
              Pago fijo mensual
              <input
                type="number"
                min={0}
                value={form.fixedMonthlyPay}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fixedMonthlyPay: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-white/70 bg-white/70 px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-300"
                placeholder="1200000"
              />
            </label>
          )}

          {form.paymentMode === "per_hour" && (
            <label className="text-sm font-semibold text-gray-700">
              Valor por hora
              <input
                type="number"
                min={0}
                value={form.valuePerHour}
                onChange={(e) =>
                  setForm((f) => ({ ...f, valuePerHour: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-white/70 bg-white/70 px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-300"
                placeholder="10000"
              />
            </label>
          )}

          <label className="text-sm font-semibold text-gray-700">
            Fecha de inicio (opcional)
            <input
              type="date"
              value={form.startDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, startDate: e.target.value }))
              }
              className="mt-1 w-full rounded-xl border border-white/70 bg-white/70 px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </label>

          <label className="text-sm font-semibold text-gray-700 inline-flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) =>
                setForm((f) => ({ ...f, active: e.target.checked }))
              }
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-400"
            />
            Activo
          </label>
        </div>
      </BaseModal>

      {/* Modal Confirmar Guardado */}
      <BaseModal
        isOpen={openConfirmSave}
        onClose={() => setOpenConfirmSave(false)}
        headerAccent="green"
        title="Confirmar guardado"
        description="¿Deseas guardar los cambios de este trabajador?"
        primaryAction={{ label: "Guardar", onClick: doSave }}
        secondaryAction={{
          label: "Cancelar",
          onClick: () => setOpenConfirmSave(false),
        }}
      >
        <p className="text-sm text-gray-600">
          Se actualizará la ficha del trabajador y se mantendrá la asistencia
          existente.
        </p>
      </BaseModal>

      {/* Modal Confirmar Eliminación */}
      <BaseModal
        isOpen={openConfirmDelete}
        onClose={() => setOpenConfirmDelete(false)}
        headerAccent="pink"
        title="Eliminar trabajador"
        description="Esta acción eliminará al trabajador y su ficha (no afecta varios históricos si tu app los guarda aparte)."
        primaryAction={{ label: "Eliminar", onClick: doDelete }}
        secondaryAction={{
          label: "Cancelar",
          onClick: () => setOpenConfirmDelete(false),
        }}
      >
        <div className="rounded-xl border bg-white px-4 py-3 text-sm">
          {toDelete ? (
            <>
              <div className="text-gray-500">Trabajador</div>
              <div className="font-semibold">
                {toDelete.firstName} {toDelete.lastName}
              </div>
            </>
          ) : null}
        </div>
      </BaseModal>
    </div>
  );
}
