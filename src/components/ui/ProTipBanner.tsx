type ProTipBannerProps = {
  title: string;
  text: string;
  gradientClass?: string;
};

export function ProTipBanner({
  title,
  text,
  gradientClass = "from-purple-600 to-pink-600",
}: ProTipBannerProps) {
  return (
    <div className="mt-12">
      <div className="relative rounded-2xl overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-r ${gradientClass}`} />
        <div className="relative z-10 p-6 text-white text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-2xl">💡</span>
            <p className="text-lg font-bold">{title}</p>
          </div>
          <p className="text-purple-100">{text}</p>
        </div>
      </div>
    </div>
  );
}
