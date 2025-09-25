import { useMemo, useState } from "react";
import type { CategoryStep } from "../../../../utils/catalog";
import { generateCombos, type ComboRow } from "../utils";

export default function PriceTable({
  steps,
  prices,
  onChange,
}: {
  steps: CategoryStep[];
  prices: Record<string, number | undefined>;
  onChange: (next: Record<string, number>) => void;
}) {
  const [filter, setFilter] = useState("");
  const [fillValue, setFillValue] = useState<string>("");

  const combos = useMemo(() => generateCombos(steps), [steps]);

  const filtered: ComboRow[] = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return combos;
    return combos.filter((c) =>
      c.labels.some(
        (p) =>
          p.optionLabel.toLowerCase().includes(f) ||
          p.stepLabel.toLowerCase().includes(f)
      )
    );
  }, [combos, filter]);

  function setPrice(key: string, v: number) {
    onChange({ ...prices, [key]: v > 0 ? v : 0 });
  }

  function applyFill() {
    const v = Number(fillValue || 0);
    if (!(v > 0)) return;
    const next = { ...prices };
    for (const c of combos) {
      if (!next[c.key] || next[c.key] === 0) next[c.key] = v;
    }
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
        <label className="text-sm text-gray-700">
          Filtro
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Busca por opción o atributo…"
            className="mt-1 w-full sm:w-72 rounded-lg border px-3 py-2"
          />
        </label>

        <div className="flex items-end gap-2">
          <label className="text-sm text-gray-700">
            Rellenar vacíos con
            <input
              type="number"
              min={0}
              step="1"
              value={fillValue}
              onChange={(e) => setFillValue(e.target.value)}
              className="mt-1 w-36 rounded-lg border px-3 py-2 text-right"
              placeholder="$"
            />
          </label>
          <button
            type="button"
            onClick={applyFill}
            className="h-10 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold"
          >
            Aplicar
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed p-6 text-center text-gray-500 bg-gray-50">
          Sin combinaciones (ajusta atributos y/o filtro).
        </div>
      ) : (
        <div className="overflow-auto rounded-xl border bg-white">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                {steps.map((s) => (
                  <th key={s.id} className="p-2 text-left">
                    {s.label}
                  </th>
                ))}
                <th className="p-2 text-right">Precio</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.key} className="odd:bg-gray-50 even:bg-white">
                  {c.labels.map((p, i) => (
                    <td key={i} className="p-2">
                      {p.optionLabel}
                    </td>
                  ))}
                  <td className="p-2 text-right">
                    <input
                      type="number"
                      min={0}
                      step="1"
                      value={prices[c.key] ?? ""}
                      onChange={(e) =>
                        setPrice(c.key, Number(e.target.value || 0))
                      }
                      className="w-32 text-right border rounded-lg px-3 py-1"
                      placeholder="$"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
