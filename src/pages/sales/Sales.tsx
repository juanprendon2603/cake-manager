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

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              to: "/sales/add-sale",
              title: "Agregar venta",
              description: "Registra una nueva venta en el sistema.",
            },
            {
              to: "/sales/add-expense",
              title: "Agregar gasto",
              description: "Registra un gasto relacionado con la pastelería.",
            },
            {
              to: "/sales/add-general-expense",
              title: "Agregar gasto general",
              description: "Registra un gasto general de la pastelería.",
            },
          ].map((item, idx) => (
            <Link
              key={idx}
              to={item.to}
              className="bg-white border border-[#E8D4F2] shadow-md rounded-xl p-6 flex flex-col justify-between min-h-[160px] hover:shadow-lg transition"
            >
              <div>
                <h3 className="text-xl font-semibold text-[#8E2DA8] mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
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
