import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ClipboardCheck, KeyRound, Mail, Shield, User } from "lucide-react";
import { useCallback } from "react";
import BaseModal from "./BaseModal";
export default function UsersInfoModal({ isOpen, onClose, demoUrl, seed, }) {
    const { admins = [], allowlist = [], profiles = {} } = seed;
    const copy = useCallback(async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            alert("Copiado al portapapeles ✅");
        }
        catch {
            console.warn("No se pudo copiar");
        }
    }, []);
    const openDemo = useCallback(() => {
        window.open(demoUrl, "_blank", "noopener,noreferrer");
        onClose();
    }, [demoUrl, onClose]);
    const users = allowlist.map((email) => ({
        email,
        role: admins.includes(email) ? "Admin" : "Operación",
        profile: profiles[email],
    }));
    return (_jsxs(BaseModal, { isOpen: isOpen, onClose: onClose, headerAccent: "purple", size: "lg", title: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Shield, { className: "w-5 h-5 text-[#8E2DA8]" }), _jsx("span", { children: "Acceso al demo" })] }), description: "Elige con qu\u00E9 usuario ingresar al demo. Puedes copiar el correo y usar la contrase\u00F1a indicada.", primaryAction: { label: "Ir al demo", onClick: openDemo }, secondaryAction: { label: "Cerrar", onClick: onClose }, bodyClassName: "space-y-5", icon: _jsx(Shield, { className: "w-5 h-5" }), children: [_jsxs("div", { className: "rounded-2xl border border-white/60 bg-white/80 backdrop-blur p-4 text-sm text-gray-700", children: [_jsx("p", { className: "font-semibold mb-1", children: "Tipos de usuario:" }), _jsxs("ul", { className: "space-y-1", children: [_jsxs("li", { children: ["\u2022 ", _jsx("strong", { children: "Admin" }), ": configura cat\u00E1logo, usuarios y reportes."] }), _jsxs("li", { children: ["\u2022 ", _jsx("strong", { children: "Operaci\u00F3n" }), ": registra ventas, abonos y asistencia."] })] })] }), _jsx("div", { className: "grid sm:grid-cols-2 gap-4", children: users.map(({ email, role, profile }) => {
                    const name = profile?.displayName ||
                        [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
                        email.split("@")[0];
                    const isAdmin = role === "Admin";
                    return (_jsxs("div", { className: "rounded-2xl border border-white/60 bg-white/90 backdrop-blur p-4 shadow", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: `w-10 h-10 rounded-xl grid place-items-center text-white shadow
                    ${isAdmin
                                            ? "bg-gradient-to-br from-indigo-500 to-blue-500"
                                            : "bg-gradient-to-br from-emerald-500 to-teal-500"}`, children: _jsx(User, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("div", { className: "font-semibold text-gray-800", children: name }), _jsx("div", { className: "text-xs text-gray-500", children: role })] })] }), _jsxs("div", { className: "mt-3 flex items-center gap-2 text-sm text-gray-700", children: [_jsx(Mail, { className: "w-4 h-4 text-gray-500" }), _jsx("span", { children: email })] }), _jsxs("div", { className: "mt-2 flex items-center gap-2 text-sm text-gray-700", children: [_jsx(KeyRound, { className: "w-4 h-4 text-gray-500" }), _jsx("span", { className: "font-mono", children: "123456" })] }), _jsxs("button", { onClick: () => copy(email), className: "mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50", children: [_jsx(ClipboardCheck, { className: "w-4 h-4" }), "Copiar correo"] })] }, email));
                }) }), _jsxs("div", { className: "text-xs text-gray-500 text-center", children: ["Todos los usuarios del demo usan la contrase\u00F1a ", _jsx("strong", { children: "123456" })] })] }));
}
