import {
  BarChart3,
  Clock,
  CreditCard,
  Package,
  Receipt,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import logoUrl from "../assets/logo.png";
import { AppFooter } from "../components/AppFooter";

export function Home() {
  const cards = [
    {
      to: "/stock",
      title: "Gestión de Stock",
      desc: "Administra tus productos y cantidades disponibles.",
      icon: <Package className="w-6 h-6 text-[#8E2DA8]" />,
      gradient: "from-purple-500 to-indigo-500",
    },
    {
      to: "/sales",
      title: "Gestión de Ventas",
      desc: "Registra y controla las ventas diarias.",
      icon: <Receipt className="w-6 h-6 text-[#8E2DA8]" />,
      gradient: "from-pink-500 to-rose-500",
    },
    {
      to: "/daily",
      title: "Resumen Diario",
      desc: "Consulta el resumen de ventas y gastos por día.",
      icon: <BarChart3 className="w-6 h-6 text-[#8E2DA8]" />,
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      to: "/payment-management",
      title: "Gestión de Abonos",
      desc: "Registra y finaliza abonos de pedidos.",
      icon: <CreditCard className="w-6 h-6 text-[#8E2DA8]" />,
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      to: "/payroll-simple",
      title: "Gestión de Asistencia",
      desc: "Registra la asistencia.",
      icon: <Clock className="w-6 h-6 text-[#8E2DA8]" />,
      gradient: "from-amber-500 to-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex flex-col">
      <main className="flex-grow p-6 sm:p-12 max-w-6xl mx-auto w-full">
        <header className="mb-12 text-center relative">
          <div className="mx-auto mb-6 w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white/70 backdrop-blur border border-white/60 shadow-[0_10px_30px_rgba(142,45,168,0.15)] flex items-center justify-center overflow-hidden ring-2 ring-purple-200">
            <img
              src={logoUrl}
              alt="InManager logo"
              className="w-20 h-20 object-contain"
              loading="eager"
              decoding="async"
            />
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-[#8E2DA8] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent mb-3 drop-shadow-[0_2px_12px_rgba(142,45,168,0.25)]">
            InManager
          </h1>
          <p className="text-lg text-gray-700">
            Plataforma general para la gestión de tu negocio
          </p>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <div className="rounded-xl px-4 py-3 text-center bg-white/60 backdrop-blur border border-white/60 shadow">
              <Package className="w-6 h-6 mx-auto text-[#8E2DA8]" />
              <div className="text-xs text-gray-600">Inventario</div>
              <div className="text-sm font-semibold text-[#8E2DA8]">Stock</div>
            </div>

            <div className="rounded-xl px-4 py-3 text-center bg-white/60 backdrop-blur border border-white/60 shadow">
              <Receipt className="w-6 h-6 mx-auto text-[#8E2DA8]" />
              <div className="text-xs text-gray-600">Ventas</div>
              <div className="text-sm font-semibold text-[#8E2DA8]">
                Diarias
              </div>
            </div>

            <div className="rounded-xl px-4 py-3 text-center bg-white/60 backdrop-blur border border-white/60 shadow">
              <BarChart3 className="w-6 h-6 mx-auto text-[#8E2DA8]" />
              <div className="text-xs text-gray-600">Resumen</div>
              <div className="text-sm font-semibold text-[#8E2DA8]">
                General
              </div>
            </div>

            <div className="rounded-xl px-4 py-3 text-center bg-white/60 backdrop-blur border border-white/60 shadow">
              <Users className="w-6 h-6 mx-auto text-[#8E2DA8]" />
              <div className="text-xs text-gray-600">Asistencia</div>
              <div className="text-sm font-semibold text-[#8E2DA8]">Equipo</div>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {cards.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group relative rounded-2xl overflow-hidden"
            >
              <div
                className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-r ${item.gradient} opacity-90`}
              />
              <div className="relative bg-white/80 backdrop-blur-xl border border-white/70 rounded-2xl p-6 shadow-[0_12px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_45px_rgba(142,45,168,0.25)] transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 -mt-10 rounded-2xl p-3 bg-white shadow-md ring-2 ring-white/80">
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-extrabold text-[#8E2DA8] mb-1">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                  <div className="hidden sm:flex items-center">
                    <span className="text-[#8E2DA8] group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </div>
                <div className="mt-5">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-white px-3 py-1 rounded-full bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] shadow">
                    Ir ahora
                    <span className="group-hover:translate-x-0.5 transition-transform">
                      ›
                    </span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </section>

        <section className="mt-8">
          <div className="rounded-2xl p-4 bg-white/70 backdrop-blur border border-white/60 shadow flex flex-wrap items-center gap-3 justify-center">
            <Link
              to="/sales"
              className="text-[#8E2DA8] font-semibold hover:underline"
            >
              Ir a Ventas
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to="/daily"
              className="text-[#8E2DA8] font-semibold hover:underline"
            >
              Ver Resumen
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to="/payment-management"
              className="text-[#8E2DA8] font-semibold hover:underline"
            >
              Abonos
            </Link>
          </div>
        </section>
      </main>
      <AppFooter appName="InManager" />
    </div>
  );
}
