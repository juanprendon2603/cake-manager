import { useEffect, useMemo, useRef, useState } from "react";
import { Send, X } from "lucide-react";

type Props = {
  /** Número en formato internacional (sin +). Ej: 573168878200 */
  phone?: string;
  /** Ruta al logo (tú subes el tuyo). Ej: /whatsapp.png */
  logoSrc?: string;
  /** Mensaje por defecto */
  defaultMessage?: string;
};

export function WhatsAppWidget({
  phone = "573168878200",
  logoSrc = "/whatsapp.png",
  defaultMessage = "¡Hola! Estoy interesado en InManager y quiero más información.",
}: Props) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState(defaultMessage);
  const panelRef = useRef<HTMLDivElement>(null);

  // Solo el mensaje
  const waLink = useMemo(() => {
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  }, [msg, phone]);

  // Cerrar con ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Cerrar si clickea fuera del panel
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement;
        if (target.closest("#wa-widget-button")) return;
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <>
      {/* Botón flotante: grande en mobile, original en desktop */}
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
        <button
          id="wa-widget-button"
          type="button"
          onClick={() => setOpen((s) => !s)}
          className={`
            flex items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110
            focus:outline-none ring-2 ring-white/60
            w-16 h-16 md:w-14 md:h-14
          `}
          style={{ backgroundColor: "#25D366" }}
          aria-label="Abrir chat de WhatsApp"
        >
          <img
            src={logoSrc}
            alt="WhatsApp"
            className={`
              object-contain pointer-events-none
              w-9 h-9 md:w-12 md:h-12 md:scale-[2.5]
            `}
            referrerPolicy="no-referrer"
          />
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/0" aria-hidden="true" />
      )}

      {/* Panel tipo chat: ancho casi completo en mobile, 320px en desktop (como antes) */}
      <div
        className={`
          fixed z-50
          bottom-[100px] right-4
          md:bottom-24 md:right-6
          transition-all
          ${open ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-3"}
          w-[94vw] max-w-[94vw]
          md:w-[320px] md:max-w-[92vw]
        `}
        ref={panelRef}
        role="dialog"
        aria-label="Chat de WhatsApp"
      >
        <div className="overflow-hidden rounded-2xl shadow-2xl border border-white/60 bg-white/95 backdrop-blur">
          {/* Header estilo WhatsApp: grande en mobile, EXACTO en desktop */}
          <div
            className="
              flex items-center justify-between text-white
              px-4 py-3
            "
            style={{ background: "linear-gradient(90deg, #128C7E 0%, #25D366 100%)" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 md:w-8 md:h-8 rounded-full bg-white/20 grid place-items-center">
                <img
                  src="/logo.png"
                  alt="InManager"
                  className="w-5 h-5"
                />
              </div>
              <div>
                {/* Mobile más grande; desktop vuelve a text-sm como antes */}
                <div className="font-semibold text-base md:text-sm">
                  Soporte InManager
                </div>
                <div className="opacity-90 text-[12px] md:text-[11px]">
                  Normalmente responde en minutos
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded bg-white/20 hover:bg-white/30 transition"
              aria-label="Cerrar chat"
            >
              <X className="w-5 h-5 md:w-4 md:h-4 text-white" />
            </button>
          </div>

          {/* Mensaje inicial: mobile más legible; desktop igual que antes */}
          <div className="p-3 bg-gray-50">
            <div className="max-w-[90%] md:max-w-[85%] rounded-2xl rounded-bl-sm bg-white border border-gray-200 px-3 py-2 text-base md:text-sm text-gray-800 shadow-sm">
              ¡Hola! 👋 ¿Deseas más información sobre InManager?
            </div>
          </div>

          {/* Input + enviar: mobile grande; desktop vuelve a px-3 py-2 text-sm */}
          <form
            className="p-3 bg-white flex items-center gap-2 border-t border-gray-100"
            onSubmit={(e) => {
              e.preventDefault();
              window.open(waLink, "_blank", "noopener,noreferrer");
            }}
          >
            <input
              className="
                flex-1 rounded-xl border border-gray-300 bg-white outline-none
                focus:ring-2 focus:ring-[#A855F7] focus:border-transparent
                px-4 py-3 text-base
                md:px-3 md:py-2 md:text-sm
              "
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Escribe tu mensaje…"
              inputMode="text"
              enterKeyHint="send"
            />
            <button
              type="submit"
              className="
                inline-flex items-center justify-center rounded-xl text-white shadow
                px-4 py-3
                md:px-3 md:py-2
              "
              style={{ backgroundColor: "#25D366" }}
              aria-label="Enviar por WhatsApp"
              title="Enviar por WhatsApp"
            >
              <Send className="w-5 h-5 md:w-4 md:h-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
