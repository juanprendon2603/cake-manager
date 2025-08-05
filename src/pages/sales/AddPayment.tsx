import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { format } from "date-fns";

export function AddPayment() {
  const navigate = useNavigate();
  const [productType, setProductType] = useState("cake");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedFlavor, setSelectedFlavor] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [totalAmount, setTotalAmount] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!selectedSize || !selectedFlavor) {
      setErrorMessage("Selecciona tamaño y sabor.");
      return;
    }

    const quantityNumber = parseInt(quantity);
    if (isNaN(quantityNumber) || quantityNumber <= 0) {
      setErrorMessage("Ingresa una cantidad válida mayor a 0.");
      return;
    }

    const totalAmountNumber = parseFloat(totalAmount);
    if (isNaN(totalAmountNumber) || totalAmountNumber <= 0) {
      setErrorMessage("Ingresa un monto total válido mayor a 0.");
      return;
    }

    // No se descuenta stock en abonos

    const today = format(new Date(), "yyyy-MM-dd");
    const salesRef = doc(db, "sales", today);

    const paymentItem = {
      id: Date.now().toString(),
      type: productType,
      size: selectedSize,
      flavor: selectedFlavor,
      cantidad: quantityNumber,
      monto: totalAmountNumber,
      paymentMethod,
      isPayment: true,
    };

    const salesSnap = await getDoc(salesRef);
    if (salesSnap.exists()) {
      await updateDoc(salesRef, {
        sales: arrayUnion(paymentItem),
      });
    } else {
      await setDoc(salesRef, {
        fecha: today,
        sales: [paymentItem],
        expenses: [],
      });
    }

    alert("Abono registrado correctamente.");
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
      ? ["naranja", "vainilla_chips", "vainilla_chocolate"]
      : ["vainilla"];

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-green-700">Registrar Abono</h1>

        {errorMessage && (
          <p className="text-red-600 text-center font-semibold">{errorMessage}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-semibold mb-1">Tipo de producto</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              value={productType}
              onChange={(e) => {
                setProductType(e.target.value);
                setSelectedSize("");
                setSelectedFlavor("");
              }}
            >
              <option value="cake">cake</option>
              <option value="sponge">sponge</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Tamaño</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
            >
              <option value="">Selecciona</option>
              {sizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Sabor</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              value={selectedFlavor}
              onChange={(e) => setSelectedFlavor(e.target.value)}
            >
              <option value="">Selecciona</option>
              {flavorOptions.map((flavor) => (
                <option key={flavor} value={flavor}>
                  {flavor}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Cantidad</label>
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Cantidad"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Monto total</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="Ejemplo: 1500"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Método de pago</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="cash">Efectivo</option>
              <option value="transfer">Transferencia</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 transition"
          >
            Registrar Abono
          </button>
        </form>
      </div>
    </main>
  );
}