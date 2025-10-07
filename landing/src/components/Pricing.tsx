import { BarChart3, Boxes, CheckCircle2, PhoneCall } from "lucide-react";
import { RouterAwareLink } from "./RouterAwareLink";

/**
 * Tres planes:
 * - Mensual
 * - Anual (2 meses gratis)
 * - Pago único
 * Con explicación clara de Firebase gratuito y qué pasa si se supera el límite.
 */

export function Pricing() {
  return (
    <section id="precios" className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-12">
          Planes transparentes
        </h2>

        <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Mensual */}
          <div className="relative rounded-2xl border border-white/60 bg-white/90 backdrop-blur p-8 shadow">
            <div className="absolute -top-3 left-6 text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
              Popular
            </div>
            <h3 className="text-2xl font-bold">Plan Mensual</h3>
            <div className="mt-2 text-5xl font-extrabold">
              $60.000
              <span className="text-lg font-semibold align-super">/mes</span>
            </div>
            <ul className="mt-6 space-y-2 text-sm">
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> App
                completa
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />{" "}
                Actualizaciones incluidas
              </li>
              <li className="flex gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-600" /> Soporte por
                WhatsApp
              </li>
            </ul>
            <div className="mt-6">
              <RouterAwareLink
                to="/checkout?plan=mensual"
                className="block px-5 py-3 rounded-xl bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white text-center"
              >
                Empezar
              </RouterAwareLink>
            </div>
          </div>

          {/* Anual (2 meses gratis) */}
          <div className="rounded-2xl border border-white/60 bg-white/90 backdrop-blur p-8 shadow">
            <h3 className="text-2xl font-bold">Plan Anual</h3>
            <div className="mt-2 text-5xl font-extrabold">$600.000</div>
            <p className="text-xs text-gray-600 mt-1">
              Equivale a <strong>2 meses gratis</strong> respecto al mensual.
            </p>
            <ul className="mt-6 space-y-2 text-sm">
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Todo lo del
                mensual
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Prioridad
                en soporte
              </li>
              <li className="flex gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" /> Reportes
                históricos extendidos
              </li>
            </ul>
            <div className="mt-6">
              <RouterAwareLink
                to="/checkout?plan=anual"
                className="block px-5 py-3 rounded-xl border border-[#8E2DA8]/30 text-[#8E2DA8] bg-white text-center hover:bg-white/80"
              >
                Elegir anual
              </RouterAwareLink>
            </div>
          </div>

          {/* Pago único */}
          <div className="rounded-2xl border border-white/60 bg-white/90 backdrop-blur p-8 shadow">
            <h3 className="text-2xl font-bold">Pago Único</h3>
            <div className="mt-2 text-5xl font-extrabold">$2.800.000</div>
            <ul className="mt-6 space-y-2 text-sm">
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-pink-600" /> Proyecto
                dedicado
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-pink-600" /> Sin
                mensualidades
              </li>
              <li className="flex gap-2">
                <Boxes className="w-4 h-4 text-pink-600" /> Exportación a Excel
                cuando quieras
              </li>
            </ul>
            <div className="mt-6">
              <RouterAwareLink
                to="/checkout?plan=unico"
                className="block px-5 py-3 rounded-xl border border-[#8E2DA8]/30 text-[#8E2DA8] bg-white text-center hover:bg-white/80"
              >
                Comprar
              </RouterAwareLink>
            </div>
          </div>
        </div>

        {/* Aclaración Firebase simple y honesta */}
        <div className="mt-10 max-w-3xl mx-auto text-sm text-gray-700 bg-white/80 backdrop-blur border border-white/60 rounded-2xl p-5">
          <p className="font-semibold mb-2">
            Sobre el almacenamiento (Firebase):
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              La app usa la nube de Google (Firebase). El plan gratuito suele
              cubrir <em>varios años</em> de uso normal.
            </li>
            <li>
              Si algún día superas el límite, te avisamos antes. Puedes:
              <ul className="list-disc pl-5 mt-1">
                <li>
                  Pagar la diferencia (normalmente baja, ~$10.000–$20.000/mes),
                  o
                </li>
                <li>Descargar datos antiguos a Excel y seguir gratis.</li>
              </ul>
            </li>
            <li>
              No hay costos ocultos: tú decides cómo proceder si tu negocio
              crece muchísimo.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
