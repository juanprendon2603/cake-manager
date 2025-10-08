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

  // ✅ Solo el mensaje, sin agregar "Página: ..."
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
      {/* Botón flotante */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative group">
          <button
            id="wa-widget-button"
            type="button"
            onClick={() => setOpen((s) => !s)}
            className="flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform hover:scale-110 focus:outline-none ring-2 ring-white/60"
            style={{ backgroundColor: "#25D366" }}
            aria-label="Abrir chat de WhatsApp"
          >
            <img
              src={logoSrc}
              alt="WhatsApp"
              className="w-12 h-12 scale-[2.5] object-contain pointer-events-none"
              referrerPolicy="no-referrer"
            />
          </button>
        </div>
      </div>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/0" aria-hidden="true" />
      )}

      {/* Panel tipo chat */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[320px] max-w-[92vw] transition-all ${
          open ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-3"
        }`}
        ref={panelRef}
        role="dialog"
        aria-label="Chat de WhatsApp"
      >
        <div className="overflow-hidden rounded-2xl shadow-2xl border border-white/60 bg-white/95 backdrop-blur">
          {/* Header estilo WhatsApp */}
          <div
            className="px-4 py-3 flex items-center justify-between text-white"
            style={{ background: "linear-gradient(90deg, #128C7E 0%, #25D366 100%)" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 grid place-items-center">
                <img src="/logo.png" alt="InManager" className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">Soporte InManager</div>
                <div className="text-[11px] opacity-90">Normalmente responde en minutos</div>
              </div>
            </div>
            <button
  type="button"
  onClick={() => setOpen(false)}
  className="p-1 rounded bg-white/20 hover:bg-white/30 transition"
  aria-label="Cerrar chat"
>
  <X className="w-4 h-4 text-white" />
</button>

          </div>

          {/* Mensaje inicial */}
          <div className="p-3 bg-gray-50">
            <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white border border-gray-200 px-3 py-2 text-sm text-gray-800 shadow-sm">
              ¡Hola! 👋 ¿Deseas más información sobre InManager?
            </div>
          </div>

          {/* Input + enviar */}
          <form
            className="p-3 bg-white flex items-center gap-2 border-t border-gray-100"
            onSubmit={(e) => {
              e.preventDefault();
              window.open(waLink, "_blank", "noopener,noreferrer");
            }}
          >
            <input
              className="flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Escribe tu mensaje…"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-white shadow"
              style={{ backgroundColor: "#25D366" }}
              aria-label="Enviar por WhatsApp"
              title="Enviar por WhatsApp"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
