// src/App.tsx
import { Navigate, Route, Routes } from "react-router-dom";
import InManagerLanding from "./pages/InManagerLanding";

export default function App() {
  return (
    <Routes>
      {/* Landing en la raíz */}
      <Route path="/" element={<InManagerLanding />} />

      {/* Ejemplos de rutas que ya usas en los CTAs */}
      <Route path="/checkout" element={<div>Checkout (WIP)</div>} />
      <Route
        path="/demo"
        element={<div>Demo interna (o redirige al externo)</div>}
      />

      {/* Redirigir cualquier cosa rara al home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
