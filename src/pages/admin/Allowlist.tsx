// src/pages/admin/Allowlist.tsx
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import BaseModal from "../../components/BaseModal";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";

type RoleSel = "user" | "admin";

function normEmail(v: string) {
  return v.toLowerCase().trim();
}
function isValidEmail(v: string) {
  const e = normEmail(v);
  // Sencillo pero efectivo
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export default function AllowlistAdmin() {
  const { role, user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Estado de configuración
  const [allow, setAllow] = useState<string[]>([]);
  const [admins, setAdmins] = useState<string[]>([]);

  // Form de alta
  const [input, setInput] = useState("");
  const [roleSel, setRoleSel] = useState<RoleSel>("user");

  // Modales
  const [confirmAddOpen, setConfirmAddOpen] = useState(false);
  const [confirmDelOpen, setConfirmDelOpen] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);

  // Mensajes UI
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const me = user?.email ? normEmail(user.email) : null;

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, "app_config", "auth"));
      const cfg = snap.exists()
        ? (snap.data() as any)
        : { initialized: false, allowlist: [], admins: [] };
      setAllow((cfg.allowlist || []).map(normEmail));
      setAdmins((cfg.admins || []).map(normEmail));
      setLoading(false);
    })();
  }, []);

  const entries = useMemo(() => {
    // Unimos allowlist ∪ admins
    const set = new Set([...allow.map(normEmail), ...admins.map(normEmail)]);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allow, admins]);

  if (role !== "admin") return <Navigate to="/" replace />;

  async function save(nextAllow: string[], nextAdmins: string[]) {
    await setDoc(
      doc(db, "app_config", "auth"),
      {
        initialized: true,
        allowlist: Array.from(new Set(nextAllow.map(normEmail))),
        admins: Array.from(new Set(nextAdmins.map(normEmail))),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  // ----- Alta -----
  function openConfirmAdd() {
    setErrorMsg(null);
    const e = normEmail(input);
    if (!e) {
      setErrorMsg("Escribe un correo.");
      return;
    }
    if (!isValidEmail(e)) {
      setErrorMsg("Correo inválido.");
      return;
    }
    const already = allow.includes(e) || admins.includes(e);
    if (already) {
      setInfoMsg("Ese correo ya está autorizado.");
      return;
    }
    setConfirmAddOpen(true);
  }

  async function confirmAdd() {
    const e = normEmail(input);
    const nextAllow =
      roleSel === "admin"
        ? Array.from(new Set([...allow, e]))
        : Array.from(new Set([...allow, e]));
    const nextAdmins =
      roleSel === "admin" ? Array.from(new Set([...admins, e])) : admins;

    setAllow(nextAllow);
    setAdmins(nextAdmins);
    setConfirmAddOpen(false);
    setInput("");
    setRoleSel("user");
    await save(nextAllow, nextAdmins);
    setInfoMsg("Usuario agregado correctamente.");
  }

  // ----- Baja -----
  function askDelete(email: string) {
    setErrorMsg(null);
    setInfoMsg(null);
    setToDelete(email);
    setConfirmDelOpen(true);
  }

  async function confirmDelete() {
    if (!toDelete) return;
    const e = normEmail(toDelete);

    // Si es admin: no permitir borrar si es el ÚLTIMO admin
    const isAdmin = admins.includes(e);
    if (isAdmin) {
      const otherAdmins = admins.filter((x) => x !== e);
      if (otherAdmins.length === 0) {
        setErrorMsg("No puedes eliminar al último administrador.");
        setConfirmDelOpen(false);
        setToDelete(null);
        return;
      }
    }

    const nextAllow = allow.filter((x) => x !== e);
    const nextAdmins = admins.filter((x) => x !== e);

    setAllow(nextAllow);
    setAdmins(nextAdmins);
    setConfirmDelOpen(false);
    setToDelete(null);
    await save(nextAllow, nextAdmins);
    setInfoMsg("Usuario eliminado de la lista.");
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 w-20 h-20 rounded-3xl bg-white/70 backdrop-blur border border-white/60 shadow flex items-center justify-center ring-2 ring-purple-200">
          <span className="text-3xl">👥</span>
        </div>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#8E2DA8] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent">
          Gestión de Usuarios (Allowlist)
        </h1>
        <p className="text-gray-600 mt-1">
          Autoriza correos y define si serán <b>Usuario</b> o{" "}
          <b>Administrador</b>.
        </p>
      </div>

      {loading ? (
        <div className="text-center text-gray-600">Cargando…</div>
      ) : (
        <>
          {/* Mensajes */}
          {errorMsg && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">
              {errorMsg}
            </div>
          )}
          {infoMsg && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-2 text-sm">
              {infoMsg}
            </div>
          )}

          {/* Form alta */}
          <div className="rounded-2xl p-4 bg-white/80 backdrop-blur border border-white/60 shadow mb-6">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <label className="text-sm font-semibold text-gray-700">
                Correo electrónico
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="correo@empresa.com"
                  className="mt-1 w-full rounded-xl border border-white/70 bg-white/70 px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-300"
                  type="email"
                />
              </label>

              {/* Selector de rol bonito */}
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-1">
                  Rol
                </div>
                <div className="flex rounded-xl overflow-hidden border border-white/70 bg-white/70 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setRoleSel("user")}
                    className={[
                      "flex-1 px-4 py-2 text-sm font-semibold transition",
                      roleSel === "user"
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        : "text-gray-700 hover:bg-gray-100",
                    ].join(" ")}
                  >
                    Usuario
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleSel("admin")}
                    className={[
                      "flex-1 px-4 py-2 text-sm font-semibold transition",
                      roleSel === "admin"
                        ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white"
                        : "text-gray-700 hover:bg-gray-100",
                    ].join(" ")}
                  >
                    Admin
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2 flex justify-end">
                <button
                  onClick={openConfirmAdd}
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-white bg-gradient-to-r from-[#8E2DA8] via-[#A855F7] to-[#C084FC] hover:shadow-[0_12px_30px_rgba(142,45,168,0.35)]"
                >
                  <span>➕</span> Agregar
                </button>
              </div>
            </div>
          </div>

          {/* Lista */}
          <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow">
            {entries.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No hay usuarios autorizados todavía.
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {entries.map((e) => {
                  const isAdmin = admins.includes(e);
                  const isMe = me && me === e;
                  return (
                    <li
                      key={e}
                      className="px-4 py-3 flex items-center justify-between"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-800 truncate">
                          {e}
                        </div>
                        <div className="mt-1">
                          <span
                            className={[
                              "inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full",
                              isAdmin
                                ? "bg-indigo-100 text-indigo-700"
                                : "bg-emerald-100 text-emerald-700",
                            ].join(" ")}
                          >
                            {isAdmin ? "Administrador" : "Usuario"}
                            {isMe && <span className="opacity-70">(tú)</span>}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => askDelete(e)}
                          className="px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          Eliminar
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Modal confirmar alta */}
          <BaseModal
            isOpen={confirmAddOpen}
            onClose={() => setConfirmAddOpen(false)}
            headerAccent={roleSel === "admin" ? "indigo" : "green"}
            title="Confirmar nuevo usuario"
            description="Verifica que el correo y el rol sean correctos."
            primaryAction={{ label: "Agregar", onClick: confirmAdd }}
            secondaryAction={{
              label: "Cancelar",
              onClick: () => setConfirmAddOpen(false),
            }}
            size="md"
          >
            <div className="space-y-3">
              <div className="rounded-xl border bg-white px-4 py-3">
                <div className="text-xs text-gray-500">Correo</div>
                <div className="font-semibold">{normEmail(input)}</div>
              </div>
              <div className="rounded-xl border bg-white px-4 py-3">
                <div className="text-xs text-gray-500">Rol</div>
                <div className="font-semibold">
                  {roleSel === "admin" ? "Administrador" : "Usuario"}
                </div>
              </div>
              <p className="text-xs text-gray-500">
                El usuario podrá iniciar sesión si ya existe o crear cuenta si
                aún no la tiene.
              </p>
            </div>
          </BaseModal>

          {/* Modal confirmar eliminación */}
          <BaseModal
            isOpen={confirmDelOpen}
            onClose={() => setConfirmDelOpen(false)}
            headerAccent="pink"
            title="Eliminar usuario"
            description="Esta acción revoca el acceso del correo a la aplicación."
            primaryAction={{ label: "Eliminar", onClick: confirmDelete }}
            secondaryAction={{
              label: "Cancelar",
              onClick: () => setConfirmDelOpen(false),
            }}
            size="md"
          >
            <div className="space-y-3">
              <div className="rounded-xl border bg-white px-4 py-3">
                <div className="text-xs text-gray-500">Correo</div>
                <div className="font-semibold">{toDelete}</div>
              </div>
              {toDelete && admins.includes(normEmail(toDelete)) && (
                <div className="rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-amber-800 text-sm">
                  Estás eliminando a un <b>Administrador</b>. Asegúrate de que
                  quede al menos un admin activo.
                </div>
              )}
            </div>
          </BaseModal>
        </>
      )}
    </div>
  );
}
