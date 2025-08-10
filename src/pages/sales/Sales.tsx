import { Link } from "react-router-dom";

export function Sales() {
  return (
    <div className="min-h-screen bg-[#FDF8FF] flex flex-col">
      <main className="flex-grow p-6 sm:p-12 max-w-6xl mx-auto w-full">
        <header className="mb-10 text-center">
          <h1 className="text-5xl font-extrabold text-[#8E2DA8] mb-4">
            Gestión de Ventas
          </h1>
          <p className="text-lg text-gray-700">
            Elige una acción para continuar
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link
            to="/sales/add-sale"
            className="bg-white border border-[#E8D4F2] shadow-md rounded-xl p-6 hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold text-[#8E2DA8] mb-2">
              Agregar venta
            </h3>
            <p className="text-gray-600 text-sm">
              Registra una nueva venta en el sistema.
            </p>
          </Link>

          <Link
            to="/sales/add-expense"
            className="bg-white border border-[#E8D4F2] shadow-md rounded-xl p-6 hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold text-[#8E2DA8] mb-2">
              Agregar gasto
            </h3>
            <p className="text-gray-600 text-sm">
              Registra un gasto relacionado con la pastelería.
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
