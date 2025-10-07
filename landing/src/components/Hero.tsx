import { Layers } from "lucide-react";
import { RouterAwareLink } from "./RouterAwareLink";

export function Hero() {
  return (
    <header className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-20 text-center">
        <div className="mx-auto mb-6 w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/70 backdrop-blur border border-white/60 shadow-[0_10px_30px_rgba(142,45,168,0.15)] flex items-center justify-center ring-2 ring-purple-200">
          <img
            src="/logo.png"
            alt="InManager logo"
            className="w-16 h-16 object-contain"
          />
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight bg-gradient-to-r from-[#8E2DA8] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent">
          Tu negocio, simple y bajo control
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto">
          InManager centraliza inventario, ventas, abonos y asistencia en una
          sola app. Menos Excel, más acción.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#precios"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white shadow hover:shadow-lg transition"
          >
            Comenzar ahora
          </a>
          <RouterAwareLink
            to="https://inmanager-b5f4c.web.app/log"
            newTab
            className="px-6 py-3 rounded-2xl bg-white/80 backdrop-blur border border-white/60 hover:bg-white shadow"
          >
            Probar demo
          </RouterAwareLink>
        </div>

        {/* mock UI */}
        <div className="relative mt-12">
          <div className="mx-auto max-w-5xl rounded-2xl border border-white/70 bg-white/90 backdrop-blur shadow-[0_20px_50px_rgba(142,45,168,0.15)] p-4">
            <div className="h-72 sm:h-96 rounded-xl border border-white/70 bg-gradient-to-br from-white to-purple-50 grid place-items-center">
              <div className="flex items-center gap-4 text-[#8E2DA8]">
                <Layers className="w-6 h-6" />
                <span className="font-semibold">
                  Vista previa del panel — métricas, inventario y ventas
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
