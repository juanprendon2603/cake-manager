import type { ReactNode } from "react";

type InfoCardProps = {
  icon: ReactNode;
  title: string;
  text: string;
  gradientClass: string;
};

export function InfoCard({ icon, title, text, gradientClass }: InfoCardProps) {
  return (
    <div className="rounded-2xl p-6 bg-white/70 backdrop-blur border border-white/60 shadow-lg text-center">
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white text-xl mx-auto mb-4`}
      >
        {icon}
      </div>
      <h4 className="font-bold text-gray-800 mb-2">{title}</h4>
      <p className="text-sm text-gray-600">{text}</p>
    </div>
  );
}
