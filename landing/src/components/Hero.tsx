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
      {/* mock UI */}
<div className="relative mt-10">
  <div className="mx-auto max-w-3xl rounded-2xl border border-white/70 bg-white/90 backdrop-blur shadow-[0_20px_50px_rgba(142,45,168,0.15)] p-3">
    <div className="h-56 sm:h-72 rounded-xl overflow-hidden border border-white/70 bg-black/10 shadow-inner">
      <video
        className="w-full h-full object-cover "
        src="/videos/preview.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      />
    </div>
  </div>
</div>

      </div>
    </header>
  );
}
