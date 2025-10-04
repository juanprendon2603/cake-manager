import logoUrl from "../assets/logo.png";

type FullScreenLoaderProps = {
  message?: string;
};

export function FullScreenLoader({
  message = "Cargando CakeManager...",
}: FullScreenLoaderProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100"
      role="dialog"
      aria-modal="true"
      aria-label="Pantalla de carga"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-20 -left-20 w-80 h-80 rounded-full blur-3xl opacity-30"
          style={{
            background:
              "radial-gradient(circle at center, #E8D4F2, transparent 60%)",
          }}
        />
        <div
          className="absolute -bottom-24 -right-10 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-30"
          style={{
            background:
              "radial-gradient(circle at center, #8E2DA8, transparent 60%)",
          }}
        />
      </div>

      <div className="relative mx-4 w-full max-w-sm rounded-3xl bg-white/90 backdrop-blur-xl shadow-2xl border-2 border-white/60 p-8 text-center">
        <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-white border border-purple-100 shadow flex items-center justify-center overflow-hidden">
          <img
            src={logoUrl}
            alt="CakeManager logo"
            className="w-10 h-10 object-contain"
            loading="eager"
            decoding="async"
          />
        </div>

        <div className="mx-auto mb-6 w-40 h-40 relative">
          <svg viewBox="0 0 160 160" className="w-full h-full">
            <ellipse
              cx="80"
              cy="138"
              rx="42"
              ry="8"
              fill="rgba(0,0,0,0.08)"
            ></ellipse>

            <path
              d="M40,100 L120,100 L112,140 C112,144 108,148 104,148 L56,148 C52,148 48,144 48,140 Z"
              fill="url(#linerBase)"
              stroke="#C7A6D9"
              strokeWidth="1.5"
            />

            <defs>
              <linearGradient id="linerBase" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#F5E6FB" />
                <stop offset="50%" stopColor="#EAD6F7" />
                <stop offset="100%" stopColor="#F5E6FB" />
              </linearGradient>
              <linearGradient id="frostingGrad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#E8D4F2" />
                <stop offset="60%" stopColor="#C785E0" />
                <stop offset="100%" stopColor="#8E2DA8" />
              </linearGradient>
              <linearGradient id="sprinkleGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FF8BCB" />
                <stop offset="100%" stopColor="#FFD166" />
              </linearGradient>
              <clipPath id="frostingClip">
                <path
                  d="M40,98
                         C35,80 48,70 60,68
                         C58,52 78,46 86,56
                         C98,46 120,54 118,70
                         C130,72 132,86 122,98
                         Z"
                />
              </clipPath>
            </defs>

            {Array.from({ length: 9 }).map((_, i) => {
              const x = 48 + i * 8;
              return (
                <path
                  key={i}
                  d={`M${x},100 L${x - 6},148`}
                  stroke="#D7C2E7"
                  strokeWidth="2"
                  opacity="0.8"
                />
              );
            })}

            <path
              d="M40,100 Q80,110 120,100"
              fill="none"
              stroke="#C7A6D9"
              strokeWidth="2"
            />

            <g clipPath="url(#frostingClip)">
              <rect
                x="24"
                y="60"
                width="120"
                height="90"
                fill="url(#frostingGrad)"
                className="cupcake-fill"
              />
              <rect
                x="24"
                y="60"
                width="120"
                height="90"
                fill="white"
                opacity="0.06"
              />
            </g>

            <path
              d="M40,98
                 C35,80 48,70 60,68
                 C58,52 78,46 86,56
                 C98,46 120,54 118,70
                 C130,72 132,86 122,98
                 Z"
              fill="none"
              stroke="#B77CCF"
              strokeWidth="2"
              opacity="0.9"
            />

            {[
              { x: 70, y: 78, r: 2, rot: 15 },
              { x: 90, y: 72, r: 2, rot: -10 },
              { x: 60, y: 88, r: 2, rot: 30 },
              { x: 104, y: 86, r: 2, rot: -25 },
              { x: 82, y: 66, r: 2, rot: 5 },
            ].map((s, idx) => (
              <g key={idx} transform={`rotate(${s.rot} ${s.x} ${s.y})`}>
                <rect
                  x={s.x - s.r}
                  y={s.y - s.r}
                  width={s.r * 2}
                  height={s.r * 4}
                  rx={s.r}
                  fill="url(#sprinkleGrad)"
                  className="animate-[sprinklePulse_1.8s_ease-in-out_infinite]"
                  style={{ animationDelay: `${idx * 0.2}s` }}
                />
              </g>
            ))}

            <circle
              cx="112"
              cy="64"
              r="6"
              fill="#FF4D88"
              className="animate-[float_2.6s_ease-in-out_infinite]"
            />
            <path
              d="M112,64 C110,56 104,52 98,52"
              stroke="#9A2C6A"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
          InManager
        </h2>
        <p className="text-sm text-gray-700 mb-4">{message}</p>

        <div className="h-2 w-full rounded-full bg-purple-100 overflow-hidden">
          <div className="h-full w-1/3 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-300 animate-[progress_1.8s_ease-in-out_infinite]" />
        </div>

        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {message}
        </div>
      </div>

      <style>{`
        /* Relleno que sube y baja para simular el llenado */
        .cupcake-fill {
          transform: translateY(55%);
          transform-box: fill-box;
          transform-origin: 50% 100%;
          animation: fillCupcake 1.8s ease-in-out infinite;
          shape-rendering: geometricPrecision;
        }

        @keyframes fillCupcake {
          0% { transform: translateY(55%); }
          50% { transform: translateY(-6%); }
          100% { transform: translateY(55%); }
        }

        /* Pulso de chispitas */
        @keyframes sprinklePulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.2); opacity: 1; }
        }

        /* Flotación de la cereza */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }

        /* Barra de progreso */
        @keyframes progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(20%); }
          100% { transform: translateX(100%); }
        }

        @media (prefers-reduced-motion: reduce) {
          .cupcake-fill,
          .animate-[progress_1.8s_ease-in-out_infinite],
          .animate-[sprinklePulse_1.8s_ease-in-out_infinite],
          .animate-[float_2.6s_ease-in-out_infinite] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
