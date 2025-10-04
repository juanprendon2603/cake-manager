import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FullScreenLoaderSession } from "./FullScreenLoaderSession";

export default function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <FullScreenLoaderSession
        appName="InManager"
        message="Preparando tu sesión…"
        logoUrl={new URL("../assets/logo.png", import.meta.url).toString()}
        tips={[
          "Consejo: puedes filtrar pedidos por estado",
          "Atajo: pulsa / para buscar rápidamente",
          "Recuerda: exporta reportes desde la vista de ventas",
        ]}
      />
    );
  }

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  return <Outlet />;
}
