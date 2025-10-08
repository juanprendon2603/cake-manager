import React from "react";

type Faq = {
  q: string;
  a: React.ReactNode;
  tag?: "Próximo";
};

const FAQS: Faq[] = [
  {
    q: "¿Qué incluye cada plan?",
    a: (
      <>
        Todos los planes incluyen <strong>acceso total a todas las funcionalidades</strong>:
        inventario, ventas/abonos, asistencia, reportes, multiusuario y datos en la nube.
        La diferencia es la forma de pago: mensual, anual (ahorras 2 meses) o pago único.
      </>
    ),
  },
  {
    q: "¿Cómo empiezo?",
    a: (
      <>
        Puedes ir a <a href="#precios" className="underline text-[#8E2DA8]">Precios</a> y crear tu cuenta,
        o probar la demo. Te ayudamos a configurar lo básico (productos, categorías, usuarios).
      </>
    ),
  },
  {
    q: "¿Necesito instalar algo?",
    a: <>No. InManager es 100% web: funciona en computador, tablet o celular.</>,
  },
  {
    q: "¿Hay soporte?",
    a: (
      <>
        Sí, por <strong>WhatsApp</strong>. Escríbenos y te respondemos lo antes posible.
        También compartimos tips para llevar inventario y cierre diario sin enredos.
      </>
    ),
  },
  {
    q: "¿Puedo cancelar cuando quiera?",
    a: (
      <>
        Sí. En el plan mensual puedes cancelar en cualquier momento. En el plan anual
        ya obtienes el descuento por pagar por adelantado.
      </>
    ),
  },
  {
    q: "¿Qué pasa si supero el límite gratuito de Firebase?",
    a: (
      <>
        Te avisamos antes. Tú decides si pagar la diferencia (normalmente baja) o descargar
        datos antiguos para seguir gratis. <em>No hay costos ocultos</em>.
      </>
    ),
  },
  {
    q: "¿Mis datos de quién son?",
    a: (
      <>
        Son tuyos. Puedes solicitar una copia cuando quieras. (Exportación directa a Excel/CSV:{" "}
        <strong>Próximo</strong>).
      </>
    ),
    tag: "Próximo",
  },
  {
    q: "¿Puedo importar mis productos/ventas desde Excel?",
    a: (
      <>
        Estamos preparando la importación desde Excel/CSV para que migres más rápido. Mientras tanto,
        te podemos guiar para cargar tus productos de forma asistida. (<strong>Próximo</strong>).
      </>
    ),
    tag: "Próximo",
  },
  {
    q: "¿Tienen alertas de stock bajo?",
    a: (
      <>
        En el roadmap inmediato. Podrás definir mínimos por producto y ver alertas antes de quedarte sin stock. (<strong>Próximo</strong>).
      </>
    ),
    tag: "Próximo",
  },
  {
    q: "¿Cierre de turno con checklist/firma?",
    a: (
      <>
        Planeado. Cierre con checklist (caja, desperdicios, limpieza) y confirmación para auditoría. (<strong>Próximo</strong>).
      </>
    ),
    tag: "Próximo",
  },
  {
    q: "¿Funciona sin internet?",
    a: (
      <>
        Requiere conexión. Si se te cae el internet, puedes anotar temporalmente y registrar luego:
        los datos quedan guardados en la nube.
      </>
    ),
  },
  {
    q: "¿Seguridad y respaldos?",
    a: (
      <>
        Usamos la nube de Google (Firebase) con autenticación. Tus datos están respaldados y seguros.
      </>
    ),
  },
  {
    q: "¿Roles y permisos?",
    a: (
      <>
        Sí. <strong>Admin</strong> (configura catálogo, usuarios, reportes, nómina) y{" "}
        <strong>Operación</strong> (ventas, abonos, asistencia, temperaturas).
      </>
    ),
  },
  {
    q: "¿Cuántos usuarios puedo tener?",
    a: (
      <>
        Puedes crear varios usuarios (admin y operativos). El precio no cambia por usuario en esta etapa.
      </>
    ),
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-10">
          Preguntas frecuentes
        </h2>

        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <details
              key={i}
              className="group bg-white/80 backdrop-blur border border-white/60 rounded-2xl p-4 open:shadow-[0_12px_30px_rgba(142,45,168,0.12)] transition"
            >
              <summary className="flex items-start justify-between cursor-pointer list-none">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-[#8E2DA8]">{f.q}</h4>
                  {f.tag === "Próximo" && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                      Próximo
                    </span>
                  )}
                </div>
                <span className="ml-3 text-gray-500 transition group-open:rotate-180">⌄</span>
              </summary>
              <div className="mt-2 text-gray-700 text-sm">{f.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
