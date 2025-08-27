import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { Sale, Expense } from "../../types/finance";
import { DailyDetailContent } from "./DailyDetailContent";
import { FullScreenLoader } from "../../components/FullScreenLoader";
import { BackButton } from "../../components/BackButton";

export function DailyDetailPage() {
  const { fecha } = useParams<{ fecha: string }>();
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDay() {
      if (!fecha) return;
      setLoading(true);
      try {
        const ref = doc(db, "sales", fecha);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as { sales?: Sale[]; expenses?: Expense[] };
          setSales(Array.isArray(data.sales) ? data.sales : []);
          setExpenses(Array.isArray(data.expenses) ? data.expenses : []);
        } else {
          setSales([]);
          setExpenses([]);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchDay();
  }, [fecha]);

  if (loading) {
    return <FullScreenLoader message="Cargando detalle..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex flex-col">
      <main className="flex-grow px-6 py-8 sm:py-12 max-w-6xl mx-auto w-full">
        <header className="mb-6 sm:mb-8">
          <div className="sm:hidden mb-3">
            <BackButton />
          </div>

          <div className="relative">
            <div className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2">
              <BackButton />
            </div>

            <div className="text-left sm:text-center relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 opacity-10"></div>
              <div className="relative py-4">
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl shadow-lg">
                    📅
                  </div>
                </div>
                <h1 className="text-3xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Detalle del día {fecha}
                </h1>
                <p className="text-gray-700 mt-2">
                  Ventas, abonos y gastos del día seleccionado.
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="bg-white/80 backdrop-blur-xl border-2 border-white/60 shadow-2xl rounded-3xl p-6 sm:p-8">
          <DailyDetailContent fecha={fecha ?? ""} sales={sales} expenses={expenses} />
        </section>

        <div className="mt-8">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-5 shadow-lg text-center">
            <p className="text-sm opacity-90">Tip</p>
            <p className="text-base">
              Toca una fila para ver mejor el detalle en móvil. Usa descripciones claras en gastos.
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