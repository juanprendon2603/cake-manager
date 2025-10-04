import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export type ActionItem = {
  to: string;
  title: string;
  desc: string;
  icon: ReactNode;
  gradient: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  features?: string[];
};

type ActionCardProps = {
  item: ActionItem;
  fullSpanOnSmall?: boolean;
  className?: string;
  "data-testid"?: string;
};

export function ActionCard({
  item,
  fullSpanOnSmall,
  className,
  "data-testid": dataTestId,
}: ActionCardProps) {
  return (
    <Link
      to={item.to}
      aria-label={item.title}
      data-testid={dataTestId}
      className={[
        "group relative overflow-hidden rounded-3xl transform transition-all duration-300 hover:scale-[1.02]",
        fullSpanOnSmall ? "sm:col-span-2" : "",
        className ?? "",
      ].join(" ")}
    >
      <div
        className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-r ${item.gradient} opacity-90`}
      />

      <div
        className={[
          "relative rounded-3xl border-2 p-8 backdrop-blur-xl transition-all duration-300",
          "shadow-[0_12px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_50px_rgba(142,45,168,0.25)]",
          `bg-gradient-to-br ${item.bgGradient}`,
          item.borderColor,
        ].join(" ")}
      >
        <div className="flex items-start gap-6">
          <div className="-mt-12 flex-shrink-0 rounded-2xl bg-white p-4 shadow-lg ring-2 ring-white/80">
            <span className="text-3xl" aria-hidden>
              {item.icon}
            </span>
          </div>

          <div className="flex-1">
            <h3 className={`mb-2 text-2xl font-extrabold ${item.textColor}`}>
              {item.title}
            </h3>
            <p className="mb-4 leading-relaxed text-gray-700">{item.desc}</p>

            {Boolean(item.features?.length) && (
              <ul className="mb-6 space-y-2">
                {item.features!.map((f, i) => (
                  <li
                    key={`${i}-${f}`}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                    {f}
                  </li>
                ))}
              </ul>
            )}

            <span
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 group-hover:shadow-xl"
              aria-hidden
            >
              Acceder ahora
              <span className="transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </span>
          </div>

          <div className="hidden items-center sm:flex">
            <span
              className={`text-2xl transition-transform duration-300 ${item.textColor} group-hover:translate-x-2`}
              aria-hidden
            >
              →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
