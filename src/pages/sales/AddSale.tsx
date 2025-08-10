import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../lib/firebase";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { format } from "date-fns";

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
]

const spongeSizes = ["media", "libra"];

const cakeFlavors = ["naranja", "vainilla_chips", "vainilla_chocolate", "negra"];

const spongeTypes = ["fría", "genovesa"];

const defaultPrices: Record<string, Record<string, Record<string, number>>> = {
  cake: {
    octavo: {
      naranja: 10000,
      "vainilla_chips": 10000,
      "vainilla_chocolate": 10000,
      negra: 12000,
    },
    "cuarto redondo": {
      naranja: 15000,
      "vainilla_chips": 15000,
      "vainilla_chocolate": 15000,
      negra: 18000,
    },
    "cuarto cuadrada": {
      naranja: 18000,
      "vainilla_chips": 18000,
      "vainilla_chocolate": 18000,
      negra: 20000,
    },
    "por_dieciocho": {
    naranja: 24000,
    "vainilla_chips": 24000,
    "vainilla_chocolate": 24000,
    negra: 28000,
    },
    media: {
      naranja: 30000,
      "vainilla_chips": 30000,
      "vainilla_chocolate": 30000,
      negra: 40000,
    },
    libra: {
      naranja: 40000,
      "vainilla_chips": 40000,
      "vainilla_chocolate": 40000,
      negra: 50000,
    },
    "libra y media": {
      naranja: 60000,
      "vainilla_chips": 60000,
      "vainilla_chocolate": 60000,
      negra: 70000,
    },
  },
  sponge: {
    media: {
      fría: 30000,
      genovesa: 50000,
    },
    libra: {
      fría: 40000,
      genovesa: 70000,
    },
  },
};

export function AddSale() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const [productType, setProductType] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [flavor, setFlavor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [totalPrice, setTotalPrice] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [errorMessage, setErrorMessage] = useState("");

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
    setErrorMessage("");

    if (!size) {
      setErrorMessage("Selecciona un tamaño.");
      return;
    }

    if (!flavor) {
      setErrorMessage(
        productType === "cake"
          ? "Selecciona un sabor."
          : "Selecciona un tipo de bizcocho."
      );
      return;
    }

    const quantityNumber = parseInt(quantity);
    if (isNaN(quantityNumber) || quantityNumber <= 0) {
      setErrorMessage("Ingresa una cantidad válida mayor a 0.");
      return;
    }

    const totalPriceNumber = parseFloat(totalPrice);
    if (isNaN(totalPriceNumber) || totalPriceNumber <= 0) {
      setErrorMessage("Ingresa un precio total válido mayor a 0.");
      return;
    }

    const stockRef = doc(db, "stock", `${productType}_${size}`);
    const stockSnap = await getDoc(stockRef);

    if (!stockSnap.exists()) {
      setErrorMessage("El producto no existe en el stock.");
      return;
    }

    const stockData = stockSnap.data();

    if (productType === "cake") {
      const currentQuantity = stockData.flavors?.[flavor] || 0;
      if (currentQuantity < quantityNumber) {
        setErrorMessage("No hay suficiente stock para este sabor y cantidad.");
        return;
      }
      const updatedFlavors = {
        ...stockData.flavors,
        [flavor]: currentQuantity - quantityNumber,
      };
      await updateDoc(stockRef, { flavors: updatedFlavors });
    } else if (productType === "sponge") {
      const currentQuantity = stockData.quantity || 0;
      if (currentQuantity < quantityNumber) {
        setErrorMessage("No hay suficiente stock para este tamaño.");
        return;
      }
      await updateDoc(stockRef, { quantity: currentQuantity - quantityNumber });
    }

    const today = format(new Date(), "yyyy-MM-dd");
    const salesRef = doc(db, "sales", today);

    const saleItem = {
      id: Date.now().toString(),
      type: productType,
      size,
      flavor,
      cantidad: quantityNumber,
      valor: totalPriceNumber,
      paymentMethod,
    };

    const salesSnap = await getDoc(salesRef);
    if (salesSnap.exists()) {
      await updateDoc(salesRef, {
        sales: arrayUnion(saleItem),
      });
    } else {
      await setDoc(salesRef, {
        fecha: today,
        sales: [saleItem],
        expenses: [],
      });
    }

    navigate("/sales");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FDF8FF] px-6 py-10">
      <div className="max-w-xl w-full bg-white rounded-2xl p-8 shadow-lg space-y-8 flex flex-col items-center">
        <h1 className="text-3xl font-extrabold text-[#8E2DA8] text-center">
          Registrar venta
        </h1>

        {errorMessage && (
          <p className="text-red-500 font-medium">{errorMessage}</p>
        )}

        {step === 1 && (
          <div className="grid grid-cols-2 gap-6 justify-center items-center">
            {productTypes.map((pt) => (
              <button
                key={pt.id}
                onClick={() => onSelectProductType(pt.id)}
                className="border-2 border-[#8E2DA8] rounded-xl p-6 text-center font-semibold text-[#8E2DA8] hover:bg-[#8E2DA8] hover:text-white transition"
              >
                {pt.label}
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <>
            <h2 className="text-xl font-semibold text-gray-700 text-center mb-4">
              Selecciona el tamaño
            </h2>
            <div className="grid grid-cols-3 gap-4 max-h-64 overflow-auto justify-center items-center">
              {(productType === "cake" ? cakeSizes : spongeSizes).map((s) => (
                <button
                  key={s}
                  onClick={() => onSelectSize(s)}
                  className={`border-2 rounded-xl p-4 text-center font-medium hover:bg-[#8E2DA8] hover:text-white transition
                    ${size === s ? "bg-[#8E2DA8] text-white" : "border-[#8E2DA8] text-[#8E2DA8]"}`}
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              className="mt-4 text-sm text-[#8E2DA8] underline"
              onClick={() => setStep(1)}
            >
              Volver a tipo de producto
            </button>
          </>
        )}

        {step === 3 && productType === "cake" && (
          <>
            <h2 className="text-xl font-semibold text-gray-700 text-center mb-4">
              Selecciona el sabor
            </h2>
            <div className="grid grid-cols-2 gap-4 max-h-64 overflow-auto justify-center items-center">
              {cakeFlavors.map((f) => (
                <button
                  key={f}
                  onClick={() => onSelectFlavor(f)}
                  className={`border-2 rounded-xl p-4 text-center font-medium hover:bg-[#8E2DA8] hover:text-white transition
                    ${flavor === f ? "bg-[#8E2DA8] text-white" : "border-[#8E2DA8] text-[#8E2DA8]"}`}
                >
                  {f}
                </button>
              ))}
            </div>
            <button
              className="mt-4 text-sm text-[#8E2DA8] underline"
              onClick={() => setStep(2)}
            >
              Volver a tamaño
            </button>
          </>
        )}

        {step === 3 && productType === "sponge" && (
          <>
            <h2 className="text-xl font-semibold text-gray-700 text-center mb-4">
              Selecciona tipo de bizcocho
            </h2>
            <div className="grid grid-cols-2 gap-4 max-h-64 overflow-auto justify-center items-center">
              {spongeTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => onSelectFlavor(t)}
                  className={`border-2 rounded-xl p-4 text-center font-medium hover:bg-[#8E2DA8] hover:text-white transition
                    ${flavor === t ? "bg-[#8E2DA8] text-white" : "border-[#8E2DA8] text-[#8E2DA8]"}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              className="mt-4 text-sm text-[#8E2DA8] underline"
              onClick={() => setStep(2)}
            >
              Volver a tamaño
            </button>
          </>
        )}

        {step === 4 && (
          <form onSubmit={handleSubmit} className="space-y-5 w-full max-w-md">
            <div>
              <label className="block mb-1 font-semibold text-gray-700">
                Cantidad
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full border border-[#8E2DA8] rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8E2DA8]"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-gray-700">
                Precio total
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={totalPrice}
                onChange={(e) => setTotalPrice(e.target.value)}
                className="w-full border border-[#8E2DA8] rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8E2DA8]"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-gray-700">
                Método de pago
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full border border-[#8E2DA8] rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8E2DA8]"
              >
                <option value="cash">Efectivo</option>
                <option value="transfer">Transferencia</option>
              </select>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                className="text-sm text-[#8E2DA8] underline"
                onClick={() => setStep(3)}
              >
                Volver
              </button>

              <button
                type="submit"
                className="bg-[#8E2DA8] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#701f85] transition"
              >
                Confirmar venta
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
