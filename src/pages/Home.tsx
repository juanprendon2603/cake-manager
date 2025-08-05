import { Link } from "react-router-dom";

export function Home() {
  return (
    <main className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-4xl font-extrabold text-pink-600 mb-6">CakeManager</h1>
      <p className="text-lg text-gray-700 mb-8">
        Bienvenido al sistema de gestión de tu pastelería.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link
          to="/stock"
          className="bg-pink-600 text-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center hover:bg-pink-700 transition"
        >
          <span className="text-xl font-semibold mb-2">Gestión de Stock</span>
          <p className="text-sm text-pink-200 text-center">
            Administra tus productos y cantidades disponibles.
          </p>
        </Link>
        <Link
          to="/sales"
          className="bg-green-600 text-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center hover:bg-green-700 transition"
        >
          <span className="text-xl font-semibold mb-2">Gestión de Ventas</span>
          <p className="text-sm text-green-200 text-center">
            Registra y controla las ventas diarias.
          </p>
        </Link>
        <Link
          to="/summary"
          className="bg-blue-600 text-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center hover:bg-blue-700 transition"
        >
          <span className="text-xl font-semibold mb-2">Resumen Diario</span>
          <p className="text-sm text-blue-200 text-center">
            Consulta el resumen de ventas y gastos por día.
          </p>
        </Link>
      </div>
    </main>
  );
}