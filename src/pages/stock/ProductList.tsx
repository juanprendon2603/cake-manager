import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import type { StockDoc } from "../../types/stock";
import { FullScreenLoader } from "../../components/FullScreenLoader";
import { BackButton } from "../../components/BackButton";

const isSpongeStock = (item: StockDoc): item is StockDoc & { type: "sponge"; quantity: number } => {
  return item.type === "sponge";
};

export function ProductList() {
  const [stocks, setStocks] = useState<StockDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [vaciarId, setVaciarId] = useState<string | null>(null);

  const fetchStock = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "stock"));
    const mapped: StockDoc[] = querySnapshot.docs.map((d) => {
      const data = d.data();
      const baseDoc = {
        id: d.id,
        type: data.type as "cake" | "sponge",
        size: data.size as string,
        last_update: data.last_update,
      };

      if (data.type === "cake") {
        return {
          ...baseDoc,
          type: "cake" as const,
          flavors: (data.flavors as Record<string, number>) || {},
        };
      } else {
        return {
          ...baseDoc,
          type: "sponge" as const,
          quantity: (data.quantity as number) || 0,
        };
      }
    });
    setStocks(mapped);
    setLoading(false);
  };

  const eliminarSabores = async (id: string) => {
    if (!window.confirm("¿Seguro que quieres vaciar los sabores de este tamaño?")) return;
    await updateDoc(doc(db, "stock", id), { flavors: {} });
    setVaciarId(id);
    setTimeout(() => setVaciarId(null), 900);
    fetchStock();
  };

  useEffect(() => {
    fetchStock();
  }, []);

  if (loading) {
    return <FullScreenLoader message="Cargando inventario..." />;
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
                Inventario por Tamaño
              </h2>
              <p className="text-gray-700 mt-1 sm:mt-2">
                Consulta y gestiona los sabores disponibles por tamaño.
              </p>
            </div>
          </div>
        </header>


        <section className="bg-white border border-[#E8D4F2] shadow-md rounded-2xl p-6 sm:p-8">
          {stocks.length === 0 ? (
            <div className="text-center py-14">
              <div className="mx-auto w-14 h-14 rounded-full bg-[#FDF8FF] border border-[#E8D4F2] flex items-center justify-center text-[#8E2DA8] font-bold">
                0
              </div>
              <p className="mt-4 text-gray-500 italic">No hay productos registrados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {stocks.map((item) => (
                <div
                  key={item.id}
                  className={`group rounded-xl bg-white border border-[#E8D4F2] shadow-sm p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${vaciarId === item.id ? "ring-2 ring-red-300 scale-[0.99]" : ""
                    }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-[#8E2DA8] capitalize">
                        {item.id.replaceAll("_", " ")}
                      </h3>
                      <p className="text-xs text-gray-500">Sabores por tamaño</p>
                    </div>
                    {item.type === "cake" && (
                      <button
                        onClick={() => eliminarSabores(item.id)}
                        className="inline-flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg shadow-sm text-sm transition-colors"
                        title="Vaciar todos los sabores"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 100 2h.278l.863 10.356A2 2 0 007.134 18h5.732a2 2 0 001.993-1.644L15.722 6H16a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0010 2H9zM8 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Vaciar
                      </button>
                    )}
                  </div>

                  {item.type === "cake" && item.flavors && Object.keys(item.flavors).length > 0 ? (
                    <ul className="mt-3 space-y-2">
                      {Object.entries(item.flavors).map(([flavor, quantity]) => (
                        <li
                          key={flavor}
                          className="flex items-center justify-between bg-[#FDF8FF] border border-[#E8D4F2] rounded-lg px-3 py-2"
                        >
                          <span className="capitalize text-gray-800">{flavor.replaceAll("_", " ")}</span>
                          <span className="inline-flex items-center justify-center min-w-10 px-2 py-0.5 rounded-md text-sm font-semibold bg-[#8E2DA8]/10 text-[#8E2DA8]">
                            {Number(quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : isSpongeStock(item) ? (
                    <div className="mt-3 bg-[#FDF8FF] border border-[#E8D4F2] rounded-lg p-4 text-center">
                      <p className="text-gray-800 font-semibold">
                        Cantidad: {item.quantity}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-3 bg-[#FDF8FF] border border-dashed border-[#E8D4F2] rounded-lg p-4 text-center">
                      <p className="text-gray-500 italic">Sin sabores registrados</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="mt-8">
          <div className="bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white rounded-xl p-5 shadow-lg text-center">
            <p className="text-sm opacity-90">Resumen visual</p>
            <p className="text-xl font-bold">Inventario actualizado</p>
          </div>
        </div>
      </main>

      <footer className="text-center text-sm text-gray-400 py-6">
        © 2025 CakeManager. Todos los derechos reservados.
      </footer>
    </div>
  );
}