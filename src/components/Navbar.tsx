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
            className="md:hidden p-2 rounded hover:bg-[#a14bb8] focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#8E2DA8"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#8E2DA8"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
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
            { to: "/summary", label: "Resumen" },
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
