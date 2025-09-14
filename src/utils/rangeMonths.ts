// utils/rangeMonths.ts
export function monthsBetween(start: string, end: string): string[] {
    // start/end YYYY-MM-DD → devuelve ["YYYY-MM", ...]
    const sY = Number(start.slice(0,4)), sM = Number(start.slice(5,7));
    const eY = Number(end.slice(0,4)), eM = Number(end.slice(5,7));
    const out: string[] = [];
    let y = sY, m = sM;
    while (y < eY || (y === eY && m <= eM)) {
      out.push(`${y}-${String(m).padStart(2,"0")}`);
      m++;
      if (m > 12) { m = 1; y++; }
    }
    return out;
  }
  
  export function isCurrentMonth(ym: string): boolean {
    const now = new Date();
    const cur = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
    return ym === cur;
  }
  