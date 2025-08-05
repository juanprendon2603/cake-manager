import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../lib/firebase.js";

export function ProductList() {
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [vaciarId, setVaciarId] = useState<string | null>(null);

  const fetchStock = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "stock"));
    setStocks(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  const eliminarSabores = async (id: string) => {
    if (
      !window.confirm("¿Seguro que quieres vaciar los sabores de este tamaño?")
    )
      return;
    await updateDoc(doc(db, "stock", id), {
      flavors: {},
    });
    setVaciarId(id);
    setTimeout(() => setVaciarId(null), 1000);
    fetchStock();
  };

  useEffect(() => {
    fetchStock();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-extrabold text-pink-600 mb-6 text-center">
        Inventario por Tamaño
      </h2>
      {loading ? (
        <div className="text-center text-gray-500">Cargando inventario...</div>
      ) : stocks.length === 0 ? (
        <div className="text-center text-gray-400 italic">
          No hay productos registrados.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {stocks.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl shadow-lg border border-pink-100 bg-white p-5 transition-all duration-300 ${
                vaciarId === item.id ? "ring-2 ring-red-400 scale-95" : ""
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg capitalize text-pink-700">
                  {item.id.replace("_", " ")}
                </h3>
                <button
                  onClick={() => eliminarSabores(item.id)}
                  className="bg-red-500 hover:bg-red-600 transition text-white px-3 py-1 rounded shadow"
                  title="Vaciar todos los sabores"
                >
                  Vaciar Sabores
                </button>
              </div>
              {item.flavors && Object.keys(item.flavors).length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {Object.entries(item.flavors).map(([flavor, quantity]) => (
                    <li key={flavor} className="flex items-center gap-2">
                      <span className="capitalize text-gray-700">{flavor}</span>
                      <span className="bg-pink-100 text-pink-700 font-bold px-2 py-0.5 rounded text-sm">
                        {quantity}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 mt-2 italic">
                  Sin sabores registrados
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
