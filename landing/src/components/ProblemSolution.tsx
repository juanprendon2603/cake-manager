import {
  ClipboardList,
  FileWarning,
  NotebookPen,
  Receipt,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";

const problemas = [
  { icon: FileWarning, text: "Inventario en Excel que nadie actualiza" },
  { icon: NotebookPen, text: "Ventas anotadas en WhatsApp o libretas" },
  { icon: Receipt, text: "Abonos que se pierden en el camino" },
  { icon: ClipboardList, text: "Sin cierre diario claro ni orden" },
];

const soluciones = [
  {
    icon: RefreshCcw,
    text: "Un solo lugar: inventario, ventas, abonos y asistencia",
  },
  {
    icon: ShieldCheck,
    text: "Datos seguros y disponibles desde cualquier dispositivo",
  },
  { icon: Receipt, text: "Ventas y abonos rápidos, con historial y fechas" },
  { icon: ClipboardList, text: "Cierre de día simple con checklist (próximo)" },
];

export function ProblemSolution() {
  return (
    <section className="relative py-18 sm:py-20">
      {/* fondo suave */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* título centrado */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#8E2DA8] bg-white/70 backdrop-blur px-3 py-1 rounded-full border border-white/60 animate-fade-in-up">
            Problema → Solución
          </span>
          <h2
            className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 animate-fade-in-up"
            style={{ animationDelay: "80ms" }}
          >
            ¿Esto te suena?{" "}
            <span className="text-[#8E2DA8]">Así te ayuda InManager</span>
          </h2>
          <p
            className="mt-2 text-gray-600 max-w-2xl mx-auto animate-fade-in-up"
            style={{ animationDelay: "120ms" }}
          >
            Menos archivos sueltos, más control en una sola app.
          </p>
        </div>

        {/* tarjetas problema / solución */}
        <div className="grid md:grid-cols-[1fr_auto_1fr] items-center gap-6 md:gap-10">
          {/* columna problemas */}
          <div
            className="bg-white/80 backdrop-blur p-6 rounded-2xl border border-white/60 shadow animate-fade-in-up"
            style={{ animationDelay: "140ms" }}
          >
            <h3 className="text-xl font-extrabold text-rose-600 flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500" />
              Dolor del día a día
            </h3>
            <ul className="mt-4 space-y-3">
              {problemas.map((p, i) => (
                <li key={i} className="flex items-start gap-3 group">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 border border-rose-100">
                    <p.icon className="w-5 h-5 text-rose-600" />
                  </div>
                  <span className="text-gray-700 leading-snug">{p.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* flecha/indicador entre columnas */}
          <div className="hidden md:flex flex-col items-center justify-center">
            <div
              className="w-12 h-12 rounded-2xl bg-white/80 border border-white/60 backdrop-blur grid place-items-center shadow animate-fade-in-up"
              style={{ animationDelay: "160ms" }}
            >
              <span className="text-[#8E2DA8] text-xl">→</span>
            </div>
          </div>

          {/* columna soluciones */}
          <div
            className="bg-white/90 backdrop-blur p-6 rounded-2xl border border-white/60 shadow animate-fade-in-up"
            style={{ animationDelay: "180ms" }}
          >
            <h3 className="text-xl font-extrabold text-emerald-600 flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Lo resolvemos así
            </h3>
            <ul className="mt-4 space-y-3">
              {soluciones.map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100">
                    <s.icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-gray-700 leading-snug">{s.text}</span>
                </li>
              ))}
            </ul>

            {/* CTA pequeño dentro de la tarjeta */}
            <div className="mt-5">
              <a
                href="#precios"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] shadow hover:shadow-lg transition focus:outline-none focus:ring-2 focus:ring-[#C084FC]/50"
              >
                Empezar ahora
              </a>
            </div>
          </div>
        </div>

        {/* flecha vertical para móvil */}
        <div
          className="md:hidden grid place-items-center mt-4 animate-fade-in-up"
          style={{ animationDelay: "200ms" }}
        >
          <span className="text-[#8E2DA8] text-2xl">↓</span>
        </div>
      </div>
    </section>
  );
}
