import { CTA } from "../components/CTA";
import { FAQ } from "../components/FAQ";
import { Features } from "../components/Features";
import { Footer } from "../components/Footer";
import { Gallery } from "../components/Gallery";
import { Hero } from "../components/Hero";
import { Navbar } from "../components/Navbar";
import { Pricing } from "../components/Pricing";

export default function InManagerLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 text-gray-900">
      <Navbar />
      <Hero />
      {/* bloque problema -> solución (opcional mantener en piezas separadas) */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 items-center">
          <div className="bg-white/80 backdrop-blur p-6 rounded-2xl border border-white/60 shadow">
            <h2 className="text-2xl font-extrabold text-[#8E2DA8]">
              ¿Te suena?
            </h2>
            <ul className="mt-4 space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span>•</span> Inventario en Excel que nadie actualiza.
              </li>
              <li className="flex gap-3">
                <span>•</span> Ventas anotadas en WhatsApp o libretas.
              </li>
              <li className="flex gap-3">
                <span>•</span> Abonos que se pierden en el camino.
              </li>
              <li className="flex gap-3">
                <span>•</span> No hay un cierre diario claro.
              </li>
            </ul>
          </div>
          <div className="bg-white/80 backdrop-blur p-6 rounded-2xl border border-white/60 shadow">
            <h3 className="text-2xl font-extrabold text-[#8E2DA8]">
              La solución
            </h3>
            <p className="mt-4 text-gray-700">
              InManager integra todo en un panel simple: productos, ventas,
              abonos y equipo. Registra rápido, consulta al momento y obtén
              reportes sin peleas.
            </p>
          </div>
        </div>
      </section>

      <Features />
      <Gallery />
      <Pricing />
      <CTA />
      <FAQ />
      <Footer />
    </div>
  );
}
