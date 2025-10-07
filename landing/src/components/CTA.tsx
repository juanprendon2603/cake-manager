import { RouterAwareLink } from "./RouterAwareLink";

export function CTA() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="rounded-3xl bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white p-10 shadow-[0_20px_50px_rgba(142,45,168,0.25)]">
          <h3 className="text-3xl sm:text-4xl font-extrabold">
            Empieza a organizar tu negocio hoy
          </h3>
          <p className="mt-2 text-white/90">
            Configúralo en minutos. Si no te sirve, cancelas cuando quieras.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <RouterAwareLink
              to="/checkout?plan=mensual"
              className="px-6 py-3 rounded-2xl bg-white text-[#8E2DA8] font-semibold"
            >
              Crear mi cuenta
            </RouterAwareLink>
            <RouterAwareLink
              to="https://inmanager-b5f4c.web.app/log"
              newTab
              className="px-6 py-3 rounded-2xl border border-white/80 text-white/95"
            >
              Ver demo
            </RouterAwareLink>
          </div>
        </div>
      </div>
    </section>
  );
}
