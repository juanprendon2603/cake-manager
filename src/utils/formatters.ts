export const humanize = (s?: string | null) => (s ? s.replace(/_/g, " ") : "");
export const paymentLabel = (pm: string) =>
pm === "cash" ? "Efectivo" : pm === "transfer" ? "Transferencia" : pm;