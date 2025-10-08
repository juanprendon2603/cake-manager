import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import { Send, X } from "lucide-react";
export function WhatsAppWidget({ phone = "573168878200", logoSrc = "/whatsapp.png", defaultMessage = "¡Hola! Estoy interesado en InManager y quiero más información.", }) {
    const [open, setOpen] = useState(false);
    const [msg, setMsg] = useState(defaultMessage);
    const panelRef = useRef(null);
    // ✅ Solo el mensaje, sin agregar "Página: ..."
    const waLink = useMemo(() => {
        return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    }, [msg, phone]);
    // Cerrar con ESC
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);
    // Cerrar si clickea fuera del panel
    useEffect(() => {
        if (!open)
            return;
        const onClick = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                const target = e.target;
                if (target.closest("#wa-widget-button"))
                    return;
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, [open]);
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed bottom-6 right-6 z-50", children: _jsx("div", { className: "relative group", children: _jsx("button", { id: "wa-widget-button", type: "button", onClick: () => setOpen((s) => !s), className: "flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform hover:scale-110 focus:outline-none ring-2 ring-white/60", style: { backgroundColor: "#25D366" }, "aria-label": "Abrir chat de WhatsApp", children: _jsx("img", { src: logoSrc, alt: "WhatsApp", className: "w-12 h-12 scale-[2.5] object-contain pointer-events-none", referrerPolicy: "no-referrer" }) }) }) }), open && (_jsx("div", { className: "fixed inset-0 z-40 bg-black/0", "aria-hidden": "true" })), _jsx("div", { className: `fixed bottom-24 right-6 z-50 w-[320px] max-w-[92vw] transition-all ${open ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-3"}`, ref: panelRef, role: "dialog", "aria-label": "Chat de WhatsApp", children: _jsxs("div", { className: "overflow-hidden rounded-2xl shadow-2xl border border-white/60 bg-white/95 backdrop-blur", children: [_jsxs("div", { className: "px-4 py-3 flex items-center justify-between text-white", style: { background: "linear-gradient(90deg, #128C7E 0%, #25D366 100%)" }, children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-white/20 grid place-items-center", children: _jsx("img", { src: "/logo.png", alt: "InManager", className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-semibold", children: "Soporte InManager" }), _jsx("div", { className: "text-[11px] opacity-90", children: "Normalmente responde en minutos" })] })] }), _jsx("button", { type: "button", onClick: () => setOpen(false), className: "p-1 rounded bg-white/20 hover:bg-white/30 transition", "aria-label": "Cerrar chat", children: _jsx(X, { className: "w-4 h-4 text-white" }) })] }), _jsx("div", { className: "p-3 bg-gray-50", children: _jsx("div", { className: "max-w-[85%] rounded-2xl rounded-bl-sm bg-white border border-gray-200 px-3 py-2 text-sm text-gray-800 shadow-sm", children: "\u00A1Hola! \uD83D\uDC4B \u00BFDeseas m\u00E1s informaci\u00F3n sobre InManager?" }) }), _jsxs("form", { className: "p-3 bg-white flex items-center gap-2 border-t border-gray-100", onSubmit: (e) => {
                                e.preventDefault();
                                window.open(waLink, "_blank", "noopener,noreferrer");
                            }, children: [_jsx("input", { className: "flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent", value: msg, onChange: (e) => setMsg(e.target.value), placeholder: "Escribe tu mensaje\u2026" }), _jsx("button", { type: "submit", className: "inline-flex items-center justify-center rounded-xl px-3 py-2 text-white shadow", style: { backgroundColor: "#25D366" }, "aria-label": "Enviar por WhatsApp", title: "Enviar por WhatsApp", children: _jsx(Send, { className: "w-4 h-4" }) })] })] }) })] }));
}
