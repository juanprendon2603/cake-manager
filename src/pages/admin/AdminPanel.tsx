// src/pages/admin/AdminPanel.tsx
import {
  BarChart3,
  CalendarDays,
  Package,
  ReceiptText,
  Snowflake,
  UserPlus,
  Users,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { driver, type DriveStep, type Driver } from "driver.js";

import "driver.js/dist/driver.css";
import logoUrl from "../../assets/logo.png";
import { AppFooter } from "../../components/AppFooter";

// === Overrides 100% efectivos para driver.js (botones bonitos tipo home) ===
const INJECTED_STYLE_ID = "cm-driver-overrides";
const DRIVER_OVERRIDES = `
  /* Base popover */
  .cm-popover.driver-popover {
    border-radius: 16px !important;
    background: rgba(255,255,255,.92) !important;
    border: 1px solid rgba(255,255,255,.7) !important;
    box-shadow: 0 12px 30px rgba(142,45,168,.18), 0 2px 10px rgba(0,0,0,.06) !important;
    backdrop-filter: blur(12px) !important;
  }
  .cm-popover .driver-popover-title {
    font-weight: 800 !important;
    background: linear-gradient(90deg,#8E2DA8,#A855F7,#EC4899);
    -webkit-background-clip: text; background-clip: text; color: transparent !important;
  }
  .cm-popover .driver-popover-description { color:#374151 !important; }

  /* BOTONES – selector genérico y específico + !important */
  .cm-popover .driver-popover-footer .driver-btn,
  .cm-popover .driver-popover-footer button {
    all: unset !important;
    display:inline-flex !important; align-items:center !important; justify-content:center !important;
    cursor:pointer !important; font-weight:700 !important; font-size:.95rem !important; line-height:1 !important;
    padding:12px 20px !important; border-radius:12px !important; transition:transform .18s, box-shadow .18s, filter .18s !important;
  }

  /* Primario (Siguiente / Finalizar) */
  .cm-popover .driver-next-btn,
  .cm-popover .driver-done-btn {
    color:#fff !important;
    background-image:linear-gradient(90deg,#8E2DA8 0%,#A855F7 60%,#EC4899 100%) !important;
    box-shadow:0 10px 26px rgba(168,85,247,.35) !important;
  }
  .cm-popover .driver-next-btn:hover,
  .cm-popover .driver-done-btn:hover { transform:translateY(-1px) !important; box-shadow:0 14px 34px rgba(168,85,247,.45) !important; filter:brightness(1.02) !important; }
  .cm-popover .driver-next-btn::after,
  .cm-popover .driver-done-btn::after { content:"→"; margin-left:8px; transition:transform .18s ease; }
  .cm-popover .driver-next-btn:hover::after,
  .cm-popover .driver-done-btn:hover::after { transform:translateX(2px); }

  /* Secundario (Anterior / Cerrar) */
  .cm-popover .driver-prev-btn,
  .cm-popover .driver-close-btn {
    color:#374151 !important; background:#fff !important; border:2px solid #E5E7EB !important;
    box-shadow:0 2px 8px rgba(0,0,0,.04) !important;
  }

  /* Overlay sin blur */
  .driver-overlay { backdrop-filter:none !important; -webkit-backdrop-filter:none !important; background:rgba(18,16,28,.55) !important; }

  /* Stage/elemento enfocado nítido con halo */
  .driver-stage, .driver-highlighted-element {
    backdrop-filter:none !important; -webkit-backdrop-filter:none !important; background:transparent !important;
    border-radius:14px !important; box-shadow:0 0 0 3px rgba(168,85,247,.65), 0 16px 36px rgba(0,0,0,.25) !important;
  }
`;

function ensureDriverCssInjected() {
  if (document.getElementById(INJECTED_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = INJECTED_STYLE_ID;
  style.textContent = DRIVER_OVERRIDES;
  document.head.appendChild(style);
}

const LS_TOUR_KEY = "admin_tour_seen_v1";

export default function AdminPanel() {
  const [hasSeenTour, setHasSeenTour] = useState(
    () => localStorage.getItem(LS_TOUR_KEY) === "1"
  );

  // refs para driver.js y para el timeout de auto-inicio
  const driverRef = useRef<Driver | null>(null);
  const autoStartTimeoutRef = useRef<number | null>(null);

  // Refs para elementos del header (por si quieres steps ahí luego)
  const logoRef = useRef<HTMLDivElement | null>(null);
  const quickStatsRef = useRef<HTMLDivElement | null>(null);

  const location = useLocation();

  // Cards del panel (memo)
  const cards = useMemo(
    () =>
      [
        {
          to: "/admin/allowlist",
          title: "Añadir usuarios",
          desc: "Autoriza correos y gestiona roles.",
          icon: <UserPlus className="w-6 h-6 text-[#8E2DA8]" />,
          gradient: "from-purple-500 to-indigo-500",
          pill: "Usuarios",
          tourId: "allowlist",
        },
        {
          to: "/admin/fridges",
          title: "Añadir refrigeradores",
          desc: "Configura y registra cámaras/fríos.",
          icon: <Snowflake className="w-6 h-6 text-[#8E2DA8]" />,
          gradient: "from-cyan-500 to-blue-500",
          pill: "Refrigeración",
          tourId: "fridges",
        },
        {
          to: "/admin/workers",
          title: "Añadir trabajadores",
          desc: "Crea y edita el equipo de trabajo.",
          icon: <Users className="w-6 h-6 text-[#8E2DA8]" />,
          gradient: "from-emerald-500 to-teal-500",
          pill: "Equipo",
          tourId: "workers",
        },
        {
          to: "/admin/catalog",
          title: "Añadir stock",
          desc: "Carga rápida de productos y existencias.",
          icon: <Package className="w-6 h-6 text-[#8E2DA8]" />,
          gradient: "from-amber-500 to-orange-500",
          pill: "Inventario",
          tourId: "catalog",
        },
        {
          to: "/payroll",
          title: "Ver nómina",
          desc: "Consulta periodos y liquidaciones.",
          icon: <ReceiptText className="w-6 h-6 text-[#8E2DA8]" />,
          gradient: "from-pink-500 to-rose-500",
          pill: "Nómina",
          tourId: "payroll",
        },
        {
          to: "/inform",
          title: "Ver informe",
          desc: "Indicadores y comparativas.",
          icon: <BarChart3 className="w-6 h-6 text-[#8E2DA8]" />,
          gradient: "from-fuchsia-500 to-purple-500",
          pill: "Reportes",
          tourId: "inform",
        },
        {
          to: "/summary",
          title: "Registros del mes",
          desc: "Ventas y gastos consolidados.",
          icon: <CalendarDays className="w-6 h-6 text-[#8E2DA8]" />,
          gradient: "from-sky-500 to-indigo-500",
          pill: "Mensual",
          tourId: "summary",
        },
      ] as const,
    []
  );

  // Clase en body y CSS inyectado
  useEffect(() => {
    document.body.classList.add("cm-admin");
    ensureDriverCssInjected();
    return () => document.body.classList.remove("cm-admin");
  }, []);

  // Builder del tour (instancia única)
  const buildTour = useCallback(() => {
    // Si ya hay uno corriendo, lo destruimos
    driverRef.current?.destroy();

    const steps: DriveStep[] = [
      ...cards.map((c) => ({
        element: `[data-tour='${c.tourId}']`,
        popover: {
          title: c.title,
          description:
            "Texto de ejemplo: aquí puedes gestionar esta sección. Luego ajustamos el copy.",
          side: "right" as const,
          align: "start" as const,
        },
      })),
    ];

    const drv = driver({
      showProgress: true,
      steps,
      overlayOpacity: 0.55,
      allowClose: true,
      stagePadding: 6,
      nextBtnText: "Siguiente",
      prevBtnText: "Anterior",
      doneBtnText: "Finalizar",
      popoverClass: "cm-popover rounded-2xl",

      // Enfocar el botón principal y bajar prioridad del "cerrar"
      onPopoverRender: () => {
        requestAnimationFrame(() => {
          const root = document.querySelector(".driver-popover") as HTMLElement | null;
          const close = root?.querySelector(".driver-close-btn") as HTMLButtonElement | null;
          const next = root?.querySelector(".driver-next-btn") as HTMLButtonElement | null;
          const done = root?.querySelector(".driver-done-btn") as HTMLButtonElement | null;
          const prev = root?.querySelector(".driver-prev-btn") as HTMLButtonElement | null;

          if (close) {
            close.setAttribute("tabindex", "-1");
            close.blur();
            close.setAttribute("aria-hidden", "true");
          }
          (next || done || prev)?.focus();
        });
      },

      onDestroyed: () => {
        localStorage.setItem(LS_TOUR_KEY, "1");
        setHasSeenTour(true);
        driverRef.current = null; // limpiar ref
      },
    });

    driverRef.current = drv;
    return drv;
  }, [cards]);

  // Autolanzar SOLO la primera vez que entra
  useEffect(() => {
    if (!hasSeenTour) {
      const drv = buildTour();
      autoStartTimeoutRef.current = window.setTimeout(() => drv.drive(), 300);
    }
    return () => {
      if (autoStartTimeoutRef.current) {
        clearTimeout(autoStartTimeoutRef.current);
        autoStartTimeoutRef.current = null;
      }
    };
  }, [hasSeenTour, buildTour]);

  // Si cambia la ruta, matar el tour y limpiar timeout
  useEffect(() => {
    driverRef.current?.destroy();
    if (autoStartTimeoutRef.current) {
      clearTimeout(autoStartTimeoutRef.current);
      autoStartTimeoutRef.current = null;
    }
  }, [location.pathname]);

  // Cleanup global al desmontar
  useEffect(() => {
    return () => {
      driverRef.current?.destroy();
      if (autoStartTimeoutRef.current) {
        clearTimeout(autoStartTimeoutRef.current);
      }
    };
  }, []);

  // Lanzar desde el botón flotante
  const handleStartTour = useCallback(() => {
    const drv = buildTour();
    drv.drive();
  }, [buildTour]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex flex-col">
      {/* Botón flotante para lanzar el tutorial */}
      <button
        onClick={handleStartTour}
        title="Ver tutorial"
        className="fixed z-50 bottom-6 right-6 rounded-full px-5 py-3 bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white font-semibold shadow-[0_10px_30px_rgba(142,45,168,0.35)] hover:shadow-[0_14px_40px_rgba(142,45,168,0.45)] transition-all"
      >
        Ver tutorial
      </button>

      <main className="flex-grow p-6 sm:p-12 max-w-6xl mx-auto w-full">
        <header className="mb-12 text-center relative">
          <div
            ref={logoRef}
            className="mx-auto mb-6 w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white/70 backdrop-blur border border-white/60 shadow-[0_10px_30px_rgba(142,45,168,0.15)] flex items-center justify-center overflow-hidden ring-2 ring-purple-200"
          >
            <img
              src={logoUrl}
              alt="CakeManager logo"
              className="w-20 h-20 object-contain"
              loading="eager"
              decoding="async"
            />
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-[#8E2DA8] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent mb-3 drop-shadow-[0_2px_12px_rgba(142,45,168,0.25)]">
            Panel de Administración
          </h1>
          <p className="text-lg text-gray-700">
            Configura acceso, personal y recursos del sistema
          </p>

          <div
            ref={quickStatsRef}
            className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto"
          >
            <div className="rounded-xl px-4 py-3 text-center bg-white/60 backdrop-blur border border-white/60 shadow">
              <Users className="w-6 h-6 mx-auto text-[#8E2DA8]" />
              <div className="text-xs text-gray-600">Usuarios</div>
              <div className="text-sm font-semibold text-[#8E2DA8]">Roles</div>
            </div>
            <div className="rounded-xl px-4 py-3 text-center bg-white/60 backdrop-blur border border-white/60 shadow">
              <Snowflake className="w-6 h-6 mx-auto text-[#8E2DA8]" />
              <div className="text-xs text-gray-600">Equipos</div>
              <div className="text-sm font-semibold text-[#8E2DA8]">Fríos</div>
            </div>
            <div className="rounded-xl px-4 py-3 text-center bg-white/60 backdrop-blur border border-white/60 shadow">
              <Users className="w-6 h-6 mx-auto text-[#8E2DA8]" />
              <div className="text-xs text-gray-600">Staff</div>
              <div className="text-sm font-semibold text-[#8E2DA8]">Altas</div>
            </div>
            <div className="rounded-xl px-4 py-3 text-center bg-white/60 backdrop-blur border border-white/60 shadow">
              <Package className="w-6 h-6 mx-auto text-[#8E2DA8]" />
              <div className="text-xs text-gray-600">Inventario</div>
              <div className="text-sm font-semibold text-[#8E2DA8]">Carga</div>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {cards.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              data-tour={item.tourId}
              onClick={() => {
                // destruir tour antes de navegar para evitar que quede visible en la nueva vista
                driverRef.current?.destroy();
              }}
              className="group relative rounded-2xl overflow-hidden"
            >
              <div
                className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-r ${item.gradient} opacity-90`}
              />
              <div className="relative bg-white/80 backdrop-blur-xl border border-white/70 rounded-2xl p-6 shadow-[0_12px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_45px_rgba(142,45,168,0.25)] transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 -mt-10 rounded-2xl p-3 bg-white shadow-md ring-2 ring-white/80">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-extrabold text-[#8E2DA8] mb-1">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                  <div className="hidden sm:flex items-center">
                    <span className="text-[#8E2DA8] group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-white px-3 py-1 rounded-full bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] shadow">
                    {item.pill}
                    <span className="group-hover:translate-x-0.5 transition-transform">
                      ›
                    </span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      </main>

      <AppFooter appName="InManager" />
    </div>
  );
}
