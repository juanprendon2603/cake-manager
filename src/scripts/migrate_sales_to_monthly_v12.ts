
/**
 * migrate_sales_to_monthly_v12.ts
 * 
 * Versión compatible con firebase-admin v12 (SDK modular).
 * Ejecuta con:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' migrate_sales_to_monthly_v12.ts --start=2025-08 --project=TU_PROJECT_ID
 */

import { initializeApp, applicationDefault, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue, FieldPath, Firestore } from 'firebase-admin/firestore';

type PaymentMethod = 'cash' | 'transfer' | 'other' | 'unknown' | string;
type Kind = 'sale' | 'payment';

interface StandardEntry {
  kind: Kind;
  day: string;
  createdAt: FirebaseFirestore.FieldValue;
  type?: 'cake' | 'sponge' | string | null;
  size?: string | null;
  flavor?: string | null;
  quantity?: number | null;
  amountCOP: number;
  paymentMethod: PaymentMethod;
  source: { dayDocId: string; legacyId?: string | null; index: number };
  legacy?: {
    isPayment?: boolean;
    isPaymentFinalization?: boolean;
    totalPayment?: boolean;
    deductedFromStock?: boolean;
    orderDate?: string;
  };
}

interface ExpenseEntry {
  day: string;
  description: string;
  paymentMethod: PaymentMethod;
  valueCOP: number;
  createdAt: FirebaseFirestore.FieldValue;
  source: { dayDocId: string; index: number };
}

interface Aggregates {
  totals: {
    salesRevenue: number;
    salesCount: number;
    paymentsAmount: number;
    paymentsCount: number;
    expensesAmount: number;
    expensesCount: number;
  };
  byPayment: Record<PaymentMethod, {
    salesRevenue: number;
    salesCount: number;
    paymentsAmount: number;
    paymentsCount: number;
  }>;
}

function parseArgs() {
  const args = new Map<string, string>();
  for (const a of process.argv.slice(2)) {
    const [k, v] = a.startsWith('--') ? a.slice(2).split('=') : [a, 'true'];
    if (k) args.set(k, v ?? 'true');
  }
  return args;
}

const argv = parseArgs();
const projectId = argv.get('project') || process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || undefined;

if (!getApps().length) {
  initializeApp({
    projectId,
    credential: applicationDefault(),
  });
}

const db: Firestore = getFirestore();
db.settings({ ignoreUndefinedProperties: true });


/** Helpers fechas **/
function isValidDateStr(s: string) { return /^\d{4}-\d{2}-\d{2}$/.test(s); }
function isYearMonth(s: string) { return /^\d{4}-\d{2}$/.test(s); }
function formatDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function* dateRangeInclusive(start: string, end: string) {
  if (!isValidDateStr(start) || !isValidDateStr(end)) throw new Error('start/end deben tener formato YYYY-MM-DD');
  const [sy, sm, sd] = start.split('-').map(Number);
  const [ey, em, ed] = end.split('-').map(Number);
  const cur = new Date(sy, sm - 1, sd);
  const last = new Date(ey, em - 1, ed);
  while (cur <= last) {
    yield formatDate(cur);
    cur.setDate(cur.getDate() + 1);
  }
}
function monthKeyOf(day: string) { return day.slice(0, 7); }

/** Normalización **/
function toNumber(x: any, def = 0): number {
  const n = typeof x === 'string' ? Number(x) : x;
  return Number.isFinite(n) ? n : def;
}

function normalizeEntry(item: any, dayDocId: string, index: number): StandardEntry {
  const isPayment = item?.isPayment === true || item?.isPaymentFinalization === true;
  const kind: Kind = isPayment ? 'payment' : 'sale';

  const amountCOP = kind === 'sale'
    ? toNumber(item?.valor ?? item?.amount ?? item?.total ?? 0, 0)
    : toNumber(item?.amount ?? item?.monto ?? item?.valor ?? 0, 0);

  // Construye legacy solo con campos definidos
  const legacy: any = {};
  if (item?.isPayment !== undefined) legacy.isPayment = !!item.isPayment;
  if (item?.isPaymentFinalization !== undefined) legacy.isPaymentFinalization = !!item.isPaymentFinalization;
  if (item?.totalPayment !== undefined) legacy.totalPayment = !!item.totalPayment;
  if (item?.deductedFromStock !== undefined) legacy.deductedFromStock = !!item.deductedFromStock;
  if (typeof item?.orderDate === 'string') legacy.orderDate = item.orderDate;

  const entry: StandardEntry = {
    kind,
    day: dayDocId,
    createdAt: FieldValue.serverTimestamp(),
    type: item?.type ?? null,
    size: item?.size ?? null,
    flavor: item?.flavor ?? null,
    quantity: kind === 'sale' ? toNumber(item?.cantidad ?? item?.quantity ?? 1, 1) : null,
    amountCOP,
    paymentMethod: (item?.paymentMethod as PaymentMethod) ?? 'unknown',
    source: {
      dayDocId,
      legacyId: typeof item?.id === 'string' ? item.id : null,
      index,
    },
    // Solo agrega legacy si tiene alguna clave
    ...(Object.keys(legacy).length ? { legacy } : {}),
  };

  return entry;
}


function normalizeExpense(exp: any, dayDocId: string, index: number): ExpenseEntry | null {
  const description = typeof exp?.description === 'string' ? exp.description : '';
  const value = toNumber(exp?.value ?? exp?.valor ?? 0, 0);
  if (!description && !value) return null;
  const paymentMethod = (exp?.paymentMethod as PaymentMethod) ?? 'unknown';
  return {
    day: dayDocId,
    description,
    paymentMethod,
    valueCOP: value,
    createdAt: FieldValue.serverTimestamp(),
    source: { dayDocId, index },
  };
}

async function upsertEntry(monthKey: string, entryId: string, entry: StandardEntry) {
  const ref = db.collection('sales_monthly').doc(monthKey).collection('entries').doc(entryId);
  const snap = await ref.get();
  if (!snap.exists) await ref.set(entry);
}

async function upsertExpense(monthKey: string, expenseId: string, expense: ExpenseEntry) {
  const ref = db.collection('sales_monthly').doc(monthKey).collection('expenses').doc(expenseId);
  const snap = await ref.get();
  if (!snap.exists) await ref.set(expense);
}

function ensureByPayment(agg: Aggregates, pm: PaymentMethod) {
  if (!agg.byPayment[pm]) {
    agg.byPayment[pm] = { salesRevenue: 0, salesCount: 0, paymentsAmount: 0, paymentsCount: 0 };
  }
}

async function rebuildAggregates(monthKey: string) {
  const monthRef = db.collection('sales_monthly').doc(monthKey);
  const entriesRef = monthRef.collection('entries');
  const expensesRef = monthRef.collection('expenses');

  const aggregates: Aggregates = {
    totals: { salesRevenue: 0, salesCount: 0, paymentsAmount: 0, paymentsCount: 0, expensesAmount: 0, expensesCount: 0 },
    byPayment: {},
  };

// --- ENTRIES ---
let lastId: string | undefined;

while (true) {
  let q = entriesRef.orderBy(FieldPath.documentId()).limit(500);
  if (lastId) q = q.startAfter(lastId);   // 👈 solo si existe

  const snap = await q.get();
  if (snap.empty) break;

  for (const doc of snap.docs) {
    const d: any = doc.data();
    const kind: Kind = d?.kind;
    const pm: PaymentMethod = d?.paymentMethod || 'unknown';
    const amount = toNumber(d?.amountCOP, 0);
    ensureByPayment(aggregates, pm);
    if (kind === 'sale') {
      aggregates.totals.salesRevenue += amount;
      aggregates.totals.salesCount += 1;
      aggregates.byPayment[pm].salesRevenue += amount;
      aggregates.byPayment[pm].salesCount += 1;
    } else if (kind === 'payment') {
      aggregates.totals.paymentsAmount += amount;
      aggregates.totals.paymentsCount += 1;
      aggregates.byPayment[pm].paymentsAmount += amount;
      aggregates.byPayment[pm].paymentsCount += 1;
    }
  }

  lastId = snap.docs[snap.docs.length - 1].id;
  if (snap.size < 500) break;
}

// --- EXPENSES ---
lastId = undefined;

while (true) {
  let q = expensesRef.orderBy(FieldPath.documentId()).limit(500);
  if (lastId) q = q.startAfter(lastId);   // 👈 solo si existe

  const snap = await q.get();
  if (snap.empty) break;

  for (const doc of snap.docs) {
    const d: any = doc.data();
    const val = toNumber(d?.valueCOP, 0);
    aggregates.totals.expensesAmount += val;
    aggregates.totals.expensesCount += 1;
  }

  lastId = snap.docs[snap.docs.length - 1].id;
  if (snap.size < 500) break;
}


  await monthRef.set({ month: monthKey, createdAt: FieldValue.serverTimestamp() }, { merge: true });
  await monthRef.set({
    month: monthKey,
    updatedAt: FieldValue.serverTimestamp(),
    totals: aggregates.totals,
    byPayment: aggregates.byPayment,
  }, { merge: true });

  console.log(`✔ Agregados reconstruidos para ${monthKey}:`, JSON.stringify(aggregates, null, 2));
}

async function migrateDays(days: string[]) {
  const monthsTouched = new Set<string>();

  for (const day of days) {
    const dayRef = db.collection('sales').doc(day);
    const snap = await dayRef.get();
    if (!snap.exists) { console.log(`- (skip) No existe sales/${day}`); continue; }
    const data = snap.data() || {};
    const monthKey = monthKeyOf(day);
    monthsTouched.add(monthKey);

    const sales: any[] = Array.isArray((data as any)?.sales) ? (data as any).sales : [];
    for (let i = 0; i < sales.length; i++) {
      const entry = normalizeEntry(sales[i], day, i);
      const entryId = entry.source.legacyId ? `${day}_${entry.source.legacyId}` : `${day}_idx${i}`;
      await upsertEntry(monthKey, entryId, entry);
    }

    const expenses: any[] = Array.isArray((data as any)?.expenses) ? (data as any).expenses : [];
    for (let i = 0; i < expenses.length; i++) {
      const exp = normalizeExpense(expenses[i], day, i);
      if (!exp) continue;
      const expId = `${day}_exp${i}`;
      await upsertExpense(monthKey, expId, exp);
    }

    console.log(`✔ Migrado ${day}: entries=${sales.length}, expenses=${expenses.length}`);
  }

  for (const m of monthsTouched) {
    await rebuildAggregates(m);
  }
}

(async () => {
  try {
    const startArg = argv.get('start'); // 'YYYY-MM-DD' o 'YYYY-MM'
    const endArg = argv.get('end');     // 'YYYY-MM-DD' (opcional)
    if (!startArg) throw new Error('Debes pasar --start=YYYY-MM-DD o --start=YYYY-MM');

    let days: string[] = [];
    if (isYearMonth(startArg) && !endArg) {
      const [y, m] = startArg.split('-').map(Number);
      const first = new Date(y, m - 1, 1);
      const last = new Date(y, m, 0);
      for (const d of dateRangeInclusive(formatDate(first), formatDate(last))) days.push(d);
    } else {
      const start = isYearMonth(startArg) ? `${startArg}-01` : startArg;
      const end = endArg ?? start;
      for (const d of dateRangeInclusive(start, end)) days.push(d);
    }

    if (!days.length) throw new Error('No se generó ningún día. Revisa el parámetro --start/--end.');

    console.log(`Iniciando migración para días: ${days[0]} .. ${days[days.length - 1]} (${days.length} días)`);
    await migrateDays(days);
    console.log('✅ Migración terminada.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error en migración:', err);
    process.exit(1);
  }
})();
