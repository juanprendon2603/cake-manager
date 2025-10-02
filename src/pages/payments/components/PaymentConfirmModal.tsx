// src/pages/payments/components/PaymentConfirmModal.tsx
import BaseModal from "../../../components/BaseModal";
import type { PaymentMethod } from "../../../types/payments";
import { paymentLabel } from "../../../utils/formatters";
import type { CategoryStep } from "../../stock/stock.model";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categoryName: string;
  selections: Record<string, string>;
  affectingSteps: CategoryStep[];
  quantity: number;
  orderDate: string;
  paymentMethod: PaymentMethod;
  deductFromStock: boolean;
  totalAmount: number;
  paidAmountToday: number;
  onConfirm: () => void;
  loading?: boolean;
  sellerName?: string; // 👈 NUEVO

}

export default function PaymentConfirmModal({
  isOpen,
  onClose,
  categoryName,
  selections,
  affectingSteps,
  quantity,
  orderDate,
  paymentMethod,
  deductFromStock,
  totalAmount,
  paidAmountToday,
  onConfirm,
  loading = false,
  sellerName,

}: Props) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      headerAccent="purple"
      size="lg"
      title="Confirmar abono/pago"
      description="Revisa los detalles antes de registrar:"
      secondaryAction={{ label: "Cancelar", onClick: onClose }}
      primaryAction={{ label: "Registrar", onClick: onConfirm }}
      bodyClassName="space-y-4"
    >
      <div className="space-y-3 text-sm text-gray-800">
        <div className="flex justify-between">
          <span className="text-gray-500">Categoría</span>
          <span className="font-medium">{categoryName}</span>
        </div>

        {affectingSteps.map((st) => (
          <div key={st.key} className="flex justify-between">
            <span className="text-gray-500">{st.label}</span>
            <span className="font-medium">
              {st.options?.find((o) => o.key === selections[st.key])?.label ||
                ""}
            </span>
          </div>
        ))}

        <div className="flex justify-between">
          <span className="text-gray-500">Cantidad</span>
          <span className="font-medium">x{quantity}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Fecha del pedido</span>
          <span className="font-medium">{orderDate}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Método de pago</span>
          <span className="font-medium">{paymentLabel(paymentMethod)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Descontar del inventario</span>
          <span className="font-medium">{deductFromStock ? "Sí" : "No"}</span>
        </div>

        <div className="h-px bg-gray-200 my-2" />

        <div className="flex justify-between text-base">
          <span className="text-gray-700 font-semibold">Valor total</span>
          <span className="font-bold text-[#8E2DA8]">
            ${Number(totalAmount || 0).toLocaleString("es-CO")}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Monto abonado hoy</span>
          <span className="font-medium">
            ${Number(paidAmountToday || 0).toLocaleString("es-CO")}
          </span>
        </div>
      </div>

      {loading && <p className="text-xs text-gray-500">Procesando…</p>}
        {sellerName && (
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-gray-600">Vendedor:</span>
          <span className="font-semibold">{sellerName}</span>
        </div>
      )}
    </BaseModal>
  );
}
