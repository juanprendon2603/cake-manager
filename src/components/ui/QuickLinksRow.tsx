// src/components/ui/QuickLinksRow.tsx
import { Link } from "react-router-dom";

type QuickLink = { to: string; label: string };

export function QuickLinksRow({ links }: { links: QuickLink[] }) {
  return (
    <section className="rounded-2xl p-6 bg-white/70 backdrop-blur border border-white/60 shadow-lg">
      <div className="flex flex-wrap items-center justify-center gap-4">
        <span className="text-gray-700 font-medium">Accesos rápidos:</span>
        {links.map((l, i) => (
          <div key={l.to} className="flex items-center gap-4">
            {i > 0 && <span className="text-gray-300">•</span>}
            <Link
              to={l.to}
              className="text-[#8E2DA8] font-semibold hover:underline transition-colors"
            >
              {l.label}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
