import { motion } from "framer-motion";
import type { Toast } from "../../../types/toast";

type Props = {
  productType: string | null;
  size: string | null;
  flavor: string | null;
  quantity: string;
  setQuantity: (v: string) => void;
  totalPrice: string;
  setTotalPrice: (v: string) => void;
  paymentMethod: string;
  setPaymentMethod: (v: string) => void;
  setStep: (n: number) => void;
  setShowConfirmModal: (v: boolean) => void;
  isLoading: boolean;
  addToast: (t: Omit<Toast, "id">) => void;
  humanize: (s?: string | null) => string;
  paymentLabel: (pm: string) => string;
};

export default function Step4Details({
  productType,
  size,
  flavor,
  quantity,
  setQuantity,
  totalPrice,
  setTotalPrice,
  paymentMethod,
  setPaymentMethod,
  setStep,
  setShowConfirmModal,
  isLoading,
  addToast,
  humanize,
}: Props) {
  return (
    <motion.form key="step-4" className="space-y-6 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
        <h3 className="font-bold text-purple-700 mb-4 flex items-center gap-2">
          <span className="text-xl">📋</span>
          Resumen del producto
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Tipo:</span>
            <span className="font-semibold">{productType === "cake" ? "Torta" : "Bizcocho"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tamaño:</span>
            <span className="font-semibold capitalize">{humanize(size)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{productType === "cake" ? "Sabor:" : "Tipo:"}</span>
            <span className="font-semibold capitalize">{humanize(flavor)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block mb-2 font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-lg">🔢</span>
            Cantidad
          </label>
          <motion.input
            whileFocus={{ scale: 1.02, boxShadow: "0 0 0 4px rgba(142,45,168,.15)" }}
            type="number"
            onWheel={(e) => e.preventDefault()}
            min="1"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full border-2 border-purple-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-purple-500 transition-all duration-200 bg-white/70 backdrop-blur"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-lg">💰</span>
            Precio total
          </label>
          <motion.input
            whileFocus={{ scale: 1.02, boxShadow: "0 0 0 4px rgba(142,45,168,.15)" }}
            type="number"
            min="0"
            onWheel={(e) => e.preventDefault()}
            step="0.01"
            value={totalPrice}
            onChange={(e) => setTotalPrice(e.target.value)}
            className="w-full border-2 border-purple-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-purple-500 transition-all duration-200 bg-white/70 backdrop-blur"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-lg">💳</span>
            Método de pago
          </label>
          <motion.select
            whileFocus={{ scale: 1.02, boxShadow: "0 0 0 4px rgba(142,45,168,.15)" }}
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full border-2 border-purple-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-purple-500 transition-all duration-200 bg-white/70 backdrop-blur"
          >
            <option value="cash">💵 Efectivo</option>
            <option value="transfer">🏦 Transferencia</option>
          </motion.select>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          onClick={() => setStep(3)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200"
          onClick={() => {
            if (!productType) {
              addToast({ type: "error", title: "Falta info", message: "Selecciona el tipo de producto.", duration: 4000 });
              return;
            }
            if (!size) {
              addToast({ type: "error", title: "Falta info", message: "Selecciona un tamaño.", duration: 4000 });
              return;
            }
            if (!flavor) {
              addToast({
                type: "error",
                title: "Falta info",
                message: productType === "cake" ? "Selecciona un sabor." : "Selecciona un tipo de bizcocho.",
                duration: 4000,
              });
              return;
            }
            const qty = parseInt(quantity);
            const price = parseFloat(totalPrice);
            if (isNaN(qty) || qty <= 0) {
              addToast({ type: "error", title: "Cantidad inválida", message: "Ingresa una cantidad mayor a 0.", duration: 4000 });
              return;
            }
            if (isNaN(price) || price <= 0) {
              addToast({ type: "error", title: "Precio inválido", message: "Ingresa un precio total mayor a 0.", duration: 4000 });
              return;
            }
            setShowConfirmModal(true);
          }}
          disabled={isLoading}
        >
          <span className="text-lg">✅</span>
          Confirmar venta
        </motion.button>
      </div>
    </motion.form>
  );
}