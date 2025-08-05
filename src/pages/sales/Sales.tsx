import { Link } from "react-router-dom";

export function Sales() {
  return (
    <main className="p-8 max-w-3xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-blue-700 mb-6">Gestión de Ventas</h2>
      <p className="text-gray-700 mb-6">Elige una acción para continuar:</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link
          to="/sales/add-sale"
          className="bg-blue-600 text-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center hover:bg-blue-700 transition"
        >
          <span className="text-xl font-semibold mb-2">Agregar venta</span>
          <p className="text-sm text-blue-200 text-center">
            Registra una nueva venta en el sistema.
          </p>
        </Link>

        <Link
          to="/sales/add-payment"
          className="bg-green-600 text-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center hover:bg-green-700 transition"
        >
          <span className="text-xl font-semibold mb-2">Agregar abono</span>
          <p className="text-sm text-green-200 text-center">
            Registra un abono sin descontar stock.
          </p>
        </Link>

        <Link
          to="/sales/add-expense"
          className="bg-red-600 text-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center hover:bg-red-700 transition"
        >
          <span className="text-xl font-semibold mb-2">Agregar gasto</span>
          <p className="text-sm text-red-200 text-center">
            Registra un gasto relacionado con la pastelería.
          </p>
        </Link>
      </div>
    </main>
  );
}