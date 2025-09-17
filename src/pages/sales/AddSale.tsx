import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { easeM3 } from "./animations";
import { getBasePrice } from "./constants";

import Step1ProductType from "./steps/Step1ProductType";
import Step2Size from "./steps/Step2Size";
import Step3Flavor from "./steps/Step3Flavor";
import Step4Details from "./steps/Step4Details";

import BaseModal from "../../components/BaseModal";
import { FullScreenLoader } from "../../components/FullScreenLoader";
import { useToast } from "../../hooks/useToast";

import type { ProductType, PendingSale } from "../../types/stock";
import { humanize, paymentLabel } from "../../utils/formatters"; // <-- ¡Quitar "type" aquí!
import type { PaymentMethod } from "../inform/types";

import { buildKeys, tryDecrementStock, registerSale } from "./sales.service";

// Helper para mensajes de error sin usar 'any'
const getErrorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : typeof err === "string" ? err : "Error al procesar la venta.";

export function AddSale() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [productType, setProductType] = useState<ProductType | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [flavor, setFlavor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [totalPrice, setTotalPrice] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showNoStockModal, setShowNoStockModal] = useState(false);
  const [pendingSale, setPendingSale] = useState<PendingSale | null>(null);

  useEffect(() => {
    const qty = Math.max(1, parseInt(quantity || "1", 10) || 1);
    if (productType && size && flavor) {
      const base = getBasePrice(productType, size, flavor);
      const total = base * qty;
      setTotalPrice(total.toString());
    } else {
      setTotalPrice("");
    }
  }, [productType, size, flavor, quantity]);

  const onSelectProductType = (type: ProductType) => {
    setProductType(type);
    setSize(null);
    setFlavor(null);
    setStep(2);
  };

  const onSelectSize = (selectedSize: string) => {
    setSize(selectedSize);
    setFlavor(null);
    setStep(3);
  };

  const onSelectFlavor = (selectedFlavor: string) => {
    setFlavor(selectedFlavor);
    setStep(4);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!productType) throw new Error("Selecciona un producto.");
      if (!size) throw new Error("Selecciona un tamaño.");
      if (!flavor) {
        throw new Error(
          productType === "cake"
            ? "Selecciona un sabor."
            : "Selecciona un tipo de bizcocho."
        );
      }

      const quantityNumber = parseInt(quantity || "0", 10);
      if (!Number.isFinite(quantityNumber) || quantityNumber <= 0) {
        throw new Error("Ingresa una cantidad válida mayor a 0.");
      }

      const amountCOP = Number(totalPrice || 0);
      if (!Number.isFinite(amountCOP) || amountCOP <= 0) {
        throw new Error("Ingresa un precio total válido mayor a 0.");
      }

      const { dayKey, monthKey } = buildKeys();

      // Intento de descuento de stock
      const result = await tryDecrementStock(
        productType,
        size,
        flavor,
        quantityNumber
      );

      if (!result.decremented) {
        // Guardamos la venta pendiente y pedimos confirmación para continuar sin stock
        setPendingSale({
          productType,
          size,
          flavor,
          quantityNumber,
          amountCOP,
          dayKey,
          monthKey,
          paymentMethod,
        });
        setShowNoStockModal(true);
        setIsLoading(false);
        return;
      }

      // Stock descontado -> registrar
      await registerSale({
        productType,
        size,
        flavor,
        quantityNumber,
        amountCOP,
        dayKey,
        monthKey,
        paymentMethod,
      });

      addToast({
        type: "success",
        title: "¡Venta registrada! 🎉",
        message: "Venta registrada exitosamente.",
        duration: 5000,
      });

      setTimeout(() => navigate("/sales"), 800);
    } catch (err: unknown) {
      addToast({
        type: "error",
        title: "Ups, algo salió mal 😞",
        message: getErrorMessage(err),
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <FullScreenLoader message="🚀 Procesando venta..." />;
  }

  const getStepTitle = () =>
    [
      "¿Qué vas a vender?",
      "Selecciona el tamaño",
      productType === "cake" ? "Elige el sabor" : "Tipo de bizcocho",
      "Detalles de la venta",
    ][step - 1] ?? "Registrar venta";

  const getStepSubtitle = () => {
    switch (step) {
      case 1:
        return "Comencemos eligiendo el tipo de producto";
      case 2:
        return `Tamaños disponibles para ${
          productType === "cake" ? "tortas" : "bizcochos"
        }`;
      case 3:
        return productType === "cake"
          ? "Sabores disponibles"
          : "Tipos de bizcocho disponibles";
      case 4:
        return "Confirma los detalles antes de registrar";
      default:
        return "";
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex items-center justify-center px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: easeM3 }}
        className="max-w-4xl w-full bg-white/80 backdrop-blur-xl border-2 border-white/60 rounded-3xl p-8 shadow-2xl space-y-8"
      >
        <div className="text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-10" />
          <div className="relative z-10 py-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl shadow-lg">
                💰
              </div>
            </div>
            <motion.h1
              layoutId="title"
              className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2"
            >
              {getStepTitle()}
            </motion.h1>
            <p className="text-gray-600 text-lg">{getStepSubtitle()}</p>

            <div className="flex justify-center mt-6">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        step >= n
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {n}
                    </div>
                    {n < 4 && (
                      <div
                        className={`w-8 h-1 mx-1 rounded-full transition-all duration-300 ${
                          step > n
                            ? "bg-gradient-to-r from-purple-500 to-pink-500"
                            : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <Step1ProductType onSelectProductType={onSelectProductType} />
            )}

            {step === 2 && (
              <Step2Size
                productType={productType}
                size={size}
                onSelectSize={onSelectSize}
                onBack={() => setStep(1)}
              />
            )}

            {step === 3 && (
              <Step3Flavor
                productType={productType!}
                flavor={flavor}
                onSelectFlavor={onSelectFlavor}
                onBack={() => setStep(2)}
              />
            )}

            {step === 4 && (
              <Step4Details
                productType={productType}
                size={size}
                flavor={flavor}
                quantity={quantity}
                setQuantity={setQuantity}
                totalPrice={totalPrice}
                setTotalPrice={setTotalPrice}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                setStep={setStep}
                setShowConfirmModal={setShowConfirmModal}
                isLoading={isLoading}
                addToast={addToast}
                humanize={humanize}
                paymentLabel={paymentLabel}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Modal confirmar venta */}
      <BaseModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        headerAccent="purple"
        title="Confirmar venta"
        description="Revisa los detalles antes de registrar:"
        secondaryAction={{
          label: "Cancelar",
          onClick: () => setShowConfirmModal(false),
        }}
        primaryAction={{
          label: "🚀 Registrar venta",
          onClick: () => {
            const fakeEvent = {
              preventDefault: () => {},
            } as unknown as React.FormEvent;
            setShowConfirmModal(false);
            handleSubmit(fakeEvent);
          },
        }}
      >
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block">Producto</span>
                <span className="font-semibold text-gray-800">
                  {productType === "cake" ? "🎂 Torta" : "🧁 Bizcocho"}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Tamaño</span>
                <span className="font-semibold text-gray-800 capitalize">
                  {humanize(size)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">
                  {productType === "cake" ? "Sabor" : "Tipo"}
                </span>
                <span className="font-semibold text-gray-800 capitalize">
                  {humanize(flavor)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Cantidad</span>
                <span className="font-semibold text-gray-800">
                  x{parseInt(quantity || "0", 10)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-gray-500 text-sm block">Método de pago</span>
                <span className="font-semibold text-gray-800">
                  {paymentLabel(paymentMethod)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-gray-500 text-sm block">Total</span>
                <span className="font-bold text-2xl text-green-600">
                  ${Number(totalPrice || 0).toLocaleString("es-CO")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </BaseModal>

      {/* Modal sin stock */}
      <BaseModal
        isOpen={!!showNoStockModal && !!pendingSale}
        onClose={() => {
          setShowNoStockModal(false);
          setPendingSale(null);
        }}
        headerAccent="amber"
        title="Inventario insuficiente"
        description={
          <>
            No cuentas con este producto en el inventario. <br />
            <span className="font-semibold">¿Deseas continuar de todas formas?</span>
            <br />
            Se registrará la venta, pero{" "}
            <span className="font-semibold">no se descontará</span> del inventario.
          </>
        }
        secondaryAction={{
          label: "Cancelar",
          onClick: () => {
            setShowNoStockModal(false);
            setPendingSale(null);
          },
        }}
        primaryAction={{
          label: "Continuar de todas formas",
          onClick: async () => {
            if (!pendingSale) return;
            try {
              setIsLoading(true);
              await registerSale(pendingSale);
              setShowNoStockModal(false);
              setPendingSale(null);
              addToast({
                type: "success",
                title: "¡Venta registrada sin stock! 🎉",
                message: "Se registró la venta sin descontar inventario.",
                duration: 5000,
              });
              setTimeout(() => navigate("/sales"), 800);
            } catch (err: unknown) {
              addToast({
                type: "error",
                title: "Error al registrar la venta 😞",
                message: getErrorMessage(err),
                duration: 5000,
              });
            } finally {
              setIsLoading(false);
            }
          },
        }}
      >
        {pendingSale && (
          <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
            <div className="flex justify-between">
              <span>Producto:</span>
              <span className="font-semibold">
                {pendingSale.productType === "cake" ? "Torta" : "Bizcocho"} •{" "}
                {humanize(pendingSale.size)} • {humanize(pendingSale.flavor)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Cantidad:</span>
              <span className="font-semibold">x{pendingSale.quantityNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-semibold">
                ${pendingSale.amountCOP.toLocaleString("es-CO")}
              </span>
            </div>
          </div>
        )}
      </BaseModal>
    </main>
  );
}

export default AddSale;
