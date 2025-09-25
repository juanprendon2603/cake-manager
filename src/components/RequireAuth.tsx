// src/components/RequireAuth.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();
  console.debug("[RequireAuth]", {
    loading,
    user: !!user,
    path: location.pathname,
  });

  if (loading) return <div style={{ padding: 24 }}>Cargando sesión…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  return <Outlet />;
}
