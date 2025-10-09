import {
  BarChart3,
  BellRing,
  CheckSquare,
  Clock4,
  CreditCard,
  Factory,
  GaugeCircle,
  Lock,
  Package,
  ShieldCheck,
  ThermometerSun,
  Users,
} from "lucide-react";

type Feature = {
  icon: React.ReactNode;
  title: string;
  desc: string;
  badge?: "Admin" | "Operación" | "Próximo";
};

const ADMIN_FEATURES: Feature[] = [
  {
    icon: <Users className="w-6 h-6" />,
    title: "Usuarios y roles",
    desc: "Crea administradores y operativos con permisos claros.",
    badge: "Admin",
  },
  {
    icon: <Factory className="w-6 h-6" />,
    title: "Catálogo con atributos",
    desc: "Define categorías (p. ej. Torta) con atributos (tamaño, relleno) y precios.",
    badge: "Admin",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Informes y nómina",
    desc: "Ventas, utilidades y nómina según reglas del negocio.",
    badge: "Admin",
  },
];

const OPERACION_FEATURES: Feature[] = [
  {
    icon: <Package className="w-6 h-6" />,
    title: "Inventario inteligente",
    desc: "Control de existencias y costos; descuenta stock al vender.",
    badge: "Operación",
  },
  {
    icon: <CreditCard className="w-6 h-6" />,
    title: "Ventas y abonos",
    desc: "Ventas rápidas y abonos por pedido con fecha de entrega.",
    badge: "Operación",
  },
  {
    icon: <Clock4 className="w-6 h-6" />,
    title: "Asistencia y turnos",
    desc: "Turno completo, medio turno o por horas; reportes claros.",
    badge: "Operación",
  },
  {
    icon: <ThermometerSun className="w-6 h-6" />,
    title: "Temperaturas",
    desc: "Registra temperatura de refrigeradores y conserva trazabilidad.",
    badge: "Operación",
  },
];

const CONTROL_SEGURIDAD: Feature[] = [
  {
    icon: <BellRing className="w-6 h-6" />,
    title: "Alertas de stock bajo",
    desc: "Define mínimos por producto y recibe alertas antes del quiebre.",
    badge: "Próximo",
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: "Seguridad de datos",
    desc: "Autenticación y respaldos en la nube.",
  },
];

function Badge({ kind }: { kind: NonNullable<Feature["badge"]> }) {
  const styles =
    kind === "Admin"
      ? "bg-indigo-100 text-indigo-700 border-indigo-200"
      : kind === "Operación"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : "bg-amber-100 text-amber-700 border-amber-200";
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full border ${styles}`}>
      {kind}
    </span>
  );
}

function Card({ f, delay = 0 }: { f: Feature; delay?: number }) {
  return (
    <article
      className="group relative rounded-2xl p-6 bg-white/80 backdrop-blur
                 border border-white/60 shadow transition
                 hover:shadow-[0_16px_45px_rgba(142,45,168,0.18)]
                 hover:-translate-y-0.5 focus-within:-translate-y-0.5
                 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
      tabIndex={0}
      aria-label={f.title}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(142,45,168,0.15), rgba(168,85,247,0.12))",
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        }}
      />

      <div className="relative z-10">
        <div
          className="w-11 h-11 rounded-xl grid place-items-center text-white
                        bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] shadow mb-4"
        >
          {f.icon}
        </div>

        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-[#8E2DA8]">{f.title}</h3>
          {f.badge && <Badge kind={f.badge} />}
        </div>

        <p className="mt-1 text-gray-700 text-sm leading-relaxed">{f.desc}</p>

        <span
          className="mt-3 block h-[2px] w-0 bg-gradient-to-r from-[#8E2DA8] to-[#A855F7]
                         transition-all duration-300 group-hover:w-1/3"
        />
      </div>
    </article>
  );
}

export function Features() {
  const withDelay = <T,>(arr: T[], base = 40) =>
    arr.map((item, i) => ({ item, delay: i * base }));

  return (
    <section id="features" className="py-12 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide
                           text-[#8E2DA8] bg-white/70 backdrop-blur px-3 py-1 rounded-full border border-white/60
                           animate-fade-in-up"
          >
            Funcionalidades
          </span>
          <h2
            className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 animate-fade-in-up"
            style={{ animationDelay: "70ms" }}
          >
            Todo lo que necesitas en un lugar
          </h2>
          <p
            className="mt-2 text-gray-600 max-w-2xl mx-auto animate-fade-in-up"
            style={{ animationDelay: "110ms" }}
          >
            El <strong>admin</strong> define estructura y reglas; la{" "}
            <strong>operación</strong> ejecuta ágil; el sistema cuida datos y da
            visibilidad.
          </p>
        </div>

        {/* Admin */}
        <h3
          className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3 flex items-center gap-2 animate-fade-in-up"
          style={{ animationDelay: "130ms" }}
        >
          <GaugeCircle className="w-4 h-4" /> Panel del administrador
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {withDelay(ADMIN_FEATURES).map(({ item, delay }) => (
            <Card key={item.title} f={item} delay={delay} />
          ))}
        </div>

        {/* Operación */}
        <h3
          className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3 flex items-center gap-2 animate-fade-in-up"
          style={{ animationDelay: "140ms" }}
        >
          <CheckSquare className="w-4 h-4" /> Operación diaria
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {withDelay(OPERACION_FEATURES).map(({ item, delay }) => (
            <Card key={item.title} f={item} delay={delay} />
          ))}
        </div>

        {/* Control & seguridad */}
        <h3
          className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3 flex items-center gap-2 animate-fade-in-up"
          style={{ animationDelay: "150ms" }}
        >
          <ShieldCheck className="w-4 h-4" /> Control & seguridad
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {withDelay(CONTROL_SEGURIDAD).map(({ item, delay }) => (
            <Card key={item.title} f={item} delay={delay} />
          ))}
        </div>
      </div>
    </section>
  );
}
