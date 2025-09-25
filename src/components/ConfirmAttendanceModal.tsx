// src/components/ConfirmAttendanceModal.tsx
import type { Person, ShiftKind } from "../types/payroll";
import BaseModal from "./BaseModal";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  person: Person;
  shift: ShiftKind;
  // Opcionales para el modo por hora (solo usados cuando shift === "hours")
  hoursPreview?: number; // ej: 5.5
  fromPreview?: string; // "HH:mm"
  toPreview?: string; // "HH:mm"
};

export default function ConfirmAttendanceModal({
  isOpen,
  onClose,
  onConfirm,
  person,
  shift,
  hoursPreview,
  fromPreview,
  toPreview,
}: Props) {
  const isHours = shift === "hours";

  // Acents válidos según BaseModal: "purple" | "amber" | "indigo" | "pink" | "blue" | "green"
  const headerAccent = isHours
    ? "blue"
    : shift === "completo"
    ? "green"
    : "amber";

  const title = isHours ? "Confirmar horas trabajadas" : "Confirmar asistencia";

  const description = isHours
    ? (() => {
        const range =
          fromPreview && toPreview ? ` (${fromPreview}–${toPreview})` : "";
        const hrs =
          typeof hoursPreview === "number" && hoursPreview > 0
            ? `${hoursPreview} h`
            : "horas";
        return `Se registrarán ${hrs}${range}.`;
      })()
    : "Vas a registrar asistencia para la persona seleccionada.";

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      headerAccent={headerAccent as "blue" | "green" | "amber"}
      title={title}
      description={description}
      secondaryAction={{ label: "Cancelar", onClick: onClose }}
      primaryAction={{ label: "Confirmar", onClick: onConfirm }}
    >
      <div className="space-y-4">
        {/* Persona */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
          <span className="text-gray-600 font-medium">Persona</span>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
              {person.firstName[0]}
              {person.lastName[0]}
            </div>
            <span className="font-bold text-gray-800">
              {person.firstName} {person.lastName}
            </span>
          </div>
        </div>

        {/* Detalle según tipo */}
        {isHours ? (
          // ===== Modo por hora: resumen de horas y (opcional) rango =====
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
            <span className="text-gray-600 font-medium">Horas</span>
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
              {typeof hoursPreview === "number" && hoursPreview > 0
                ? `${hoursPreview} h`
                : "—"}
              {fromPreview && toPreview ? ` (${fromPreview}–${toPreview})` : ""}
            </span>
          </div>
        ) : (
          // ===== Modo por día: vuelve el pill "Completo / Medio" =====
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
            <span className="text-gray-600 font-medium">Turno</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                shift === "completo"
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {shift === "completo" ? "🕐 Completo" : "⏰ Medio"}
            </span>
          </div>
        )}
      </div>
    </BaseModal>
  );
}
