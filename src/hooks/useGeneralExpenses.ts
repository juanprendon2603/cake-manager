import { useEffect, useMemo, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

type Range = { start: string; end: string }; 
type PaymentMethod = "cash" | "transfer";

type GeneralExpense = {
  date: string;              
  description: string;
  paymentMethod: PaymentMethod;
  value: number;            
};

type Totals = {
  generalExpensesCash: number;
  generalExpensesTransfer: number;
  generalExpensesTotal: number;
};

type GeneralExpenseRaw = {
  date?: unknown;
  description?: unknown;
  paymentMethod?: unknown;
  value?: unknown;
};

type MonthDocRaw = {
  expenses?: unknown;
};


function isYYYYMMDD(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s);
  return Number.isFinite(d.getTime()) && s === d.toISOString().slice(0, 10);
}

function parsePaymentMethod(x: unknown): PaymentMethod | null {
  if (x === "cash" || x === "transfer") return x;
  return null;
}

function toStringSafe(x: unknown): string {
  return typeof x === "string" ? x : String(x ?? "");
}

function toNumberSafe(x: unknown): number {
  if (typeof x === "number" && Number.isFinite(x)) return x;
  if (typeof x === "string" && x.trim() !== "") {
    const n = Number(x);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

function parseGeneralExpense(raw: GeneralExpenseRaw): GeneralExpense | null {
  const date = toStringSafe(raw.date).slice(0, 10);
  if (!isYYYYMMDD(date)) return null;

  const pm = parsePaymentMethod(raw.paymentMethod);
  if (!pm) return null;

  const value = toNumberSafe(raw.value);
  const description = toStringSafe(raw.description);

  return { date, description, paymentMethod: pm, value };
}

function monthsBetween(start: string, end: string): string[] {
  const [sy, sm] = start.split("-").map((x) => parseInt(x, 10));
  const [ey, em] = end.split("-").map((x) => parseInt(x, 10));
  const startIdx = sy * 12 + (sm - 1);
  const endIdx = ey * 12 + (em - 1);

  const keys: string[] = [];
  for (let i = startIdx; i <= endIdx; i++) {
    const y = Math.floor(i / 12);
    const m = (i % 12) + 1;
    keys.push(`${y}-${String(m).padStart(2, "0")}`);
  }
  return keys;
}

export function useGeneralExpenses(range: Range) {
  const [loading, setLoading] = useState<boolean>(true);
  const [items, setItems] = useState<GeneralExpense[]>([]);
  const [totals, setTotals] = useState<Totals>({
    generalExpensesCash: 0,
    generalExpensesTransfer: 0,
    generalExpensesTotal: 0,
  });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      try {
        const months = monthsBetween(range.start, range.end);

        const collected: GeneralExpense[] = [];
        let cash = 0;
        let transfer = 0;

        for (const monthKey of months) {
          const ref = doc(db, "generalExpenses", monthKey);
          const snap = await getDoc(ref);

          if (!snap.exists()) continue;

          const data = snap.data() as unknown as MonthDocRaw;

          const expensesArray: unknown = data?.expenses;
          if (!Array.isArray(expensesArray)) continue;

          for (const e of expensesArray) {
            const parsed = parseGeneralExpense(e as GeneralExpenseRaw);
            if (!parsed) continue;

            if (parsed.date < range.start || parsed.date > range.end) continue;

            collected.push(parsed);

            if (parsed.paymentMethod === "cash") cash += parsed.value;
            else if (parsed.paymentMethod === "transfer") transfer += parsed.value;
          }
        }

        if (!cancelled) {
          collected.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
          setItems(collected);
          setTotals({
            generalExpensesCash: cash,
            generalExpensesTransfer: transfer,
            generalExpensesTotal: cash + transfer,
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [range.start, range.end]);

  const byDay = useMemo(() => {
    const m = new Map<string, GeneralExpense[]>();
    for (const it of items) {
      const arr = m.get(it.date);
      if (arr) arr.push(it);
      else m.set(it.date, [it]);
    }
    return m;
  }, [items]);

  return { loading, items, totals, byDay };
}
