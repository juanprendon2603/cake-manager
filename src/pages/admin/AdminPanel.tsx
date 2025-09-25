// src/pages/admin/AdminPanel.tsx
import { Link } from "react-router-dom";
import logoUrl from "../../assets/logo.png";

export default function AdminPanel() {
  const cards = [
    {
      to: "/admin/allowlist",
      title: "Añadir usuarios",
      desc: "Autoriza correos y gestiona roles.",
      icon: "👤",
      gradient: "from-purple-500 to-indigo-500",
      pill: "Usuarios",
    },
    {
      to: "/admin/fridges",
      title: "Añadir refrigeradores",
      desc: "Configura y registra cámaras/fríos.",
      icon: "❄️",
      gradient: "from-cyan-500 to-blue-500",
      pill: "Refrigeración",
    },
    {
      to: "/admin/workers",
      title: "Añadir trabajadores",
      desc: "Crea y edita el equipo de trabajo.",
      icon: "🧑‍🍳",
      gradient: "from-emerald-500 to-teal-500",
      pill: "Equipo",
    },
    {
      to: "/admin/catalog",
      title: "Añadir stock",
      desc: "Carga rápida de productos y existencias.",
      icon: "📦",
      gradient: "from-amber-500 to-orange-500",
      pill: "Inventario",
    },
    {
      to: "/payroll",
      title: "Ver nómina",
      desc: "Consulta periodos y liquidaciones.",
      icon: "🧾",
      gradient: "from-pink-500 to-rose-500",
      pill: "Nómina",
    },
    {
      to: "/inform",
      title: "Ver informe",
      desc: "Indicadores y comparativas.",
      icon: "📈",
      gradient: "from-fuchsia-500 to-purple-500",
      pill: "Reportes",
    },
    {
      to: "/summary",
      title: "Registros del mes",
      desc: "Ventas y gastos consolidados.",
      icon: "🗓️",
      gradient: "from-sky-500 to-indigo-500",
      pill: "Mensual",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex flex-col">
      <main className="flex-grow p-6 sm:p-12 max-w-6xl mx-auto w-full">
        {/* Header */}
        <header className="mb-12 text-center relative">
          <div className="mx-auto mb-6 w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white/70 backdrop-blur border border-white/60 shadow-[0_10px_30px_rgba(142,45,168,0.15)] flex items-center justify-center overflow-hidden ring-2 ring-purple-200">
            <img
              src={logoUrl}
              alt="CakeManager logo"
              className="w-20 h-20 object-contain"
              loading="eager"
              decoding="async"
            />
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-[#8E2DA8] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent mb-3 drop-shadow-[0_2px_12px_rgba(142,45,168,0.25)]">
            Panel de Administración
          </h1>
          <p className="text-lg text-gray-700">
            Configura acceso, personal y recursos del sistema
          </p>

          {/* mini-cards */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <div className="rounded-xl px-4 py-3 text-center bg-white/60 backdrop-blur border border-white/60 shadow">
              <div className="text-2xl">👥</div>
              <div className="text-xs text-gray-600">Usuarios</div>
              <div className="text-sm font-semibold text-[#8E2DA8]">Roles</div>
            </div>
            <div className="rounded-xl px-4 py-3 text-center bg-white/60 backdrop-blur border border-white/60 shadow">
              <div className="text-2xl">❄️</div>
              <div className="text-xs text-gray-600">Equipos</div>
              <div className="text-sm font-semibold text-[#8E2DA8]">Fríos</div>
            </div>
            <div className="rounded-xl px-4 py-3 text-center bg-white/60 backdrop-blur border border-white/60 shadow">
              <div className="text-2xl">🧑‍🍳</div>
              <div className="text-xs text-gray-600">Staff</div>
              <div className="text-sm font-semibold text-[#8E2DA8]">Altas</div>
            </div>
            <div className="rounded-xl px-4 py-3 text-center bg-white/60 backdrop-blur border border-white/60 shadow">
              <div className="text-2xl">📦</div>
              <div className="text-xs text-gray-600">Inventario</div>
              <div className="text-sm font-semibold text-[#8E2DA8]">Carga</div>
            </div>
          </div>
        </header>

        {/* Grid de acciones */}
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

                <div className="mt-5 flex items-center gap-2">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-white px-3 py-1 rounded-full bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] shadow">
                    {item.pill}
                    <span className="group-hover:translate-x-0.5 transition-transform">
                      ›
                    </span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </section>

        {/* Accesos rápidos */}
        <section className="mt-8">
          <div className="rounded-2xl p-4 bg-white/70 backdrop-blur border border-white/60 shadow flex flex-wrap items-center gap-3 justify-center">
            <Link
              to="/admin/allowlist"
              className="text-[#8E2DA8] font-semibold hover:underline"
            >
              Autorizar correos
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to="/stock/agregar"
              className="text-[#8E2DA8] font-semibold hover:underline"
            >
              Cargar stock
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to="/summary"
              className="text-[#8E2DA8] font-semibold hover:underline"
            >
              Registros mensuales
            </Link>
          </div>
        </section>
      </main>

      <footer className="text-center text-sm text-white py-6 bg-gradient-to-r from-[#7a1f96] via-[#8E2DA8] to-[#a84bd1]">
        © 2025 CakeManager Admin. Todos los derechos reservados.
      </footer>
    </div>
  );
}
