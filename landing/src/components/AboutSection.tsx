import {
  Cake,
  Clock,
  Heart,
  Lightbulb,
  Quote,
  Rocket,
  Sparkles,
} from "lucide-react";

export default function AboutSection() {
  return (
    <section id="about" className="relative py-16 sm:py-20">
      {/* fondo suave */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-transparent" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* título */}
        <div className="text-center mb-8 animate-fade-in-up">
          <span
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide
                           text-[#8E2DA8] bg-white/70 backdrop-blur px-3 py-1 rounded-full border border-white/60"
          >
            Acerca del creador
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            Una app hecha en casa, para negocios reales
          </h2>
        </div>

        {/* card principal */}
        <article
          className="relative rounded-3xl bg-white/90 backdrop-blur p-6 sm:p-8 border border-white/60 shadow
                            animate-fade-in-up"
          style={{ animationDelay: "80ms" }}
        >
          {/* borde degradado sutil */}
          <span
            className="pointer-events-none absolute inset-0 rounded-3xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(142,45,168,0.14), rgba(168,85,247,0.10))",
              mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMask:
                "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              padding: "1px",
            }}
          />

          {/* header autor */}
          <header className="flex flex-col items-center text-center">
            {/* avatar / placeholder (reemplaza src si quieres) */}
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-purple-200 shadow mb-3">
              <img
                src="/avatar.jpg" /* coloca aquí tu foto o deja un placeholder */
                alt="Juan Pablo Rendón"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/logo.png";
                }}
              />
            </div>

            <h3 className="text-2xl font-bold text-gray-900">
              Juan Pablo Rendón
            </h3>
            <p className="text-sm text-gray-500">
              Ingeniero de Sistemas · Creador de InManager
            </p>

            {/* badges */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[#8E2DA8]">
              <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-purple-50 border border-purple-100">
                <Cake className="w-4 h-4" /> Inspirado en una pastelería real
              </span>
              <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-pink-50 border border-pink-100">
                <Heart className="w-4 h-4" /> Hecho con dedicación familiar
              </span>
              <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100">
                <Sparkles className="w-4 h-4" /> Menos Excel, más acción
              </span>
            </div>
          </header>

          {/* quote */}
          <blockquote className="mt-6 relative rounded-2xl bg-gradient-to-br from-purple-50 to-white border border-purple-100 p-5">
            <Quote className="w-5 h-5 text-[#8E2DA8]" />
            <p className="mt-2 text-gray-700 leading-relaxed">
              Nací y crecí en una familia pastelera. El día a día era cuadernos
              con ventas, hojas de Excel y cuentas al final de la jornada.
              Pensé:{" "}
              <span className="italic text-[#8E2DA8]">
                “¿por qué no crear una app que nos quite ese peso?”
              </span>
              . Así nació <strong>InManager</strong>: para automatizar lo
              repetitivo y dejar más tiempo a lo importante: el producto y los
              clientes.
            </p>
          </blockquote>

          {/* timeline de la historia */}
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Clock className="w-4 h-4 text-[#8E2DA8]" /> El problema
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Inventario y ventas dispersos: cuaderno, WhatsApp, Excel… y
                cierres diarios lentos.
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Lightbulb className="w-4 h-4 text-[#8E2DA8]" /> La idea
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Un solo panel: stock, ventas, abonos, asistencia y reportes
                listos en minutos.
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Rocket className="w-4 h-4 text-[#8E2DA8]" /> Hoy
              </div>
              <p className="mt-1 text-sm text-gray-600">
                InManager ayuda a micro y pequeñas empresas a trabajar ordenadas
                sin complicaciones.
              </p>
            </div>
          </div>

          {/* CTA inferior */}
          <footer className="mt-6 text-center">
            <a
              href="#precios"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white
                         bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] shadow hover:shadow-lg transition
                         focus:outline-none focus:ring-2 focus:ring-[#C084FC]/50"
            >
              Empezar con InManager
            </a>
            <p className="mt-2 text-xs text-gray-500">
              ¿Tienes dudas? Escríbeme por WhatsApp desde el botón flotante.
            </p>
          </footer>
        </article>
      </div>
    </section>
  );
}
