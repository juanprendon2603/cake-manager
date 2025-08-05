import { Link } from "react-router-dom";

export function StockHome() {
  return (
    <main className="p-8 max-w-3xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-green-700 mb-6">Gestión de Stock</h2>
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
    </main>
  );
}