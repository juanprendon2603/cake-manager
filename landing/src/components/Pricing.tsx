import { CheckCircle2, PhoneCall } from "lucide-react";

type Plan = {
  name: string;
  priceText: string;
  subtitle?: string;
  ctaText: string;
  accent: "emerald" | "indigo" | "pink";
  badge?: string;
  note?: string;
};

const PLANS: Plan[] = [
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

function AccentClasses(kind: Plan["accent"]) {
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

function PriceCard({ plan, delay = 0 }: { plan: Plan; delay?: number }) {
  const c = AccentClasses(plan.accent);
  const whatsappNumber = "573168878200";
  const message = encodeURIComponent(
    `Hola! Estoy interesado en el ${plan.name} de ${plan.priceText} de InManager.`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <div
      className="relative rounded-2xl bg-white/90 backdrop-blur p-8 shadow border hover:-translate-y-0.5 transition will-change-transform hover:shadow-[0_18px_55px_rgba(142,45,168,0.15)] animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {plan.badge && (
        <div
          className={`absolute -top-3 left-6 text-xs px-2 py-1 rounded-full ${c.pill}`}
        >
          {plan.badge}
        </div>
      )}

      <h3 className="text-2xl font-bold">{plan.name}</h3>

      <div className="mt-2">
        <div className="text-5xl font-extrabold leading-none">
          {plan.priceText}
        </div>
        {plan.subtitle && (
          <p className="text-xs text-gray-600 mt-1">{plan.subtitle}</p>
        )}
      </div>

      {/* Bullets */}
      <ul className="mt-6 space-y-2 text-sm">
        <li className="flex gap-2">
          <CheckCircle2 className={`w-4 h-4 ${c.icon}`} /> Acceso total a todas
          las funciones
        </li>
        <li className="flex gap-2">
          <CheckCircle2 className={`w-4 h-4 ${c.icon}`} /> Actualizaciones
          incluidas
        </li>
        <li className="flex gap-2">
          <PhoneCall className={`w-4 h-4 ${c.icon}`} /> Soporte por WhatsApp
        </li>
        <li className="flex gap-2">
          <CheckCircle2 className={`w-4 h-4 ${c.icon}`} /> Multiusuario (admin y
          operativos)
        </li>
        <li className="flex gap-2">
          <CheckCircle2 className={`w-4 h-4 ${c.icon}`} /> Datos en la nube
          (Firebase)
        </li>
      </ul>

      <div className="mt-6">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`block px-5 py-3 rounded-xl text-center focus:outline-none ${c.cta} ${c.ring}`}
        >
          {plan.ctaText}
        </a>
      </div>

      {plan.note && <p className="mt-3 text-xs text-gray-600">{plan.note}</p>}
    </div>
  );
}

export function Pricing() {
  const stagger = (i: number) => 60 * i;

  return (
    <section id="precios" className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#8E2DA8] bg-white/70 backdrop-blur px-3 py-1 rounded-full border border-white/60 animate-fade-in-up">
            Precios simples
          </span>
          <h2
            className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 animate-fade-in-up"
            style={{ animationDelay: "80ms" }}
          >
            Planes transparentes
          </h2>
          <p
            className="mt-2 text-gray-600 max-w-2xl mx-auto animate-fade-in-up"
            style={{ animationDelay: "120ms" }}
          >
            Todos los planes incluyen lo mismo. Elige cómo prefieres pagar.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {PLANS.map((p, i) => (
            <PriceCard key={p.name} plan={p} delay={stagger(i)} />
          ))}
        </div>
      </div>
    </section>
  );
}
