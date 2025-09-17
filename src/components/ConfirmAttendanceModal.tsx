// src/components/ConfirmAttendanceModal.tsx
import BaseModal from "./BaseModal";
import type { Person, ShiftKind } from "../types/payroll";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  person: Person;
  shift: ShiftKind;
}

export default function ConfirmAttendanceModal({
  isOpen,
  onClose,
  onConfirm,
  person,
  shift,
}: Props) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      headerAccent="purple"
      title="Confirmar asistencia"
      description="Vas a registrar asistencia para la persona seleccionada."
      secondaryAction={{ label: "Cancelar", onClick: onClose }}
      primaryAction={{ label: "Confirmar", onClick: onConfirm }}
    >
      <div className="space-y-4">
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

        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
          <span className="text-gray-600 font-medium">Turno</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              shift === "completo"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {shift === "completo" ? "🕐 Completo" : "⏰ Medio"}
          </span>
        </div>
      </div>
    </BaseModal>
  );
}
