import { Link } from "react-router-dom";

export function PaymentManagement() {
    return (
        <main className="p-8 max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-yellow-700 mb-6">Gestión de Abonos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link
              to="/payment-management/add"
              className="bg-green-600 text-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center hover:bg-green-700 transition"
            >
              <span className="text-xl font-semibold mb-2">Agregar Abono</span>
              <p className="text-sm text-green-200 text-center">
                Registra nuevos abonos en el sistema.
              </p>
            </Link>
            <Link
              to="/payment-management/finalize"
              className="bg-blue-600 text-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center hover:bg-blue-700 transition"
            >
              <span className="text-xl font-semibold mb-2">Finalizar Abono</span>
              <p className="text-sm text-blue-200 text-center">
                Completa y procesa los abonos pendientes.
              </p>
            </Link>
          </div>
        </main>
      );
    }