import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useParallax } from "../hooks/useParallax";
import UsersInfoModal from "./UsersInfoModal";
import { VideoPreview } from "./VideoPreview";
export function Hero() {
    const offset = useParallax(0.12, 18); // parallax suave
    const [showDemoModal, setShowDemoModal] = useState(false);
    const seed = {
        admins: ["admin@admin.com"],
        allowlist: ["admin@admin.com", "usuario@usuario.com"],
        profiles: {
            "admin@admin.com": {
                displayName: "Admin Prueba",
                firstName: "Admin",
                lastName: "Prueba",
            },
            "usuario@usuario.com": {
                displayName: "Usuario Prueba",
                firstName: "Usuario",
                lastName: "Prueba",
            },
        },
        initialized: true,
    };
    return (_jsxs("header", { className: "relative overflow-hidden", children: [_jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-20 text-center", children: [_jsx("div", { className: "mx-auto mb-6 w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/70 backdrop-blur border border-white/60 shadow-[0_10px_30px_rgba(142,45,168,0.12)] flex items-center justify-center ring-2 ring-purple-200", children: _jsx("img", { src: "/logo.png", alt: "InManager logo", className: "w-16 h-16 object-contain" }) }), _jsx("h1", { className: "text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight bg-gradient-to-r from-[#8E2DA8] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent", children: "Tu negocio, simple y bajo control" }), _jsx("p", { className: "mt-4 text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto", children: "InManager centraliza inventario, ventas, abonos y asistencia en una sola app. Menos Excel, m\u00E1s acci\u00F3n." }), _jsxs("div", { className: "mt-8 flex flex-wrap items-center justify-center gap-3", children: [_jsx("a", { href: "#precios", className: "px-6 py-3 rounded-2xl bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white shadow hover:shadow-lg transition focus:outline-none focus:ring-2 focus:ring-[#C084FC]/50", children: "Comenzar ahora" }), _jsx("button", { onClick: () => setShowDemoModal(true), className: "px-6 py-3 rounded-2xl bg-white/85 backdrop-blur border border-white/60 hover:bg-white shadow transition focus:outline-none focus:ring-2 focus:ring-[#C084FC]/40", children: "Probar demo" })] }), _jsx("div", { className: "relative mt-10", children: _jsx("div", { className: "mx-auto max-w-3xl rounded-2xl border border-white/70 bg-white/90 backdrop-blur shadow-[0_20px_50px_rgba(142,45,168,0.15)] p-3 transition-transform duration-300", style: { transform: `translateY(${offset}px)` }, children: _jsx(VideoPreview, { srcDesktop: "/videos/preview.mp4", srcMobile: "/videos/preview-mobile.mp4" }) }) })] }), _jsx(UsersInfoModal, { isOpen: showDemoModal, onClose: () => setShowDemoModal(false), demoUrl: "https://inmanager-b5f4c.web.app", seed: seed })] }));
}
