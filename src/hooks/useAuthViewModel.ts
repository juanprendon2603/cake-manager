// FILE: src/features/auth/hooks/useAuthViewModel.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fbErrorToMessage, getErrorCode } from "../pages/auth/utils/authErrors";
import { canRegisterOrSignIn } from "../pages/auth/utils/authGate";
import { applyPersistence } from "../pages/auth/utils/persistence";
import { useAuth } from "./../contexts/AuthContext";
import { useToast } from "./../hooks/useToast";
import { auth } from "./../lib/firebase";

const AUTH_PENDING_KEY = "auth:pending";

export type Mode = "login" | "register";

export function useAuthViewModel() {
  const nav = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addToast } = useToast();

  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname || "/";

  const [mode, setMode] = useState<Mode>("login");
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

  useEffect(() => {
    if (sessionStorage.getItem(AUTH_PENDING_KEY) === "1") {
      setSubmitting(true);
    }
  }, []);

  useEffect(() => {
    if (user) {
      sessionStorage.removeItem(AUTH_PENDING_KEY);
      nav(from, { replace: true });
    }
  }, [user, from, nav]);

  useEffect(() => {
    if (error) setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, password, confirm, mode]);

  const canSubmit = useMemo(() => {
    const base = email.trim().length > 3 && password.length >= 6;
    if (mode === "register") return base && confirm.length >= 6;
    return base;
  }, [email, password, confirm, mode]);

  const passwordsMismatch =
    mode === "register" && confirm.length > 0 && password !== confirm;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return; // evita doble submit
    setSubmitting(true);
    sessionStorage.setItem(AUTH_PENDING_KEY, "1"); // mantiene el loader si el componente se re-monta
    setError(null);

    try {
      await applyPersistence(remember);
      const eLower = email.trim().toLowerCase();

      // Validación de allowlist/admins
      const gate = await canRegisterOrSignIn(eLower);
      if (!gate.allow) {
        showErrorToast(
          gate.reason === "config-error"
            ? "No se pudo validar el acceso. Inténtalo de nuevo."
            : mode === "login"
            ? "Tu correo no está autorizado por el administrador."
            : "Tu correo no está autorizado para crear cuenta.",
          mode === "login" ? "Acceso restringido" : "Registro restringido"
        );
        setSubmitting(false);
        sessionStorage.removeItem(AUTH_PENDING_KEY);
        return;
      }

      if (mode === "login") {
        await signInWithEmailAndPassword(auth, eLower, password);
        showSuccessToast("Bienvenido de vuelta 👋", "Sesión iniciada");
      } else {
        if (passwordsMismatch) {
          showErrorToast("Las contraseñas no coinciden.", "Validación");
          setSubmitting(false);
          sessionStorage.removeItem(AUTH_PENDING_KEY);
          return;
        }
        await createUserWithEmailAndPassword(auth, eLower, password);
        showSuccessToast("Tu cuenta fue creada 🎉", "Registro completado");
      }
    } catch (err: unknown) {
      showErrorToast(fbErrorToMessage(getErrorCode(err)));
      setSubmitting(false);
      sessionStorage.removeItem(AUTH_PENDING_KEY);
    }
  }

  return {
    mode,
    email,
    password,
    confirm,
    showPwd,
    showPwd2,
    remember,
    submitting,
    error,
    canSubmit,
    passwordsMismatch,
    setMode,
    setEmail,
    setPassword,
    setConfirm,
    setShowPwd,
    setShowPwd2,
    setRemember,
    setSubmitting,
    setError,
    handleSubmit,
  };
}
