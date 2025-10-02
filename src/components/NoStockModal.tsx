// src/components/NoStockModal.tsx
import BaseModal from "./BaseModal";

interface Part {
  stepKey: string;
  stepLabel: string;
  optionKey: string;
  optionLabel: string;
}

interface NoStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  selectedParts?: Part[];
  currentStock?: number;
  requestedQty?: number;
}

export default function NoStockModal({
  isOpen,
  onClose,
  onContinue,
  selectedParts = [],
  currentStock = 0,
  requestedQty = 0,
}: NoStockModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      headerAccent="amber"
      title="Inventario insuficiente"
      description="No hay stock para esta combinación. ¿Qué deseas hacer?"
      size="lg"
      icon="⚠️"
      secondaryAction={{
        label: "Cancelar",
        onClick: onClose,
      }}
      primaryAction={{
        label: "Registrar sin descontar",
        onClick: onContinue,
      }}
    >
      <div className="space-y-5">
        {/* Bloque con detalles de selección */}
        {selectedParts.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <div className="font-semibold">Combinación seleccionada:</div>
            <ul className="mt-2 text-sm leading-6 list-disc pl-5">
              {selectedParts.map((p) => (
                <li key={p.stepKey}>
                  <span className="text-gray-600">{p.stepLabel}:</span>{" "}
                  <span className="font-medium">{p.optionLabel}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Stock vs cantidad */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border p-3 bg-white text-center">
            <div className="text-xs text-gray-500">Stock actual</div>
            <div className="text-2xl font-extrabold text-amber-600">
              {currentStock}
            </div>
          </div>
          <div className="rounded-xl border p-3 bg-white text-center">
            <div className="text-xs text-gray-500">Cantidad solicitada</div>
            <div className="text-2xl font-extrabold text-gray-800">
              {requestedQty}
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
