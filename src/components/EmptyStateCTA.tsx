import React from "react";
import { useNavigate } from "react-router-dom";

type EmptyStateCTAProps = {
  title: string;
  description?: React.ReactNode;
  to: string;
  buttonLabel?: string;
  showButton?: boolean;
  emoji?: string;
  icon?: React.ReactNode;
  /** "section" = compacto (default). "page" = vista más alta (sin llegar a full screen). */
  variant?: "section" | "page";
  /** Opcionales para afinar estilos desde el uso */
  className?: string;      // wrapper extra classes
  cardClassName?: string;  // card extra classes
};

export function EmptyStateCTA({
  title,
  description,
  to,
  buttonLabel = "Ir",
  showButton = true,
  emoji,
  icon,
  variant = "section",
  className,
  cardClassName,
}: EmptyStateCTAProps) {
  const navigate = useNavigate();

  // Alturas y tamaños según variante
  const wrapperBase =
    variant === "page"
      ? "min-h-[55vh] px-4 py-8 flex items-center justify-center"
      : "px-4 py-6"; // compacto para usar bajo un PageHero

  const iconBoxCls =
    variant === "page"
      ? "w-16 h-16 mb-3"
      : "w-12 h-12 mb-2";

  const iconInnerBox =
    variant === "page"
      ? "w-10 h-10"
      : "w-8 h-8";

  const emojiCls =
    variant === "page"
      ? "text-4xl"
      : "text-3xl";

  const titleCls =
    variant === "page"
      ? "text-xl"
      : "text-lg md:text-xl";

  return (
    <div className={`${wrapperBase} ${className || ""}`}>
      <div
        className={`max-w-md w-full mx-auto bg-white/90 rounded-2xl shadow-xl border border-white/60 p-5 text-center ${cardClassName || ""}`}
      >
        <div
          className={`mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center shadow ${iconBoxCls}`}
        >
          {icon ? (
            <div className={`${iconInnerBox} flex items-center justify-center`}>
              {icon}
            </div>
          ) : (
            <div className={emojiCls}>{emoji ?? "✨"}</div>
          )}
        </div>

        <h2 className={`${titleCls} font-bold text-gray-900`}>{title}</h2>

        {description ? (
          <p className="text-gray-600 mt-1.5">{description}</p>
        ) : null}

        {showButton && (
          <button
            onClick={() => navigate(to)}
            className="mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold w-full sm:w-auto shadow hover:shadow-lg transition"
            title={buttonLabel}
          >
            {buttonLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export default EmptyStateCTA;
