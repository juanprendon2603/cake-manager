import type { ReactNode } from "react";

type PageHeroProps = {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  gradientClass?: string;
  iconGradientClass?: string;
};

export function PageHero({
  icon = "📦",
  title,
  subtitle,
  gradientClass = "from-[#7a1f96] via-[#8E2DA8] to-[#a84bd1]",
  iconGradientClass = "from-[#8E2DA8] to-[#A855F7]",
}: PageHeroProps) {
  return (
    <header className="mb-10 text-center relative">
      <div
        className={`absolute inset-0 bg-gradient-to-r ${gradientClass} rounded-3xl opacity-10`}
      />
      <div className="relative z-10 py-6 sm:py-10">
        <div className="flex justify-center mb-4 sm:mb-6">
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br ${iconGradientClass} flex items-center justify-center text-white text-2xl sm:text-3xl shadow-xl ring-4 ring-purple-200`}
          >
            {icon}
          </div>
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-[#8E2DA8] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent mb-3 sm:mb-4 drop-shadow-[0_2px_10px_rgba(142,45,168,0.25)]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-base sm:text-lg md:text-xl text-gray-700 font-medium mb-1 sm:mb-2 px-4">
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
}
