import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../lib/firebase";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { format } from "date-fns";
import { motion, AnimatePresence, cubicBezier } from "framer-motion";
import type { Variants } from "framer-motion";
import { useToast } from "../../hooks/useToast";
import { FullScreenLoader } from "../../components/FullScreenLoader";
const productTypes = [
  { id: "cake", label: "Cake" },
  { id: "sponge", label: "Sponge" },
];

const cakeSizes = [
  "octavo",
  "cuarto_redondo",
  "cuarto_cuadrado",
  "por_dieciocho",
  "media",
  "libra",
  "libra_y_media",
  "dos_libras",
];

const spongeSizes = ["media", "libra"];

const cakeFlavors = ["naranja", "vainilla_chips", "vainilla_chocolate", "negra"];

const spongeTypes = ["fría", "genovesa"];

const defaultPrices: Record<string, Record<string, Record<string, number>>> = {
  cake: {
    octavo: {
      naranja: 10000,
      vainilla_chips: 10000,
      vainilla_chocolate: 10000,
      negra: 12000,
    },
    "cuarto redondo": {
      naranja: 15000,
      vainilla_chips: 15000,
      vainilla_chocolate: 15000,
      negra: 18000,
    },
    "cuarto cuadrada": {
      naranja: 18000,
      vainilla_chips: 18000,
      vainilla_chocolate: 18000,
      negra: 20000,
    },
    por_dieciocho: {
      naranja: 24000,
      vainilla_chips: 24000,
      vainilla_chocolate: 24000,
      negra: 28000,
    },
    media: {
      naranja: 30000,
      vainilla_chips: 30000,
      vainilla_chocolate: 30000,
      negra: 40000,
    },
    libra: {
      naranja: 40000,
      vainilla_chips: 40000,
      vainilla_chocolate: 40000,
      negra: 50000,
    },
    "libra y media": {
      naranja: 60000,
      vainilla_chips: 60000,
      vainilla_chocolate: 60000,
      negra: 70000,
    },
  },
  sponge: {
    media: { fría: 35000, genovesa: 50000 },
    libra: { fría: 45000, genovesa: 70000 },
  },
};

const easeM3 = cubicBezier(0.4, 0, 0.2, 1);

const pageVariants: Variants = {
  initial: { opacity: 0, y: 12, filter: "blur(4px)" },
  enter: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.28, ease: easeM3 } },
  exit: { opacity: 0, y: -12, filter: "blur(4px)", transition: { duration: 0.2, ease: easeM3 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.18, ease: easeM3 } },
};

const containerStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};



export function AddSale() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [productType, setProductType] = useState<string | null>(null);
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
    if (productType && size && flavor) {
      const basePrice = defaultPrices[productType]?.[size]?.[flavor] ?? 0;
      setTotalPrice(basePrice.toString());
    }
  }, [productType, size, flavor]);

  const onSelectProductType = (type: string) => {
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
        title: "¡Venta registrada!",
        message: "Venta registrada exitosamente.",
        duration: 5000,
      }); setTimeout(() => navigate("/sales"), 800);
    } catch (err) {
      addToast({
        type: "error",
        title: "Ups, algo salió mal",
        message: (err as Error).message ?? "Error al procesar la venta.",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <FullScreenLoader message="Cargando inventario..." />;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FDF8FF] px-6 py-10">


      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="max-w-xl w-full bg-white rounded-2xl p-8 shadow-lg space-y-8 flex flex-col items-center"
      >
        <motion.h1 layoutId="title" className="text-3xl font-extrabold text-[#8E2DA8] text-center">
          Registrar venta
        </motion.h1>





        <div className="w-full">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                variants={pageVariants}
                initial="initial"
                animate="enter"
                exit="exit"
              >
                <motion.div
                  variants={containerStagger}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-2 gap-6 justify-center items-center"
                >
                  {productTypes.map((pt) => (
                    <motion.button
                      key={pt.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.04, boxShadow: "0 6px 18px rgba(142,45,168,.15)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onSelectProductType(pt.id)}
                      className="border-2 border-[#8E2DA8] rounded-xl p-6 text-center font-semibold text-[#8E2DA8] hover:bg-[#8E2DA8] hover:text-white transition-colors"
                    >
                      {pt.label}
                    </motion.button>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step-2" variants={pageVariants} initial="initial" animate="enter" exit="exit">
                <motion.h2 variants={itemVariants} initial="hidden" animate="show" className="text-xl font-semibold text-gray-700 text-center mb-4">
                  Selecciona el tamaño
                </motion.h2>

                <motion.div
                  variants={containerStagger}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center items-center place-items-center"
                >
                  {(productType === "cake" ? cakeSizes : spongeSizes).map((s) => {
                    const selected = size === s;
                    return (
                      <motion.button
                        key={s}
                        variants={itemVariants}
                        whileHover={{ scale: 1.05, boxShadow: "0 8px 24px rgba(142,45,168,.18)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelectSize(s)}
                        className={`border-2 rounded-2xl p-6 sm:p-8 text-lg text-center font-semibold break-words whitespace-normal w-full max-w-[240px] min-h-[110px] flex items-center justify-center transition-colors ${selected ? "bg-[#8E2DA8] text-white border-transparent" : "border-[#8E2DA8] text-[#8E2DA8] hover:bg-[#8E2DA8] hover:text-white"
                          }`}
                      >
                        {s.replace(/_/g, " ")}
                      </motion.button>
                    );
                  })}
                </motion.div>
                <AnimatePresence mode="popLayout">

                </AnimatePresence>

                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver a tipo de producto
                  </button>
                </div>


              </motion.div>
            )}

            {step === 3 && productType === "cake" && (
              <motion.div key="step-3-cake" variants={pageVariants} initial="initial" animate="enter" exit="exit">
                <motion.h2 variants={itemVariants} initial="hidden" animate="show" className="text-xl font-semibold text-gray-700 text-center mb-4">
                  Selecciona el sabor
                </motion.h2>
                <motion.div
                  variants={containerStagger}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center items-center place-items-center"
                >
                  {cakeFlavors.map((f) => {
                    const selected = flavor === f;
                    return (
                      <motion.button
                        key={f}
                        variants={itemVariants}
                        whileHover={{ scale: 1.05, boxShadow: "0 8px 24px rgba(142,45,168,.18)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelectFlavor(f)}
                        className={`border-2 rounded-2xl p-6 sm:p-8 text-lg text-center font-semibold break-words whitespace-normal w-full max-w-[240px] min-h-[110px] flex items-center justify-center transition-colors ${selected ? "bg-[#8E2DA8] text-white border-transparent" : "border-[#8E2DA8] text-[#8E2DA8] hover:bg-[#8E2DA8] hover:text-white"
                          }`}
                      >
                        {f.replace(/_/g, " ")}
                      </motion.button>
                    );
                  })}
                </motion.div>


                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver a tamaño
                  </button>
                </div>

              </motion.div>
            )}

            {step === 3 && productType === "sponge" && (
              <motion.div key="step-3-sponge" variants={pageVariants} initial="initial" animate="enter" exit="exit">
                <motion.h2 variants={itemVariants} initial="hidden" animate="show" className="text-xl font-semibold text-gray-700 text-center mb-4">
                  Selecciona tipo de bizcocho
                </motion.h2>
                <motion.div
                  variants={containerStagger}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-2 gap-4 max-h-64 overflow-auto justify-center items-center"
                >
                  {spongeTypes.map((t) => {
                    const selected = flavor === t;
                    return (
                      <motion.button
                        key={t}
                        variants={itemVariants}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelectFlavor(t)}
                        className={`border-2 rounded-xl p-4 text-center font-medium transition-colors ${selected ? "bg-[#8E2DA8] text-white border-transparent" : "border-[#8E2DA8] text-[#8E2DA8] hover:bg-[#8E2DA8] hover:text-white"
                          }`}
                      >
                        {t}
                      </motion.button>
                    );
                  })}
                </motion.div>
                <motion.button whileHover={{ x: -2 }} className="mt-4 text-sm text-[#8E2DA8] underline" onClick={() => setStep(2)}>
                  Volver a tamaño
                </motion.button>
              </motion.div>
            )}

            {step === 4 && (
              <motion.form
                key="step-4"
                onSubmit={handleSubmit}
                variants={pageVariants}
                initial="initial"
                animate="enter"
                exit="exit"
                className="space-y-5 w-full max-w-md mx-auto flex flex-col items-center"
              >
                <div className="w-full">
                  <label className="block mb-1 font-semibold text-gray-700">Cantidad</label>
                  <motion.input
                    whileFocus={{ scale: 1.01, boxShadow: "0 0 0 4px rgba(142,45,168,.15)" }}
                    type="number"
                    min="1"
                    step="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full border border-[#8E2DA8] rounded-lg px-4 py-2 text-gray-800 focus:outline-none"
                    required
                  />
                </div>

                <div className="w-full">
                  <label className="block mb-1 font-semibold text-gray-700">Precio total</label>
                  <motion.input
                    whileFocus={{ scale: 1.01, boxShadow: "0 0 0 4px rgba(142,45,168,.15)" }}
                    type="number"
                    min="0"
                    step="0.01"
                    value={totalPrice}
                    onChange={(e) => setTotalPrice(e.target.value)}
                    className="w-full border border-[#8E2DA8] rounded-lg px-4 py-2 text-gray-800 focus:outline-none"
                    required
                  />
                </div>

                <div className="w-full">
                  <label className="block mb-1 font-semibold text-gray-700">Método de pago</label>
                  <motion.select
                    whileFocus={{ scale: 1.01, boxShadow: "0 0 0 4px rgba(142,45,168,.15)" }}
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full border border-[#8E2DA8] rounded-lg px-4 py-2 text-gray-800 focus:outline-none"
                  >
                    <option value="cash">Efectivo</option>
                    <option value="transfer">Transferencia</option>
                  </motion.select>
                </div>

                <div className="w-full flex justify-between">
                  <motion.button
                    type="button"
                    whileHover={{ x: -2 }}
                    className="text-sm text-[#8E2DA8] underline"
                    onClick={() => setStep(3)}
                  >
                    Volver
                  </motion.button>

                  <motion.button
                    type="button"
                    className="bg-[#8E2DA8] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#701f85] transition-colors disabled:opacity-60"
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
                    Confirmar venta
                  </motion.button>
                </div>
              </motion.form>

            )}
          </AnimatePresence>
        </div>
      </motion.div>
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-[#8E2DA8]">Confirmar venta</h3>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-4">Revisa los detalles antes de registrar:</p>

              <div className="space-y-3 text-sm text-gray-800">
                <div className="flex justify-between">
                  <span className="text-gray-500">Producto</span>
                  <span className="font-medium">
                    {productType === "cake" ? "Cake" : productType === "sponge" ? "Sponge" : "-"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Tamaño</span>
                  <span className="font-medium">{humanize(size)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">{productType === "cake" ? "Sabor" : "Tipo bizcocho"}</span>
                  <span className="font-medium">{humanize(flavor)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Cantidad</span>
                  <span className="font-medium">x{parseInt(quantity || "0", 10)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Método de pago</span>
                  <span className="font-medium">{paymentLabel(paymentMethod)}</span>
                </div>

                <div className="h-px bg-gray-200 my-2" />

                <div className="flex justify-between text-base">
                  <span className="text-gray-700 font-semibold">Total</span>
                  <span className="font-bold text-[#8E2DA8]">
                    ${Number(totalPrice || 0).toLocaleString("es-CO")}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);

                  const fakeEvent = { preventDefault: () => { } } as unknown as React.FormEvent;
                  handleSubmit(fakeEvent);
                }}
                className="px-4 py-2 bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white rounded-lg hover:opacity-95 transition disabled:opacity-60"
                disabled={isLoading}
              >
                Registrar venta
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}