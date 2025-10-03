import { motion } from "framer-motion";
import type { PaymentMethod } from "../../../types/stock";
import { PageIcon, Ui, PaymentIcon } from "../../../components/ui/icons";

type Props = {
  selections: Record<string, string>;
  quantity: string;
  setQuantity: (v: string) => void;
  unitPrice: number;
  totalPrice: string;
  setTotalPrice: (v: string) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (pm: PaymentMethod) => void;
  onBack: () => void;
  onConfirm: () => void;
};

export default function StepDetailsGeneric({
  selections,
  quantity,
  setQuantity,
  unitPrice,
  totalPrice,
  setTotalPrice,
  paymentMethod,
  setPaymentMethod,
  onBack,
  onConfirm,
}: Props) {
  return (
    <motion.form
      className="space-y-6 max-w-md mx-auto"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
        <h3 className="font-bold text-purple-700 mb-4 flex items-center gap-2">
          {PageIcon("resumen")}{/* ← ícono lucide normal */}
          <span>Resumen</span>
        </h3>
        <div className="space-y-1 text-sm">
          {Object.entries(selections).map(([k, v]) => (
            <div className="flex justify-between" key={k}>
              <span className="text-gray-600 capitalize">{k}:</span>
              <span className="font-semibold capitalize">{v}</span>
            </div>
          ))}
          <div className="flex justify-between">
            <span className="text-gray-600">Precio unitario:</span>
            <span className="font-semibold">
              ${unitPrice.toLocaleString("es-CO")}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block mb-2 font-semibold text-gray-700">
            Cantidad
          </label>
          <input
            type="number"
            min={1}
            step={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full border-2 border-purple-200 rounded-xl px-4 py-3 bg-white/70"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold text-gray-700">
            Precio total
          </label>
          <input
            type="number"
            min={0}
            step={1}
            value={totalPrice}
            onChange={(e) => setTotalPrice(e.target.value)}
            className="w-full border-2 border-purple-200 rounded-xl px-4 py-3 bg-white/70"
          />
          <p className="text-xs text-gray-500 mt-1">
            Se precarga con unitario × cantidad; puedes editarlo.
          </p>
        </div>

        <div>
  <label className="block mb-2 font-semibold text-gray-700">
    Método de pago
  </label>
  <select
    value={paymentMethod}
    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
    className="w-full border-2 border-purple-200 rounded-xl px-4 py-3 bg-white/70"
  >
    <option value="cash">💵 Efectivo</option>
    <option value="transfer">🏦 Transferencia</option>
  </select>
</div>



      </div>

      <div className="flex justify-between items-center pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold shadow-lg inline-flex items-center gap-2"
        >
          <Ui.ArrowLeft className="w-5 h-5" />
          Volver
        </button>

        <button
          type="button"
          onClick={onConfirm}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg inline-flex items-center gap-2"
        >
          <Ui.Confirm className="w-5 h-5" />
          Confirmar venta
        </button>
      </div>
    </motion.form>
  );
}
