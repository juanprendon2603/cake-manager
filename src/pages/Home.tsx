import { Link } from "react-router-dom";
import logoUrl from "../assets/logo.png";

export function Home() {
  return (
    <div className="min-h-screen bg-[#FDF8FF] flex flex-col">
      <main className="flex-grow p-6 sm:p-12 max-w-6xl mx-auto w-full">
        <header className="mb-10 text-center">
          <div className="mx-auto mb-5 w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white border border-[#E8D4F2] shadow flex items-center justify-center overflow-hidden">
            <img
              src={logoUrl}
              alt="CakeManager logo"
              className="w-20 h-20 object-contain"
              loading="eager"
              decoding="async"
            />
          </div>

          <h1 className="text-5xl font-extrabold text-[#8E2DA8] mb-4">
            CakeManager
          </h1>
          <p className="text-lg text-gray-700">
            Bienvenido al sistema de gestión de tu pastelería
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { to: "/stock", title: "Gestión de Stock", desc: "Administra tus productos y cantidades disponibles." },
            { to: "/sales", title: "Gestión de Ventas", desc: "Registra y controla las ventas diarias." },
            { to: "/daily", title: "Resumen Diario", desc: "Consulta el resumen de ventas y gastos por día." },
            { to: "/payment-management", title: "Gestión de Abonos", desc: "Registra y finaliza abonos de pedidos." },
            { to: "/payroll-simple", title: "Gestión de Asistencia", desc: "Registra la asistencia." },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="bg-white border border-[#E8D4F2] shadow-md rounded-xl p-6 hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold text-[#8E2DA8] mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </Link>
          ))}
        </section>
      </main>

      <footer className="text-center text-sm text-gray-400 py-4">
        © 2025 CakeManager. Todos los derechos reservados.
      </footer>
    </div>
  );
}