import { useEffect, useState } from "react";
import { db } from "../../lib/firebase.js";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

export function ProductList() {
  const [stocks, setStocks] = useState<any[]>([]);

  const fetchStock = async () => {
    const querySnapshot = await getDocs(collection(db, "stock"));
    setStocks(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const eliminarSabores = async (id: string) => {
    await updateDoc(doc(db, "stock", id), {
      flavors: {},
    });
    fetchStock();
  };

  useEffect(() => {
    fetchStock();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Inventario por Tamaño</h2>
      <ul className="space-y-4">
        {stocks.map((item) => (
          <li key={item.id} className="border p-4 rounded">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg capitalize">{item.id.replace("_", " ")}</h3>
              <button
                onClick={() => eliminarSabores(item.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Vaciar Sabores
              </button>
            </div>
            {item.flavors && Object.keys(item.flavors).length > 0 ? (
  <ul className="mt-2 ml-4 list-disc">
    {Object.entries(item.flavors).map(([flavor, quantity]) => (
      <li key={flavor}>
        {flavor}: <span className="font-semibold">{quantity}</span>
      </li>
    ))}
  </ul>
) : (
  <p className="text-gray-500 mt-2 ml-4 italic">Sin sabores registrados</p>
)}
          </li>
        ))}
      </ul>
    </div>
  );
}
