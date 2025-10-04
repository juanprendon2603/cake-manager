import type { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function AdminRoute({ children }: { children: ReactElement }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div style={{ padding: 24 }}>Cargando…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (role !== "admin") return <Navigate to="/" replace />;

  return children;
}
