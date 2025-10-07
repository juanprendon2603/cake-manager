import { Sparkles } from "lucide-react";
import { RouterAwareLink } from "./RouterAwareLink";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-30 bg-white/70 backdrop-blur border-b border-white/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="InManager" className="w-8 h-8" />
          <span className="text-xl font-extrabold bg-gradient-to-r from-[#8E2DA8] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent">
            InManager
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm">
          <a href="#features" className="hover:text-[#8E2DA8]">
            Características
          </a>
          <a href="#vistas" className="hover:text-[#8E2DA8]">
            Vistas
          </a>
          <a href="#precios" className="hover:text-[#8E2DA8]">
            Precios
          </a>
          <a href="#faq" className="hover:text-[#8E2DA8]">
            FAQ
          </a>
        </div>

        <div className="flex items-center gap-3">
          <RouterAwareLink
            to="https://inmanager-b5f4c.web.app/log"
            newTab
            className="hidden sm:inline-block px-4 py-2 rounded-xl border border-[#8E2DA8]/30 text-[#8E2DA8] hover:bg-white/60 transition"
          >
            Ver demo
          </RouterAwareLink>
          <a
            href="#precios"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white shadow"
          >
            Empezar <Sparkles className="w-4 h-4" />
          </a>
        </div>
      </div>
    </nav>
  );
}
