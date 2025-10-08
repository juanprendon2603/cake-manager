import { User, Heart, Cake, Sparkles } from "lucide-react";

export default function AboutSection() {
  return (
    <section id="about" className="py-16 bg-gradient-to-br from-white/70 to-purple-50 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#8E2DA8] mb-6">
          Acerca del creador
        </h2>

        <div className="bg-white/80 backdrop-blur border border-white/60 rounded-3xl p-8 shadow-[0_15px_40px_rgba(142,45,168,0.1)] text-gray-700">
          <div className="flex flex-col items-center gap-3 mb-6">
            <User className="w-10 h-10 text-[#8E2DA8]" />
            <h3 className="text-2xl font-bold">Juan Pablo Rendón</h3>
            <p className="text-sm text-gray-500">Ingeniero de Sistemas & Desarrollador de InManager</p>
          </div>

          <p className="mb-4">
            Nací y crecí en una familia pastelera. Desde siempre he visto de cerca cómo se vive el trabajo en una pastelería: los cuadernos llenos de pedidos, las hojas de Excel con ventas diarias y los cálculos manuales de gastos y ganancias al final del día. Todo anotado a mano, con el riesgo de que algo se pierda o se confunda.
          </p>

          <p className="mb-4">
            Como ingeniero de sistemas e hijo de pastelera, pensé: <span className="italic text-[#8E2DA8]">“¿por qué no hacer una app que nos ayude con todo esto?”</span>. Así nació <strong>InManager</strong>: una herramienta creada para facilitar la gestión de negocios pequeños como el de mi familia, automatizando tareas y evitando el estrés de los números al final del día.
          </p>

          <p className="mb-4">
            Lo que comenzó como una solución para nuestra pastelería se convirtió en una plataforma que hoy puede ayudar a cientos de negocios que viven lo mismo: manejar pedidos, controlar el inventario, registrar abonos y organizar las ventas sin complicaciones.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-4 text-[#8E2DA8]">
            <div className="flex items-center gap-2"><Heart className="w-5 h-5" /> Hecho con dedicación familiar</div>
            <div className="flex items-center gap-2"><Cake className="w-5 h-5" /> Inspirado en una pastelería real</div>
            <div className="flex items-center gap-2"><Sparkles className="w-5 h-5" /> Desarrollado para simplificar tu día</div>
          </div>
        </div>
      </div>
    </section>
  );
}
