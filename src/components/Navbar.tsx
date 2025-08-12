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

  return (
    <nav className="shadow-lg bg-[#8E2DA8]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16 text-white">
          <Link to="/" className="text-xl font-bold text-[#2FE1EB]">
            CakeManager
          </Link>

          <div className="hidden md:flex space-x-6">
            {[
              { to: "/", label: "Inicio" },
              { to: "/stock", label: "Stock" },
              { to: "/sales", label: "Ventas" },
              { to: "/payment-management", label: "Abonos" },
              { to: "/daily", label: "Resumen" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${isActive(item.to)
                    ? "bg-white text-[#8E2DA8]"
                    : "hover:text-white hover:bg-[#E3B6F4] text-[#BAA1DD]"
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <button
            className="md:hidden p-3 rounded-lg bg-white/20 border border-white/30 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-[#8E2DA8] px-4 pb-4 space-y-2">
          {[
            { to: "/", label: "Inicio" },
            { to: "/stock", label: "Stock" },
            { to: "/sales", label: "Ventas" },
            { to: "/payment-management", label: "Abonos" },
            { to: "/daily", label: "Resumen" }, 
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition ${isActive(item.to)
                  ? "bg-white text-[#8E2DA8]"
                  : "hover:text-white hover:bg-[#E3B6F4] text-[#BAA1DD]"
                }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}