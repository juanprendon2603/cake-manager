import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../lib/firebase";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../../hooks/useToast";
import { FullScreenLoader } from "../../components/FullScreenLoader";

import {
  getBasePrice,
} from "./constants";
import {  easeM3 } from "./animations";

import Step1ProductType from "./steps/Step1ProductType";
import Step2Size from "./steps/Step2Size";
import Step3Flavor from "./steps/Step3Flavor";
import Step4Details from "./steps/Step4Details";

export function AddSale() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [productType, setProductType] = useState<"cake" | "sponge" | null>(null);
   const [size, setSize] = useState<string | null>(null);
  const [flavor, setFlavor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [totalPrice, setTotalPrice] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const { addToast } = useToast();

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const humanize = (s?: string | null) => (s ? s.replace(/_/g, " ") : "");
  const paymentLabel = (pm: string) => (pm === "cash" ? "Efectivo" : pm === "transfer" ? "Transferencia" : pm);

  

  useEffect(() => {
    const qty = Math.max(1, parseInt(quantity || "1", 10) || 1);
  
    if (productType && size && flavor) {
      const basePrice = getBasePrice(productType, size, flavor);
      if (basePrice === 0) {
        console.warn("Precio base 0 — revisa size/flavor/productType", { productType, size, flavor });
      }
      const total = basePrice * qty;
      setTotalPrice(total.toString());
    } else {
      setTotalPrice("");
    }
  }, [productType, size, flavor, quantity]);
  

  const onSelectProductType = (type: "cake" | "sponge") => {
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
      if (!size) throw new Error("Selecciona un tamaño.");
      if (!flavor) {
        throw new Error(productType === "cake" ? "Selecciona un sabor." : "Selecciona un tipo de bizcocho.");
      }

      const quantityNumber = parseInt(quantity);
      if (isNaN(quantityNumber) || quantityNumber <= 0) throw new Error("Ingresa una cantidad válida mayor a 0.");

      const totalPriceNumber = parseFloat(totalPrice);
      if (isNaN(totalPriceNumber) || totalPriceNumber <= 0) throw new Error("Ingresa un precio total válido mayor a 0.");

      const stockRef = doc(db, "stock", `${productType}_${size}`);
      const stockSnap = await getDoc(stockRef);
      if (!stockSnap.exists()) throw new Error("El producto no existe en el stock.");

      const stockData = stockSnap.data();

      if (productType === "cake") {
        const currentQuantity = stockData.flavors?.[flavor] || 0;
        if (currentQuantity < quantityNumber) throw new Error("No hay suficiente stock para este sabor y cantidad.");
        const updatedFlavors = { ...stockData.flavors, [flavor]: currentQuantity - quantityNumber };
        await updateDoc(stockRef, { flavors: updatedFlavors });
      } else if (productType === "sponge") {
        const currentQuantity = stockData.quantity || 0;
        if (currentQuantity < quantityNumber) throw new Error("No hay suficiente stock para este tamaño.");
        await updateDoc(stockRef, { quantity: currentQuantity - quantityNumber });
      }

      const today = format(new Date(), "yyyy-MM-dd");
      const salesRef = doc(db, "sales", today);

      const saleItem = {
        id: Date.now().toString(),
        type: productType,
        size,
        flavor,
        cantidad: parseInt(quantity),
        valor: parseFloat(totalPrice),
        paymentMethod,
      };

      const salesSnap = await getDoc(salesRef);
      if (salesSnap.exists()) {
        await updateDoc(salesRef, { sales: arrayUnion(saleItem) });
      } else {
        await setDoc(salesRef, { fecha: today, sales: [saleItem], expenses: [] });
      }

      addToast({
        type: "success",
        title: "¡Venta registrada! 🎉",
        message: "Venta registrada exitosamente.",
        duration: 5000,
      });
      setTimeout(() => navigate("/sales"), 800);
    } catch (err) {
      addToast({
        type: "error",
        title: "Ups, algo salió mal 😞",
        message: (err as Error).message ?? "Error al procesar la venta.",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <FullScreenLoader message="🚀 Procesando venta..." />;
  }

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "¿Qué vas a vender?";
      case 2:
        return "Selecciona el tamaño";
      case 3:
        return productType === "cake" ? "Elige el sabor" : "Tipo de bizcocho";
      case 4:
        return "Detalles de la venta";
      default:
        return "Registrar venta";
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case 1:
        return "Comencemos eligiendo el tipo de producto";
      case 2:
        return `Tamaños disponibles para ${productType === "cake" ? "tortas" : "bizcochos"}`;
      case 3:
        return productType === "cake" ? "Sabores disponibles" : "Tipos de bizcocho disponibles";
      case 4:
        return "Confirma los detalles antes de registrar";
      default:
        return "";
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex items-center justify-center px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.4, ease: easeM3 }} className="max-w-4xl w-full bg-white/80 backdrop-blur-xl border-2 border-white/60 rounded-3xl p-8 shadow-2xl space-y-8">
        <div className="text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-10" />
          <div className="relative z-10 py-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl shadow-lg">💰</div>
            </div>
            <motion.h1 layoutId="title" className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              {getStepTitle()}
            </motion.h1>
            <p className="text-gray-600 text-lg">{getStepSubtitle()}</p>

            <div className="flex justify-center mt-6">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((stepNum) => (
                  <div key={stepNum} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        step >= stepNum ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg" : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {stepNum}
                    </div>
                    {stepNum < 4 && <div className={`w-8 h-1 mx-1 rounded-full transition-all duration-300 ${step > stepNum ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-gray-200"}`} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full">
          <AnimatePresence mode="wait">
            {step === 1 && <Step1ProductType onSelectProductType={onSelectProductType} />}

            {step === 2 && (
              <Step2Size
                productType={productType}
                size={size}
                onSelectSize={onSelectSize}
                onBack={() => setStep(1)}
              />
            )}

            {step === 3 && productType === "cake" && (
              <Step3Flavor productType={productType} flavor={flavor} onSelectFlavor={onSelectFlavor} onBack={() => setStep(2)} />
            )}

            {step === 3 && productType === "sponge" && (
              <Step3Flavor productType={productType} flavor={flavor} onSelectFlavor={onSelectFlavor} onBack={() => setStep(2)} />
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

      {showConfirmModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="relative p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-purple-500 to-pink-500 opacity-10" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl">✅</div>
                <h3 className="text-xl font-bold text-purple-700">Confirmar venta</h3>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-6">Revisa los detalles antes de registrar:</p>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 block">Producto</span>
                      <span className="font-semibold text-gray-800">{productType === "cake" ? "🎂 Torta" : "🧁 Bizcocho"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Tamaño</span>
                      <span className="font-semibold text-gray-800 capitalize">{humanize(size)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">{productType === "cake" ? "Sabor" : "Tipo"}</span>
                      <span className="font-semibold text-gray-800 capitalize">{humanize(flavor)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Cantidad</span>
                      <span className="font-semibold text-gray-800">x{parseInt(quantity || "0", 10)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-gray-500 text-sm block">Método de pago</span>
                      <span className="font-semibold text-gray-800">{paymentLabel(paymentMethod)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-500 text-sm block">Total</span>
                      <span className="font-bold text-2xl text-green-600">${Number(totalPrice || 0).toLocaleString("es-CO")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowConfirmModal(false)} className="px-6 py-3 text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-100 transition font-semibold" disabled={isLoading}>
                Cancelar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowConfirmModal(false);
                  const fakeEvent = { preventDefault: () => {} } as unknown as React.FormEvent;
                  handleSubmit(fakeEvent);
                }}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition font-bold disabled:opacity-60"
                disabled={isLoading}
              >
                🚀 Registrar venta
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </main>
  );
}