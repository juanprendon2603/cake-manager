import BaseModal from "../../../components/BaseModal";
import type { PaymentMethod, ProductType } from "../../../types/payments";
import { humanize, paymentLabel } from "../../../utils/formatters";


interface Props {
  isOpen: boolean;
  onClose: () => void;
  productType: ProductType;
  size: string;
  flavorOrSponge: string;
  quantity: number;
  orderDate: string;
  paymentMethod: PaymentMethod;
  deductFromStock: boolean;
  totalAmount: number;
  paidAmountToday: number;
  onConfirm: () => void;
  loading?: boolean;
}

export default function PaymentConfirmModal({
  isOpen,
  onClose,
  productType,
  size,
  flavorOrSponge,
  quantity,
  orderDate,
  paymentMethod,
  deductFromStock,
  totalAmount,
  paidAmountToday,
  onConfirm,
  loading = false,
}: Props) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      headerAccent="purple"
      size="lg"
      title="Confirmar abono/pago"
      description="Revisa los detalles antes de registrar:"
      secondaryAction={{
        label: "Cancelar",
        onClick: onClose,
      }}
      primaryAction={{
        label: "Registrar",
        onClick: onConfirm,
      }}
      bodyClassName="space-y-4"
    >
      <div className="space-y-3 text-sm text-gray-800">
        <div className="flex justify-between">
          <span className="text-gray-500">Producto</span>
          <span className="font-medium">{productType === "cake" ? "Torta" : "Bizcocho"}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Tamaño</span>
          <span className="font-medium">{humanize(size)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">{productType === "cake" ? "Sabor" : "Tipo de bizcocho"}</span>
          <span className="font-medium">{humanize(flavorOrSponge)}</span>
        </div>

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

      {loading && (
        <p className="text-xs text-gray-500">Procesando…</p>
      )}
    </BaseModal>
  );
}
