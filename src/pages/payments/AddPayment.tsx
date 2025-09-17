import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { BackButton } from "../../components/BackButton";
import { FullScreenLoader } from "../../components/FullScreenLoader";
import { useToast } from "../../hooks/useToast";
import type { PaymentFormState } from "../../types/payments";
import AddPaymentForm from "./AddPaymentForm";
import PaymentConfirmModal from "./components/PaymentConfirmModal";
import { deductStockIfRequested, registerPayment } from "./payment.service";

export function AddPayment() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const [state, setState] = useState<PaymentFormState>(() => ({
    productType: "cake",
    selectedSize: "",
    selectedFlavor: "",
    selectedSpongeType: "",
    quantity: "1",
    totalAmount: "",
    partialAmount: "",
    paymentMethod: "cash",
    deductFromStock: false,
    isTotalPayment: false,
    orderDate: format(new Date(), "yyyy-MM-dd"),
  }));

  // Auto toggle pago total
  useEffect(() => {
    if (state.totalAmount && state.partialAmount) {
      setState((s) => ({
        ...s,
        isTotalPayment: parseFloat(s.partialAmount) === parseFloat(s.totalAmount),
      }));
    } else {
      setState((s) => ({ ...s, isTotalPayment: false }));
    }
  }, [state.totalAmount, state.partialAmount]);

  // Helpers
  const prettyFlavorOrSponge = useMemo(
    () => (state.productType === "cake" ? state.selectedFlavor : state.selectedSpongeType),
    [state.productType, state.selectedFlavor, state.selectedSpongeType]
  );

  // Validación simple previa al modal
  const validateBeforeConfirm = (): string | null => {
    if (!state.selectedSize) return "Selecciona un tamaño.";
    if (state.productType === "cake" && !state.selectedFlavor) return "Selecciona un sabor.";
    if (state.productType === "sponge" && !state.selectedSpongeType) return "Selecciona el tipo de bizcocho.";

    const qty = parseInt(state.quantity, 10);
    if (!Number.isFinite(qty) || qty <= 0) return "Ingresa una cantidad válida.";

    const total = parseFloat(state.totalAmount);
    if (!Number.isFinite(total) || total <= 0) return "Ingresa un valor total válido.";

    if (!state.isTotalPayment) {
      const part = parseFloat(state.partialAmount);
      if (!Number.isFinite(part) || part <= 0) return "Ingresa un valor válido para el abono.";
      if (part > total) return "El abono no puede ser mayor al valor total.";
    }

    return null;
  };

  const openConfirm = () => {
    const err = validateBeforeConfirm();
    if (err) {
      setErrorMessage(err);
      return;
    }
    setErrorMessage("");
    setShowConfirm(true);
  };

  const onConfirm = async () => {
    const qty = parseInt(state.quantity, 10);
    const total = parseFloat(state.totalAmount);
    const paid = state.isTotalPayment ? total : parseFloat(state.partialAmount);
    const flavorOrSponge = prettyFlavorOrSponge;

    setLoading(true);
    try {
      // 1) stock (opcional)
      await deductStockIfRequested(
        state.productType,
        state.selectedSize,
        flavorOrSponge,
        qty,
        state.deductFromStock
      );

      // 2) persistencias
      const today = format(new Date(), "yyyy-MM-dd");
      await registerPayment({
        today,
        productType: state.productType,
        size: state.selectedSize,
        flavorOrSponge,
        quantity: qty,
        totalAmount: total,
        paidAmountToday: paid,
        paymentMethod: state.paymentMethod,
        totalPayment: state.isTotalPayment,
        deductedFromStock: state.deductFromStock,
        orderDate: state.orderDate,
      });

      addToast({
        type: "success",
        title: "¡Abono registrado!",
        message: "Abono/pago registrado exitosamente.",
        duration: 5000,
      });
      navigate("/payment-management");
    } catch (e) {
      const msg = (e as Error).message ?? "Error al registrar el abono.";
      setErrorMessage(msg);
      addToast({
        type: "error",
        title: "Ups, algo salió mal",
        message: msg,
        duration: 5000,
      });
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  const patch = (p: Partial<PaymentFormState>) => setState((s) => ({ ...s, ...p }));

  if (loading) {
    return <FullScreenLoader message="Guardando abono..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex flex-col">
      <main className="flex-grow p-6 sm:p-12 max-w-6xl mx-auto w-full">
        <header className="mb-12 text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl opacity-10" />
          <div className="relative z-10 py-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl shadow-xl ring-4 ring-purple-200">
                💳
              </div>
            </div>
            <h1 className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-[#8E2DA8] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent mb-4 drop-shadow-[0_2px_12px_rgba(142,45,168,0.25)]">
              Registrar Abono/Pago
            </h1>
            <p className="text-xl text-gray-700 font-medium mb-8">
              Registra abonos o pagos totales y actualiza el inventario si lo deseas.
            </p>
            <div className="absolute top-4 left-4">
              <BackButton />
            </div>
          </div>
        </header>

        <AddPaymentForm
          state={state}
          setState={patch}
          errorMessage={errorMessage}
          onClickOpenConfirm={openConfirm}
          loading={loading}
        />

        <div className="mt-8 max-w-xl mx-auto">
          <div className="bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white rounded-xl p-5 shadow-lg text-center">
            <p className="text-sm opacity-90">Tip</p>
            <p className="text-base">
              Si marcas “Descontar del inventario”, verificaremos el stock antes de registrar el pago.
            </p>
          </div>
        </div>
      </main>

      <footer className="text-center text-sm text-gray-400 py-6">
        © 2025 CakeManager. Todos los derechos reservados.
      </footer>

      <PaymentConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        productType={state.productType}
        size={state.selectedSize}
        flavorOrSponge={prettyFlavorOrSponge}
        quantity={parseInt(state.quantity || "0", 10)}
        orderDate={state.orderDate}
        paymentMethod={state.paymentMethod}
        deductFromStock={state.deductFromStock}
        totalAmount={Number(state.totalAmount || 0)}
        paidAmountToday={
          state.isTotalPayment ? Number(state.totalAmount || 0) : Number(state.partialAmount || 0)
        }
        onConfirm={onConfirm}
        loading={loading}
      />
    </div>
  );
}

export default AddPayment;
