// src/contexts/AuthContext.tsx
import type { User } from "firebase/auth";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth, db } from "../lib/firebase";

type Role = "admin" | "user";
type AuthContextValue = {
  user: User | null;
  loading: boolean;
  role: Role | null;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const un = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      const cfgRef = doc(db, "app_config", "auth");
      const userRef = doc(db, "users", u.uid);
      const email = (u.email || "").toLowerCase().trim();

      try {
        // 0) Lee configuración
        const cfgSnap = await getDoc(cfgRef);
        const cfg = cfgSnap.exists()
          ? (cfgSnap.data() as any)
          : { initialized: false, allowlist: [], admins: [] };

        const initialized = !!cfg.initialized;
        const allow: string[] = (cfg.allowlist || []).map((x: any) =>
          String(x).toLowerCase().trim()
        );
        const admins: string[] = (cfg.admins || []).map((x: any) =>
          String(x).toLowerCase().trim()
        );

        // ✅ bootstrap si NO hay admins (aunque initialized sea true)
        const sinAdmins = admins.length === 0;

        // 1) BOOTSTRAP: si no está inicializado O NO HAY ADMINS → hacer admin al usuario actual
        if (!initialized || sinAdmins) {
          await runTransaction(db, async (tx) => {
            const freshCfg = await tx.get(cfgRef);
            const currCfg = freshCfg.exists()
              ? (freshCfg.data() as any)
              : { initialized: false, allowlist: [], admins: [] };

            const cAllow: string[] = (currCfg.allowlist || []).map((x: any) =>
              String(x).toLowerCase().trim()
            );
            const cAdmins: string[] = (currCfg.admins || []).map((x: any) =>
              String(x).toLowerCase().trim()
            );

            if (!currCfg.initialized || cAdmins.length === 0) {
              tx.set(
                cfgRef,
                {
                  initialized: true,
                  allowlist: Array.from(new Set([...(cAllow || []), email])),
                  admins: Array.from(new Set([...(cAdmins || []), email])),
                  updatedAt: serverTimestamp(),
                },
                { merge: true }
              );

              tx.set(
                userRef,
                {
                  email: u.email ?? null,
                  displayName: u.displayName ?? null,
                  photoURL: u.photoURL ?? null,
                  role: "admin",
                  active: true,
                  disabled: false,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                },
                { merge: true }
              );
            }
          });

          setUser(u);
          setRole("admin");
          setLoading(false);
          return;
        }

        // 2) YA INICIALIZADO: validar allowlist/admins
        const isAdminEmail = admins.includes(email);
        const isAllowedEmail = isAdminEmail || allow.includes(email);
        if (!isAllowedEmail) {
          await signOut(auth);
          setUser(null);
          setRole(null);
          setLoading(false);
          return;
        }

        // 3) Asegurar/actualizar users/{uid}
        let finalRole: Role = isAdminEmail ? "admin" : "user";
        await runTransaction(db, async (tx) => {
          const uSnap = await tx.get(userRef);
          if (!uSnap.exists()) {
            tx.set(userRef, {
              email: u.email ?? null,
              displayName: u.displayName ?? null,
              photoURL: u.photoURL ?? null,
              role: finalRole,
              active: true,
              disabled: false,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            return;
          }

          const data = uSnap.data() as any;
          if (data.disabled === true || data.active === false) {
            throw new Error("USER_DISABLED");
          }

          const currentRole: Role | undefined = data.role;
          const patch: any = {
            email: u.email ?? null,
            displayName: u.displayName ?? null,
            photoURL: u.photoURL ?? null,
            updatedAt: serverTimestamp(),
          };
          if (currentRole !== finalRole) {
            patch.role = finalRole;
          }
          tx.set(userRef, patch, { merge: true });
        });

        setUser(u);
        setRole(finalRole);
        setLoading(false);
      } catch (e: any) {
        console.error("[Auth] Bootstrap/allowlist error", e);
        if (String(e?.message) === "USER_DISABLED") {
          await signOut(auth);
        }
        setUser(null);
        setRole(null);
        setLoading(false);
      }
    });

    return () => un();
  }, []);

  const value = useMemo(
    () => ({ user, loading, role, logout: () => signOut(auth) }),
    [user, loading, role]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
