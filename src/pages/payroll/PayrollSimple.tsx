import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { FullScreenLoader } from "../../components/FullScreenLoader";

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
    fixedFortnightPay?: number;
}

interface SummaryModalProps {
    month: string;
    people: Person[];
    onClose: () => void;
}

const SummaryModal: React.FC<SummaryModalProps> = ({ month, people, onClose }) => {
    const getQuincenaSummary = () => {
        return people.map((p) => {
            const q1: string[] = [];
            const q2: string[] = [];
            const monthData = p.attendance?.[month] || {};

            for (const date in monthData) {
                const day = parseInt(date.split("-")[2]);
                if (day <= 15) {
                    q1.push(date);
                } else {
                    q2.push(date);
                }
            }

            return {
                name: `${p.firstName} ${p.lastName}`,
                q1,
                q2,
            };
        });
    };


    const summary = getQuincenaSummary();

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-xl font-bold text-purple-700">Resumen por quincena</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
                </div>
                <div className="p-6 space-y-6">
                    {summary.map((s, idx) => (
                        <div
                            key={idx}
                            className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-6 shadow-lg border-l-4 border-purple-500 transition-transform hover:-translate-y-1"
                        >
                            {/* Nombre */}
                            <p className="text-xl font-bold text-purple-800 mb-4">{s.name}</p>

                            {/* 1ª Quincena */}
                            <div className="mb-4">
                                <p className="text-sm text-purple-700 font-semibold mb-2 flex items-center gap-2">
                                    <span>📅</span> 1ª Quincena
                                </p>
                                {s.q1.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {s.q1.map((d) => (
                                            <span
                                                key={d}
                                                className="bg-white text-purple-700 px-3 py-1 rounded-full text-xs font-medium shadow-sm hover:bg-purple-100 transition"
                                            >
                                                {new Date(d).toLocaleDateString("es-MX", {
                                                    day: "numeric",
                                                    month: "short",
                                                })}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 italic">Sin días trabajados</p>
                                )}
                            </div>

                            {/* 2ª Quincena */}
                            <div>
                                <p className="text-sm text-purple-700 font-semibold mb-2 flex items-center gap-2">
                                    <span>📅</span> 2ª Quincena
                                </p>
                                {s.q2.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {s.q2.map((d) => (
                                            <span
                                                key={d}
                                                className="bg-white text-purple-700 px-3 py-1 rounded-full text-xs font-medium shadow-sm hover:bg-purple-100 transition"
                                            >
                                                {new Date(d).toLocaleDateString("es-MX", {
                                                    day: "numeric",
                                                    month: "short",
                                                })}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 italic">Sin días trabajados</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 border-t flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

const PayrollSimple: React.FC = () => {
    const [month] = useState(new Date().toISOString().slice(0, 7));
    const [people, setPeople] = useState<Person[]>([]);
    const [loading, setLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
    const [selectedShift, setSelectedShift] = useState<"completo" | "medio" | null>(null);

    const today = new Date().toISOString().slice(0, 10);

    const loadPeople = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "payroll"));
            const peopleData: Person[] = [];
            querySnapshot.forEach((d) => {
                peopleData.push({
                    id: d.id,
                    ...(d.data() as Omit<Person, "id">),
                });
            });

            const filteredPeople = peopleData.filter((p) => p.firstName !== "Nancy");
            setPeople(filteredPeople);
        } catch (error) {
            console.error("Error cargando personas:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPeople();
    }, []);

    const handleConfirmClick = (person: Person, shift: "completo" | "medio") => {
        setSelectedPerson(person);
        setSelectedShift(shift);
        setShowConfirmModal(true);
    };

    const markAttendance = async () => {
        if (!selectedPerson || !selectedShift) return;

        setLoading(true);
        try {
            const updatedAttendance: AttendanceByMonth = {
                ...selectedPerson.attendance,
                [month]: {
                    ...(selectedPerson.attendance?.[month] || {}),
                    [today]: selectedShift,
                },
            };

            setPeople((curr) =>
                curr.map((p) =>
                    p.id === selectedPerson.id ? { ...p, attendance: updatedAttendance } : p
                )
            );

            const personRef = doc(db, "payroll", selectedPerson.id);
            await updateDoc(personRef, { attendance: updatedAttendance });
        } catch (err) {
            console.error("Error actualizando asistencia:", err);
        } finally {
            setLoading(false);
            setShowConfirmModal(false);
            setSelectedPerson(null);
            setSelectedShift(null);
        }
    };

    if (loading) {
        return <FullScreenLoader message="Guardando asistencia..." />;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10">
            <h1 className="text-3xl font-bold text-purple-700 mb-8">Registro de Asistencia</h1>

            <button
                onClick={() => setShowSummaryModal(true)}
                className="mb-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
                Ver resumen
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
                {people.map((p) => {
                    const hasMarkedToday = p.attendance?.[month]?.[today] !== undefined;

                    return (
                        <div
                            key={p.id}
                            className="bg-white shadow-md rounded-xl p-4 sm:p-6 mx-3 sm:mx-0 flex flex-col items-center border border-purple-100"
                        >
                            <h2 className="text-xl font-semibold text-purple-700 mb-4 text-center">
                                {p.firstName} {p.lastName}
                            </h2>
                            <div className="flex gap-3 flex-wrap justify-center">
                                <button
                                    onClick={() => handleConfirmClick(p, "completo")}
                                    disabled={hasMarkedToday}
                                    className={`px-4 py-2 rounded-lg shadow font-medium transition-colors ${hasMarkedToday
                                            ? "bg-gray-300 cursor-not-allowed"
                                            : "bg-green-500 hover:bg-green-600 text-white"
                                        }`}
                                >
                                    Turno Completo
                                </button>
                                <button
                                    onClick={() => handleConfirmClick(p, "medio")}
                                    disabled={hasMarkedToday}
                                    className={`px-4 py-2 rounded-lg shadow font-medium transition-colors ${hasMarkedToday
                                            ? "bg-gray-300 cursor-not-allowed"
                                            : "bg-yellow-500 hover:bg-yellow-600 text-white"
                                        }`}
                                >
                                    Medio Turno
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {showConfirmModal && selectedPerson && selectedShift && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
                        <div className="p-6 border-b">
                            <h3 className="text-xl font-bold text-purple-700">Confirmar asistencia</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-600 mb-4">Vas a registrar asistencia para:</p>
                            <div className="space-y-3 text-sm text-gray-800">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Persona</span>
                                    <span className="font-medium">
                                        {selectedPerson.firstName} {selectedPerson.lastName}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Turno</span>
                                    <span className="font-medium capitalize">{selectedShift}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={markAttendance}
                                className="px-4 py-2 bg-gradient-to-r from-purple-700 to-purple-500 text-white rounded-lg hover:opacity-95 transition"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showSummaryModal && (
                <SummaryModal month={month} people={people} onClose={() => setShowSummaryModal(false)} />
            )}
        </div>
    );
};

export default PayrollSimple;
