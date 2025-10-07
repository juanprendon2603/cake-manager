import * as React from "react";

type FullScreenLoaderProps = {
  message?: string;
  appName?: string;
  logoUrl?: string;
  tips?: string[];
  progress?: number;
};

type CSSVars = {
  "--brand-1": string;
  "--brand-2": string;
  "--bg-from": string;
  "--bg-to": string;
};

export function FullScreenLoader({
  message = "Cargando…",
  appName = "InManager",
  logoUrl,
  tips,
  progress,
}: FullScreenLoaderProps) {
  const [tipIndex, setTipIndex] = React.useState(0);
  const [revealedLetters, setRevealedLetters] = React.useState(0);

  // Tips rotativos
  React.useEffect(() => {
    if (!tips?.length) return;
    const id = setInterval(() => setTipIndex(i => (i + 1) % tips.length), 3200);
    return () => clearInterval(id);
  }, [tips]);

  // Efecto de letras cayendo (aparece una a una)
  React.useEffect(() => {
    setRevealedLetters(0);
    const total = appName.length;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setRevealedLetters(v => (v < total ? v + 1 : v));
      if (i >= total) clearInterval(id);
    }, 100);
    return () => clearInterval(id);
  }, [appName]);

  const clamped =
    typeof progress === "number" ? Math.max(0, Math.min(1, progress)) : undefined;

  // 🎨 Paleta unificada por CSS vars (ajústalas desde el padre si quieres)
  const rootStyle: React.CSSProperties & CSSVars = {
    "--brand-1": "#7a1f96",
    "--brand-2": "#8E2DA8",
    "--bg-from": "#F8FAFC",
    "--bg-to": "#EEF2FF",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Pantalla de carga"
      style={rootStyle}
    >
      {/* Fondo aurora */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-from)] to-[var(--bg-to)]" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-24 -left-16 w-80 h-80 rounded-full blur-3xl opacity-30 animate-softPulse"
          style={{
            background:
              "radial-gradient(circle at center, var(--brand-1), transparent 60%)",
          }}
        />
        <div
          className="absolute -bottom-24 -right-10 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-25 animate-softPulse2"
          style={{
            background:
              "radial-gradient(circle at center, var(--brand-2), transparent 60%)",
          }}
        />
      </div>

      {/* Card principal */}
      <div className="relative mx-4 w-full max-w-sm rounded-3xl bg-white/80 backdrop-blur-2xl shadow-2xl border border-white/70 p-7 sm:p-8 text-center">
        {/* Logo */}
        {logoUrl ? (
          <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-white border border-gray-100 shadow flex items-center justify-center overflow-hidden">
            <img
              src={logoUrl}
              alt={`${appName} logo`}
              className="w-10 h-10 object-contain"
              loading="eager"
              decoding="async"
            />
          </div>
        ) : null}

        {/* Loader visual: anillo orbital + ondas */}
        <div className="mx-auto mb-6 w-40 h-40 relative">
          <svg viewBox="0 0 160 160" className="w-full h-full">
            <defs>
              <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--brand-1)" />
                <stop offset="100%" stopColor="var(--brand-2)" />
              </linearGradient>
              <radialGradient id="dotGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="white" />
                <stop offset="100%" stopColor="var(--brand-2)" />
              </radialGradient>
            </defs>

            {/* sombra base */}
            <ellipse cx="80" cy="138" rx="44" ry="10" fill="rgba(0,0,0,0.06)"></ellipse>

            {/* Anillo principal (determinado o indeterminado) */}
            {typeof clamped === "number" ? (
              <circle
                cx="80"
                cy="80"
                r="42"
                fill="none"
                stroke="url(#strokeGrad)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${Math.PI * 2 * 42}`}
                strokeDashoffset={`${Math.PI * 2 * 42 * (1 - clamped)}`}
                transform="rotate(-90 80 80)"
              />
            ) : (
              <circle
                cx="80"
                cy="80"
                r="42"
                fill="none"
                stroke="url(#strokeGrad)"
                strokeWidth="10"
                strokeLinecap="round"
                className="animate-spinDash"
                style={{ strokeDasharray: "180 120" }}
              />
            )}

            {/* Hexágono rotando (marca “tech”) */}
            <g className="animate-rotate" style={{ transformOrigin: "80px 80px" }}>
              <polygon
                points={hexagonPoints(80, 80, 34)}
                fill="none"
                stroke="url(#strokeGrad)"
                strokeWidth="2.5"
              />
            </g>

            {/* Puntos orbitando */}
            {[0, 1, 2, 3, 4].map(i => {
              const angle = (i / 5) * Math.PI * 2;
              const x = 80 + Math.cos(angle) * 52;
              const y = 80 + Math.sin(angle) * 52;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="url(#dotGrad)"
                  className="animate-pulseDot"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              );
            })}

            {/* Ondas suaves */}
            <g className="opacity-70">
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="none"
                stroke="rgba(99,102,241,0.15)"
                strokeWidth="1.5"
                className="animate-wave"
                style={{ transformOrigin: "80px 80px" }}
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="rgba(14,165,233,0.12)"
                strokeWidth="1"
                className="animate-wave2"
                style={{ transformOrigin: "80px 80px" }}
              />
            </g>
          </svg>
        </div>

        {/* AppName con efecto “caída de letras” */}
        <div className="relative mb-2 flex justify-center space-x-[2px] sm:space-x-[3px]">
          {appName.split("").map((ch, i) => (
            <span
              key={`${ch}-${i}`}
              className={`text-2xl sm:text-[26px] font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--brand-1)] to-[var(--brand-2)] inline-block transition-all duration-500 ${
                i < revealedLetters ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
              }`}
              style={{ transitionDelay: `${i * 0.07}s` }}
            >
              {ch}
            </span>
          ))}
        </div>

        {/* Mensaje */}
        <p className="text-sm text-gray-700 mb-4">{message}</p>

        {/* Barra de progreso (determinada o indeterminada) */}
        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden mb-2" aria-hidden={clamped === undefined}>
          <div
            className={["h-full", clamped === undefined ? "w-1/3 animate-progress" : ""].join(" ")}
            style={{
              width: clamped === undefined ? undefined : `${Math.round(clamped * 100)}%`,
              background: "linear-gradient(90deg, var(--brand-1), var(--brand-2))",
            }}
          />
        </div>

        {/* Tips */}
        {tips?.length ? (
          <div className="min-h-[1.25rem] text-xs text-gray-500">
            <span className="inline-block animate-fade">{tips[tipIndex]}</span>
          </div>
        ) : null}

        {/* ARIA live */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {message} {typeof clamped === "number" ? `${Math.round(clamped * 100)}%` : ""}
        </div>
      </div>

      {/* Animaciones clave (mantener aquí para no depender de config externa) */}
      <style>{`
        .animate-rotate { animation: rotate 6s ease-in-out infinite; }
        @keyframes rotate { 0%,100% { transform: rotate(0deg) } 50% { transform: rotate(180deg) } }

        .animate-spinDash { animation: spinDash 1.6s ease-in-out infinite; transform-origin: 80px 80px; }
        @keyframes spinDash {
          0%   { transform: rotate(0deg);   stroke-dashoffset: 0;   }
          50%  { transform: rotate(180deg); stroke-dashoffset: -200;}
          100% { transform: rotate(360deg); stroke-dashoffset: -360;}
        }

        .animate-pulseDot { animation: pulseDot 1.8s ease-in-out infinite; }
        @keyframes pulseDot {
          0%,100% { transform: scale(1); opacity: .85; }
          50%     { transform: scale(1.25); opacity: 1; }
        }

        .animate-wave { animation: wave 3.8s ease-in-out infinite; }
        .animate-wave2 { animation: wave2 4.6s ease-in-out infinite; }
        @keyframes wave   { 0%,100% { transform: scale(1) } 50% { transform: scale(1.03) } }
        @keyframes wave2  { 0%,100% { transform: scale(1) } 50% { transform: scale(1.05) } }

        .animate-softPulse  { animation: softPulse 8s ease-in-out infinite; }
        .animate-softPulse2 { animation: softPulse 10s ease-in-out infinite; }
        @keyframes softPulse {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(8px,-6px) scale(1.05); }
        }

        .animate-progress { animation: progress 1.8s ease-in-out infinite; }
        @keyframes progress {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(20%);   }
          100% { transform: translateX(100%);  }
        }

        .animate-fade { animation: fadeInOut 3.2s ease-in-out infinite; }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(4px); }
          10%, 90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-4px); }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-rotate,
          .animate-spinDash,
          .animate-pulseDot,
          .animate-wave,
          .animate-wave2,
          .animate-softPulse,
          .animate-softPulse2,
          .animate-progress,
          .animate-fade {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function hexagonPoints(cx: number, cy: number, r: number): string {
  const pts = Array.from({ length: 6 }).map((_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    return `${x},${y}`;
  });
  return pts.join(" ");
}
