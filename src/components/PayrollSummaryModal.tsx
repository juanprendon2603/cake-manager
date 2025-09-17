// src/components/PayrollSummaryModal.tsx
import BaseModal from "./BaseModal";
import type { Person } from "../types/payroll";
import { parseLocalDate } from "../utils/dates";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  month: string; // YYYY-MM
  people: Person[];
}

export default function PayrollSummaryModal({
  isOpen,
  onClose,
  month,
  people,
}: Props) {
  const summary = people.map((p) => {
    const q1: string[] = [];
    const q2: string[] = [];
    const monthData = p.attendance?.[month] || {};
    for (const date in monthData) {
      const day = parseInt(date.split("-")[2], 10);
      (day <= 15 ? q1 : q2).push(date);
    }
    return { name: `${p.firstName} ${p.lastName}`, q1, q2 };
  });

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      headerAccent="indigo"
      title="Resumen por quincena"
      description={`Mes: ${month}`}
      secondaryAction={{ label: "Cerrar", onClick: onClose }}
      /** más ancho */
      size="5xl"
      /** cuerpo scrolleable en pantallas pequeñas y medianas */
      bodyClassName="max-h-[70vh] overflow-y-auto"
    >
      {/* grid de personas: 1 col en mobile, 2 cols en >=lg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {summary.map((s, idx) => (
          <div
            key={idx}
            className="relative bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-100 hover:border-purple-200 transition-all duration-300"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-2xl" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-bold">
                {s.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <p className="text-lg sm:text-xl font-bold text-gray-800">
                {s.name}
              </p>
            </div>

            {/* Q1 y Q2 lado a lado en >=md */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Q1 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center text-white text-xs">
                    1
                  </div>
                  <p className="text-sm font-bold text-gray-700">1ª Quincena</p>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                    {s.q1.length} días
                  </span>
                </div>
                {s.q1.length > 0 ? (
                  // grid de chips de fechas — evita columnas eternas
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                    {s.q1.map((d) => (
                      <span
                        key={d}
                        className="text-center bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-green-200"
                      >
                        {parseLocalDate(d).toLocaleDateString("es-CO", {
                          day: "numeric",
                        })}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-xs text-gray-400">
                    📭 Sin días
                  </div>
                )}
              </div>

              {/* Q2 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white text-xs">
                    2
                  </div>
                  <p className="text-sm font-bold text-gray-700">2ª Quincena</p>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                    {s.q2.length} días
                  </span>
                </div>
                {s.q2.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                    {s.q2.map((d) => (
                      <span
                        key={d}
                        className="text-center bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-blue-200"
                      >
                        {parseLocalDate(d).toLocaleDateString("es-CO", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-xs text-gray-400">
                    📭 Sin días
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {summary.length === 0 && (
          <p className="col-span-full text-center text-gray-500">
            Sin información.
          </p>
        )}
      </div>
    </BaseModal>
  );
}
