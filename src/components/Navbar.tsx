import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string): boolean => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const items = [
    { to: "/", label: "Inicio" },
    { to: "/stock", label: "Stock" },
    { to: "/sales", label: "Ventas" },
    { to: "/payment-management", label: "Abonos" },
    { to: "/daily", label: "Resumen" },
    { to: "/payroll-simple", label: "Asistencia" },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-gradient-to-r from-[#7a1f96]/80 via-[#8E2DA8]/80 to-[#a84bd1]/80 border-b border-white/20 shadow-[0_8px_20px_rgba(142,45,168,0.25)]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16 text-white">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-[#2FE1EB] via-white to-[#F3E8FF] bg-clip-text text-transparent drop-shadow-[0_1px_8px_rgba(47,225,235,0.35)]">
              CakeManager
            </span>
            <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-white/80 tracking-wider">
              PRO
            </span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-1">
            {items.map((item) => {
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={[
                    "relative px-3 py-2 rounded-xl text-sm font-semibold transition-all",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E3B6F4]/60 focus:ring-offset-transparent",
                    active
                      ? "text-[#8E2DA8] bg-white shadow-[0_6px_16px_rgba(255,255,255,0.25)]"
                      : "text-[#E9D9F7] hover:text-white bg-white/0 hover:bg-white/10"
                  ].join(" ")}
                >
                  <span className="relative z-10">{item.label}</span>
                  {/* Active underline / indicator */}
                  <span
                    className={[
                      "absolute left-3 right-3 -bottom-1 h-0.5 rounded-full transition-all",
                      active ? "bg-gradient-to-r from-[#2FE1EB] to-[#F3E8FF] opacity-100" : "opacity-0 group-hover:opacity-60"
                    ].join(" ")}
                  />
                </Link>
              );
            })}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition focus:outline-none focus:ring-2 focus:ring-white/70"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 pt-2">
          <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md shadow-[0_12px_30px_rgba(0,0,0,0.25)] overflow-hidden">
            {items.map((item, idx) => {
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={[
                    "block px-4 py-3 text-sm font-semibold transition-all",
                    idx !== items.length - 1 ? "border-b border-white/10" : "",
                    active
                      ? "bg-white text-[#8E2DA8]"
                      : "text-[#E9D9F7] hover:text-white hover:bg-white/10"
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}