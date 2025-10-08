import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/App.tsx
import { Navigate, Route, Routes } from "react-router-dom";
import PrivacyPolicy from "./components/PrivacyPolicy";
import InManagerLanding from "./pages/InManagerLanding";
export default function App() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(InManagerLanding, {}) }), _jsx(Route, { path: "/checkout", element: _jsx("div", { children: "Checkout (WIP)" }) }), _jsx(Route, { path: "/demo", element: _jsx("div", { children: "Demo interna (o redirige al externo)" }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) }), _jsx(Route, { path: "/privacidad", element: _jsx(PrivacyPolicy, {}) })] }));
}
