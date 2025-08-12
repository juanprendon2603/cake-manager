import logoUrl from "../assets/logo.png";

type FullScreenLoaderProps = {
  message?: string;
};

export function FullScreenLoader({ message = "Cargando CakeManager..." }: FullScreenLoaderProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#FDF8FF]"
      role="dialog"
      aria-modal="true"
      aria-label="Pantalla de carga"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full blur-3xl opacity-30"
          style={{ background: "radial-gradient(circle at center, #E8D4F2, transparent 60%)" }} />
        <div className="absolute -bottom-24 -right-10 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-30"
          style={{ background: "radial-gradient(circle at center, #8E2DA8, transparent 60%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[46rem] h-[46rem] rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(circle at center, #E8D4F2, transparent 60%)" }} />
      </div>

      <div className="relative mx-4 w-full max-w-sm rounded-2xl border border-[#E8D4F2] bg-white/80 backdrop-blur shadow-xl p-8 text-center">
        <div className="mx-auto mb-6 w-24 h-24 rounded-2xl bg-white border border-[#E8D4F2] shadow flex items-center justify-center overflow-hidden">
          <img
            src={logoUrl}
            alt="CakeManager logo"
            className="w-16 h-16 object-contain"
            loading="eager"
            decoding="async"
          />
        </div>

        <div className="relative mx-auto h-24 w-24 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-[#E8D4F2] border-t-transparent animate-spin"
            style={{ animationDuration: "1.2s" }} />
          <div className="absolute inset-2 rounded-full border-4 border-[#8E2DA8] border-b-transparent animate-spin"
            style={{ animationDuration: "1.8s", animationDirection: "reverse" as const }} />
          <div className="absolute inset-4 rounded-full border-4 border-dashed border-[#E8D4F2] animate-spin"
            style={{ animationDuration: "2.4s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-[#8E2DA8]" />
        </div>

        <h2 className="text-2xl font-extrabold text-[#8E2DA8] mb-1">CakeManager</h2>
        <p className="text-sm text-gray-700 mb-4">{message}</p>

        <div className="h-2 w-full rounded-full bg-[#F3E8FB] overflow-hidden">
          <div className="h-full w-1/3 bg-gradient-to-r from-[#8E2DA8] via-[#B35BC7] to-[#E8D4F2] animate-[progress_1.8s_ease-in-out_infinite]" />
        </div>

        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {message}
        </div>
      </div>

      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(20%); }
          100% { transform: translateX(100%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-spin { animation: none !important; }
          .animate-[progress_1.8s_ease-in-out_infinite] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}