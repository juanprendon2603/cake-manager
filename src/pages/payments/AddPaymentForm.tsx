import { SIZE_OPTIONS, FLAVOR_OPTIONS_CAKE, SPONGE_TYPES } from "./constants";
import { humanize } from "../../utils/formatters";
import type { PaymentFormState } from "../../types/payments";
import type { ProductType } from "../../types/stock";
import type { PaymentMethod } from "../sales/sales.service";

interface Props {
  state: PaymentFormState;
  setState: (patch: Partial<PaymentFormState>) => void;
  errorMessage: string;
  onClickOpenConfirm: () => void;
  loading?: boolean;
}

export default function AddPaymentForm({
  state,
  setState,
  errorMessage,
  onClickOpenConfirm,
  loading = false,
}: Props) {
  const {
    productType,
    selectedSize,
    selectedFlavor,
    selectedSpongeType,
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

  const sizeOptions = SIZE_OPTIONS[productType];

  return (
    <section className="max-w-xl mx-auto bg-white border border-[#E8D4F2] shadow-md rounded-2xl p-6 sm:p-8">
      {errorMessage && (
        <div className="mb-4 rounded-lg px-4 py-3 text-sm bg-red-50 text-red-700 border border-red-200">
          {errorMessage}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Tipo de producto
          </label>
          <select
            value={productType}
            onChange={(e) =>
              setState({
                productType: e.target.value as ProductType,
                selectedSize: "",
                selectedFlavor: "",
                selectedSpongeType: "",
              })
            }
            className={inputBase}
          >
            <option value="cake">Torta</option>
            <option value="sponge">Bizcocho</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Tamaño
          </label>
          <select
            value={selectedSize}
            onChange={(e) => setState({ selectedSize: e.target.value })}
            className={inputBase}
          >
            <option value="">Seleccionar</option>
            {sizeOptions.map((size) => (
              <option key={size} value={size}>
                {humanize(size)}
              </option>
            ))}
          </select>
        </div>

        {productType === "cake" && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Sabor
            </label>
            <select
              value={selectedFlavor}
              onChange={(e) => setState({ selectedFlavor: e.target.value })}
              className={inputBase}
            >
              <option value="">Seleccionar</option>
              {FLAVOR_OPTIONS_CAKE.map((flavor) => (
                <option key={flavor} value={flavor}>
                  {humanize(flavor)}
                </option>
              ))}
            </select>
          </div>
        )}

        {productType === "sponge" && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Tipo de bizcocho
            </label>
            <select
              value={selectedSpongeType}
              onChange={(e) => setState({ selectedSpongeType: e.target.value })}
              className={inputBase}
            >
              <option value="">Seleccionar</option>
              {SPONGE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        )}

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

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Valor total
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
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

        {!isTotalPayment && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Monto abonado
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
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
            <p className="mt-1 text-xs text-gray-500">Ingresa cuánto abona el cliente.</p>
          </div>
        )}

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

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Método de pago
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setState({ paymentMethod: e.target.value as PaymentMethod })}
            className={inputBase}
          >
            <option value="cash">Efectivo</option>
            <option value="transfer">Transferencia</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="deductStock"
            checked={deductFromStock}
            onChange={(e) => setState({ deductFromStock: e.target.checked })}
            className="accent-[#8E2DA8] h-4 w-4"
          />
          <label htmlFor="deductStock" className="text-sm font-semibold text-gray-700">
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
