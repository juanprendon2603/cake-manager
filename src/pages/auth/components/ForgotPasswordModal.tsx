// FILE: src/features/auth/components/ForgotPasswordModal.tsx
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { useToast } from "../../../hooks/useToast";
import { auth } from "../../../lib/firebase";
import { fbErrorToMessage, getErrorCode } from "../utils/authErrors";

export function ForgotPasswordModal({
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
    } catch (error: unknown) {
      const msg = fbErrorToMessage(getErrorCode(error));
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
        ) : (
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

export function Spinner() {
  return (
    <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
  );
}
