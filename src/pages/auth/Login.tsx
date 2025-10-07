// FILE: src/features/auth/pages/Login.tsx
import { useState } from "react";
import logoUrl from "../../assets/logo.png";
import { FullScreenLoaderSession } from "../../components/FullScreenLoaderSession";
import { useAuthViewModel } from "../../hooks/useAuthViewModel";
import { ForgotPasswordModal, Spinner } from "./components/ForgotPasswordModal";
import { PasswordInput } from "./components/PasswordInput";

export default function Login() {
  const vm = useAuthViewModel();
  const [forgotOpen, setForgotOpen] = useState(false);

  if (vm.submitting) {
    return (
      <FullScreenLoaderSession
        appName="InManager"
        message={
          vm.mode === "login" ? "Ingresando a InManager…" : "Creando tu cuenta…"
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
        <div className="absolute -inset-6 rounded-3xl bg-gradient-to-r from-[#8E2DA8] via-[#A855F7] to-[#C084FC] opacity-30 blur-2xl" />

        <div className="relative rounded-3xl border border-white/60 bg-white/80 backdrop-blur-xl shadow-[0_20px_45px_rgba(142,45,168,0.18)] p-6 sm:p-8">
          <div className="w-20 h-20 rounded-2xl bg-white border border-white/60 shadow mx-auto -mt-14 mb-6 flex items-center justify-center ring-2 ring-purple-200 overflow-hidden">
            <img
              src={logoUrl}
              alt="InManager logo"
              className="w-16 h-16 object-contain"
              loading="eager"
              decoding="async"
            />
          </div>

          <div className="text-center mb-6">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#8E2DA8] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(142,45,168,0.18)]">
              {vm.mode === "login" ? "Bienvenido" : "Crear cuenta"}
            </h1>
            <p className="text-gray-600 text-sm">
              {vm.mode === "login"
                ? "Ingresa para gestionar tu negocio"
                : "Crea tu cuenta para empezar"}
            </p>
          </div>

          {vm.error && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">
              {vm.error}
            </div>
          )}

          <form onSubmit={vm.handleSubmit} className="grid gap-3">
            <label className="text-sm font-semibold text-gray-700">
              Correo electrónico
              <input
                type="email"
                className="mt-1 w-full rounded-xl border border-white/70 bg-white/70 px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-300"
                placeholder="tucorreo@ejemplo.com"
                value={vm.email}
                onChange={(e) => vm.setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </label>

            <PasswordInput
              label="Contraseña"
              value={vm.password}
              onChange={vm.setPassword}
              show={vm.showPwd}
              setShow={vm.setShowPwd}
              placeholder={
                vm.mode === "login" ? "Tu contraseña" : "Mínimo 6 caracteres"
              }
              autoComplete={
                vm.mode === "login" ? "current-password" : "new-password"
              }
            />

            {vm.mode === "register" && (
              <>
                <PasswordInput
                  label="Confirmar contraseña"
                  value={vm.confirm}
                  onChange={vm.setConfirm}
                  show={vm.showPwd2}
                  setShow={vm.setShowPwd2}
                  placeholder="Repite la contraseña"
                  autoComplete="new-password"
                  invalid={vm.passwordsMismatch}
                />
                {vm.passwordsMismatch && (
                  <span className="mt-1 block text-xs text-rose-600">
                    Las contraseñas no coinciden.
                  </span>
                )}
              </>
            )}

            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  checked={vm.remember}
                  onChange={(e) => vm.setRemember(e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-400"
                />
                Recordarme
              </label>

              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="font-semibold text-[#8E2DA8] hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              type="submit"
              disabled={
                vm.submitting ||
                !vm.canSubmit ||
                (vm.mode === "register" && vm.passwordsMismatch)
              }
              className={`mt-2 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white shadow-lg transition-all
                ${
                  vm.submitting ||
                  !vm.canSubmit ||
                  (vm.mode === "register" && vm.passwordsMismatch)
                    ? "bg-gradient-to-r from-purple-300 to-pink-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#8E2DA8] via-[#A855F7] to-[#C084FC] hover:shadow-[0_12px_30px_rgba(142,45,168,0.35)] hover:-translate-y-0.5"
                }`}
            >
              {vm.submitting ? (
                <>
                  <Spinner />
                  {vm.mode === "login" ? "Ingresando…" : "Creando…"}
                </>
              ) : (
                <>{vm.mode === "login" ? "Entrar" : "Crear cuenta"}</>
              )}
            </button>

            <div className="text-center text-sm text-gray-600 mt-1">
              {vm.mode === "login" ? (
                <>
                  ¿No tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => vm.setMode("register")}
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
                    onClick={() => vm.setMode("login")}
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

      {forgotOpen && (
        <ForgotPasswordModal
          email={vm.email}
          onClose={() => setForgotOpen(false)}
        />
      )}
    </div>
  );
}
