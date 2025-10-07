// FILE: src/features/auth/utils/authGate.ts
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { normalizeList } from "./authErrors";

type AppAuthConfig = {
  initialized?: boolean;
  allowlist?: unknown[];
  admins?: unknown[];
};

export async function canRegisterOrSignIn(email: string) {
  const e = email.toLowerCase().trim();
  try {
    const snap = await getDoc(doc(db, "app_config", "auth"));
    if (!snap.exists()) return { allow: true, reason: "first-user:no-config" };

    const cfg = (snap.data() as AppAuthConfig) ?? {};
    const initialized = Boolean(cfg.initialized);
    const allow = Array.isArray(cfg.allowlist)
      ? normalizeList(cfg.allowlist)
      : [];
    const admins = Array.isArray(cfg.admins) ? normalizeList(cfg.admins) : [];

    if (!initialized || admins.length === 0) {
      return { allow: true, reason: "bootstrap:no-admins" };
    }

    const ok = allow.includes(e) || admins.includes(e);
    return { allow: ok, reason: ok ? "in-allowlist" : "not-allowed" };
  } catch {
    return { allow: true, reason: "assume-first-user" };
  }
}
