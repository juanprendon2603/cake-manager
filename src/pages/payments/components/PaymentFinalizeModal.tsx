import BaseModal from "../../../components/BaseModal";
import type { PendingPaymentGroup } from "../../../types/payments";
import { humanize, paymentLabel } from "../../../utils/formatters";


interface Props {
  isOpen: boolean;
  onClose: () => void;
  group: PendingPaymentGroup;
  onConfirm: () => void;
  loading?: boolean;
}

export default function PaymentFinalizeModal({
  isOpen,
  onClose,
  group,
  onConfirm,
  loading = false,
}: Props) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Confirmar pago"
      description="Se marcará el pedido como finalizado. Si hay saldo pendiente, se creará una venta por el restante."
      secondaryAction={{ label: "Cancelar", onClick: onClose }}
      primaryAction={{ label: "Pagar", onClick: onConfirm }}
      bodyClassName="space-y-5"
    >
      <div className="bg-violet-50/60 border border-violet-200 rounded-xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Pedido</span>
            <span className="font-medium">{group.orderDay}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Producto</span>
            <span className="font-medium">
              {group.type === "cake" ? "Torta" : "Bizcocho"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Detalle</span>
            <span className="font-medium">
              {humanize(group.size)}
              {group.type === "cake" && group.flavor ? ` · ${humanize(group.flavor)}` : ""}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Cantidad</span>
            <span className="font-medium">x{group.quantity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Método</span>
            <span className="font-medium">{paymentLabel(group.paymentMethod)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Inventario</span>
            <span className="font-medium">{group.deductedFromStock ? "Descontado" : "Pendiente"}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <div className="rounded-xl border border-gray-200 p-3 text-center">
          <div className="text-gray-500 mb-1">Total</div>
          <div className="font-extrabold text-violet-700">
            ${group.totalAmountCOP.toLocaleString("es-CO")}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 p-3 text-center">
          <div className="text-gray-500 mb-1">Abonado</div>
          <div className="font-bold text-gray-800">
            ${group.abonado.toLocaleString("es-CO")}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 p-3 text-center">
          <div className="text-gray-500 mb-1">Pendiente</div>
          <div className={`font-extrabold ${group.restante > 0 ? "text-yellow-700" : "text-emerald-700"}`}>
            ${group.restante.toLocaleString("es-CO")}
          </div>
        </div>
      </div>

      {loading && <p className="text-xs text-gray-500">Procesando…</p>}
    </BaseModal>
  );
}
