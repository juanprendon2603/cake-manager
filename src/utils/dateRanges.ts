import { format, lastDayOfMonth, parseISO } from "date-fns";

export type Range = { start: string; end: string };

export function monthRange(ym: string): Range {
  const first = parseISO(`${ym}-01`);
  const last = lastDayOfMonth(first);
  return { start: format(first, "yyyy-MM-dd"), end: format(last, "yyyy-MM-dd") };
}

export function quincenaRange(ym: string, which: "Q1" | "Q2"): Range {
  const { start: monthStart, end: monthEnd } = monthRange(ym); 
  const y = ym.slice(0, 4);
  const m = ym.slice(5, 7);

  if (which === "Q1") {
    return { start: monthStart, end: `${y}-${m}-15` };
  }
  return { start: `${y}-${m}-16`, end: monthEnd };
}
