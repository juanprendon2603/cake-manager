import {
  BarChart3,
  Clock4,
  CreditCard,
  Package,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

const FEATURES = [
  {
    icon: <Package className="w-6 h-6" />,
    title: "Inventario inteligente",
    desc: "Control de existencias, costos y alertas en tiempo real.",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Resumen diario",
    desc: "Ventas, gastos y utilidades listos para decidir.",
  },
  {
    icon: <CreditCard className="w-6 h-6" />,
    title: "Gestión de abonos",
    desc: "Registra anticipos y liquida pedidos sin enredos.",
  },
  {
    icon: <Clock4 className="w-6 h-6" />,
    title: "Asistencia del equipo",
    desc: "Entradas/salidas y reportes simples.",
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Reportes y métricas",
    desc: "Productos top, márgenes y tendencias por periodo.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Seguro y confiable",
    desc: "Autenticación y respaldo de datos.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-6 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-10">
          Todo lo que necesitas en un lugar
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="group bg-white/80 backdrop-blur border border-white/60 rounded-2xl p-6 hover:shadow-[0_16px_45px_rgba(142,45,168,0.15)] transition"
            >
              <div className="w-11 h-11 rounded-xl grid place-items-center text-white bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] shadow mb-4">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold mb-1 text-[#8E2DA8]">
                {f.title}
              </h3>
              <p className="text-gray-700 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
