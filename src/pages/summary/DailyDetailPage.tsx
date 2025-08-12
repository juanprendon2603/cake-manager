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
                            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#8E2DA8]">
                                Detalle del día {fecha}
                            </h1>
                            <p className="text-gray-700 mt-1 sm:mt-2">
                                Ventas, abonos y gastos del día seleccionado.
                            </p>
                        </div>
                    </div>
                </header>

                <section className="bg-white border border-[#E8D4F2] shadow-md rounded-2xl p-6 sm:p-8">
                    <DailyDetailContent fecha={fecha ?? ""} sales={sales} expenses={expenses} />
                </section>
            </main>

            <footer className="text-center text-sm text-gray-400 py-6">
                © 2025 CakeManager. Todos los derechos reservados.
            </footer>
        </div>
    );
}