// components/Navbar.jsx
import { Link, useLocation } from "react-router-dom";

export function Navbar() {
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="bg-pink-600 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold">
            CakeManager
          </Link>

          <div className="flex space-x-6">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive("/") && location.pathname === "/"
                  ? "bg-pink-700 text-white"
                  : "text-pink-200 hover:text-white hover:bg-pink-500"
              }`}
            >
              Inicio
            </Link>

            <Link
              to="/stock"
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive("/stock")
                  ? "bg-pink-700 text-white"
                  : "text-pink-200 hover:text-white hover:bg-pink-500"
              }`}
            >
              Stock
            </Link>

            <Link
              to="/sales"
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive("/sales")
                  ? "bg-pink-700 text-white"
                  : "text-pink-200 hover:text-white hover:bg-pink-500"
              }`}
            >
              Ventas
            </Link>

            <Link
              to="/summary"
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive("/summary")
                  ? "bg-pink-700 text-white"
                  : "text-pink-200 hover:text-white hover:bg-pink-500"
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
