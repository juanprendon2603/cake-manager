import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import UsersInfoModal from "./UsersInfoModal";
export function Navbar() {
    const [open, setOpen] = useState(false); // drawer mobile
    const [showUsers, setShowUsers] = useState(false); // modal demo
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
    return (_jsxs(_Fragment, { children: [_jsxs("nav", { className: "sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/60 shadow-[0_4px_24px_rgba(142,45,168,0.08)]", children: [_jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("img", { src: "/logo.png", alt: "InManager", className: "w-8 h-8 rounded-xl" }), _jsx("span", { className: "text-xl font-extrabold bg-gradient-to-r from-[#8E2DA8] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent tracking-tight", children: "InManager" })] }), _jsxs("div", { className: "hidden md:flex items-center gap-6", children: [_jsx("a", { href: "#features", className: "relative text-sm text-gray-700/90 hover:text-[#8E2DA8] transition", children: "Caracter\u00EDsticas" }), _jsx("a", { href: "#vistas", className: "relative text-sm text-gray-700/90 hover:text-[#8E2DA8] transition", children: "Vistas" }), _jsx("a", { href: "#precios", className: "relative text-sm text-gray-700/90 hover:text-[#8E2DA8] transition", children: "Precios" }), _jsx("a", { href: "#faq", className: "relative text-sm text-gray-700/90 hover:text-[#8E2DA8] transition", children: "FAQ" })] }), _jsxs("div", { className: "hidden sm:flex items-center gap-3", children: [_jsx("button", { onClick: () => setShowUsers(true), className: "px-4 py-2 rounded-xl border border-[#8E2DA8]/30 text-[#8E2DA8]\n                         hover:bg-white transition focus:outline-none focus:ring-2 focus:ring-[#C084FC]/40", children: "Ver demo" }), _jsxs("a", { href: "#precios", className: "inline-flex items-center gap-2 px-4 py-2 rounded-xl\n                         bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white shadow\n                         hover:shadow-lg transition focus:outline-none focus:ring-2 focus:ring-[#C084FC]/50", children: ["Empezar ", _jsx(Sparkles, { className: "w-4 h-4" })] })] }), _jsx("button", { className: "md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl\n                       bg-white/60 border border-white/60 text-[#8E2DA8]\n                       hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#C084FC]/40", onClick: () => setOpen((v) => !v), "aria-label": "Abrir men\u00FA", "aria-expanded": open, children: _jsx("svg", { className: "w-6 h-6", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.2, children: open ? (_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6 18L18 6M6 6l12 12" })) : (_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M4 6h16M4 12h16M4 18h16" })) }) })] }), open && (_jsx("div", { className: "md:hidden border-t border-white/60 bg-white/80 backdrop-blur", children: _jsxs("div", { className: "mx-auto max-w-7xl px-4 py-3 flex flex-col gap-2", children: [_jsx("a", { href: "#features", className: "py-2 text-sm font-semibold text-gray-700 hover:text-[#8E2DA8]", onClick: () => setOpen(false), children: "Caracter\u00EDsticas" }), _jsx("a", { href: "#vistas", className: "py-2 text-sm font-semibold text-gray-700 hover:text-[#8E2DA8]", onClick: () => setOpen(false), children: "Vistas" }), _jsx("a", { href: "#precios", className: "py-2 text-sm font-semibold text-gray-700 hover:text-[#8E2DA8]", onClick: () => setOpen(false), children: "Precios" }), _jsx("a", { href: "#faq", className: "py-2 text-sm font-semibold text-gray-700 hover:text-[#8E2DA8]", onClick: () => setOpen(false), children: "FAQ" }), _jsxs("div", { className: "pt-2 flex items-center gap-2", children: [_jsx("button", { onClick: () => {
                                                setShowUsers(true);
                                                setOpen(false);
                                            }, className: "flex-1 px-4 py-2 rounded-xl border border-[#8E2DA8]/30 text-[#8E2DA8] bg-white hover:bg-white/80 text-center", children: "Ver demo" }), _jsx("a", { href: "#precios", className: "flex-1 px-4 py-2 rounded-xl text-center text-white bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] shadow", onClick: () => setOpen(false), children: "Empezar" })] })] }) }))] }), _jsx(UsersInfoModal, { isOpen: showUsers, onClose: () => setShowUsers(false), demoUrl: "https://inmanager-b5f4c.web.app", seed: seed })] }));
}
