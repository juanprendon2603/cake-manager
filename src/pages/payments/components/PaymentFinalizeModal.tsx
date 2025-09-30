import BaseModal from "../../../components/BaseModal";
import type { PendingPaymentGroup } from "../../../types/payments";
import { paymentLabel } from "../../../utils/formatters";
import type { CategoryStep, ProductCategory } from "../../stock/stock.model";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  group: PendingPaymentGroup;
  onConfirm: () => void;
  loading?: boolean;
  /** Para resolver labels de selections */
  category: ProductCategory | null;
}

// Reemplaza prettySelections por esta versión:
function prettySelections(
  category: ProductCategory | null,
  selectionsInput: Record<string, string> | undefined | null,
  variantKey?: string
): Array<{ label: string; value: string }> {
  const selections: Record<string, string> = selectionsInput ?? {};

  if (category && Array.isArray(category.steps)) {
    const affecting: CategoryStep[] = (category.steps || []).filter(
      (s) => s.affectsStock
    );
    const pretty = affecting.map((st) => {
      const valKey = selections[st.key] ?? "";
      const valueLabel =
        st.options?.find((o) => o.key === valKey)?.label ?? valKey;
      return { label: st.label, value: valueLabel };
    });
    const hasAny = pretty.some((p) => p.value);
    if (!hasAny && variantKey) {
      try {
        const parts = variantKey.split("|").map((p) => p.split(":"));
        return parts
          .filter((kv) => kv.length === 2)
          .map(([k, v]) => ({ label: k, value: v }));
      } catch {}
    }
    return pretty;
  }

  const entries = Object.entries(selections);
  if (entries.length > 0) {
    return entries.map(([k, v]) => ({ label: k, value: v }));
  }

  if (variantKey) {
    try {
      const parts = variantKey.split("|").map((p) => p.split(":"));
      return parts
        .filter((kv) => kv.length === 2)
        .map(([k, v]) => ({ label: k, value: v }));
    } catch {}
  }

  return [];
}

export default function PaymentFinalizeModal({
  isOpen,
  onClose,
  group,
  onConfirm,
  loading = false,
  category,
}: Props) {
  const pretty = prettySelections(category, group.selections, group.variantKey);

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
            <span className="text-gray-500">Categoría</span>
            <span className="font-medium">{group.categoryName}</span>
          </div>

          {/* Detalle de selections */}
          <div className="sm:col-span-2">
            <div className="text-gray-500 mb-1">Detalle</div>
            <div className="flex flex-wrap gap-2">
              {pretty.map(({ label, value }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-violet-200 text-sm"
                >
                  <span className="text-gray-500">{label}:</span>
                  <span className="font-medium">{value}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Cantidad</span>
            <span className="font-medium">x{group.quantity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Método</span>
            <span className="font-medium">
              {paymentLabel(group.paymentMethod)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Inventario</span>
            <span className="font-medium">
              {group.deductedFromStock ? "Descontado" : "Pendiente"}
            </span>
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
          <div
            className={`font-extrabold ${
              group.restante > 0 ? "text-yellow-700" : "text-emerald-700"
            }`}
          >
            ${group.restante.toLocaleString("es-CO")}
          </div>
        </div>
      </div>

      {loading && <p className="text-xs text-gray-500">Procesando…</p>}
    </BaseModal>
  );
}
