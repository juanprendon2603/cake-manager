import { Link } from "react-router-dom";
import logoUrl from "./../assets/logo.png";

type FooterLink = { label: string; to: string };

type AppFooterProps = {
  appName?: string;
  quickLinks?: FooterLink[];
  tagline?: string;
  version?: string;
};

export function AppFooter({
  appName = "InManager",
  quickLinks = [
    { label: "Ventas", to: "/sales" },
    { label: "Resumen", to: "/daily" },
    { label: "Abonos", to: "/payment-management" },
    { label: "Stock", to: "/stock" },
  ],
  tagline = "Operación simple, control total.",
  version,
}: AppFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-white/20 bg-gradient-to-r from-[#7a1f96] via-[#8E2DA8] to-[#a84bd1] text-white shadow-[0_-8px_20px_rgba(142,45,168,0.25)]">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white p-2 shadow ring-1 ring-white/70">
              <img
                src={logoUrl}
                alt={`${appName} logo`}
                className="h-7 w-7 object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div>
              <p className="text-lg font-extrabold tracking-tight">{appName}</p>
              {tagline && <p className="text-xs text-white/80">{tagline}</p>}
            </div>
          </div>

          {quickLinks.length > 0 && (
            <nav aria-label="Enlaces rápidos">
              <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-semibold">
                {quickLinks.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="text-white/90 hover:text-white hover:underline underline-offset-4 decoration-white/60"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>

        <div className="my-6 h-px w-full bg-white/20" />
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-white/85">
            © {year} {appName}. Todos los derechos reservados.
          </p>
          {version && (
            <span className="text-[11px] px-2 py-1 rounded-md bg-white/10 ring-1 ring-white/25">
              {version}
            </span>
          )}
        </div>
      </div>
    </footer>
  );
}
