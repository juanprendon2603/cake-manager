import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { AppFooter } from "../../components/AppFooter";
import { BackButton } from "../../components/BackButton";
import BaseModal from "../../components/BaseModal";
import { PageHero } from "../../components/ui/PageHero";
import { ProTipBanner } from "../../components/ui/ProTipBanner";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";

type RoleSel = "user" | "admin";

type Profile = {
  firstName?: string;
  lastName?: string;
  displayName?: string;
};
type ProfilesMap = Record<string, Profile>;

type AppAuthConfig = {
  initialized?: boolean;
  allowlist?: unknown[];
  admins?: unknown[];
  profiles?: Record<string, { firstName?: unknown; lastName?: unknown; displayName?: unknown }>;
};


function normEmail(v: string) {
  return v.toLowerCase().trim();
}
function isValidEmail(v: string) {
  const e = normEmail(v);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}
function mkDisplayName(firstName?: string, lastName?: string) {
  const f = (firstName || "").trim();
  const l = (lastName || "").trim();
  return [f, l].filter(Boolean).join(" ") || undefined;
}

export default function AllowlistAdmin() {
  const { role, user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [allow, setAllow] = useState<string[]>([]);
  const [admins, setAdmins] = useState<string[]>([]);
  const [profiles, setProfiles] = useState<ProfilesMap>({});

  const [input, setInput] = useState("");
  const [firstInput, setFirstInput] = useState("");
  const [lastInput, setLastInput] = useState("");
  const [roleSel, setRoleSel] = useState<RoleSel>("user");

  const [confirmAddOpen, setConfirmAddOpen] = useState(false);
  const [confirmDelOpen, setConfirmDelOpen] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editEmail, setEditEmail] = useState<string | null>(null);
  const [editFirst, setEditFirst] = useState("");
  const [editLast, setEditLast] = useState("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const me = user?.email ? normEmail(user.email) : null;

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, "app_config", "auth"));
      const cfg: AppAuthConfig = snap.exists() ? (snap.data() as AppAuthConfig) : {};
  
      const allowlist = Array.isArray(cfg.allowlist) ? cfg.allowlist : [];
      const adminsList = Array.isArray(cfg.admins) ? cfg.admins : [];
      const rawProfiles = cfg.profiles ?? {};
  
      setAllow(allowlist.map(x => normEmail(String(x))));
      setAdmins(adminsList.map(x => normEmail(String(x))));
  
      const normalized: ProfilesMap = {};
      for (const [key, val] of Object.entries(rawProfiles)) {
        const ek = normEmail(key);
        const p = (val ?? {}) as { firstName?: unknown; lastName?: unknown; displayName?: unknown };
        const firstName = typeof p.firstName === "string" ? p.firstName : undefined;
        const lastName  = typeof p.lastName  === "string" ? p.lastName  : undefined;
        const displayName =
          typeof p.displayName === "string" && p.displayName.trim()
            ? p.displayName
            : mkDisplayName(firstName, lastName);
  
        normalized[ek] = { firstName, lastName, displayName };
      }
  
      setProfiles(normalized);
      setLoading(false);
    })();
  }, []);
  

  const entries = useMemo(() => {
    const set = new Set([...allow.map(normEmail), ...admins.map(normEmail)]);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allow, admins]);

  if (role !== "admin") return <Navigate to="/" replace />;

  async function save(
    nextAllow: string[],
    nextAdmins: string[],
    nextProfiles?: ProfilesMap
  ) {
    await setDoc(
      doc(db, "app_config", "auth"),
      {
        initialized: true,
        allowlist: Array.from(new Set(nextAllow.map(normEmail))),
        admins: Array.from(new Set(nextAdmins.map(normEmail))),
        ...(nextProfiles ? { profiles: nextProfiles } : {}),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  function openConfirmAdd() {
    setErrorMsg(null);
    setInfoMsg(null);

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

    const f = firstInput.trim();
    const l = lastInput.trim();
    let nextProfiles: ProfilesMap | undefined = profiles;
    if (f || l) {
      nextProfiles = {
        ...profiles,
        [e]: {
          firstName: f || undefined,
          lastName: l || undefined,
          displayName: mkDisplayName(f, l),
        },
      };
      setProfiles(nextProfiles);
    }

    setAllow(nextAllow);
    setAdmins(nextAdmins);
    setConfirmAddOpen(false);
    setInput("");
    setFirstInput("");
    setLastInput("");
    setRoleSel("user");

    await save(nextAllow, nextAdmins, nextProfiles);
    setInfoMsg("Usuario agregado correctamente.");
  }

  function askDelete(email: string) {
    setErrorMsg(null);
    setInfoMsg(null);
    setToDelete(email);
    setConfirmDelOpen(true);
  }

  async function confirmDelete() {
    if (!toDelete) return;
    const e = normEmail(toDelete);

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

    const nextProfiles: ProfilesMap = { ...profiles };
    if (nextProfiles[e]) {
      delete nextProfiles[e];
    }

    setAllow(nextAllow);
    setAdmins(nextAdmins);
    setProfiles(nextProfiles);
    setConfirmDelOpen(false);
    setToDelete(null);

    await save(nextAllow, nextAdmins, nextProfiles);
    setInfoMsg("Usuario eliminado de la lista.");
  }

  function openEdit(email: string) {
    const e = normEmail(email);
    const p = profiles[e] || {};
    setEditEmail(e);
    setEditFirst(p.firstName || "");
    setEditLast(p.lastName || "");
    setEditOpen(true);
  }

  async function confirmEditProfile() {
    if (!editEmail) return;
    const f = editFirst.trim();
    const l = editLast.trim();
    const nextProfiles: ProfilesMap = {
      ...profiles,
      [editEmail]: {
        firstName: f || undefined,
        lastName: l || undefined,
        displayName: mkDisplayName(f, l),
      },
    };
    const p = nextProfiles[editEmail];
    if (!p.firstName && !p.lastName) {
      delete nextProfiles[editEmail];
    }

    setProfiles(nextProfiles);
    setEditOpen(false);
    setEditEmail(null);
    setEditFirst("");
    setEditLast("");

    await save(allow, admins, nextProfiles);
    setInfoMsg("Datos de usuario actualizados.");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex flex-col">
      <main className="flex-grow p-6 sm:p-12 max-w-6xl mx-auto w-full">
        <div className="relative">
          <PageHero
            icon={<Users className="w-10 h-10" />}
            title="Gestión de Usuarios"
            subtitle="Autoriza correos, asigna roles y guarda nombre y apellido"
          />
          <div className="absolute top-4 left-4">
            <BackButton fallback="/admin" />
          </div>
        </div>

        <section className="bg-white/80 backdrop-blur-xl border-2 border-white/60 shadow-2xl rounded-3xl p-6 sm:p-8">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#8E2DA8]" />
              <p className="mt-3 text-gray-600">Cargando…</p>
            </div>
          ) : (
            <>
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

              <div className="rounded-2xl p-4 bg-white/70 backdrop-blur border border-white/60 shadow mb-6">
                <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr]">
                  <label className="text-sm font-semibold text-gray-700 sm:col-span-1">
                    Correo electrónico
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="correo@empresa.com"
                      className="mt-1 w-full rounded-xl border border-white/70 bg-white/70 px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-300"
                      type="email"
                    />
                  </label>

                  <label className="text-sm font-semibold text-gray-700">
                    Nombre (opcional)
                    <input
                      value={firstInput}
                      onChange={(e) => setFirstInput(e.target.value)}
                      placeholder="Nombre"
                      className="mt-1 w-full rounded-xl border border-white/70 bg-white/70 px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-300"
                      type="text"
                    />
                  </label>

                  <label className="text-sm font-semibold text-gray-700">
                    Apellido (opcional)
                    <input
                      value={lastInput}
                      onChange={(e) => setLastInput(e.target.value)}
                      placeholder="Apellido"
                      className="mt-1 w-full rounded-xl border border-white/70 bg-white/70 px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-300"
                      type="text"
                    />
                  </label>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
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

                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      onClick={openConfirmAdd}
                      className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-white bg-gradient-to-r from-[#8E2DA8] via-[#A855F7] to-[#C084FC] hover:shadow-[0_12px_30px_rgba(142,45,168,0.35)]"
                    >
                      <span>➕</span> Agregar
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white/70 backdrop-blur border border-white/60 shadow">
                {entries.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No hay usuarios autorizados todavía.
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {entries.map((e) => {
                      const isAdmin = admins.includes(e);
                      const isMe = me && me === e;
                      const profile = profiles[e];
                      const display = profile?.displayName;
                      return (
                        <li
                          key={e}
                          className="px-4 py-3 flex items-center justify-between"
                        >
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 truncate">
                              {display || e}
                            </div>
                            <div className="text-xs text-gray-500">{e}</div>
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
                                {isMe && (
                                  <span className="opacity-70">(tú)</span>
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEdit(e)}
                              className="px-3 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg"
                            >
                              Editar nombre
                            </button>
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
            </>
          )}
        </section>

        <div className="mt-8">
          <ProTipBanner
            title="Tip de administración"
            text="Puedes guardar el nombre y apellido para que las iniciales y el nombre mostrado en la app sean consistentes, incluso si el displayName de Firebase está vacío."
          />
        </div>
      </main>

      <AppFooter appName="InManager" />

      <BaseModal
        isOpen={confirmAddOpen}
        onClose={() => setConfirmAddOpen(false)}
        headerAccent={roleSel === "admin" ? "indigo" : "green"}
        title="Confirmar nuevo usuario"
        description="Verifica que los datos sean correctos."
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
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border bg-white px-4 py-3">
              <div className="text-xs text-gray-500">Nombre</div>
              <div className="font-semibold">{firstInput.trim() || "—"}</div>
            </div>
            <div className="rounded-xl border bg-white px-4 py-3">
              <div className="text-xs text-gray-500">Apellido</div>
              <div className="font-semibold">{lastInput.trim() || "—"}</div>
            </div>
          </div>
          <div className="rounded-xl border bg-white px-4 py-3">
            <div className="text-xs text-gray-500">Rol</div>
            <div className="font-semibold">
              {roleSel === "admin" ? "Administrador" : "Usuario"}
            </div>
          </div>
          <p className="text-xs text-gray-500">
            El usuario podrá iniciar sesión si ya existe o crear cuenta si aún
            no la tiene.
          </p>
        </div>
      </BaseModal>

      <BaseModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        headerAccent="indigo"
        title="Editar nombre del usuario"
        description={editEmail || ""}
        primaryAction={{ label: "Guardar", onClick: confirmEditProfile }}
        secondaryAction={{
          label: "Cancelar",
          onClick: () => setEditOpen(false),
        }}
        size="md"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold text-gray-700">
            Nombre
            <input
              value={editFirst}
              onChange={(e) => setEditFirst(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/70 bg-white/70 px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-300"
              type="text"
            />
          </label>
          <label className="text-sm font-semibold text-gray-700">
            Apellido
            <input
              value={editLast}
              onChange={(e) => setEditLast(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/70 bg-white/70 px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-300"
              type="text"
            />
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Si dejas ambos campos vacíos, se eliminará el nombre guardado para
          este correo.
        </p>
      </BaseModal>

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
              Estás eliminando a un <b>Administrador</b>. Asegúrate de que quede
              al menos un admin activo.
            </div>
          )}
        </div>
      </BaseModal>
    </div>
  );
}
