// src/components/ui/ActionCard.tsx
import { Link } from "react-router-dom";

export type ActionItem = {
  to: string;
  title: string;
  desc: string;
  icon: string;
  gradient: string; // franja superior
  bgGradient: string; // fondo de la tarjeta
  borderColor: string; // p.ej. 'border-emerald-200'
  textColor: string; // p.ej. 'text-emerald-700'
  features?: string[];
};

type ActionCardProps = {
  item: ActionItem;
  fullSpanOnSmall?: boolean; // p.ej. para la 3ra tarjeta en Ventas
};

export function ActionCard({ item, fullSpanOnSmall }: ActionCardProps) {
  return (
    <Link
      to={item.to}
      className={`group relative rounded-3xl overflow-hidden transform hover:scale-[1.02] transition-all duration-300 ${
        fullSpanOnSmall ? "sm:col-span-2" : ""
      }`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-r ${item.gradient} opacity-90`}
      />
      <div
        className={`relative bg-gradient-to-br ${item.bgGradient} backdrop-blur-xl border-2 ${item.borderColor} rounded-3xl p-8 shadow-[0_12px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_50px_rgba(142,45,168,0.25)] transition-all duration-300`}
      >
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0 -mt-12 rounded-2xl p-4 bg-white shadow-lg ring-2 ring-white/80">
            <span className="text-3xl">{item.icon}</span>
          </div>
          <div className="flex-1">
            <h3 className={`text-2xl font-extrabold ${item.textColor} mb-2`}>
              {item.title}
            </h3>
            <p className="text-gray-700 mb-4 leading-relaxed">{item.desc}</p>
            {item.features?.length ? (
              <ul className="space-y-2 mb-6">
                {item.features.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                    {f}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-full bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] shadow-lg group-hover:shadow-xl transition-all duration-300">
              Acceder ahora
              <span className="group-hover:translate-x-1 transition-transform duration-200">
                →
              </span>
            </div>
          </div>
          <div className="hidden sm:flex items-center">
            <span
              className={`text-2xl ${item.textColor} group-hover:translate-x-2 transition-transform duration-300`}
            >
              →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
