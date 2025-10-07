import { Lock, PhoneCall, Users } from "lucide-react";
import { useMemo } from "react";
import { RouterAwareLink } from "./RouterAwareLink";

export function Footer() {
  const year = useMemo(() => new Date().getFullYear(), []);
  return (
    <footer className="bg-white/70 backdrop-blur border-t border-white/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="InManager" className="w-7 h-7" />
            <span className="font-extrabold text-[#8E2DA8]">InManager</span>
          </div>
          <p className="mt-3 text-sm text-gray-600 max-w-sm">
            Plataforma ligera para gestionar inventario, ventas, abonos y
            asistencia. Ideal para micro y pequeñas empresas.
          </p>
        </div>

        <div className="text-sm">
          <h5 className="font-bold mb-2 text-[#8E2DA8]">Enlaces</h5>
          <ul className="space-y-1">
            <li>
              <a className="hover:underline" href="#features">
                Características
              </a>
            </li>
            <li>
              <a className="hover:underline" href="#precios">
                Precios
              </a>
            </li>
            <li>
              <RouterAwareLink
                className="hover:underline"
                to="https://inmanager-b5f4c.web.app/log"
                newTab
              >
                Demo
              </RouterAwareLink>
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <h5 className="font-bold mb-2 text-[#8E2DA8]">Contacto</h5>
          <ul className="space-y-1">
            <li className="flex items-center gap-2">
              <Users className="w-4 h-4" /> Soporte dedicado
            </li>
            <li className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4" /> WhatsApp y correo
            </li>
            <li className="flex items-center gap-2">
              <Lock className="w-4 h-4" /> Política de privacidad
            </li>
          </ul>
        </div>
      </div>
      <div className="text-center text-xs text-gray-500 pb-8">
        © {year} InManager. Todos los derechos reservados.
      </div>
    </footer>
  );
}
