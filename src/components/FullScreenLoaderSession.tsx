import * as React from "react";

type FullScreenLoaderProps = {
  message?: string;
  appName?: string;
  logoUrl?: string;
  tips?: string[];
  progress?: number;
};

export function FullScreenLoaderSession({
  message = "Cargando…",
  appName = "Tu App",
  logoUrl,
  tips,
  progress,
}: FullScreenLoaderProps) {
  const [tipIndex, setTipIndex] = React.useState(0);
  React.useEffect(() => {
    if (!tips?.length) return;
    const id = setInterval(
      () => setTipIndex((i) => (i + 1) % tips.length),
      3200
    );
    return () => clearInterval(id);
  }, [tips]);

  const clamped =
    typeof progress === "number"
      ? Math.max(0, Math.min(1, progress))
      : undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Pantalla de carga"
      style={{
        ["--brand-1" as any]: "#0EA5E9",
        ["--brand-2" as any]: "#6366F1",
        ["--bg-from" as any]: "#F8FAFC",
        ["--bg-to" as any]: "#EEF2FF",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-from)] to-[var(--bg-to)]" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-16 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-30 animate-softPulse"
          style={{
            background:
              "radial-gradient(circle at center, var(--brand-1), transparent 60%)",
          }}
        />
        <div
          className="absolute -bottom-24 right-10 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-25 animate-softPulse2"
          style={{
            background:
              "radial-gradient(circle at center, var(--brand-2), transparent 60%)",
          }}
        />
      </div>

      <div className="relative mx-4 w-full max-w-sm rounded-3xl bg-white/80 backdrop-blur-xl shadow-2xl border border-white/70 p-8 text-center">
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

        <div className="mx-auto mb-6 w-40 h-40 relative">
          <svg viewBox="0 0 160 160" className="w-full h-full">
            <ellipse
              cx="80"
              cy="138"
              rx="44"
              ry="10"
              fill="rgba(0,0,0,0.06)"
            ></ellipse>

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

            <g className="animate-rotate">
              <polygon
                points={hexagonPoints(80, 80, 34)}
                fill="none"
                stroke="url(#strokeGrad)"
                strokeWidth="2.5"
              />
            </g>

            {[0, 1, 2, 3, 4].map((i) => {
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

            <g className="opacity-70">
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="none"
                stroke="rgba(99,102,241,0.15)"
                strokeWidth="1.5"
                className="animate-wave"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="rgba(14,165,233,0.12)"
                strokeWidth="1"
                className="animate-wave2"
              />
            </g>
          </svg>
        </div>

        <h2 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[var(--brand-1)] to-[var(--brand-2)] mb-1">
          {appName}
        </h2>
        <p className="text-sm text-gray-700 mb-4">{message}</p>

        <div
          className="h-2 w-full rounded-full bg-gray-100 overflow-hidden mb-2"
          aria-hidden={clamped === undefined}
        >
          <div
            className={
              "h-full " +
              (clamped === undefined ? "w-1/3 animate-progress" : "")
            }
            style={{
              width:
                clamped === undefined
                  ? undefined
                  : `${Math.round(clamped * 100)}%`,
              background:
                "linear-gradient(90deg, var(--brand-1), var(--brand-2))",
            }}
          />
        </div>

        {tips?.length ? (
          <div className="min-h-[1.25rem] text-xs text-gray-500">
            <span className="inline-block animate-fade">{tips[tipIndex]}</span>
          </div>
        ) : null}

        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {message}{" "}
          {typeof clamped === "number" ? `${Math.round(clamped * 100)}%` : ""}
        </div>
      </div>

      <style>{`
        /* rotación del hexágono */
        .animate-rotate { animation: rotate 6s ease-in-out infinite; transform-origin: 80px 80px; }
        @keyframes rotate { 0%,100% { transform: rotate(0deg) } 50% { transform: rotate(180deg) } }

        /* dash indeterminado del anillo */
        .animate-spinDash { animation: spinDash 1.6s ease-in-out infinite; transform-origin: 80px 80px; }
        @keyframes spinDash {
          0%   { transform: rotate(0deg);   stroke-dashoffset: 0;   }
          50%  { transform: rotate(180deg); stroke-dashoffset: -200;}
          100% { transform: rotate(360deg); stroke-dashoffset: -360;}
        }

        /* puntos respirando */
        .animate-pulseDot { animation: pulseDot 1.8s ease-in-out infinite; }
        @keyframes pulseDot {
          0%,100% { transform: scale(1); opacity: .85; }
          50%     { transform: scale(1.25); opacity: 1; }
        }

        /* ondas */
        .animate-wave { animation: wave 3.8s ease-in-out infinite; transform-origin: 80px 80px; }
        .animate-wave2 { animation: wave2 4.6s ease-in-out infinite; transform-origin: 80px 80px; }
        @keyframes wave   { 0%,100% { transform: scale(1) } 50% { transform: scale(1.03) } }
        @keyframes wave2  { 0%,100% { transform: scale(1) } 50% { transform: scale(1.05) } }

        /* fondo suave */
        .animate-softPulse  { animation: softPulse 8s ease-in-out infinite; }
        .animate-softPulse2 { animation: softPulse 10s ease-in-out infinite; }
        @keyframes softPulse {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(8px,-6px) scale(1.05); }
        }

        /* barra indeterminada */
        .animate-progress { animation: progress 1.8s ease-in-out infinite; }
        @keyframes progress {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(20%);   }
          100% { transform: translateX(100%);  }
        }

        /* tip fade */
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

function hexagonPoints(cx: number, cy: number, r: number) {
  const pts = Array.from({ length: 6 }).map((_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    return `${x},${y}`;
  });
  return pts.join(" ");
}
