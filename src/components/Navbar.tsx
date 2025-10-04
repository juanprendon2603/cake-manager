import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function getInitialsFromProfileOrUser(
  firstName?: string | null,
  lastName?: string | null,
  displayName?: string | null,
  email?: string | null
) {
  const fn = (firstName || "").trim();
  const ln = (lastName || "").trim();
  if (fn && ln) return (fn[0] + ln[0]).toUpperCase();

  const dn = (displayName || "").trim();
  if (dn) {
    const words = dn.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    const w = words[0];
    return ((w?.[0] || "U") + (w?.[1] || "")).toUpperCase();
  }

  const base = (email || "U").split("@")[0] || "U";
  const parts = base.replace(/[_\.]/g, " ").split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0]?.toUpperCase() ?? "U";
  const b = parts[1]?.[0]?.toUpperCase() ?? "";
  return (a + b).slice(0, 2);
}

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, role, profile } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const isActive = (path: string): boolean => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(e.target as Node)) setUserOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setUserOpen(false);
        setMenuOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  async function handleLogout() {
    try {
      await logout();
      setUserOpen(false);
      setMenuOpen(false);
      navigate("/login", { replace: true });
    } catch (e) {
      console.error("Error al cerrar sesión", e);
    }
  }

  const items = [
    { to: "/", label: "Inicio" },
    { to: "/stock", label: "Stock" },
    { to: "/sales", label: "Ventas" },
    { to: "/payment-management", label: "Abonos" },
    { to: "/daily", label: "Resumen" },
    { to: "/payroll-simple", label: "Asistencia" },
  ];

  const displayName =
    (profile?.firstName || profile?.lastName
      ? `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim()
      : profile?.displayName) ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Usuario";

  const initials = getInitialsFromProfileOrUser(
    profile?.firstName,
    profile?.lastName,
    profile?.displayName ?? user?.displayName ?? null,
    user?.email ?? null
  );

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-gradient-to-r from-[#7a1f96]/80 via-[#8E2DA8]/80 to-[#a84bd1]/80 border-b border-white/20 shadow-[0_8px_20px_rgba(142,45,168,0.25)]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16 text-white">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-[#2FE1EB] via-white to-[#F3E8FF] bg-clip-text text-transparent drop-shadow-[0_1px_8px_rgba(47,225,235,0.35)]">
              InManager
            </span>
          </Link>

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
                      : "text-[#E9D9F7] hover:text-white bg-white/0 hover:bg-white/10",
                  ].join(" ")}
                >
                  <span className="relative z-10">{item.label}</span>
                  <span
                    className={[
                      "absolute left-3 right-3 -bottom-1 h-0.5 rounded-full transition-all",
                      active
                        ? "bg-gradient-to-r from-[#2FE1EB] to-[#F3E8FF] opacity-100"
                        : "opacity-0 group-hover:opacity-60",
                    ].join(" ")}
                  />
                </Link>
              );
            })}

            <div className="relative ml-2" ref={userMenuRef}>
              <button
                onClick={() => setUserOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={userOpen}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 transition focus:outline-none focus:ring-2 focus:ring-white/70"
              >
                <div className="h-8 w-8 rounded-xl bg-white/90 text-[#8E2DA8] font-extrabold grid place-items-center shadow">
                  {initials}
                </div>
                <span className="text-sm font-semibold">{displayName}</span>
                <svg
                  className={`h-4 w-4 transition-transform ${
                    userOpen ? "rotate-180" : ""
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.19l3.71-3.96a.75.75 0 111.08 1.04l-4.25 4.54a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {userOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/20 bg-white/90 backdrop-blur-xl shadow-xl overflow-hidden"
                >
                  <div className="px-4 py-3 text-sm text-gray-700 border-b border-white/30">
                    <div className="font-semibold line-clamp-1">
                      {displayName || "—"}
                    </div>
                    <div className="text-gray-500">
                      {role === "admin" ? "Administrador" : "Sesión activa"}
                    </div>
                  </div>

                  {role === "admin" && (
                    <Link
                      to="/admin"
                      onClick={() => setUserOpen(false)}
                      role="menuitem"
                      className="block px-4 py-3 text-sm font-semibold text-[#8E2DA8] hover:bg-[#8E2DA8]/10"
                    >
                      Panel de administración
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    role="menuitem"
                    className="w-full text-left px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50/80"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            className="md:hidden p-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition focus:outline-none focus:ring-2 focus:ring-white/70"
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

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
                      : "text-[#E9D9F7] hover:text-white hover:bg-white/10",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}

            {role === "admin" && (
              <Link
                to="/admin"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-sm font-semibold text-[#E3D3FF] hover:text-white hover:bg-white/10 border-t border-white/10"
              >
                Panel de administración
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-sm font-semibold text-rose-200 hover:text-rose-600 hover:bg-rose-50/10"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
