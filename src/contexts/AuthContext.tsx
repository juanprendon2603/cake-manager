/* eslint-disable react-refresh/only-export-components */
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

export type UserProfile = {
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  role: Role | null;
  profile: UserProfile | null;
  logout: () => Promise<void>;
};

type AppAuthConfig = {
  initialized: boolean;
  allowlist: string[];
  admins: string[];
  profiles: Record<string, UserProfile>;
};

type UserDoc = {
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: Role;
  active: boolean;
  disabled: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
};

const DEFAULT_CONFIG: AppAuthConfig = {
  initialized: false,
  allowlist: [],
  admins: [],
  profiles: {},
};

const toLowerTrim = (arr: unknown): string[] =>
  Array.isArray(arr) ? arr.map((x) => String(x).toLowerCase().trim()) : [];

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const un = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        setRole(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      const cfgRef = doc(db, "app_config", "auth");
      const userRef = doc(db, "users", u.uid);
      const email = (u.email || "").toLowerCase().trim();

      try {
        // --- Leer configuración de la app ---
        const cfgSnap = await getDoc(cfgRef);
        const cfg = cfgSnap.exists()
          ? ((cfgSnap.data() as Partial<AppAuthConfig>) ?? {})
          : ({} as Partial<AppAuthConfig>);

        const initialized = Boolean(cfg.initialized);
        const allow: string[] = toLowerTrim(cfg.allowlist);
        const admins: string[] = toLowerTrim(cfg.admins);
        const profilesMap: AppAuthConfig["profiles"] =
          cfg.profiles ?? DEFAULT_CONFIG.profiles;

        const profForEmail = profilesMap[email] ?? null;
        const sinAdmins = admins.length === 0;

        // --- Bootstrap inicial si no hay admins o no inicializado ---
        if (!initialized || sinAdmins) {
          await runTransaction(db, async (tx) => {
            const freshCfg = await tx.get(cfgRef);
            const curr = freshCfg.exists()
              ? ((freshCfg.data() as Partial<AppAuthConfig>) ?? {})
              : ({} as Partial<AppAuthConfig>);

            const cAllow: string[] = toLowerTrim(curr.allowlist);
            const cAdmins: string[] = toLowerTrim(curr.admins);

            if (!curr.initialized || cAdmins.length === 0) {
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

              const bootstrapUser: UserDoc = {
                email: u.email ?? null,
                displayName: u.displayName ?? null,
                photoURL: u.photoURL ?? null,
                role: "admin",
                active: true,
                disabled: false,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              };

              tx.set(userRef, bootstrapUser, { merge: true });
            }
          });

          setUser(u);
          setRole("admin");
          setProfile(profForEmail);
          setLoading(false);
          return;
        }

        // --- Validación allowlist/admins ---
        const isAdminEmail = admins.includes(email);
        const isAllowedEmail = isAdminEmail || allow.includes(email);
        if (!isAllowedEmail) {
          await signOut(auth);
          setUser(null);
          setRole(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        const finalRole: Role = isAdminEmail ? "admin" : "user";

        // --- Upsert de documento de usuario y validaciones ---
        await runTransaction(db, async (tx) => {
          const uSnap = await tx.get(userRef);
          if (!uSnap.exists()) {
            const newDoc: UserDoc = {
              email: u.email ?? null,
              displayName: u.displayName ?? null,
              photoURL: u.photoURL ?? null,
              role: finalRole,
              active: true,
              disabled: false,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };
            tx.set(userRef, newDoc);
            return;
          }

          const data = (uSnap.data() as Partial<UserDoc>) ?? {};
          if (data.disabled === true || data.active === false) {
            throw new Error("USER_DISABLED");
          }

          const currentRole: Role | undefined = data.role;
          const patch: Partial<UserDoc> = {
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
        setProfile(profForEmail);
        setLoading(false);
      } catch (e: unknown) {
        console.error("[Auth] Bootstrap/allowlist error", e);
        const msg =
          typeof e === "object" && e && "message" in e
            ? String((e as { message?: unknown }).message)
            : "";
        if (msg === "USER_DISABLED") {
          await signOut(auth);
        }
        setUser(null);
        setRole(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => un();
  }, []);

  const value = useMemo(
    () => ({ user, loading, role, profile, logout: () => signOut(auth) }),
    [user, loading, role, profile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
