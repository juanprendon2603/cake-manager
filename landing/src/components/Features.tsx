import {
  BarChart3,
  BellRing,
  ClipboardCheck,
  Clock4,
  CreditCard,
  Factory,
  GaugeCircle,
  Lock,
  Package,
  ShieldCheck,
  ThermometerSun,
  TrendingUp,
  Users,
  CheckSquare,
} from "lucide-react";

type Feature = {
  icon: JSX.Element;
  title: string;
  desc: string;
  badge?: "Admin" | "Operación" | "Próximo";
};

const ADMIN_FEATURES: Feature[] = [
  {
    icon: <Users className="w-6 h-6" />,
    title: "Usuarios y roles",
    desc: "Crea administradores y usuarios operativos con permisos claros.",
    badge: "Admin",
  },
  {
    icon: <Factory className="w-6 h-6" />,
    title: "Catálogo con atributos",
    desc: "Define categorías (p. ej. Torta) con atributos (tamaño, relleno) y sus precios.",
    badge: "Admin",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Informes y nómina",
    desc: "Visualiza ventas, utilidades y calcula la nómina según reglas del negocio.",
    badge: "Admin",
  },
];

const OPERACION_FEATURES: Feature[] = [
  {
    icon: <Package className="w-6 h-6" />,
    title: "Inventario inteligente",
    desc: "Controla existencias y costos; descuenta stock automáticamente al vender.",
    badge: "Operación",
  },
  {
    icon: <CreditCard className="w-6 h-6" />,
    title: "Ventas y abonos",
    desc: "Registra ventas rápidas y abonos por pedido con fecha de entrega.",
    badge: "Operación",
  },
  {
    icon: <Clock4 className="w-6 h-6" />,
    title: "Asistencia y turnos",
    desc: "Marca turno completo, medio turno o por horas; genera reportes de asistencia.",
    badge: "Operación",
  },
  {
    icon: <ThermometerSun className="w-6 h-6" />,
    title: "Control de temperatura",
    desc: "Registra temperatura de refrigeradores y mantén trazabilidad.",
    badge: "Operación",
  },
];

const CONTROL_SEGURIDAD: Feature[] = [
  {
    icon: <BellRing className="w-6 h-6" />,
    title: "Alertas de stock bajo",
    desc: "Define mínimos por producto y recibe alertas antes de quedarte sin stock.",
    badge: "Próximo",
  },
  {
    icon: <ClipboardCheck className="w-6 h-6" />,
    title: "Cierre de turno",
    desc: "Cierra turnos con checklist (caja, desperdicios, limpieza) y firma digital.",
    badge: "Próximo",
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Bitácora & auditoría",
    desc: "Historial de cambios: quién hizo qué y cuándo (altas, bajas, precios).",
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: "Seguridad de datos",
    desc: "Autenticación y respaldos para que nada se pierda.",
  },
];

function Card({ f }: { f: Feature }) {
  const badgeStyles =
    f.badge === "Admin"
      ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
      : f.badge === "Operación"
      ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
      : "bg-amber-100 text-amber-700 border border-amber-200";

  return (
    <div className="group bg-white/80 backdrop-blur border border-white/60 rounded-2xl p-6 hover:shadow-[0_16px_45px_rgba(142,45,168,0.15)] transition">
      <div className="w-11 h-11 rounded-xl grid place-items-center text-white bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] shadow mb-4">
        {f.icon}
      </div>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold mb-1 text-[#8E2DA8]">{f.title}</h3>
        {f.badge && (
          <span className={`text-[11px] px-2 py-0.5 rounded-full ${badgeStyles}`}>
            {f.badge}
          </span>
        )}
      </div>
      <p className="text-gray-700 text-sm">{f.desc}</p>
    </div>
  );
}

export function Features() {
  return (
    <section id="features" className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-2">
          Todo lo que necesitas en un lugar
        </h2>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10">
          Admin crea estructura y reglas; el equipo ejecuta ágil; el sistema cuida datos y da visibilidad.
        </p>

        {/* Admin */}
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3 flex items-center gap-2">
          <GaugeCircle className="w-4 h-4" /> Panel del administrador
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {ADMIN_FEATURES.map((f, i) => (
            <Card key={`admin-${i}`} f={f} />
          ))}
        </div>

        {/* Operación */}
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3 flex items-center gap-2">
          <CheckSquare className="w-4 h-4" /> Operación diaria
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {OPERACION_FEATURES.map((f, i) => (
            <Card key={`op-${i}`} f={f} />
          ))}
        </div>

        {/* Control & seguridad */}
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> Control & seguridad
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CONTROL_SEGURIDAD.map((f, i) => (
            <Card key={`sec-${i}`} f={f} />
          ))}
        </div>
      </div>
    </section>
  );
}
