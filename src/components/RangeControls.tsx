import { format, lastDayOfMonth, parseISO } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  start: string;
  end: string;
  onChange: (range: { start: string; end: string }) => void;
  persistKey?: string;
};

type Mode = "month" | "range";
type Fortnight = "Q1" | "Q2";
type Range = { start: string; end: string };

const todayStr = () => format(new Date(), "yyyy-MM-dd");
const ymFrom = (d: string) => d.slice(0, 7);
const dayNum = (d: string) => Number(d.slice(8, 10));
const fortnightFromDate = (d: string): Fortnight =>
  dayNum(d) <= 15 ? "Q1" : "Q2";

const monthFortnightRange = (ym: string, q: Fortnight): Range => {
  const first = `${ym}-01`;
  const last = format(lastDayOfMonth(parseISO(first)), "yyyy-MM-dd");
  return q === "Q1"
    ? { start: first, end: `${ym}-15` }
    : { start: `${ym}-16`, end: last };
};

export function RangeControls({
  start,
  end,
  onChange,
  persistKey = "rangeControls",
}: Props) {
  const [mode, setMode] = useState<Mode>(() => {
    const saved = localStorage.getItem(`${persistKey}:mode`);
    return saved === "month" || saved === "range" ? saved : "month";
  });

  const derivedMonth = useMemo(() => ymFrom(start), [start]);
  const [month, setMonth] = useState<string>(() => {
    const saved = localStorage.getItem(`${persistKey}:month`);
    return saved ?? derivedMonth;
  });

  const [fortnight, setFortnight] = useState<Fortnight>(() => {
    const saved = localStorage.getItem(`${persistKey}:fortnight`);
    return saved === "Q1" || saved === "Q2" ? saved : fortnightFromDate(start);
  });

  const [customStart, setCustomStart] = useState<string>(() => {
    return localStorage.getItem(`${persistKey}:customStart`) ?? start;
  });
  const [customEnd, setCustomEnd] = useState<string>(() => {
    return localStorage.getItem(`${persistKey}:customEnd`) ?? end;
  });
  const [rangeDirty, setRangeDirty] = useState(false);

  const lastAppliedRef = useRef<Range>({ start, end });

  useEffect(() => {
    localStorage.setItem(`${persistKey}:mode`, mode);
  }, [mode, persistKey]);

  useEffect(() => {
    localStorage.setItem(`${persistKey}:month`, month);
  }, [month, persistKey]);

  useEffect(() => {
    localStorage.setItem(`${persistKey}:fortnight`, fortnight);
  }, [fortnight, persistKey]);

  useEffect(() => {
    localStorage.setItem(`${persistKey}:customStart`, customStart);
  }, [customStart, persistKey]);

  useEffect(() => {
    localStorage.setItem(`${persistKey}:customEnd`, customEnd);
  }, [customEnd, persistKey]);

  useEffect(() => {
    setMonth(derivedMonth);
    setFortnight(fortnightFromDate(start));

    if (mode === "month" || !rangeDirty) {
      setCustomStart(start);
      setCustomEnd(end);
    }
  }, [start, end, derivedMonth, mode, rangeDirty]);

  const applyMonthFortnight = (m: string, q: Fortnight) => {
    const next = monthFortnightRange(m, q);
    lastAppliedRef.current = next;
    onChange(next);
  };

  const isCustomValid = (s: string, e: string) => Boolean(s && e && s <= e);

  const applyCustomRange = (s: string, e: string) => {
    if (!isCustomValid(s, e)) return;
    const next = { start: s, end: e };
    lastAppliedRef.current = next;
    setRangeDirty(false);
    onChange(next);
  };

  const handleMode = (value: Mode) => {
    setMode(value);
    if (value === "month") {
      applyMonthFortnight(month, fortnight);
    } else {
      setCustomStart(lastAppliedRef.current.start);
      setCustomEnd(lastAppliedRef.current.end);
      setRangeDirty(false);
    }
  };

  const handleMonth = (m: string) => {
    setMonth(m);
    if (mode === "month") applyMonthFortnight(m, fortnight);
  };

  const handleFortnight = (q: Fortnight) => {
    setFortnight(q);
    if (mode === "month") applyMonthFortnight(month, q);
  };

  const handleCustomStart = (s: string) => {
    setCustomStart(s);
    if (mode === "range") setRangeDirty(true);
  };

  const handleCustomEnd = (e: string) => {
    setCustomEnd(e);
    if (mode === "range") setRangeDirty(true);
  };

  const handleReset = () => {
    const now = todayStr();
    const ym = ymFrom(now);
    const q = fortnightFromDate(now);
    setMode("month");
    setMonth(ym);
    setFortnight(q);
    setRangeDirty(false);
    const next = monthFortnightRange(ym, q);
    lastAppliedRef.current = next;
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3 items-stretch sm:items-center sm:flex-row sm:justify-center">
      <div className="bg-white rounded-2xl p-3 shadow border border-purple-200 flex flex-wrap gap-3 items-center">
        <select
          value={mode}
          onChange={(e) => handleMode(e.target.value as Mode)}
          className="border-2 border-purple-300 rounded-xl px-3 py-2 text-purple-700 font-semibold"
        >
          <option value="month">🗓️ Mes / Quincena</option>
          <option value="range">📅 Rango libre</option>
        </select>

        {mode === "month" && (
          <>
            <input
              type="month"
              value={month}
              onChange={(e) => handleMonth(e.target.value)}
              className="border-2 border-purple-300 rounded-xl px-3 py-2"
            />
            <select
              value={fortnight}
              onChange={(e) => handleFortnight(e.target.value as Fortnight)}
              className="border-2 border-purple-300 rounded-xl px-3 py-2 text-purple-700 font-semibold"
            >
              <option value="Q1">Q1 (1–15)</option>
              <option value="Q2">Q2 (16–fin)</option>
            </select>
          </>
        )}

        {mode === "range" && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStart}
              onChange={(e) => handleCustomStart(e.target.value)}
              className="border-2 border-purple-300 rounded-xl px-3 py-2"
            />
            <span className="text-gray-500">—</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => handleCustomEnd(e.target.value)}
              className="border-2 border-purple-300 rounded-xl px-3 py-2"
            />

            <button
              type="button"
              onClick={() => applyCustomRange(customStart, customEnd)}
              disabled={!rangeDirty || !isCustomValid(customStart, customEnd)}
              className={`ml-2 px-3 py-2 rounded-xl font-semibold transition
                ${
                  !rangeDirty || !isCustomValid(customStart, customEnd)
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow hover:shadow-md"
                }`}
              title={
                !isCustomValid(customStart, customEnd)
                  ? "Selecciona un rango válido"
                  : "Aplicar rango"
              }
            >
              Aplicar
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={handleReset}
          className="ml-auto px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold"
          title="Reiniciar a la quincena actual"
        >
          Reiniciar
        </button>
      </div>
    </div>
  );
}
