import { Link } from "react-router-dom";

export function PaymentManagement() {
  const actions = [
    {
      to: "/payment-management/add",
      title: "Agregar Abono",
      desc: "Registra nuevos abonos en el sistema.",
      icon: "➕",
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50 to-teal-50",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-700",
      features: ["Métodos de pago variados", "Notas y referencias", "Validaciones rápidas"],
    },
    {
      to: "/payment-management/finalize",
      title: "Finalizar Abono",
      desc: "Completa y procesa los abonos pendientes.",
      icon: "✅",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      features: ["Conciliación simple", "Actualiza estados", "Historial detallado"],
    },
  ];



  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex flex-col">
      <main className="flex-grow p-6 sm:p-12 max-w-6xl mx-auto w-full">
        {/* Header estilo Stock/Sales */}
        <header className="mb-12 text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl opacity-10"></div>

          <div className="relative z-10 py-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl shadow-xl ring-4 ring-purple-200">
                💳
              </div>
            </div>

            <h1 className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-[#8E2DA8] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent mb-4 drop-shadow-[0_2px_12px_rgba(142,45,168,0.25)]">
              Gestión de Abonos
            </h1>
            <p className="text-xl text-gray-700 font-medium mb-8">
              Administra y procesa los abonos de manera sencilla
            </p>

            {/* Quick Stats */}
           
          </div>
        </header>

        {/* Action Cards: 2 columnas (match con patrón) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
          {actions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="group relative rounded-3xl overflow-hidden transform hover:scale-[1.02] transition-all duration-300"
            >
              {/* Franja superior con gradiente */}
              <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-r ${action.gradient} opacity-90`} />

              <div
                className={`relative bg-gradient-to-br ${action.bgGradient} backdrop-blur-xl border-2 ${action.borderColor} rounded-3xl p-8 shadow-[0_12px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_50px_rgba(142,45,168,0.25)] transition-all duration-300`}
              >
                <div className="flex items-start gap-6">
                  {/* Icono */}
                  <div className="flex-shrink-0 -mt-12 rounded-2xl p-4 bg-white shadow-lg ring-2 ring-white/80">
                    <span className="text-3xl">{action.icon}</span>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1">
                    <h3 className={`text-2xl font-extrabold ${action.textColor} mb-2`}>
                      {action.title}
                    </h3>
                    <p className="text-gray-700 mb-4 leading-relaxed">{action.desc}</p>

                    <ul className="space-y-2 mb-6">
                      {action.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-full bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] shadow-lg group-hover:shadow-xl transition-all duration-300">
                      Acceder ahora
                      <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                    </div>
                  </div>

                  {/* Flecha lateral */}
                  <div className="hidden sm:flex items-center">
                    <span className={`text-2xl ${action.textColor} group-hover:translate-x-2 transition-transform duration-300`}>
                      →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </section>

        {/* Info Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="rounded-2xl p-6 bg-white/70 backdrop-blur border border-white/60 shadow-lg text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-xl mx-auto mb-4">
              🔒
            </div>
            <h4 className="font-bold text-gray-800 mb-2">Cobros Seguros</h4>
            <p className="text-sm text-gray-600">Procesa abonos con validaciones y control</p>
          </div>

          <div className="rounded-2xl p-6 bg-white/70 backdrop-blur border border-white/60 shadow-lg text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xl mx-auto mb-4">
              📊
            </div>
            <h4 className="font-bold text-gray-800 mb-2">Seguimiento</h4>
            <p className="text-sm text-gray-600">Monitorea pendientes y completados</p>
          </div>

          <div className="rounded-2xl p-6 bg-white/70 backdrop-blur border border-white/60 shadow-lg text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl mx-auto mb-4">
              ⚡
            </div>
            <h4 className="font-bold text-gray-800 mb-2">Rapidez</h4>
            <p className="text-sm text-gray-600">Flujo ágil para registrar y finalizar</p>
          </div>
        </section>

        {/* Accesos rápidos */}
        <section className="rounded-2xl p-6 bg-white/70 backdrop-blur border border-white/60 shadow-lg">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span className="text-gray-700 font-medium">Accesos rápidos:</span>
            <Link to="/payment-management/add" className="text-[#8E2DA8] font-semibold hover:underline transition-colors">
              Agregar Abono
            </Link>
            <span className="text-gray-300">•</span>
            <Link to="/payment-management/finalize" className="text-[#8E2DA8] font-semibold hover:underline transition-colors">
              Finalizar Abono
            </Link>
            <span className="text-gray-300">•</span>
            <Link to="/sales" className="text-[#8E2DA8] font-semibold hover:underline transition-colors">
              Ir a Ventas
            </Link>
          </div>
        </section>

        {/* Pro Tip */}
        <div className="mt-12">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"></div>
            <div className="relative z-10 p-6 text-white text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-2xl">💡</span>
                <p className="text-lg font-bold">Tip de Abonos</p>
              </div>
              <p className="text-purple-100">
                Registra los abonos al instante y mantén actualizado el estado de cada pedido.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer con gradiente */}
      <footer className="text-center py-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="text-lg font-semibold">🎂 CakeManager Pro</div>
        <div className="text-sm opacity-80 mt-1">© 2025 - Gestión de Abonos</div>
      </footer>
    </div>
  );
}