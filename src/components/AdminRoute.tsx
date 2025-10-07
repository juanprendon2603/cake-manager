// src/components/AdminRoute.tsx
import type { ReactElement } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import logoUrl from "../assets/logo.png";
import { useAuth } from "../contexts/AuthContext";
import { FullScreenLoaderSession } from "./FullScreenLoaderSession";

/**
 * AdminGate (DEFAULT): úsalo como padre anidado:
 * <Route path="/admin" element={<AdminGate />}><Route ... /></Route>
 */
export default function AdminGate() {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <FullScreenLoaderSession
        appName="InManager"
        message="Verificando permisos…"
        logoUrl={logoUrl}
        tips={["Tip: usa «Recordarme» para mantener la sesión"]}
      />
    );
  }

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (String(role).toLowerCase() !== "admin")
    return <Navigate to="/" replace />;

  return <Outlet />;
}

/**
 * AdminRoute (NAMED): wrapper por si quieres proteger un solo elemento:
 * <AdminRoute><Componente/></AdminRoute>
 */
export function AdminRoute({ children }: { children: ReactElement }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div style={{ padding: 24 }}>Cargando…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (String(role).toLowerCase() !== "admin")
    return <Navigate to="/" replace />;

  return children;
}
