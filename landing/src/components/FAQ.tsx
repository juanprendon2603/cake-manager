import React, { useEffect, useMemo, useRef, useState } from "react";

type Faq = {
  q: string;
  a: React.ReactNode;
  tag?: "Próximo";
  id?: string; // para deep-link
};

const RAW_FAQS: Faq[] = [
  {
    q: "¿Qué incluye cada plan?",
    a: (
      <>
        Todos los planes incluyen{" "}
        <strong>acceso total a todas las funcionalidades</strong>: inventario,
        ventas/abonos, asistencia, reportes, multiusuario y datos en la nube. La
        diferencia es la forma de pago: mensual, anual (ahorras 2 meses) o pago
        único.
      </>
    ),
  },
  {
    q: "¿Cómo empiezo?",
    a: (
      <>
        Puedes ir a{" "}
        <a href="#precios" className="underline text-[#8E2DA8]">
          Precios
        </a>{" "}
        y crear tu cuenta, o probar la demo. Te ayudamos a configurar lo básico
        (productos, categorías, usuarios).
      </>
    ),
  },
  {
    q: "¿Necesito instalar algo?",
    a: (
      <>No. InManager es 100% web: funciona en computador, tablet o celular.</>
    ),
  },
  {
    q: "¿Hay soporte?",
    a: (
      <>
        Sí, por <strong>WhatsApp</strong>. Escríbenos y te respondemos lo antes
        posible. También compartimos tips para llevar inventario y cierre diario
        sin enredos.
      </>
    ),
  },
  {
    q: "¿Puedo cancelar cuando quiera?",
    a: (
      <>
        Sí. En el plan mensual puedes cancelar en cualquier momento. En el plan
        anual ya obtienes el descuento por pagar por adelantado.
      </>
    ),
  },
  {
    q: "¿Qué pasa si supero el límite gratuito de Firebase?",
    a: (
      <>
        Te avisamos antes. Tú decides si pagar la diferencia (normalmente baja)
        o descargar datos antiguos para seguir gratis.{" "}
        <em>No hay costos ocultos</em>.
      </>
    ),
  },
  {
    q: "¿Mis datos de quién son?",
    a: (
      <>
        Son tuyos. Puedes solicitar una copia cuando quieras. (Exportación
        directa a Excel/CSV: <strong>Próximo</strong>).
      </>
    ),
    tag: "Próximo",
  },
  {
    q: "¿Puedo importar mis productos/ventas desde Excel?",
    a: (
      <>
        Estamos preparando la importación desde Excel/CSV para que migres más
        rápido. Mientras tanto, te podemos guiar para cargar tus productos de
        forma asistida. (<strong>Próximo</strong>).
      </>
    ),
    tag: "Próximo",
  },
  {
    q: "¿Tienen alertas de stock bajo?",
    a: (
      <>
        En el roadmap inmediato. Podrás definir mínimos por producto y ver
        alertas antes de quedarte sin stock. (<strong>Próximo</strong>).
      </>
    ),
    tag: "Próximo",
  },
  {
    q: "¿Funciona sin internet?",
    a: (
      <>
        Requiere conexión. Si se te cae el internet, puedes anotar temporalmente
        y registrar luego: los datos quedan guardados en la nube.
      </>
    ),
  },
  {
    q: "¿Seguridad y respaldos?",
    a: (
      <>
        Usamos la nube de Google (Firebase) con autenticación. Tus datos están
        respaldados y seguros.
      </>
    ),
  },
  {
    q: "¿Roles y permisos?",
    a: (
      <>
        Sí. <strong>Admin</strong> (configura catálogo, usuarios, reportes,
        nómina) y <strong>Operación</strong> (ventas, abonos, asistencia,
        temperaturas).
      </>
    ),
  },
  {
    q: "¿Cuántos usuarios puedo tener?",
    a: (
      <>
        Puedes crear varios usuarios (admin y operativos). El precio no cambia
        por usuario en esta etapa.
      </>
    ),
  },
];

// slugify simple para id de cada pregunta
const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.length);
  const after = text.slice(idx + query.length);
  return (
    <>
      {before}
      <mark className="bg-yellow-100 text-yellow-800 rounded px-0.5">
        {match}
      </mark>
      <Highlight text={after} query={query} />
    </>
  );
}

export function FAQ() {
  const [query, setQuery] = useState("");
  const [openAll, setOpenAll] = useState<"none" | "all">("none");
  const containerRef = useRef<HTMLDivElement>(null);

  const FAQS = useMemo<Faq[]>(
    () => RAW_FAQS.map((f) => ({ ...f, id: f.id ?? slug(f.q) })),
    []
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return FAQS;
    const q = query.toLowerCase();
    return FAQS.filter((f) => {
      const text = `${f.q} ${typeof f.a === "string" ? f.a : ""}`;
      return text.toLowerCase().includes(q);
    });
  }, [FAQS, query]);

  // deep-link open
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const el = document.getElementById(hash);
    if (!el) return;
    // abrir el <details>
    const details = el.closest("details") as HTMLDetailsElement | null;
    if (details) details.open = true;
    // scroll con margen por navbar
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // manejar abrir/cerrar todo
  useEffect(() => {
    if (!containerRef.current) return;
    const details = Array.from(
      containerRef.current.querySelectorAll("details")
    );
    details.forEach(
      (d) => ((d as HTMLDetailsElement).open = openAll === "all")
    );
  }, [openAll, filtered]);

  return (
    <section id="faq" className="py-16 scroll-mt-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <span
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide
                           text-[#8E2DA8] bg-white/70 backdrop-blur px-3 py-1 rounded-full border border-white/60
                           animate-fade-in-up"
          >
            ¿Dudas?
          </span>
          <h2
            className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 animate-fade-in-up"
            style={{ animationDelay: "70ms" }}
          >
            Preguntas frecuentes
          </h2>

          {/* Search + controls */}
          <div
            className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 animate-fade-in-up"
            style={{ animationDelay: "110ms" }}
          >
            <div className="relative w-full sm:w-[440px]">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar en la FAQ (ej. 'stock', 'roles', 'soporte')"
                className="w-full rounded-xl border border-white/60 bg-white/90 backdrop-blur px-3 py-2
                           text-sm text-gray-800 shadow focus:outline-none focus:ring-2 focus:ring-[#C084FC]/40"
                aria-label="Buscar en la FAQ"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                  aria-label="Limpiar búsqueda"
                >
                  limpiar
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setOpenAll("all")}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-white/80 border border-white/60 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#C084FC]/30"
              >
                Abrir todo
              </button>
              <button
                onClick={() => setOpenAll("none")}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-white/60 border border-white/60 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#C084FC]/30"
              >
                Cerrar todo
              </button>
            </div>
          </div>

          {/* count */}
          <p
            className="mt-2 text-xs text-gray-500 animate-fade-in-up"
            style={{ animationDelay: "130ms" }}
          >
            Mostrando {filtered.length} de {FAQS.length} preguntas
          </p>
        </div>

        {/* List */}
        <div ref={containerRef} className="space-y-3">
          {filtered.map((f, i) => (
            <details
              key={f.id}
              className="group relative bg-white/80 backdrop-blur border border-white/60 rounded-2xl p-4
                         open:shadow-[0_12px_30px_rgba(142,45,168,0.12)] transition animate-fade-in-up"
              style={{ animationDelay: `${i * 35}ms` }}
            >
              {/* borde degradado sutil */}
              <span
                className="pointer-events-none absolute inset-0 rounded-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(142,45,168,0.10), rgba(168,85,247,0.08))",
                  mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                  WebkitMask:
                    "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                  padding: "1px",
                }}
              />
              <summary className="flex items-start justify-between cursor-pointer list-none">
                <div className="flex items-center gap-2 pr-6">
                  <h4
                    id={f.id}
                    className="font-bold text-[#8E2DA8] scroll-mt-28"
                  >
                    <Highlight text={f.q} query={query} />
                  </h4>
                  {f.tag === "Próximo" && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                      Próximo
                    </span>
                  )}
                </div>
                <span
                  className="ml-3 text-gray-500 transition group-open:rotate-180"
                  aria-hidden
                >
                  ⌄
                </span>
              </summary>
              <div className="mt-2 text-gray-700 text-sm leading-relaxed">
                {/* si la respuesta es string, aplica highlight */}
                {typeof f.a === "string" ? (
                  <Highlight text={f.a} query={query} />
                ) : (
                  f.a
                )}
              </div>
            </details>
          ))}
        </div>

        {/* Fallback si no hay resultados */}
        {filtered.length === 0 && (
          <div className="mt-6 text-center text-sm text-gray-600">
            No encontramos resultados para <strong>“{query}”</strong>. Intenta
            con otras palabras.
          </div>
        )}
      </div>
    </section>
  );
}
