import { Lock, PhoneCall, Users } from "lucide-react";
import { useMemo } from "react";

export function Footer() {
  const year = useMemo(() => new Date().getFullYear(), []);

  const whatsapp =
    "https://wa.me/573168878200?text=Hola!%20Quiero%20m%C3%A1s%20informaci%C3%B3n%20sobre%20InManager.";
  const email = "mailto:juanprendon2603@gmail.com?subject=Consulta%20InManager";

  return (
    <footer className="relative mt-20 border-t border-white/60 bg-white/85 backdrop-blur">
      {/* línea luminosa superior muy sutil */}
      <div className="absolute -top-px inset-x-0 h-px bg-gradient-to-r from-transparent via-[#A855F7]/30 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 grid md:grid-cols-3 gap-10 text-gray-700">
        {/* Marca */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-white border border-white/60 flex items-center justify-center shadow-sm">
              <img
                src="/logo.png"
                alt="InManager"
                className="w-6 h-6 object-contain"
              />
            </div>
            <span className="font-extrabold text-xl bg-gradient-to-r from-[#8E2DA8] to-[#C084FC] bg-clip-text text-transparent">
              InManager
            </span>
          </div>
          <p className="text-sm leading-relaxed text-gray-600">
            Gestiona inventario, ventas, abonos y asistencia en una sola app,
            simple y rápida.
          </p>
          <p className="mt-3 text-xs text-gray-500">
            Desarrollado con 💜 en Colombia.
          </p>
        </div>

        {/* Enlaces */}
        <div>
          <h5 className="font-bold mb-3 text-gray-800">Enlaces</h5>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="#features"
                className="text-gray-600 hover:text-[#8E2DA8] transition-colors"
              >
                Características
              </a>
            </li>
            <li>
              <a
                href="#precios"
                className="text-gray-600 hover:text-[#8E2DA8] transition-colors"
              >
                Precios
              </a>
            </li>
            <li>
              <a
                href="#faq"
                className="text-gray-600 hover:text-[#8E2DA8] transition-colors"
              >
                Preguntas frecuentes
              </a>
            </li>
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <h5 className="font-bold mb-3 text-gray-800">Contacto</h5>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2 text-gray-600">
              <Users className="w-4 h-4 text-[#8E2DA8]" />
              Soporte dedicado
            </li>
            <li className="flex items-start gap-2 text-gray-600">
              <PhoneCall className="w-4 h-4 text-[#8E2DA8] mt-0.5" />
              <div className="flex flex-col">
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#8E2DA8] transition-colors"
                >
                  WhatsApp: 316 887 8200
                </a>
                <a
                  href={email}
                  className="hover:text-[#8E2DA8] transition-colors"
                >
                  juanprendon2603@gmail.com
                </a>
              </div>
            </li>
            <li className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#8E2DA8]" />
              <a
                href="/privacidad"
                className="hover:text-[#8E2DA8] transition-colors"
              >
                Política de privacidad
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Línea inferior */}
      <div className="border-t border-white/60 bg-white/80">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-xs text-gray-500">
          © {year} InManager · Todos los derechos reservados
        </div>
      </div>
    </footer>
  );
}
