import { useNavigate } from "react-router-dom";

export function BackButton({ label = "Volver" }: { label?: string }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      {label}
    </button>
  );
}
