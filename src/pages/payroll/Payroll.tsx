import React, { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, doc, getDocs, setDoc, updateDoc } from "firebase/firestore";

interface AttendanceRecord {
  [date: string]: "completo" | "medio";
}

interface AttendanceByMonth {
  [month: string]: AttendanceRecord;
}

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  valuePerDay: number;
  attendance: AttendanceByMonth;
}

const Payroll: React.FC = () => {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);

  const initialPeople: Omit<Person, "id">[] = [
    { firstName: "Juan", lastName: "Rendon", valuePerDay: 50000, attendance: {} },
    { firstName: "Alejandra", lastName: "Munares", valuePerDay: 50000, attendance: {} },
    { firstName: "Carlos", lastName: "Marin", valuePerDay: 40000, attendance: {} },
    { firstName: "Camila", lastName: "Mora", valuePerDay: 40000, attendance: {} },
    { firstName: "Suleima", lastName: "Rendon", valuePerDay: 40000, attendance: {} },
  ];

  const loadPeople = async () => {
    setLoading(true);
    const payrollRef = collection(db, "payroll");
    const snapshot = await getDocs(payrollRef);

    if (snapshot.empty) {
      for (const p of initialPeople) {
        const id = `${p.firstName}_${p.lastName}`;
        await setDoc(doc(payrollRef, id), { id, ...p });
      }
      setPeople(initialPeople.map((p) => ({ id: `${p.firstName}_${p.lastName}`, ...p })));
    } else {
      const data: Person[] = snapshot.docs.map((d) => d.data() as Person);
      setPeople(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPeople();
  }, []);

  const markAttendance = async (personId: string, shift: "completo" | "medio") => {
    const today = new Date().toISOString().slice(0, 10);
    const person = people.find((p) => p.id === personId);
    if (!person) return;

    const updatedAttendance = {
      ...person.attendance,
      [month]: {
        ...(person.attendance[month] || {}),
        [today]: shift,
      },
    };

    const updatedPeople = people.map((p) =>
      p.id === personId ? { ...p, attendance: updatedAttendance } : p
    );
    setPeople(updatedPeople);

    const personRef = doc(db, "payroll", personId);
    await updateDoc(personRef, { attendance: updatedAttendance });
  };

  // 🔹 Calcular el total del mes de una persona
  const calculateMonthlyTotal = (p: Person) => {
    const monthData = p.attendance[month] || {};
    let total = 0;
    for (const shift of Object.values(monthData)) {
      total += shift === "completo" ? p.valuePerDay : p.valuePerDay / 2;
    }
    return total;
  };

  // 🔹 Calcular total general
  const calculateGeneralTotal = () => {
    return people.reduce((sum, p) => sum + calculateMonthlyTotal(p), 0);
  };

  return (
    <div className="min-h-screen bg-[#FDF8FF] flex flex-col">
      <main className="flex-grow p-6 sm:p-12 max-w-6xl mx-auto w-full">
        <header className="mb-10 text-center">
          <h1 className="text-5xl font-extrabold text-[#8E2DA8] mb-4">
            Nómina
          </h1>
          <p className="text-lg text-gray-700">
            Gestión de asistencia y pagos del personal
          </p>
        </header>

        <div className="bg-white border border-[#E8D4F2] shadow-md rounded-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <label className="text-lg font-semibold text-[#8E2DA8]">Seleccionar mes:</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border border-[#E8D4F2] p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8E2DA8] focus:border-transparent text-center"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#8E2DA8]"></div>
            <p className="mt-4 text-lg text-gray-600">Cargando personal...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {people.map((p) => (
              <div key={p.id} className="bg-white border border-[#E8D4F2] shadow-md rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-[#8E2DA8] mb-2">
                      {p.firstName} {p.lastName}
                    </h3>
                    <div className="space-y-1 mb-4">
                      <p className="text-gray-600">
                        <span className="font-semibold">Valor por día:</span> ${p.valuePerDay.toLocaleString()}
                      </p>
                      <p className="text-lg font-bold text-[#8E2DA8]">
                        <span className="font-semibold">Total {month}:</span> ${calculateMonthlyTotal(p).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => markAttendance(p.id, "completo")}
                      className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-semibold shadow-md"
                    >
                      Turno Completo
                    </button>
                    <button
                      onClick={() => markAttendance(p.id, "medio")}
                      className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors font-semibold shadow-md"
                    >
                      Medio Turno
                    </button>
                  </div>
                </div>

                {p.attendance[month] && Object.keys(p.attendance[month]).length > 0 && (
                  <div className="mt-6 pt-4 border-t border-[#E8D4F2]">
                    <h4 className="font-bold text-[#8E2DA8] mb-3">Asistencias de {month}:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {Object.entries(p.attendance[month]).map(([date, shift]) => (
                        <div key={date} className="bg-[#FDF8FF] border border-[#E8D4F2] rounded-lg p-3">
                          <p className="font-semibold text-gray-800">{date}</p>
                          <p className={`text-sm font-medium ${
                            shift === "completo" ? "text-green-600" : "text-yellow-600"
                          }`}>
                            {shift === "completo" ? "Turno Completo" : "Medio Turno"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Total general */}
            <div className="bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white rounded-xl p-6 shadow-lg">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Total a Pagar</h2>
                <p className="text-lg mb-2">Mes: {month}</p>
                <p className="text-4xl font-extrabold">
                  ${calculateGeneralTotal().toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="text-center text-sm text-gray-400 py-4">
        © 2025 CakeManager. Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default Payroll;