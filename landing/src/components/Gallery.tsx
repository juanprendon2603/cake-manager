export function Gallery() {
  return (
    <section id="vistas" className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-10">
          Una app clara y rápida
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {["Panel", "Inventario", "Ventas"].map((label) => (
            <div
              key={label}
              className="bg-white/80 backdrop-blur border border-white/60 rounded-2xl p-4 shadow"
            >
              <div className="h-48 rounded-lg border border-white/70 bg-gradient-to-br from-white to-purple-50 grid place-items-center text-[#8E2DA8]">
                <span className="font-semibold">Captura: {label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
