import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
const RAW_FAQS = [
    {
        q: "¿Qué incluye cada plan?",
        a: (_jsxs(_Fragment, { children: ["Todos los planes incluyen", " ", _jsx("strong", { children: "acceso total a todas las funcionalidades" }), ": inventario, ventas/abonos, asistencia, reportes, multiusuario y datos en la nube. La diferencia es la forma de pago: mensual, anual (ahorras 2 meses) o pago \u00FAnico."] })),
    },
    {
        q: "¿Cómo empiezo?",
        a: (_jsxs(_Fragment, { children: ["Puedes ir a", " ", _jsx("a", { href: "#precios", className: "underline text-[#8E2DA8]", children: "Precios" }), " ", "y crear tu cuenta, o probar la demo. Te ayudamos a configurar lo b\u00E1sico (productos, categor\u00EDas, usuarios)."] })),
    },
    {
        q: "¿Necesito instalar algo?",
        a: (_jsx(_Fragment, { children: "No. InManager es 100% web: funciona en computador, tablet o celular." })),
    },
    {
        q: "¿Hay soporte?",
        a: (_jsxs(_Fragment, { children: ["S\u00ED, por ", _jsx("strong", { children: "WhatsApp" }), ". Escr\u00EDbenos y te respondemos lo antes posible. Tambi\u00E9n compartimos tips para llevar inventario y cierre diario sin enredos."] })),
    },
    {
        q: "¿Puedo cancelar cuando quiera?",
        a: (_jsx(_Fragment, { children: "S\u00ED. En el plan mensual puedes cancelar en cualquier momento. En el plan anual ya obtienes el descuento por pagar por adelantado." })),
    },
    {
        q: "¿Qué pasa si supero el límite gratuito de Firebase?",
        a: (_jsxs(_Fragment, { children: ["Te avisamos antes. T\u00FA decides si pagar la diferencia (normalmente baja) o descargar datos antiguos para seguir gratis.", " ", _jsx("em", { children: "No hay costos ocultos" }), "."] })),
    },
    {
        q: "¿Mis datos de quién son?",
        a: (_jsxs(_Fragment, { children: ["Son tuyos. Puedes solicitar una copia cuando quieras. (Exportaci\u00F3n directa a Excel/CSV: ", _jsx("strong", { children: "Pr\u00F3ximo" }), ")."] })),
        tag: "Próximo",
    },
    {
        q: "¿Puedo importar mis productos/ventas desde Excel?",
        a: (_jsxs(_Fragment, { children: ["Estamos preparando la importaci\u00F3n desde Excel/CSV para que migres m\u00E1s r\u00E1pido. Mientras tanto, te podemos guiar para cargar tus productos de forma asistida. (", _jsx("strong", { children: "Pr\u00F3ximo" }), ")."] })),
        tag: "Próximo",
    },
    {
        q: "¿Tienen alertas de stock bajo?",
        a: (_jsxs(_Fragment, { children: ["En el roadmap inmediato. Podr\u00E1s definir m\u00EDnimos por producto y ver alertas antes de quedarte sin stock. (", _jsx("strong", { children: "Pr\u00F3ximo" }), ")."] })),
        tag: "Próximo",
    },
    {
        q: "¿Cierre de turno con checklist/firma?",
        a: (_jsxs(_Fragment, { children: ["Planeado. Cierre con checklist (caja, desperdicios, limpieza) y confirmaci\u00F3n para auditor\u00EDa. (", _jsx("strong", { children: "Pr\u00F3ximo" }), ")."] })),
        tag: "Próximo",
    },
    {
        q: "¿Funciona sin internet?",
        a: (_jsx(_Fragment, { children: "Requiere conexi\u00F3n. Si se te cae el internet, puedes anotar temporalmente y registrar luego: los datos quedan guardados en la nube." })),
    },
    {
        q: "¿Seguridad y respaldos?",
        a: (_jsx(_Fragment, { children: "Usamos la nube de Google (Firebase) con autenticaci\u00F3n. Tus datos est\u00E1n respaldados y seguros." })),
    },
    {
        q: "¿Roles y permisos?",
        a: (_jsxs(_Fragment, { children: ["S\u00ED. ", _jsx("strong", { children: "Admin" }), " (configura cat\u00E1logo, usuarios, reportes, n\u00F3mina) y ", _jsx("strong", { children: "Operaci\u00F3n" }), " (ventas, abonos, asistencia, temperaturas)."] })),
    },
    {
        q: "¿Cuántos usuarios puedo tener?",
        a: (_jsx(_Fragment, { children: "Puedes crear varios usuarios (admin y operativos). El precio no cambia por usuario en esta etapa." })),
    },
];
// slugify simple para id de cada pregunta
const slug = (s) => s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
function Highlight({ text, query }) {
    if (!query)
        return _jsx(_Fragment, { children: text });
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1)
        return _jsx(_Fragment, { children: text });
    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + query.length);
    const after = text.slice(idx + query.length);
    return (_jsxs(_Fragment, { children: [before, _jsx("mark", { className: "bg-yellow-100 text-yellow-800 rounded px-0.5", children: match }), _jsx(Highlight, { text: after, query: query })] }));
}
export function FAQ() {
    const [query, setQuery] = useState("");
    const [openAll, setOpenAll] = useState("none");
    const containerRef = useRef(null);
    const FAQS = useMemo(() => RAW_FAQS.map((f) => ({ ...f, id: f.id ?? slug(f.q) })), []);
    const filtered = useMemo(() => {
        if (!query.trim())
            return FAQS;
        const q = query.toLowerCase();
        return FAQS.filter((f) => {
            const text = `${f.q} ${typeof f.a === "string" ? f.a : ""}`;
            return text.toLowerCase().includes(q);
        });
    }, [FAQS, query]);
    // deep-link open
    useEffect(() => {
        const hash = window.location.hash.replace("#", "");
        if (!hash)
            return;
        const el = document.getElementById(hash);
        if (!el)
            return;
        // abrir el <details>
        const details = el.closest("details");
        if (details)
            details.open = true;
        // scroll con margen por navbar
        el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, []);
    // manejar abrir/cerrar todo
    useEffect(() => {
        if (!containerRef.current)
            return;
        const details = Array.from(containerRef.current.querySelectorAll("details"));
        details.forEach((d) => (d.open = openAll === "all"));
    }, [openAll, filtered]);
    return (_jsx("section", { id: "faq", className: "py-16 scroll-mt-24", children: _jsxs("div", { className: "mx-auto max-w-5xl px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("span", { className: "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide\n                           text-[#8E2DA8] bg-white/70 backdrop-blur px-3 py-1 rounded-full border border-white/60\n                           animate-fade-in-up", children: "\u00BFDudas?" }), _jsx("h2", { className: "mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 animate-fade-in-up", style: { animationDelay: "70ms" }, children: "Preguntas frecuentes" }), _jsxs("div", { className: "mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 animate-fade-in-up", style: { animationDelay: "110ms" }, children: [_jsxs("div", { className: "relative w-full sm:w-[440px]", children: [_jsx("input", { value: query, onChange: (e) => setQuery(e.target.value), placeholder: "Buscar en la FAQ (ej. 'stock', 'roles', 'soporte')", className: "w-full rounded-xl border border-white/60 bg-white/90 backdrop-blur px-3 py-2\n                           text-sm text-gray-800 shadow focus:outline-none focus:ring-2 focus:ring-[#C084FC]/40", "aria-label": "Buscar en la FAQ" }), query && (_jsx("button", { onClick: () => setQuery(""), className: "absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs", "aria-label": "Limpiar b\u00FAsqueda", children: "limpiar" }))] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => setOpenAll("all"), className: "px-3 py-2 text-xs font-semibold rounded-lg bg-white/80 border border-white/60 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#C084FC]/30", children: "Abrir todo" }), _jsx("button", { onClick: () => setOpenAll("none"), className: "px-3 py-2 text-xs font-semibold rounded-lg bg-white/60 border border-white/60 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#C084FC]/30", children: "Cerrar todo" })] })] }), _jsxs("p", { className: "mt-2 text-xs text-gray-500 animate-fade-in-up", style: { animationDelay: "130ms" }, children: ["Mostrando ", filtered.length, " de ", FAQS.length, " preguntas"] })] }), _jsx("div", { ref: containerRef, className: "space-y-3", children: filtered.map((f, i) => (_jsxs("details", { className: "group relative bg-white/80 backdrop-blur border border-white/60 rounded-2xl p-4\n                         open:shadow-[0_12px_30px_rgba(142,45,168,0.12)] transition animate-fade-in-up", style: { animationDelay: `${i * 35}ms` }, children: [_jsx("span", { className: "pointer-events-none absolute inset-0 rounded-2xl", style: {
                                    background: "linear-gradient(135deg, rgba(142,45,168,0.10), rgba(168,85,247,0.08))",
                                    mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                                    WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                                    padding: "1px",
                                } }), _jsxs("summary", { className: "flex items-start justify-between cursor-pointer list-none", children: [_jsxs("div", { className: "flex items-center gap-2 pr-6", children: [_jsx("h4", { id: f.id, className: "font-bold text-[#8E2DA8] scroll-mt-28", children: _jsx(Highlight, { text: f.q, query: query }) }), f.tag === "Próximo" && (_jsx("span", { className: "text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200", children: "Pr\u00F3ximo" }))] }), _jsx("span", { className: "ml-3 text-gray-500 transition group-open:rotate-180", "aria-hidden": true, children: "\u2304" })] }), _jsx("div", { className: "mt-2 text-gray-700 text-sm leading-relaxed", children: typeof f.a === "string" ? (_jsx(Highlight, { text: f.a, query: query })) : (f.a) })] }, f.id))) }), filtered.length === 0 && (_jsxs("div", { className: "mt-6 text-center text-sm text-gray-600", children: ["No encontramos resultados para ", _jsxs("strong", { children: ["\u201C", query, "\u201D"] }), ". Intenta con otras palabras."] }))] }) }));
}
