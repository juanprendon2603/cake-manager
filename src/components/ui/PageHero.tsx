// src/components/ui/PageHero.tsx

type PageHeroProps = {
  icon?: string; // emoji o pequeño ícono
  title: string;
  subtitle?: string;
  gradientClass?: string; // franja de fondo
  iconGradientClass?: string; // azulejo del ícono
};

export function PageHero({
  icon = "📦",
  title,
  subtitle,
  gradientClass = "from-[#7a1f96] via-[#8E2DA8] to-[#a84bd1]",
  iconGradientClass = "from-[#8E2DA8] to-[#A855F7]",
}: PageHeroProps) {
  return (
    <header className="mb-12 text-center relative">
      <div
        className={`absolute inset-0 bg-gradient-to-r ${gradientClass} rounded-3xl opacity-10`}
      />
      <div className="relative z-10 py-8">
        <div className="flex justify-center mb-6">
          <div
            className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${iconGradientClass} flex items-center justify-center text-white text-3xl shadow-xl ring-4 ring-purple-200`}
          >
            {icon}
          </div>
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-[#8E2DA8] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent mb-4 drop-shadow-[0_2px_12px_rgba(142,45,168,0.25)]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl text-gray-700 font-medium mb-2">{subtitle}</p>
        )}
      </div>
    </header>
  );
}
