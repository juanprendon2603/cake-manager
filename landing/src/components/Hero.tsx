import { useDemoModal } from "../hooks/useDemoModal";
import { useParallax } from "../hooks/useParallax";
import { VideoPreview } from "./VideoPreview";

export function Hero() {
  const offset = useParallax(0.12, 18); // parallax suave
  const { openDemo } = useDemoModal(); // modal global

  return (
    <header className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-20 text-center">
        {/* Logo */}
        <div className="mx-auto mb-6 w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/70 backdrop-blur border border-white/60 shadow-[0_10px_30px_rgba(142,45,168,0.12)] flex items-center justify-center ring-2 ring-purple-200">
          <img
            src="/logo.png"
            alt="InManager logo"
            className="w-16 h-16 object-contain"
          />
        </div>

        {/* Título principal */}
        <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight bg-gradient-to-r from-[#8E2DA8] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent">
          Tu negocio, simple y bajo control
        </h1>

        <p className="mt-4 text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto">
          InManager centraliza inventario, ventas, abonos y asistencia en una
          sola app. Menos Excel, más acción.
        </p>

        {/* Card adicional: adaptable a más negocios */}
        <div className="mt-8 max-w-3xl mx-auto bg-white/70 backdrop-blur border border-white/60 rounded-2xl shadow-[0_8px_25px_rgba(142,45,168,0.12)] p-6 text-gray-700">
          <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] bg-clip-text text-transparent">
            🌸 Pensada para crecer contigo
          </h3>
          <p className="text-base sm:text-lg leading-relaxed">
            InManager nació como una herramienta para una{" "}
            <span className="font-medium">pastelería</span>, pero hoy se adapta
            perfectamente a negocios como{" "}
            <span className="font-medium">heladerías</span>,{" "}
            <span className="font-medium">floristerías</span> o{" "}
            <span className="font-medium">tiendas especializadas</span>.
            Ideal para quienes manejan pocos productos, pero muchas ventas
            diarias.
          </p>
        </div>

        {/* Botones principales */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#precios"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white shadow hover:shadow-lg transition focus:outline-none focus:ring-2 focus:ring-[#C084FC]/50"
          >
            Comenzar ahora
          </a>

          <button
            onClick={openDemo}
            className="px-6 py-3 rounded-2xl bg-white/85 backdrop-blur border border-white/60 hover:bg-white shadow transition focus:outline-none focus:ring-2 focus:ring-[#C084FC]/40"
          >
            Probar demo
          </button>
        </div>

        {/* Preview con efecto parallax */}
        <div className="relative mt-10">
          <div
            className="mx-auto max-w-3xl rounded-2xl border border-white/70 bg-white/90 backdrop-blur shadow-[0_20px_50px_rgba(142,45,168,0.15)] p-3 transition-transform duration-300"
            style={{ transform: `translateY(${offset}px)` }}
          >
            <VideoPreview
              srcDesktop="/videos/preview.mp4"
              srcMobile="/videos/preview-mobile.mp4"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
