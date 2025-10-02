// src/pages/auth/Login.tsx
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logoUrl from "../../assets/logo.png";
import { FullScreenLoaderSession } from "../../components/FullScreenLoaderSession";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../hooks/useToast";
import { auth, db } from "../../lib/firebase";

/* ========================= Utils ========================= */

function fbErrorToMessage(code?: string) {
  switch (code) {
    case "auth/invalid-email":
      return "Correo inválido.";
    case "auth/user-disabled":
      return "Usuario deshabilitado.";
    case "auth/user-not-found":
      return "No existe una cuenta con ese correo.";
    case "auth/wrong-password":
      return "Contraseña incorrecta.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Intenta más tarde.";
    case "auth/email-already-in-use":
      return "Ese correo ya está registrado.";
    case "auth/weak-password":
      return "La contraseña es muy débil.";
    default:
      return "Algo salió mal. Intenta de nuevo.";
  }
}

/** Lee app_config/auth.
 * Si no existe o está sin inicializar/vacía → permite PRIMER usuario.
 * Si initialized=true → permite solo si email ∈ (allowlist ∪ admins).
 */
async function canRegisterOrSignIn(email: string) {
  const e = email.toLowerCase().trim();
  try {
    const snap = await getDoc(doc(db, "app_config", "auth"));
    if (!snap.exists()) return { allow: true, reason: "first-user:no-config" };

    const cfg = snap.data() as any;
    const initialized = !!cfg.initialized;
    const allow: string[] = (cfg.allowlist || []).map((x: any) =>
      String(x).toLowerCase().trim()
    );
    const admins: string[] = (cfg.admins || []).map((x: any) =>
      String(x).toLowerCase().trim()
    );

    if (!initialized || admins.length === 0) {
      return { allow: true, reason: "bootstrap:no-admins" };
    }

    const ok = allow.includes(e) || admins.includes(e);
    return { allow: ok, reason: ok ? "in-allowlist" : "not-allowed" };
  } catch {
    return { allow: true, reason: "assume-first-user" };
  }
}

/* ========================= Página ========================= */

export default function Login() {
  const nav = useNavigate();
  const location = useLocation() as any;
  const { user } = useAuth();
  const { addToast } = useToast();
  const from = location.state?.from?.pathname || "/";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [remember, setRemember] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function showErrorToast(message: string, title = "Error") {
    setError(message);
    addToast({ type: "error", title, message });
  }
  function showSuccessToast(message: string, title = "Listo") {
    addToast({ type: "success", title, message });
  }

  // Si ya hay sesión, vete fuera del login
  useEffect(() => {
    if (user) {
      nav(from, { replace: true });
    }
  }, [user, from, nav]);

  // limpia errores al cambiar inputs
  useEffect(() => {
    if (error) setError(null);
  }, [email, password, confirm, mode, error]);

  async function applyPersistence() {
    await setPersistence(
      auth,
      remember ? browserLocalPersistence : browserSessionPersistence
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await applyPersistence();
      const eLower = email.trim().toLowerCase();

      if (mode === "login") {
        const gate = await canRegisterOrSignIn(eLower);
        if (!gate.allow) {
          showErrorToast(
            gate.reason === "config-error"
              ? "No se pudo validar el acceso. Inténtalo de nuevo."
              : "Tu correo no está autorizado por el administrador.",
            "Acceso restringido"
          );
          setSubmitting(false);
          return;
        }
        await signInWithEmailAndPassword(auth, eLower, password);
        // Esperamos a que useAuth() propague `user`
        showSuccessToast("Bienvenido de vuelta 👋", "Sesión iniciada");
      } else {
        if (password !== confirm) {
          showErrorToast("Las contraseñas no coinciden.", "Validación");
          setSubmitting(false);
          return;
        }
        const gate = await canRegisterOrSignIn(eLower);
        if (!gate.allow) {
          showErrorToast(
            gate.reason === "config-error"
              ? "No se pudo validar el acceso. Inténtalo de nuevo."
              : "Tu correo no está autorizado para crear cuenta.",
            "Registro restringido"
          );
          setSubmitting(false);
          return;
        }
        await createUserWithEmailAndPassword(auth, eLower, password);
        // Esperamos a que `user` se propague
        showSuccessToast("Tu cuenta fue creada 🎉", "Registro completado");
      }
    } catch (err: any) {
      showErrorToast(fbErrorToMessage(err?.code));
      setSubmitting(false); // sólo bajamos el loader si hubo error
    }
  }

  const canSubmit = useMemo(() => {
    const base = email.trim().length > 3 && password.length >= 6;
    if (mode === "register") return base && confirm.length >= 6;
    return base;
  }, [email, password, confirm, mode]);

  const passwordsMismatch =
    mode === "register" && confirm.length > 0 && password !== confirm;

  // 🔄 Mientras enviamos credenciales y esperamos que se propague `user`, muestra loader
  if (submitting) {
    return (
      <FullScreenLoaderSession
        appName="InManager"
        message={
          mode === "login" ? "Ingresando a InManager…" : "Creando tu cuenta…"
        }
        logoUrl={logoUrl}
        tips={[
          "Tip: usa «Recordarme» para mantener la sesión",
          "Atajo: pulsa / para buscar",
          "Consejo: exporta reportes desde Ventas",
        ]}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-md">
        {/* Glow de fondo */}
        <div className="absolute -inset-6 rounded-3xl bg-gradient-to-r from-[#8E2DA8] via-[#A855F7] to-[#C084FC] opacity-30 blur-2xl" />

        {/* Card */}
        <div className="relative rounded-3xl border border-white/60 bg-white/80 backdrop-blur-xl shadow-[0_20px_45px_rgba(142,45,168,0.18)] p-6 sm:p-8">
          {/* Logo */}
          <div className="w-20 h-20 rounded-2xl bg-white border border-white/60 shadow mx-auto -mt-14 mb-6 flex items-center justify-center ring-2 ring-purple-200 overflow-hidden">
            <img
              src={logoUrl}
              alt="InManager logo"
              className="w-16 h-16 object-contain"
              loading="eager"
              decoding="async"
            />
          </div>

          {/* Título */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#8E2DA8] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(142,45,168,0.18)]">
              {mode === "login" ? "Bienvenido" : "Crear cuenta"}
            </h1>
            <p className="text-gray-600 text-sm">
              {mode === "login"
                ? "Ingresa para gestionar tu negocio"
                : "Crea tu cuenta para empezar"}
            </p>
          </div>

          {/* Alert de error (inline, opcional) */}
          {error && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="grid gap-3">
            <label className="text-sm font-semibold text-gray-700">
              Correo electrónico
              <input
                type="email"
                className="mt-1 w-full rounded-xl border border-white/70 bg-white/70 px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-300"
                placeholder="tucorreo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </label>

            <label className="text-sm font-semibold text-gray-700">
              Contraseña
              <div className="mt-1 relative">
                <input
                  type={showPwd ? "text" : "password"}
                  className="w-full rounded-xl border border-white/70 bg-white/70 px-4 py-3 pr-11 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-300"
                  placeholder={
                    mode === "login" ? "Tu contraseña" : "Mínimo 6 caracteres"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={
                    showPwd ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
                >
                  {showPwd ? "🙈" : "👁️"}
                </button>
              </div>
            </label>

            {mode === "register" && (
              <label className="text-sm font-semibold text-gray-700">
                Confirmar contraseña
                <div className="mt-1 relative">
                  <input
                    type={showPwd2 ? "text" : "password"}
                    className={`w-full rounded-xl border px-4 py-3 pr-11 shadow-inner focus:outline-none focus:ring-2 ${
                      passwordsMismatch
                        ? "border-rose-300 bg-rose-50 focus:ring-rose-300"
                        : "border-white/70 bg-white/70 focus:ring-purple-300"
                    }`}
                    placeholder="Repite la contraseña"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd2((v) => !v)}
                    aria-label={
                      showPwd2 ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
                  >
                    {showPwd2 ? "🙈" : "👁️"}
                  </button>
                </div>
                {passwordsMismatch && (
                  <span className="mt-1 block text-xs text-rose-600">
                    Las contraseñas no coinciden.
                  </span>
                )}
              </label>
            )}

            {/* opciones */}
            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-400"
                />
                Recordarme
              </label>

              <ForgotPasswordTrigger email={email} />
            </div>

            <button
              type="submit"
              disabled={
                submitting ||
                !canSubmit ||
                (mode === "register" && passwordsMismatch)
              }
              className={`mt-2 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white shadow-lg transition-all
                ${
                  submitting ||
                  !canSubmit ||
                  (mode === "register" && passwordsMismatch)
                    ? "bg-gradient-to-r from-purple-300 to-pink-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#8E2DA8] via-[#A855F7] to-[#C084FC] hover:shadow-[0_12px_30px_rgba(142,45,168,0.35)] hover:-translate-y-0.5"
                }`}
            >
              {submitting ? (
                <>
                  <Spinner />
                  {mode === "login" ? "Ingresando…" : "Creando…"}
                </>
              ) : (
                <>{mode === "login" ? "Entrar" : "Crear cuenta"}</>
              )}
            </button>

            <div className="text-center text-sm text-gray-600 mt-1">
              {mode === "login" ? (
                <>
                  ¿No tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("register")}
                    className="font-semibold text-[#8E2DA8] hover:underline"
                  >
                    Crear una
                  </button>
                </>
              ) : (
                <>
                  ¿Ya tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="font-semibold text-[#8E2DA8] hover:underline"
                  >
                    Inicia sesión
                  </button>
                </>
              )}
            </div>
          </form>

          <div className="mt-6 h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent" />
          <p className="mt-4 text-center text-xs text-gray-500">
            © 2025 InManager
          </p>
        </div>
      </div>
    </div>
  );
}

/* ========================= Auxiliares UI ========================= */

function Spinner() {
  return (
    <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
  );
}

/** Modal inline para recuperar contraseña */
function ForgotPasswordTrigger({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-semibold text-[#8E2DA8] hover:underline"
      >
        ¿Olvidaste tu contraseña?
      </button>
      {open && (
        <ForgotPasswordModal email={email} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function ForgotPasswordModal({
  email,
  onClose,
}: {
  email: string;
  onClose: () => void;
}) {
  const [value, setValue] = useState(email || "");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const { addToast } = useToast();

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await sendPasswordResetEmail(auth, value.trim());
      setSent(true);
      addToast({
        type: "success",
        title: "Enlace enviado",
        message: "Revisa tu bandeja de entrada o spam.",
      });
    } catch (error: any) {
      const msg = fbErrorToMessage(error?.code);
      setErr(msg);
      addToast({ type: "error", title: "No se pudo enviar", message: msg });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/60 bg-white/90 backdrop-blur-xl shadow-xl p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Recuperar contraseña
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Te enviaremos un enlace a tu correo para restablecerla.
        </p>

        {err && (
          <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">
            {err}
          </div>
        )}

        {sent ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-2 text-sm mb-4">
            Enlace enviado. Revisa tu correo.
          </div>
        ) : null}

        {!sent && (
          <form onSubmit={handleSend} className="grid gap-3">
            <label className="text-sm font-semibold text-gray-700">
              Correo
              <input
                type="email"
                className="mt-1 w-full rounded-xl border border-white/70 bg-white/70 px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-300"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
              />
            </label>

            <button
              type="submit"
              disabled={busy || value.trim().length < 4}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white shadow-lg transition-all
                ${
                  busy || value.trim().length < 4
                    ? "bg-gradient-to-r from-purple-300 to-pink-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#8E2DA8] via-[#A855F7] to-[#C084FC] hover:shadow-[0_12px_30px_rgba(142,45,168,0.35)]"
                }`}
            >
              {busy ? <Spinner /> : "Enviar enlace"}
            </button>
          </form>
        )}

        <div className="mt-4 text-right">
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold text-[#8E2DA8] hover:underline"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
