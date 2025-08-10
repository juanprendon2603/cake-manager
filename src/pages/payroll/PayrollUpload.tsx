import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, doc, setDoc } from "firebase/firestore";

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  valuePerDay: number;
  attendance: { date: string; shift: "completo" | "medio" }[];
}

const PayrollUpload: React.FC = () => {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [loading, setLoading] = useState(false);

  const initialPeople: Omit<Person, "id">[] = [
    { firstName: "Juan", lastName: "Rendon", valuePerDay: 50000, attendance: [] },
    { firstName: "Alejandra", lastName: "Munares", valuePerDay: 50000, attendance: [] },
    { firstName: "Carlos", lastName: "Marin", valuePerDay: 40000, attendance: [] },
    { firstName: "Camila", lastName: "Mora", valuePerDay: 40000, attendance: [] },
    { firstName: "Suleima", lastName: "Rendon", valuePerDay: 40000, attendance: [] },
  ];

  const uploadToFirebase = async () => {
    setLoading(true);
    try {
      const monthRef = collection(db, "payroll", month, "people");

      for (const person of initialPeople) {
        const id = `${person.firstName}_${person.lastName}`;
        await setDoc(doc(monthRef, id), {
          id,
          ...person,
        });
      }

      alert("Personas cargadas correctamente");
    } catch (error) {
      console.error("Error subiendo a Firebase:", error);
      alert("Error al subir datos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Cargar Nómina Inicial</h1>

      <label className="block mb-2">Mes</label>
      <input
        type="month"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />

      <button
        onClick={uploadToFirebase}
        disabled={loading}
        className={`px-4 py-2 rounded text-white ${
          loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {loading ? "Cargando..." : "Subir a Firebase"}
      </button>
    </div>
  );
};

export default PayrollUpload;
