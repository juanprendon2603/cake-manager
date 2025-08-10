import { Link } from "react-router-dom";

export function StockHome() {
  return (
    <div className="min-h-screen bg-[#FDF8FF] flex flex-col">
      <main className="flex-grow p-6 sm:p-12 max-w-6xl mx-auto w-full">
        <header className="mb-10 text-center">
          <h1 className="text-5xl font-extrabold text-[#8E2DA8] mb-4">
            Gestión de Stock
          </h1>
          <p className="text-lg text-gray-700">
            Administra y controla tu inventario de manera sencilla
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link
            to="/stock/agregar"
            className="bg-white border border-[#E8D4F2] shadow-md rounded-xl p-6 hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold text-[#8E2DA8] mb-2">
              Agregar Producto
            </h3>
            <p className="text-gray-600 text-sm">
              Añade nuevos productos a tu inventario.
            </p>
          </Link>

          <Link
            to="/stock/listado"
            className="bg-white border border-[#E8D4F2] shadow-md rounded-xl p-6 hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold text-[#8E2DA8] mb-2">
              Ver Inventario
            </h3>
            <p className="text-gray-600 text-sm">
              Consulta y administra los productos existentes.
            </p>
          </Link>
        </section>
      </main>

      <footer className="text-center text-sm text-gray-400 py-4">
        © 2025 CakeManager. Todos los derechos reservados.
      </footer>
    </div>
  );
}
