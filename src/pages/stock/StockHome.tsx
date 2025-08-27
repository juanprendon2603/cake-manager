import { Link } from "react-router-dom";

export function StockHome() {  const stockActions = [
    {
      to: "/stock/agregar",
      title: "Agregar Producto",
      desc: "Añade nuevos productos a tu inventario con facilidad.",
      icon: "📦",
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50 to-teal-50",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-700",
      features: ["Múltiples sabores", "Cantidades flexibles", "Actualización automática"]
    },
    {
      to: "/stock/listado",
      title: "Ver Inventario",
      desc: "Consulta y administra todos los productos existentes.",
      icon: "📋",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      features: ["Vista por tamaños", "Gestión de sabores", "Estadísticas en vivo"]
    }
  ];



  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex flex-col">
      <main className="flex-grow p-6 sm:p-12 max-w-6xl mx-auto w-full">
        {/* Enhanced Header */}
        <header className="mb-12 text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl opacity-10"></div>
          
          <div className="relative z-10 py-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl shadow-xl ring-4 ring-purple-200">
                📦
              </div>
            </div>
            
            <h1 className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-[#8E2DA8] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent mb-4 drop-shadow-[0_2px_12px_rgba(142,45,168,0.25)]">
              Gestión de Stock
            </h1>
            <p className="text-xl text-gray-700 font-medium mb-8">
              Administra y controla tu inventario de manera sencilla y profesional
            </p>

           
          </div>
        </header>

        {/* Action Cards */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {stockActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="group relative rounded-3xl overflow-hidden transform hover:scale-[1.02] transition-all duration-300"
            >
              {/* Background gradient strip */}
              <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-r ${action.gradient} opacity-90`} />
              
              <div className={`relative bg-gradient-to-br ${action.bgGradient} backdrop-blur-xl border-2 ${action.borderColor} rounded-3xl p-8 shadow-[0_12px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_50px_rgba(142,45,168,0.25)] transition-all duration-300`}>
                <div className="flex items-start gap-6">
                  {/* Icon */}
                  <div className="flex-shrink-0 -mt-12 rounded-2xl p-4 bg-white shadow-lg ring-2 ring-white/80">
                    <span className="text-3xl">{action.icon}</span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <h3 className={`text-2xl font-extrabold ${action.textColor} mb-2`}>
                      {action.title}
                    </h3>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {action.desc}
                    </p>
                    
                    {/* Features list */}
                    <ul className="space-y-2 mb-6">
                      {action.features.map((feature, featureIdx) => (
                        <li key={featureIdx} className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    {/* CTA Button */}
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-full bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] shadow-lg group-hover:shadow-xl transition-all duration-300">
                      Acceder ahora
                      <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                    </div>
                  </div>
                  
                  {/* Arrow indicator */}
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

        {/* Info Cards Section */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="rounded-2xl p-6 bg-white/70 backdrop-blur border border-white/60 shadow-lg text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-xl mx-auto mb-4">
              ✅
            </div>
            <h4 className="font-bold text-gray-800 mb-2">Control Total</h4>
            <p className="text-sm text-gray-600">Gestiona cada producto con precisión y facilidad</p>
          </div>
          
          <div className="rounded-2xl p-6 bg-white/70 backdrop-blur border border-white/60 shadow-lg text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xl mx-auto mb-4">
              📊
            </div>
            <h4 className="font-bold text-gray-800 mb-2">Estadísticas</h4>
            <p className="text-sm text-gray-600">Visualiza el estado de tu inventario en tiempo real</p>
          </div>
          
          <div className="rounded-2xl p-6 bg-white/70 backdrop-blur border border-white/60 shadow-lg text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl mx-auto mb-4">
              🚀
            </div>
            <h4 className="font-bold text-gray-800 mb-2">Eficiencia</h4>
            <p className="text-sm text-gray-600">Optimiza tu tiempo con herramientas intuitivas</p>
          </div>
        </section>

        {/* Quick Actions Bar */}
        <section className="rounded-2xl p-6 bg-white/70 backdrop-blur border border-white/60 shadow-lg">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span className="text-gray-700 font-medium">Accesos rápidos:</span>
            <Link to="/stock/agregar" className="text-[#8E2DA8] font-semibold hover:underline transition-colors">
              Agregar Productos
            </Link>
            <span className="text-gray-300">•</span>
            <Link to="/stock/listado" className="text-[#8E2DA8] font-semibold hover:underline transition-colors">
              Ver Inventario
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
                <p className="text-lg font-bold">Tip Profesional</p>
              </div>
              <p className="text-purple-100">
                Mantén tu inventario actualizado diariamente para optimizar las ventas y evitar faltantes.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="text-center py-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="text-lg font-semibold">🎂 CakeManager Pro</div>
        <div className="text-sm opacity-80 mt-1">© 2025 - Sistema de Gestión de Stock Avanzado</div>
      </footer>
    </div>
  );
}

