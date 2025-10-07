  import React from "react";

  interface Feature {
    title: string;
    desc: string;
  }

  const App: React.FC = () => {
    const features: Feature[] = [
      {
        title: "Control de pedidos",
        desc: "Lleva el registro de todos tus pedidos con fechas, estados y clientes.",
      },
      {
        title: "Inventario fácil",
        desc: "Agrega y descuenta productos automáticamente con cada venta.",
      },
      {
        title: "Reportes diarios",
        desc: "Visualiza ventas, ganancias y productos más vendidos con un clic.",
      },
    ];

    return (
      <div className="min-h-screen bg-pastel-pink text-pastel-brown font-sans">
        {/* Hero */}
        <header className="text-center py-16 px-4 bg-white shadow-md">
          <h1 className="text-4xl font-bold mb-2">Sistema para Pastelerías</h1>
          <p className="text-lg max-w-2xl mx-auto">
            Administra tus pedidos, clientes, inventario y ventas desde cualquier
            lugar. Todo en una app sencilla y hecha para pastelerías pequeñas.
          </p>
          <a
            href="#planes"
            className="mt-6 inline-block bg-pastel-brown text-white px-6 py-3 rounded-full hover:bg-opacity-90 transition"
          >
            Ver planes
          </a>
        </header>

        {/* Sección de características */}
        <section className="py-16 px-6 max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10">¿Qué puedes hacer con la app?</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {features.map((item, i) => (
              <div key={i} className="bg-white shadow-md p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Sección de planes */}
        <section id="planes" className="py-16 bg-white px-6">
          <h2 className="text-3xl font-bold text-center mb-10">
            Planes disponibles
          </h2>
          <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
            {/* Plan mensual */}
            <div className="p-8 border rounded-2xl shadow-sm text-center">
              <h3 className="text-2xl font-bold mb-4">Plan Mensual</h3>
              <p className="text-5xl font-bold mb-2">$50.000</p>
              <p className="mb-4 text-sm text-gray-600">por mes</p>
              <ul className="text-left mb-6 space-y-2">
                <li>✅ App completa personalizada</li>
                <li>✅ Actualizaciones incluidas</li>
                <li>✅ Hasta 5 GB de almacenamiento</li>
                <li>⚠️ Si supera el límite, se cobra según uso de Firebase</li>
              </ul>
              <button className="bg-pastel-brown text-white px-6 py-3 rounded-full hover:bg-opacity-90 transition">
                Empezar ahora
              </button>
            </div>

            {/* Plan único */}
            <div className="p-8 border rounded-2xl shadow-sm text-center bg-pastel-pink">
              <h3 className="text-2xl font-bold mb-4">Pago Único</h3>
              <p className="text-5xl font-bold mb-2">$800.000</p>
              <p className="mb-4 text-sm text-gray-600">pago único</p>
              <ul className="text-left mb-6 space-y-2">
                <li>✅ App personalizada solo para ti</li>
                <li>✅ Sin mensualidad</li>
                <li>⚠️ Límite de 5 GB en Firebase</li>
                <li>
                  💾 Si llegas al límite, puedes exportar los datos a Excel o pagar almacenamiento extra.
                </li>
              </ul>
              <button className="bg-pastel-brown text-white px-6 py-3 rounded-full hover:bg-opacity-90 transition">
                Comprar
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 text-center bg-pastel-brown text-white">
          <p>© {new Date().getFullYear()} RAZE | Sistema para Pastelerías</p>
          <p className="text-sm mt-2">Desarrollado por Juan Pablo Rendón</p>
        </footer>
      </div>
    );
  };

  export default App;
