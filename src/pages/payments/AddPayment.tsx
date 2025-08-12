import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../lib/firebase";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { format } from "date-fns";
import { FullScreenLoader } from "../../components/FullScreenLoader";
import { useToast } from "../../hooks/useToast";
import { BackButton } from "../../components/BackButton";

export function AddPayment() {
  const navigate = useNavigate();
  const [productType, setProductType] = useState<"cake" | "sponge">("cake");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedFlavor, setSelectedFlavor] = useState("");
  const [selectedSpongeType, setSelectedSpongeType] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [totalAmount, setTotalAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">("cash");
  const [deductFromStock, setDeductFromStock] = useState(false);
  const [isTotalPayment, setIsTotalPayment] = useState(false);
  const [orderDate, setOrderDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const paymentLabel = (pm: "cash" | "transfer") => (pm === "cash" ? "Efectivo" : "Transferencia");

  const spongeTypes = ["fría", "genovesa"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!selectedSize) {
      setErrorMessage("Selecciona un tamaño.");
      return;
    }
    if (productType === "cake" && !selectedFlavor) {
      setErrorMessage("Selecciona un sabor.");
      return;
    }
    if (productType === "sponge" && !selectedSpongeType) {
      setErrorMessage("Selecciona el tipo de bizcocho.");
      return;
    }

    const quantityNumber = parseInt(quantity);
    if (isNaN(quantityNumber) || quantityNumber <= 0) {
      setErrorMessage("Ingresa una cantidad válida.");
      return;
    }

    const totalAmountNumber = parseFloat(totalAmount);
    if (isNaN(totalAmountNumber) || totalAmountNumber <= 0) {
      setErrorMessage("Ingresa un valor total válido.");
      return;
    }

    setLoading(true);
    try {
      if (deductFromStock) {
        const stockRef = doc(db, "stock", `${productType}_${selectedSize}`);
        const stockSnap = await getDoc(stockRef);
        if (!stockSnap.exists()) {
          throw new Error("El producto no se encuentra en el inventario.");
        }
        const stockData = stockSnap.data();

        if (productType === "cake") {
          const currentQuantity = stockData.flavors?.[selectedFlavor] || 0;
          if (currentQuantity < quantityNumber) {
            throw new Error("No hay suficiente stock para este sabor.");
          }
          const updatedFlavors = {
            ...stockData.flavors,
            [selectedFlavor]: currentQuantity - quantityNumber,
          };
          await updateDoc(stockRef, { flavors: updatedFlavors });
        } else {
          const currentQuantity = stockData.quantity || 0;
          if (currentQuantity < quantityNumber) {
            throw new Error("No hay suficiente stock para este tamaño.");
          }
          await updateDoc(stockRef, { quantity: currentQuantity - quantityNumber });
        }
      }

      const today = format(new Date(), "yyyy-MM-dd");
      const salesRef = doc(db, "sales", today);

      const paymentItem = {
        id: Date.now().toString(),
        type: productType,
        size: selectedSize,
        flavor: productType === "cake" ? selectedFlavor : selectedSpongeType,
        quantity: parseInt(quantity),
        amount: parseFloat(totalAmount),
        paymentMethod,
        isPayment: true,
        deductedFromStock: deductFromStock,
        totalPayment: isTotalPayment,
        orderDate,
      };

      const salesSnap = await getDoc(salesRef);
      if (salesSnap.exists()) {
        await updateDoc(salesRef, { sales: arrayUnion(paymentItem) });
      } else {
        await setDoc(salesRef, { date: today, sales: [paymentItem], expenses: [] });
      }

      const paymentsRef = doc(db, "payments", orderDate);
      const paymentsSnap = await getDoc(paymentsRef);
      if (paymentsSnap.exists()) {
        await updateDoc(paymentsRef, { payments: arrayUnion(paymentItem) });
      } else {
        await setDoc(paymentsRef, { date: orderDate, payments: [paymentItem] });
      }

      addToast({
        type: "success",
        title: "¡Abono registrado!",
        message: "Abono/pago registrado exitosamente.",
        duration: 5000,
      });
      navigate("/payment-management");
    } catch (err) {
      setErrorMessage((err as Error).message ?? "Error al registrar el abono.");
    } finally {
      setLoading(false);
    }
  };

  const sizeOptions =
    productType === "cake"
      ? [
        "octavo",
        "cuarto_redondo",
        "cuarto_cuadrado",
        "por_dieciocho",
        "media",
        "libra",
        "libra_y_media",
        "dos_libras",
      ]
      : ["media", "libra"];

  const flavorOptions =
    productType === "cake"
      ? ["naranja", "vainilla_chips", "vainilla_chocolate", "negra"]
      : [];

  const inputBase =
    "w-full border border-[#E8D4F2] rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#8E2DA8] focus:border-transparent";

  const pretty = (s: string) => s.replaceAll("_", " ");
  if (loading) {
    return <FullScreenLoader message="Guardando abono..." />;
  }

  return (
    <div className="min-h-screen bg-[#FDF8FF] flex flex-col">
      <main className="flex-grow p-6 sm:p-12 max-w-6xl mx-auto w-full">

        <header className="mb-6 sm:mb-8">
          <div className="sm:hidden mb-3">
            <BackButton />
          </div>

          <div className="relative">
            <div className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2">
              <BackButton />
            </div>

            <div className="text-left sm:text-center">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-[#8E2DA8]">
                Registrar Abono/Pago
              </h2>
              <p className="text-gray-700 mt-1 sm:mt-2">
                Registra abonos o pagos totales y actualiza el inventario si lo deseas.
              </p>
            </div>
          </div>
        </header>



        <section className="max-w-xl mx-auto bg-white border border-[#E8D4F2] shadow-md rounded-2xl p-6 sm:p-8">
          {errorMessage && (
            <div className="mb-4 rounded-lg px-4 py-3 text-sm bg-red-50 text-red-700 border border-red-200">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tipo de producto
              </label>
              <select
                value={productType}
                onChange={(e) => {
                  const val = e.target.value as "cake" | "sponge";
                  setProductType(val);
                  setSelectedSize("");
                  setSelectedFlavor("");
                  setSelectedSpongeType("");
                }}
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
                onChange={(e) => setSelectedSize(e.target.value)}
                className={inputBase}
              >
                <option value="">Seleccionar</option>
                {sizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {pretty(size)}
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
                  onChange={(e) => setSelectedFlavor(e.target.value)}
                  className={inputBase}
                >
                  <option value="">Seleccionar</option>
                  {flavorOptions.map((flavor) => (
                    <option key={flavor} value={flavor}>
                      {pretty(flavor)}
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
                  onChange={(e) => setSelectedSpongeType(e.target.value)}
                  className={inputBase}
                >
                  <option value="">Seleccionar</option>
                  {spongeTypes.map((type) => (
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
                onChange={(e) => setQuantity(e.target.value)}
                className={inputBase}
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
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className={`${inputBase} pl-8`}
                  placeholder="0"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">En pesos colombianos.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Fecha del pedido
              </label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className={inputBase}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Método de pago
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as "cash" | "transfer")}
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
                onChange={(e) => setDeductFromStock(e.target.checked)}
                className="accent-[#8E2DA8] h-4 w-4"
              />
              <label htmlFor="deductStock" className="text-sm font-semibold text-gray-700">
                Descontar del inventario
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="totalPayment"
                checked={isTotalPayment}
                onChange={(e) => setIsTotalPayment(e.target.checked)}
                className="accent-[#8E2DA8] h-4 w-4"
              />
              <label htmlFor="totalPayment" className="text-sm font-semibold text-gray-700">
                Pago total
              </label>
            </div>

            <button
              type="button"
              className="w-full bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white py-3.5 rounded-xl font-semibold shadow-md hover:opacity-95 transition disabled:opacity-60"
              onClick={() => {
                setErrorMessage("");
                if (!selectedSize) return setErrorMessage("Selecciona un tamaño.");
                if (productType === "cake" && !selectedFlavor) return setErrorMessage("Selecciona un sabor.");
                if (productType === "sponge" && !selectedSpongeType) return setErrorMessage("Selecciona el tipo de bizcocho.");
                const qty = parseInt(quantity);
                const amt = parseFloat(totalAmount);
                if (isNaN(qty) || qty <= 0) return setErrorMessage("Ingresa una cantidad válida.");
                if (isNaN(amt) || amt <= 0) return setErrorMessage("Ingresa un valor total válido.");
                setShowConfirmModal(true);
              }}
              disabled={loading}
            >
              Registrar pago
            </button>
          </form>
        </section>

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

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-[#8E2DA8]">Confirmar abono/pago</h3>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-4">Revisa los detalles antes de registrar:</p>

              <div className="space-y-3 text-sm text-gray-800">
                <div className="flex justify-between">
                  <span className="text-gray-500">Producto</span>
                  <span className="font-medium">{productType === "cake" ? "Torta" : "Bizcocho"}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Tamaño</span>
                  <span className="font-medium">{pretty(selectedSize)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">{productType === "cake" ? "Sabor" : "Tipo de bizcocho"}</span>
                  <span className="font-medium">
                    {productType === "cake" ? pretty(selectedFlavor) : selectedSpongeType}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Cantidad</span>
                  <span className="font-medium">x{parseInt(quantity || "0", 10)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Fecha del pedido</span>
                  <span className="font-medium">{orderDate}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Método de pago</span>
                  <span className="font-medium">{paymentLabel(paymentMethod)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Descontar del inventario</span>
                  <span className="font-medium">{deductFromStock ? "Sí" : "No"}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Pago total</span>
                  <span className="font-medium">{isTotalPayment ? "Sí" : "No"}</span>
                </div>

                <div className="h-px bg-gray-200 my-2" />

                <div className="flex justify-between text-base">
                  <span className="text-gray-700 font-semibold">Valor total</span>
                  <span className="font-bold text-[#8E2DA8]">
                    ${Number(totalAmount || 0).toLocaleString("es-CO")}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                disabled={loading}
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
                disabled={loading}
              >
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}