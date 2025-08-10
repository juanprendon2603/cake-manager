import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../lib/firebase";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { format } from "date-fns";

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
  const [errorMessage, setErrorMessage] = useState("");

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

    if (deductFromStock) {
      const stockRef = doc(db, "stock", `${productType}_${selectedSize}`);
      const stockSnap = await getDoc(stockRef);

      if (!stockSnap.exists()) {
        setErrorMessage("El producto no se encuentra en el inventario.");
        return;
      }

      const stockData = stockSnap.data();

      if (productType === "cake") {
        const currentQuantity = stockData.flavors?.[selectedFlavor] || 0;
        if (currentQuantity < quantityNumber) {
          setErrorMessage("No hay suficiente stock para este sabor.");
          return;
        }
        const updatedFlavors = {
          ...stockData.flavors,
          [selectedFlavor]: currentQuantity - quantityNumber,
        };
        await updateDoc(stockRef, { flavors: updatedFlavors });
      } else {
        const currentQuantity = stockData.quantity || 0;
        if (currentQuantity < quantityNumber) {
          setErrorMessage("No hay suficiente stock para este tamaño.");
          return;
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
      quantity: quantityNumber,
      amount: totalAmountNumber,
      paymentMethod,
      isPayment: true,
      deductedFromStock: deductFromStock,
      totalPayment: isTotalPayment,
      orderDate,
    };

    const salesSnap = await getDoc(salesRef);
    if (salesSnap.exists()) {
      await updateDoc(salesRef, {
        sales: arrayUnion(paymentItem),
      });
    } else {
      await setDoc(salesRef, {
        date: today,
        sales: [paymentItem],
        expenses: [],
      });
    }

    // Guardar en payments por fecha del pedido
    const paymentsRef = doc(db, "payments", orderDate);
    const paymentsSnap = await getDoc(paymentsRef);

    if (paymentsSnap.exists()) {
      await updateDoc(paymentsRef, { payments: arrayUnion(paymentItem) });
    } else {
      await setDoc(paymentsRef, { date: orderDate, payments: [paymentItem] });
    }

    navigate("/sales");
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

  return (
    <div className="min-h-screen bg-[#FDF8FF] flex flex-col">
      <main className="flex-grow p-6 sm:p-12 max-w-6xl mx-auto w-full">
        <header className="mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#8E2DA8]">
            Registrar Abono/Pago
          </h1>
          <p className="text-gray-700 mt-2">
            Registra abonos o pagos totales y actualiza el inventario si lo deseas.
          </p>
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
              type="submit"
              className="w-full bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white py-3.5 rounded-xl font-semibold shadow-md hover:opacity-95 transition"
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
    </div>
  );
}