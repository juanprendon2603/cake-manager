import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BarChart3, BellRing, CheckSquare, ClipboardCheck, Clock4, CreditCard, Factory, GaugeCircle, Lock, Package, ShieldCheck, ThermometerSun, Users, } from "lucide-react";
const ADMIN_FEATURES = [
    {
        icon: _jsx(Users, { className: "w-6 h-6" }),
        title: "Usuarios y roles",
        desc: "Crea administradores y operativos con permisos claros.",
        badge: "Admin",
    },
    {
        icon: _jsx(Factory, { className: "w-6 h-6" }),
        title: "Catálogo con atributos",
        desc: "Define categorías (p. ej. Torta) con atributos (tamaño, relleno) y precios.",
        badge: "Admin",
    },
    {
        icon: _jsx(BarChart3, { className: "w-6 h-6" }),
        title: "Informes y nómina",
        desc: "Ventas, utilidades y nómina según reglas del negocio.",
        badge: "Admin",
    },
];
const OPERACION_FEATURES = [
    {
        icon: _jsx(Package, { className: "w-6 h-6" }),
        title: "Inventario inteligente",
        desc: "Control de existencias y costos; descuenta stock al vender.",
        badge: "Operación",
    },
    {
        icon: _jsx(CreditCard, { className: "w-6 h-6" }),
        title: "Ventas y abonos",
        desc: "Ventas rápidas y abonos por pedido con fecha de entrega.",
        badge: "Operación",
    },
    {
        icon: _jsx(Clock4, { className: "w-6 h-6" }),
        title: "Asistencia y turnos",
        desc: "Turno completo, medio turno o por horas; reportes claros.",
        badge: "Operación",
    },
    {
        icon: _jsx(ThermometerSun, { className: "w-6 h-6" }),
        title: "Temperaturas",
        desc: "Registra temperatura de refrigeradores y conserva trazabilidad.",
        badge: "Operación",
    },
];
const CONTROL_SEGURIDAD = [
    {
        icon: _jsx(BellRing, { className: "w-6 h-6" }),
        title: "Alertas de stock bajo",
        desc: "Define mínimos por producto y recibe alertas antes del quiebre.",
        badge: "Próximo",
    },
    {
        icon: _jsx(ClipboardCheck, { className: "w-6 h-6" }),
        title: "Cierre de turno",
        desc: "Checklist de caja/limpieza y firma digital.",
        badge: "Próximo",
    },
    {
        icon: _jsx(ShieldCheck, { className: "w-6 h-6" }),
        title: "Bitácora y auditoría",
        desc: "Quién hizo qué y cuándo (altas, bajas, cambios de precio).",
    },
    {
        icon: _jsx(Lock, { className: "w-6 h-6" }),
        title: "Seguridad de datos",
        desc: "Autenticación y respaldos en la nube.",
    },
];
function Badge({ kind }) {
    const styles = kind === "Admin"
        ? "bg-indigo-100 text-indigo-700 border-indigo-200"
        : kind === "Operación"
            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
            : "bg-amber-100 text-amber-700 border-amber-200";
    return (_jsx("span", { className: `text-[11px] px-2 py-0.5 rounded-full border ${styles}`, children: kind }));
}
function Card({ f, delay = 0 }) {
    return (_jsxs("article", { className: "group relative rounded-2xl p-6 bg-white/80 backdrop-blur\n                 border border-white/60 shadow transition\n                 hover:shadow-[0_16px_45px_rgba(142,45,168,0.18)]\n                 hover:-translate-y-0.5 focus-within:-translate-y-0.5\n                 animate-fade-in-up", style: { animationDelay: `${delay}ms` }, tabIndex: 0, "aria-label": f.title, children: [_jsx("div", { className: "pointer-events-none absolute inset-0 rounded-2xl", style: {
                    background: "linear-gradient(135deg, rgba(142,45,168,0.15), rgba(168,85,247,0.12))",
                    mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                    WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                } }), _jsxs("div", { className: "relative z-10", children: [_jsx("div", { className: "w-11 h-11 rounded-xl grid place-items-center text-white\n                        bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] shadow mb-4", children: f.icon }), _jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsx("h3", { className: "text-lg font-bold text-[#8E2DA8]", children: f.title }), f.badge && _jsx(Badge, { kind: f.badge })] }), _jsx("p", { className: "mt-1 text-gray-700 text-sm leading-relaxed", children: f.desc }), _jsx("span", { className: "mt-3 block h-[2px] w-0 bg-gradient-to-r from-[#8E2DA8] to-[#A855F7]\n                         transition-all duration-300 group-hover:w-1/3" })] })] }));
}
export function Features() {
    // helper para escalonar animaciones
    const withDelay = (arr, base = 40) => arr.map((item, i) => ({ item, delay: i * base }));
    return (_jsx("section", { id: "features", className: "py-12 sm:py-14", children: _jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("span", { className: "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide\n                           text-[#8E2DA8] bg-white/70 backdrop-blur px-3 py-1 rounded-full border border-white/60\n                           animate-fade-in-up", children: "Funcionalidades" }), _jsx("h2", { className: "mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 animate-fade-in-up", style: { animationDelay: "70ms" }, children: "Todo lo que necesitas en un lugar" }), _jsxs("p", { className: "mt-2 text-gray-600 max-w-2xl mx-auto animate-fade-in-up", style: { animationDelay: "110ms" }, children: ["El ", _jsx("strong", { children: "admin" }), " define estructura y reglas; la", " ", _jsx("strong", { children: "operaci\u00F3n" }), " ejecuta \u00E1gil; el sistema cuida datos y da visibilidad."] })] }), _jsxs("h3", { className: "text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3 flex items-center gap-2 animate-fade-in-up", style: { animationDelay: "130ms" }, children: [_jsx(GaugeCircle, { className: "w-4 h-4" }), " Panel del administrador"] }), _jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8", children: withDelay(ADMIN_FEATURES).map(({ item, delay }) => (_jsx(Card, { f: item, delay: delay }, item.title))) }), _jsxs("h3", { className: "text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3 flex items-center gap-2 animate-fade-in-up", style: { animationDelay: "140ms" }, children: [_jsx(CheckSquare, { className: "w-4 h-4" }), " Operaci\u00F3n diaria"] }), _jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8", children: withDelay(OPERACION_FEATURES).map(({ item, delay }) => (_jsx(Card, { f: item, delay: delay }, item.title))) }), _jsxs("h3", { className: "text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3 flex items-center gap-2 animate-fade-in-up", style: { animationDelay: "150ms" }, children: [_jsx(ShieldCheck, { className: "w-4 h-4" }), " Control & seguridad"] }), _jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-6", children: withDelay(CONTROL_SEGURIDAD).map(({ item, delay }) => (_jsx(Card, { f: item, delay: delay }, item.title))) })] }) }));
}
