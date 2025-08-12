import type { Sale, Expense } from "../../types/finance";
import { DailyDetailContent } from "./DailyDetailContent";

interface DailyDetailProps {
  fecha: string;
  sales: Sale[];
  expenses: Expense[];
  onClose: () => void;
}

export function DailyDetail({ fecha, sales, expenses, onClose }: DailyDetailProps) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="daily-detail-title"
    >
      <div
        className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8E2DA8] hover:text-[#701f85] font-bold text-xl"
          aria-label="Cerrar modal"
        >
          &times;
        </button>

        <DailyDetailContent fecha={fecha} sales={sales} expenses={expenses} />
      </div>
    </div>
  );
}