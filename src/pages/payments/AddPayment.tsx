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
  const [selectedSpongeType, setSelectedSpongeType] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [totalAmount, setTotalAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [deductFromStock, setDeductFromStock] = useState(false);
  const [isTotalPayment, setIsTotalPayment] = useState(false);
  const [orderDate, setOrderDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [errorMessage, setErrorMessage] = useState("");

  const spongeTypes = ["fría", "genovesa"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!selectedSize) {
      setErrorMessage("Select a size.");
      return;
    }

    if (productType === "cake" && !selectedFlavor) {
      setErrorMessage("Select a flavor.");
      return;
    }

    if (productType === "sponge" && !selectedSpongeType) {
      setErrorMessage("Select a sponge type.");
      return;
    }

    const quantityNumber = parseInt(quantity);
    if (isNaN(quantityNumber) || quantityNumber <= 0) {
      setErrorMessage("Enter a valid quantity.");
      return;
    }

    const totalAmountNumber = parseFloat(totalAmount);
    if (isNaN(totalAmountNumber) || totalAmountNumber <= 0) {
      setErrorMessage("Enter a valid total amount.");
      return;
    }

    if (deductFromStock) {
      const stockRef = doc(db, "stock", `${productType}_${selectedSize}`);
      const stockSnap = await getDoc(stockRef);

      if (!stockSnap.exists()) {
        setErrorMessage("Product not found in stock.");
        return;
      }

      const stockData = stockSnap.data();

      if (productType === "cake") {
        const currentQuantity = stockData.flavors?.[selectedFlavor] || 0;
        if (currentQuantity < quantityNumber) {
          setErrorMessage("Not enough stock for this flavor.");
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
          setErrorMessage("Not enough stock for this size.");
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
      orderDate, // 👈 nueva propiedad añadida
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

    // --------- NUEVO: Guardar en payments ---------
  const paymentsRef = doc(db, "payments", orderDate);
  const paymentsSnap = await getDoc(paymentsRef);

  if (paymentsSnap.exists()) {
    await updateDoc(paymentsRef, {
      payments: arrayUnion(paymentItem),
    });
  } else {
    await setDoc(paymentsRef, {
      date: orderDate,
      payments: [paymentItem],
    });
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
      ? ["naranja", "vainilla_chips", "vainilla_chocolate"]
      : [];

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-green-700">Register Payment</h1>

        {errorMessage && (
          <p className="text-red-600 text-center font-semibold">{errorMessage}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-semibold mb-1">Product type</label>
            <select
              value={productType}
              onChange={(e) => {
                setProductType(e.target.value);
                setSelectedSize("");
                setSelectedFlavor("");
                setSelectedSpongeType("");
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="cake">cake</option>
              <option value="sponge">sponge</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Size</label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Select</option>
              {sizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {productType === "cake" && (
            <div>
              <label className="block font-semibold mb-1">Flavor</label>
              <select
                value={selectedFlavor}
                onChange={(e) => setSelectedFlavor(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Select</option>
                {flavorOptions.map((flavor) => (
                  <option key={flavor} value={flavor}>
                    {flavor}
                  </option>
                ))}
              </select>
            </div>
          )}

          {productType === "sponge" && (
            <div>
              <label className="block font-semibold mb-1">Sponge type</label>
              <select
                value={selectedSpongeType}
                onChange={(e) => setSelectedSpongeType(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Select</option>
                {spongeTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block font-semibold mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Total amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Order date</label>
            <input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Payment method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="cash">Cash</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="deductStock"
              checked={deductFromStock}
              onChange={(e) => setDeductFromStock(e.target.checked)}
            />
            <label htmlFor="deductStock" className="font-semibold">
              Deduct from stock
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="totalPayment"
              checked={isTotalPayment}
              onChange={(e) => setIsTotalPayment(e.target.checked)}
            />
            <label htmlFor="totalPayment" className="font-semibold">
              Total payment
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 transition"
          >
            Register Payment
          </button>
        </form>
      </div>
    </main>
  );
}
