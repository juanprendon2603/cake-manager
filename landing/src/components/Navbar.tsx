import { Sparkles } from "lucide-react";
import { useState } from "react";
import { useDemoModal } from "../hooks/useDemoModal";

export function Navbar() {
  const [open, setOpen] = useState(false); // drawer mobile
  const { openDemo } = useDemoModal(); // modal global

  return (
    <nav className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/60 shadow-[0_4px_24px_rgba(142,45,168,0.08)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="InManager"
            className="w-8 h-8 rounded-xl"
          />
          <span className="text-xl font-extrabold bg-gradient-to-r from-[#8E2DA8] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent tracking-tight">
            InManager
          </span>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          <a
            href="#features"
            className="relative text-sm text-gray-700/90 hover:text-[#8E2DA8] transition"
          >
            Características
          </a>
          <a
            href="#vistas"
            className="relative text-sm text-gray-700/90 hover:text-[#8E2DA8] transition"
          >
            Vistas
          </a>
          <a
            href="#precios"
            className="relative text-sm text-gray-700/90 hover:text-[#8E2DA8] transition"
          >
            Precios
          </a>
          <a
            href="#faq"
            className="relative text-sm text-gray-700/90 hover:text-[#8E2DA8] transition"
          >
            FAQ
          </a>
        </div>

        {/* CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={openDemo}
            className="px-4 py-2 rounded-xl border border-[#8E2DA8]/30 text-[#8E2DA8]
                       hover:bg-white transition focus:outline-none focus:ring-2 focus:ring-[#C084FC]/40"
          >
            Ver demo
          </button>

          <a
            href="#precios"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                       bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white shadow
                       hover:shadow-lg transition focus:outline-none focus:ring-2 focus:ring-[#C084FC]/50"
          >
            Empezar <Sparkles className="w-4 h-4" />
          </a>
        </div>

        {/* Burger (mobile) */}
        <button
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl
                     bg-white/60 border border-white/60 text-[#8E2DA8]
                     hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#C084FC]/40"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menú"
          aria-expanded={open}
        >
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
          >
            {open ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Drawer mobile */}
      {open && (
        <div className="md:hidden border-t border-white/60 bg-white/80 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-2">
            <a
              href="#features"
              className="py-2 text-sm font-semibold text-gray-700 hover:text-[#8E2DA8]"
              onClick={() => setOpen(false)}
            >
              Características
            </a>
            <a
              href="#vistas"
              className="py-2 text-sm font-semibold text-gray-700 hover:text-[#8E2DA8]"
              onClick={() => setOpen(false)}
            >
              Vistas
            </a>
            <a
              href="#precios"
              className="py-2 text-sm font-semibold text-gray-700 hover:text-[#8E2DA8]"
              onClick={() => setOpen(false)}
            >
              Precios
            </a>
            <a
              href="#faq"
              className="py-2 text-sm font-semibold text-gray-700 hover:text-[#8E2DA8]"
              onClick={() => setOpen(false)}
            >
              FAQ
            </a>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  openDemo();
                  setOpen(false);
                }}
                className="flex-1 px-4 py-2 rounded-xl border border-[#8E2DA8]/30 text-[#8E2DA8] bg-white hover:bg-white/80 text-center"
              >
                Ver demo
              </button>
              <a
                href="#precios"
                className="flex-1 px-4 py-2 rounded-xl text-center text-white bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] shadow"
                onClick={() => setOpen(false)}
              >
                Empezar
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
