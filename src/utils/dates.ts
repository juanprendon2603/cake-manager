// src/utils/dates.ts
const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

export const getLocalTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const getLocalMonthString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; // YYYY-MM
};

export const parseLocalDate = (isoDate: string) => {
  // isoDate "YYYY-MM-DD"
  const [y, m, day] = isoDate.split("-").map((x) => parseInt(x, 10));
  return new Date(y, (m || 1) - 1, day || 1);
};
