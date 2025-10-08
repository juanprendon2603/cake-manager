import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CheckCircle2, PhoneCall } from "lucide-react";
const PLANS = [
    {
        name: "Plan Mensual",
        priceText: "$35.000",
        subtitle: "/mes",
        ctaText: "Empezar",
        accent: "emerald",
        badge: "Popular",
        note: "Sin permanencia. Cancela cuando quieras.",
    },
    {
        name: "Plan Anual",
        priceText: "$350.000",
        subtitle: "equivale a 2 meses gratis",
        ctaText: "Elegir anual",
        accent: "indigo",
        badge: "Ahorra $70.000",
        note: "Promedio $29.167/mes.",
    },
    {
        name: "Pago Único",
        priceText: "$2.000.000",
        ctaText: "Comprar",
        accent: "pink",
        note: "Acceso total sin mensualidades.",
    },
];
function AccentClasses(kind) {
    switch (kind) {
        case "emerald":
            return {
                icon: "text-emerald-600",
                pill: "bg-emerald-100 text-emerald-700 border border-emerald-200",
                ring: "focus:ring-emerald-300/50",
                cta: "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:shadow-lg",
            };
        case "indigo":
            return {
                icon: "text-indigo-600",
                pill: "bg-indigo-100 text-indigo-700 border border-indigo-200",
                ring: "focus:ring-indigo-300/50",
                cta: "border border-[#8E2DA8]/30 text-[#8E2DA8] bg-white hover:bg-white/80",
            };
        default:
            return {
                icon: "text-pink-600",
                pill: "bg-pink-100 text-pink-700 border border-pink-200",
                ring: "focus:ring-pink-300/50",
                cta: "border border-[#8E2DA8]/30 text-[#8E2DA8] bg-white hover:bg-white/80",
            };
    }
}
function PriceCard({ plan, delay = 0 }) {
    const c = AccentClasses(plan.accent);
    const whatsappNumber = "573168878200";
    const message = encodeURIComponent(`Hola! Estoy interesado en el ${plan.name} de ${plan.priceText} de InManager.`);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    return (_jsxs("div", { className: "relative rounded-2xl bg-white/90 backdrop-blur p-8 shadow border hover:-translate-y-0.5 transition will-change-transform hover:shadow-[0_18px_55px_rgba(142,45,168,0.15)] animate-fade-in-up", style: { animationDelay: `${delay}ms` }, children: [plan.badge && (_jsx("div", { className: `absolute -top-3 left-6 text-xs px-2 py-1 rounded-full ${c.pill}`, children: plan.badge })), _jsx("h3", { className: "text-2xl font-bold", children: plan.name }), _jsxs("div", { className: "mt-2", children: [_jsx("div", { className: "text-5xl font-extrabold leading-none", children: plan.priceText }), plan.subtitle && (_jsx("p", { className: "text-xs text-gray-600 mt-1", children: plan.subtitle }))] }), _jsxs("ul", { className: "mt-6 space-y-2 text-sm", children: [_jsxs("li", { className: "flex gap-2", children: [_jsx(CheckCircle2, { className: `w-4 h-4 ${c.icon}` }), " Acceso total a todas las funciones"] }), _jsxs("li", { className: "flex gap-2", children: [_jsx(CheckCircle2, { className: `w-4 h-4 ${c.icon}` }), " Actualizaciones incluidas"] }), _jsxs("li", { className: "flex gap-2", children: [_jsx(PhoneCall, { className: `w-4 h-4 ${c.icon}` }), " Soporte por WhatsApp"] }), _jsxs("li", { className: "flex gap-2", children: [_jsx(CheckCircle2, { className: `w-4 h-4 ${c.icon}` }), " Multiusuario (admin y operativos)"] }), _jsxs("li", { className: "flex gap-2", children: [_jsx(CheckCircle2, { className: `w-4 h-4 ${c.icon}` }), " Datos en la nube (Firebase)"] })] }), _jsx("div", { className: "mt-6", children: _jsx("a", { href: whatsappUrl, target: "_blank", rel: "noopener noreferrer", className: `block px-5 py-3 rounded-xl text-center focus:outline-none ${c.cta} ${c.ring}`, children: plan.ctaText }) }), plan.note && _jsx("p", { className: "mt-3 text-xs text-gray-600", children: plan.note })] }));
}
export function Pricing() {
    const stagger = (i) => 60 * i;
    return (_jsx("section", { id: "precios", className: "py-16", children: _jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("span", { className: "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#8E2DA8] bg-white/70 backdrop-blur px-3 py-1 rounded-full border border-white/60 animate-fade-in-up", children: "Precios simples" }), _jsx("h2", { className: "mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 animate-fade-in-up", style: { animationDelay: "80ms" }, children: "Planes transparentes" }), _jsx("p", { className: "mt-2 text-gray-600 max-w-2xl mx-auto animate-fade-in-up", style: { animationDelay: "120ms" }, children: "Todos los planes incluyen lo mismo. Elige c\u00F3mo prefieres pagar." })] }), _jsx("div", { className: "grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto", children: PLANS.map((p, i) => (_jsx(PriceCard, { plan: p, delay: stagger(i) }, p.name))) })] }) }));
}
