// src/pages/payments/AddPaymentForm.tsx
import type { PaymentFormState, PaymentMethod } from "../../types/payments";
import type { CategoryStep, ProductCategory } from "../stock/stock.model";

type Props = {
  state: PaymentFormState;
  setState: (patch: Partial<PaymentFormState>) => void;
  errorMessage: string;
  onClickOpenConfirm: () => void;
  loading?: boolean;
  categories: ProductCategory[];
  selectedCategory: ProductCategory | null;
  onChangeCategory: (c: ProductCategory | null) => void;
  affectingSteps: CategoryStep[];
};

export default function AddPaymentForm({
  state,
  setState,
  errorMessage,
  onClickOpenConfirm,
  loading = false,
  categories,
  selectedCategory,
  onChangeCategory,
  affectingSteps,
}: Props) {
  const {
    quantity,
    totalAmount,
    partialAmount,
    paymentMethod,
    orderDate,
    deductFromStock,
    isTotalPayment,
  } = state;

  const inputBase =
    "w-full border border-[#E8D4F2] rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#8E2DA8] focus:border-transparent";

  const handleCategoryChange = (id: string) => {
    const next = categories.find((c) => c.id === id) || null;
    onChangeCategory(next);
    if (next) {
      const baseSel = Object.fromEntries(
        (next.steps || []).filter((s) => s.affectsStock).map((s) => [s.key, ""])
      );
      setState({ categoryId: next.id, selections: baseSel });
    } else {
      setState({ categoryId: "", selections: {} });
    }
  };

  return (
    <section className="max-w-xl mx-auto bg-white border border-[#E8D4F2] shadow-md rounded-2xl p-6 sm:p-8">
      {errorMessage && (
        <div className="mb-4 rounded-lg px-4 py-3 text-sm bg-red-50 text-red-700 border border-red-200">
          {errorMessage}
        </div>
      )}

      <div className="space-y-5">
        {/* Categoría */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Categoría
          </label>
          <select
            value={selectedCategory?.id || ""}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className={inputBase}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Steps que afectan stock (dinámicos) */}
        {affectingSteps.map((st) => {
          const opts = (st.options || []).filter((o) => o.active !== false);
          return (
            <div key={st.key}>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {st.label}
              </label>
              <select
                value={state.selections[st.key] || ""}
                onChange={(e) =>
                  setState({
                    selections: {
                      ...state.selections,
                      [st.key]: e.target.value,
                    },
                  })
                }
                className={inputBase}
              >
                <option value="">Seleccionar</option>
                {opts.map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          );
        })}

        {/* Cantidad */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Cantidad
          </label>
          <input
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(e) => setState({ quantity: e.target.value })}
            className={inputBase}
            onWheel={(e) => e.currentTarget.blur()}
          />
        </div>

        {/* Valor total */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Valor total
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              $
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={totalAmount}
              onChange={(e) => setState({ totalAmount: e.target.value })}
              className={`${inputBase} pl-8`}
              placeholder="0"
              onWheel={(e) => e.currentTarget.blur()}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">En pesos colombianos.</p>
        </div>

        {/* Monto abonado (si no es total) */}
        {!isTotalPayment && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Monto abonado
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                $
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={partialAmount}
                onChange={(e) => setState({ partialAmount: e.target.value })}
                className={`${inputBase} pl-8`}
                placeholder="0"
                onWheel={(e) => e.currentTarget.blur()}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Ingresa cuánto abona el cliente.
            </p>
          </div>
        )}

        {/* Fecha del pedido */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Fecha del pedido
          </label>
          <input
            type="date"
            value={orderDate}
            onChange={(e) => setState({ orderDate: e.target.value })}
            className={inputBase}
          />
        </div>

        {/* Método de pago */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Método de pago
          </label>
          <select
            value={paymentMethod}
            onChange={(e) =>
              setState({ paymentMethod: e.target.value as PaymentMethod })
            }
            className={inputBase}
          >
            <option value="cash">Efectivo</option>
            <option value="transfer">Transferencia</option>
          </select>
        </div>

        {/* Descontar stock */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="deductStock"
            checked={deductFromStock}
            onChange={(e) => setState({ deductFromStock: e.target.checked })}
            className="accent-[#8E2DA8] h-4 w-4"
          />
          <label
            htmlFor="deductStock"
            className="text-sm font-semibold text-gray-700"
          >
            Descontar del inventario
          </label>
        </div>

        <button
          type="button"
          className="w-full bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white py-3.5 rounded-xl font-semibold shadow-md hover:opacity-95 transition disabled:opacity-60"
          onClick={onClickOpenConfirm}
          disabled={loading}
        >
          Registrar pago
        </button>
      </div>
    </section>
  );
}
