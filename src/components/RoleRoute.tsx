// src/components/RoleRoute.tsx
import type { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Uso:
// <RoleRoute allowed={["admin","manager"]}><SomePage/></RoleRoute>
export function RoleRoute({
  allowed,
  children,
}: {
  allowed: string[]; // roles permitidos
  children: ReactElement; // página a renderizar
}) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div style={{ padding: 24 }}>Cargando…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  // role puede venir en minúsculas (recomendado normalizarlo al setearlo)
  const ok =
    role &&
    allowed.map((r) => r.toLowerCase()).includes(String(role).toLowerCase());
  if (!ok) return <Navigate to="/" replace />;

  return children;
}
