import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../../components/BackButton";
import { FullScreenLoader } from "../../components/FullScreenLoader";
import { useToast } from "../../hooks/useToast";
import { paymentLabel } from "../../utils/formatters";
import BaseModal from "../../components/BaseModal";
import {
  registerGeneralExpense,
  type PaymentMethod,
} from "../sales/sales.service"; // ajusta la ruta si tu service está en otra carpeta

export function AddGeneralExpense() {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [message, setMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { addToast } = useToast();
  const navigate = useNavigate();

  const validate = () => {
    if (!description.trim() || !amount || Number(amount) <= 0) {
      setMessage(
        "Todos los campos son obligatorios y el valor debe ser mayor a 0."
      );
      return false;
    }
    setMessage("");
    return true;
  };

  // helper para errores sin 'any'
  const getErrorMessage = (e: unknown): string =>
    e instanceof Error ? e.message : "Error al registrar el gasto.";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await registerGeneralExpense({
        description,
        valueCOP: Number(amount),
        paymentMethod,
      });

      addToast({
        type: "success",
        title: "¡Gasto general registrado!",
        message: "Gasto registrado correctamente.",
        duration: 5000,
      });

      setDescription("");
      setAmount("");
      setTimeout(() => navigate("/general-expenses"), 800);
    } catch (error: unknown) {
      addToast({
        type: "error",
        title: "Ups, algo salió mal",
        message: getErrorMessage(error),
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full border border-[#E8D4F2] rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#8E2DA8] focus:border-transparent placeholder:text-gray-400";

  if (loading) {
    return <FullScreenLoader message="Guardando gasto general..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex flex-col">
      <main className="flex-grow p-6 sm:p-12 max-w-6xl mx-auto w-full">
        <header className="mb-12 text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl opacity-10" />
          <div className="relative z-10 py-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl shadow-xl ring-4 ring-purple-200">
                💸
              </div>
            </div>
            <h1 className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-[#8E2DA8] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent mb-4 drop-shadow-[0_2px_12px_rgba(142,45,168,0.25)]">
              Registrar Gasto General
            </h1>
            <p className="text-xl text-gray-700 font-medium mb-8">
              Añade un gasto general del mes
            </p>
            <div className="absolute top-4 left-4">
              <BackButton />
            </div>
          </div>
        </header>

        <section className="max-w-xl mx-auto bg-white border border-[#E8D4F2] shadow-md rounded-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Método de pago
              </label>
              <select
                className={inputBase}
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as PaymentMethod)
                }
              >
                <option value="cash">Efectivo</option>
                <option value="transfer">Transferencia</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Descripción
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Servicios públicos, arriendo, insumos generales..."
                className={inputBase}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Valor
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className={`${inputBase} pl-8`}
                  placeholder="0"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Ingresa el valor en pesos colombianos.
              </p>
            </div>

            <button
              type="button"
              className="w-full bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white py-3.5 rounded-xl font-semibold shadow-md hover:opacity-95 transition disabled:opacity-60"
              onClick={() => {
                if (!validate()) return;
                setShowConfirmModal(true);
              }}
              disabled={loading}
            >
              Guardar gasto
            </button>
          </form>

          {message && (
            <div
              className={`mt-4 rounded-lg px-4 py-3 text-sm ${
                message.includes("correctamente")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}
        </section>

        <div className="mt-8 max-w-xl mx-auto">
          <div className="bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white rounded-xl p-5 shadow-lg text-center">
            <p className="text-sm opacity-90">Tip</p>
            <p className="text-base">
              Usa descripciones claras para facilitar tu resumen mensual.
            </p>
          </div>
        </div>
      </main>

      <footer className="text-center text-sm text-gray-400 py-6">
        © 2025 CakeManager. Todos los derechos reservados.
      </footer>

      {/* Modal reutilizable */}
      <BaseModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        headerAccent="purple"
        title="Confirmar gasto general"
        description="Revisa los detalles antes de registrar:"
        secondaryAction={{
          label: "Cancelar",
          onClick: () => setShowConfirmModal(false),
        }}
        primaryAction={{
          label: "Registrar gasto",
          onClick: () => {
            setShowConfirmModal(false);
            const fakeEvent = {
              preventDefault: () => {},
            } as unknown as React.FormEvent;
            handleSubmit(fakeEvent);
          },
        }}
      >
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block">Método de pago</span>
                <span className="font-semibold text-gray-800">
                  {paymentLabel(paymentMethod)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Valor</span>
                <span className="font-bold text-[#8E2DA8]">
                  ${Number(amount || 0).toLocaleString("es-CO")}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500 block">Descripción</span>
                <span className="font-medium text-gray-800">
                  {description || "-"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}

export default AddGeneralExpense;
