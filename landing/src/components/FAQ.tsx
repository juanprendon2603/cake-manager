const FAQS = [
  {
    q: "¿Necesito instalar algo?",
    a: "No. InManager es web: entra desde tu celular o computador y listo.",
  },
  {
    q: "¿Puedo migrar mis datos?",
    a: "Sí. Puedes importar desde Excel/CSV y exportar tus reportes cuando quieras.",
  },
  {
    q: "¿Qué pasa si supero el límite gratuito?",
    a: "Te avisamos antes. Tú decides si pagas la diferencia o descargas datos viejos para seguir gratis.",
  },
  {
    q: "¿Puedo personalizar la app?",
    a: "Claro, adaptamos etiquetas, campos y flujos a tu operación.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-10">
          Preguntas frecuentes
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {FAQS.map((f, i) => (
            <div
              key={i}
              className="bg-white/80 backdrop-blur border border-white/60 rounded-2xl p-6"
            >
              <h4 className="font-bold text-[#8E2DA8]">{f.q}</h4>
              <p className="mt-1 text-gray-700 text-sm">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
