// FILE: src/features/auth/components/PasswordInput.tsx
import { useId } from "react";

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  setShow: (v: boolean) => void;
  placeholder?: string;
  autoComplete?: string;
  minLength?: number;
  invalid?: boolean;
};

export function PasswordInput({
  label,
  value,
  onChange,
  show,
  setShow,
  placeholder,
  autoComplete,
  minLength = 6,
  invalid = false,
}: Props) {
  const id = useId();
  return (
    <label htmlFor={id} className="text-sm font-semibold text-gray-700">
      {label}
      <div className="mt-1 relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          className={`w-full rounded-xl border px-4 py-3 pr-11 shadow-inner focus:outline-none focus:ring-2 ${
            invalid
              ? "border-rose-300 bg-rose-50 focus:ring-rose-300"
              : "border-white/70 bg-white/70 focus:ring-purple-300"
          }`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required
          minLength={minLength}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
        >
          {show ? "🙈" : "👁️"}
        </button>
      </div>
    </label>
  );
}
