import { useState } from "react";
import { useParallax } from "../hooks/useParallax";
import UsersInfoModal, { DemoSeed } from "./UsersInfoModal";
import { VideoPreview } from "./VideoPreview";

export function Hero() {
  const offset = useParallax(0.12, 18); // parallax suave
  const [showDemoModal, setShowDemoModal] = useState(false);

  const seed: DemoSeed = {
    admins: ["admin@admin.com"],
    allowlist: ["admin@admin.com", "usuario@usuario.com"],
    profiles: {
      "admin@admin.com": {
        displayName: "Admin Prueba",
        firstName: "Admin",
        lastName: "Prueba",
      },
      "usuario@usuario.com": {
        displayName: "Usuario Prueba",
        firstName: "Usuario",
        lastName: "Prueba",
      },
    },
    initialized: true,
  };

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

        <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight bg-gradient-to-r from-[#8E2DA8] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent">
          Tu negocio, simple y bajo control
        </h1>

        <p className="mt-4 text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto">
          InManager centraliza inventario, ventas, abonos y asistencia en una
          sola app. Menos Excel, más acción.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#precios"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white shadow hover:shadow-lg transition focus:outline-none focus:ring-2 focus:ring-[#C084FC]/50"
          >
            Comenzar ahora
          </a>

          <button
            onClick={() => setShowDemoModal(true)}
            className="px-6 py-3 rounded-2xl bg-white/85 backdrop-blur border border-white/60 hover:bg-white shadow transition focus:outline-none focus:ring-2 focus:ring-[#C084FC]/40"
          >
            Probar demo
          </button>
        </div>

        {/* Preview con parallax y SIN recortes */}
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

      {/* Modal de demo con usuarios */}
      <UsersInfoModal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
        demoUrl="https://inmanager-b5f4c.web.app"
        seed={seed}
      />
    </header>
  );
}
