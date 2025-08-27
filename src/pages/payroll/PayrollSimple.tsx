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

/* Helpers para manejo de fechas en local (evita el shift por UTC) */
const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const getLocalTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const getLocalMonthString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; // YYYY-MM
};

const parseLocalDate = (isoDate: string) => {
    // isoDate expected: "YYYY-MM-DD"
    const [y, m, day] = isoDate.split("-").map((x) => parseInt(x, 10));
    return new Date(y, (m || 1) - 1, day || 1); // local date
};

const SummaryModal: React.FC<SummaryModalProps> = ({ month, people, onClose }) => {
    const getQuincenaSummary = () => {
        return people.map((p) => {
            const q1: string[] = [];
            const q2: string[] = [];
            const monthData = p.attendance?.[month] || {};

            for (const date in monthData) {
                const day = parseInt(date.split("-")[2], 10);
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
        <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose} // click en overlay cierra
        >
            <div
                className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto border-2 border-white/60"
                onClick={(e) => e.stopPropagation()} // evita que clicks internos cierren
            >
                <div className="p-6 border-b border-purple-100 flex justify-between items-center bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-3xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg">
                            📊
                        </div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Resumen por quincena
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all duration-200"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {summary.map((s, idx) => (
                        <div
                            key={idx}
                            className="relative bg-gradient-to-br from-white to-purple-50/50 rounded-2xl p-6 shadow-lg border-2 border-purple-100 hover:border-purple-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-2xl"></div>

                            {/* Nombre */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-bold">
                                    {s.name.split(" ").map((n) => n[0]).join("")}
                                </div>
                                <p className="text-xl font-bold text-gray-800">{s.name}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* 1ª Quincena */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center text-white text-xs">
                                            1
                                        </div>
                                        <p className="text-sm font-bold text-gray-700">1ª Quincena</p>
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                            {s.q1.length} días
                                        </span>
                                    </div>
                                    {s.q1.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {s.q1.map((d) => (
                                                <span
                                                    key={d}
                                                    className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm hover:shadow-md transition-all duration-200 border border-green-200"
                                                >
                                                    {parseLocalDate(d).toLocaleDateString("es-CO", {
                                                        day: "numeric",
                                                        month: "short",
                                                    })}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                            <div className="text-2xl mb-1">📭</div>
                                            <p className="text-xs text-gray-400 font-medium">Sin días trabajados</p>
                                        </div>
                                    )}
                                </div>

                                {/* 2ª Quincena */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white text-xs">
                                            2
                                        </div>
                                        <p className="text-sm font-bold text-gray-700">2ª Quincena</p>
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                            {s.q2.length} días
                                        </span>
                                    </div>
                                    {s.q2.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {s.q2.map((d) => (
                                                <span
                                                    key={d}
                                                    className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200"
                                                >
                                                    {parseLocalDate(d).toLocaleDateString("es-CO", {
                                                        day: "numeric",
                                                        month: "short",
                                                    })}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                            <div className="text-2xl mb-1">📭</div>
                                            <p className="text-xs text-gray-400 font-medium">Sin días trabajados</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 border-t border-purple-100 flex justify-end bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-b-3xl">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

const PayrollSimple: React.FC = () => {
    const [month] = useState<string>(getLocalMonthString()); // ahora basado en local
    const [people, setPeople] = useState<Person[]>([]);
    const [loading, setLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
    const [selectedShift, setSelectedShift] = useState<"completo" | "medio" | null>(null);

    const today = getLocalTodayString(); // fecha local YYYY-MM-DD

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
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex flex-col items-center py-10">
            {/* Header */}
            <div className="text-center mb-10">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl shadow-lg">
                        👥
                    </div>
                </div>
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    Registro de Asistencia
                </h1>
                <p className="text-gray-600 max-w-md mx-auto">
                    Marca la asistencia diaria del equipo de trabajo
                </p>
            </div>

            {/* Summary Button */}
            <div className="mb-8">
                <button
                    onClick={() => setShowSummaryModal(true)}
                    className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-3"
                >
                    <span className="text-xl group-hover:scale-110 transition-transform duration-200">📊</span>
                    Ver resumen por quincenas
                </button>
            </div>

            {/* People Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl px-4">
                {people.map((p) => {
                    const hasMarkedToday = p.attendance?.[month]?.[today] !== undefined;
                    const todayShift = p.attendance?.[month]?.[today];

                    return (
                        <div
                            key={p.id}
                            className={`relative bg-white/80 backdrop-blur-xl shadow-lg rounded-2xl p-6 flex flex-col items-center border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                                hasMarkedToday
                                    ? "border-green-200 bg-gradient-to-br from-green-50/50 to-emerald-50/50"
                                    : "border-white/60 hover:border-purple-200"
                            }`}
                        >
                            {hasMarkedToday && (
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm shadow-lg">
                                    ✓
                                </div>
                            )}

                            {/* Avatar */}
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xl font-bold mb-4 shadow-lg">
                                {p.firstName[0]}
                                {p.lastName[0]}
                            </div>

                            {/* Name */}
                            <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">
                                {p.firstName} {p.lastName}
                            </h2>

                            {/* Status */}
                            {hasMarkedToday ? (
                                <div className="mb-4">
                                    <span
                                        className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                            todayShift === "completo"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-yellow-100 text-yellow-700"
                                        }`}
                                    >
                                        {todayShift === "completo" ? "🕐 Turno Completo" : "⏰ Medio Turno"}
                                    </span>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm mb-4">Pendiente de marcar</p>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-3 flex-wrap justify-center w-full">
                                <button
                                    onClick={() => handleConfirmClick(p, "completo")}
                                    disabled={hasMarkedToday}
                                    className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                                        hasMarkedToday
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                                    }`}
                                >
                                    <span>🕐</span>
                                    Turno Completo
                                </button>
                                <button
                                    onClick={() => handleConfirmClick(p, "medio")}
                                    disabled={hasMarkedToday}
                                    className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                                        hasMarkedToday
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                                    }`}
                                >
                                    <span>⏰</span>
                                    Medio Turno
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {showConfirmModal && selectedPerson && selectedShift && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setShowConfirmModal(false)}
                >
                    <div
                        className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-md shadow-2xl border-2 border-white/60"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-3xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg">
                                    ✓
                                </div>
                                <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    Confirmar asistencia
                                </h3>
                            </div>
                        </div>

                        <div className="p-6">
                            <p className="text-gray-600 mb-6">Vas a registrar asistencia para:</p>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                                    <span className="text-gray-600 font-medium">Persona</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
                                            {selectedPerson.firstName[0]}
                                            {selectedPerson.lastName[0]}
                                        </div>
                                        <span className="font-bold text-gray-800">
                                            {selectedPerson.firstName} {selectedPerson.lastName}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                                    <span className="text-gray-600 font-medium">Turno</span>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                            selectedShift === "completo" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                        }`}
                                    >
                                        {selectedShift === "completo" ? "🕐 Completo" : "⏰ Medio"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-purple-100 flex justify-end gap-3 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-b-3xl">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-6 py-3 text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={markAttendance}
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
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