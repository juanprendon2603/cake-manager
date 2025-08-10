// components/Navbar.jsx
import { Link, useLocation } from "react-router-dom";

export function Navbar() {
  const location = useLocation();

  const isActive = (path: string): boolean => {    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="shadow-lg" style={{ backgroundColor: "  #8E2DA8" }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16 text-white">
        <Link to="/" className="text-xl font-bold" style={{ color: "#2FE1EB" }}>
        CakeManager
          </Link>

          <div className="flex space-x-6">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive("/") && location.pathname === "/"
                  ? "bg-white text-[#8E2DA8]"
                  : "hover:text-white hover:bg-[#E3B6F4] text-[#BAA1DD]"
              }`}
            >
              Inicio
            </Link>

            <Link
              to="/stock"
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive("/stock")
                  ? "bg-white text-[#8E2DA8]"
                  : "hover:text-white hover:bg-[#E3B6F4] text-[#BAA1DD]"
              }`}
            >
              Stock
            </Link>

            <Link
              to="/sales"
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive("/sales")
                  ? "bg-white text-[#8E2DA8]"
                  : "hover:text-white hover:bg-[#E3B6F4] text-[#BAA1DD]"
              }`}
            >
              Ventas
            </Link>

            <Link
              to="/payment-management"
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive("/payment-management")
                  ? "bg-white text-[#8E2DA8]"
                  : "hover:text-white hover:bg-[#E3B6F4] text-[#BAA1DD]"
              }`}
            >
              Abonos
            </Link>

            <Link
              to="/summary"
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive("/summary")
                  ? "bg-white text-[#8E2DA8]"
                  : "hover:text-white hover:bg-[#E3B6F4] text-[#BAA1DD]"
              }`}
            >
              Resumen
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
