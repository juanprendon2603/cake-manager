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
            Bienvenido al sistema de gestión de tu pastelería
          </p>
        </header>
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link
          to="/stock/agregar"
          className="bg-green-600 text-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center hover:bg-green-700 transition"
        >
          <span className="text-xl font-semibold mb-2">Agregar Producto</span>
          <p className="text-sm text-green-200 text-center">
            Añade nuevos productos a tu inventario.
          </p>
        </Link>
        <Link
          to="/stock/listado"
          className="bg-blue-600 text-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center hover:bg-blue-700 transition"
        >
          <span className="text-xl font-semibold mb-2">Ver Inventario</span>
          <p className="text-sm text-blue-200 text-center">
            Consulta y administra los productos existentes.
          </p>
        </Link>
      </div>
      </section>

    </main>
    </div>

  );
}