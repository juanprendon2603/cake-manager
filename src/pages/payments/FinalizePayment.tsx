// src/pages/payments/FinalizePayment.tsx
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { BackButton } from "../../components/BackButton";
// import BaseModal from "../../components/BaseModal"; // ⬅️ ya no se usa aquí
import { FullScreenLoader } from "../../components/FullScreenLoader";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../hooks/useToast";
import type {
  PaymentsMonthlyRow,
  PendingPaymentGroup,
} from "../../types/payments";
import {
  listCategories,
  tryDecrementStockGeneric,
} from "../catalog/catalog.service";
import type { CategoryStep, ProductCategory } from "../stock/stock.model";
import PaymentFinalizeModal from "./components/PaymentFinalizeModal";
import {
  fetchPaymentsEntriesForMonth,
  finalizePaymentGroup,
  groupPayments,
} from "./payment.service";

// ✨ UI consistente
import { AppFooter } from "../../components/AppFooter";
import { PageHero } from "../../components/ui/PageHero";
import { ProTipBanner } from "../../components/ui/ProTipBanner";

// ➕ Modal reutilizable de “sin stock”
import NoStockModal from "../../components/NoStockModal";

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const localToday = () => format(new Date(), "yyyy-MM-dd");

/* ------------------------- Pretty selections helper ------------------------ */
function buildPrettySelections(
  cat: ProductCategory | null,
  selectionsInput: Record<string, string> | undefined | null,
  variantKey?: string
): Array<{ label: string; value: string }> {
  const selections: Record<string, string> = selectionsInput ?? {};

  if (cat && Array.isArray(cat.steps)) {
    const affectingSteps: CategoryStep[] = (cat.steps || []).filter(
      (s) => s.affectsStock
    );
    const pretty = affectingSteps.map((st) => {
      const valKey = selections[st.key] ?? "";
      const valueLabel =
        st.options?.find((o) => o.key === valKey)?.label ?? valKey;
      return { label: st.label, value: valueLabel };
    });
    const hasAny = pretty.some((p) => p.value);
    if (!hasAny && variantKey) {
      try {
        const parts = variantKey.split("|").map((p) => p.split(":"));
        return parts
          .filter((kv) => kv.length === 2)
          .map(([k, v]) => ({ label: k, value: v }));
      } catch {}
    }
    return pretty;
  }

  const entries = Object.entries(selections);
  if (entries.length > 0)
    return entries.map(([k, v]) => ({ label: k, value: v }));

  if (variantKey) {
    try {
      const parts = variantKey.split("|").map((p) => p.split(":"));
      return parts
        .filter((kv) => kv.length === 2)
        .map(([k, v]) => ({ label: k, value: v }));
    } catch {}
  }
  return [];
}

/* ------------------------------ Calendario utils -------------------------- */
const monthOf = (yyyyMmDd: string) => yyyyMmDd.slice(0, 7);
function getMonthMeta(yyyyMm: string) {
  const [Y, M] = yyyyMm.split("-").map(Number);
  const first = new Date(Y, M - 1, 1);
  const daysInMonth = new Date(Y, M, 0).getDate();
  // Lunes=0, Martes=1, ..., Domingo=6
  const mondayStartIndex = (first.getDay() + 6) % 7; // getDay: 0=Dom..6=Sab
  return { Y, M, daysInMonth, mondayStartIndex };
}
function ymd(Y: number, M: number, D: number) {
  return `${Y}-${pad(M)}-${pad(D)}`;
}

export function FinalizePayment() {
  const { addToast } = useToast();
  const now = new Date();
  const { user, profile } = useAuth();

  const defaultMonth = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;

  const [month, setMonth] = useState<string>(defaultMonth); // YYYY-MM
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<PaymentsMonthlyRow[]>([]);
  const [selected, setSelected] = useState<PendingPaymentGroup | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null); // YYYY-MM-DD

  // Modal “sin stock” para finalizar
  const [showNoStock, setShowNoStock] = useState(false);
  const [pendingFinalize, setPendingFinalize] =
    useState<PendingPaymentGroup | null>(null);

  // ➕ Contexto para NoStockModal
  const [noStockCtx, setNoStockCtx] = useState<{
    selectedParts: {
      stepKey: string;
      stepLabel: string;
      optionKey: string;
      optionLabel: string;
    }[];
    currentStock: number;
    requestedQty: number;
  }>({
    selectedParts: [],
    currentStock: 0,
    requestedQty: 0,
  });

  const sellerName = useMemo(() => {
    const f = (profile?.firstName || "").trim();
    const l = (profile?.lastName || "").trim();
    const byFL = [f, l].filter(Boolean).join(" ");
    const dn =
      (profile?.displayName || "").trim() || (user?.displayName || "").trim();
    const mail = (user?.email || "").trim();
    const fromEmail = mail ? mail.split("@")[0] : "";
    return byFL || dn || fromEmail || "Usuario";
  }, [profile, user]);

  // catálogo para labels
  const [catsLoading, setCatsLoading] = useState(true);
  const [cats, setCats] = useState<ProductCategory[]>([]);
  const catById = useMemo(
    () => Object.fromEntries(cats.map((c) => [c.id, c] as const)),
    [cats]
  );

  async function load(monthKey: string) {
    try {
      setLoading(true);
      const list = await fetchPaymentsEntriesForMonth(monthKey);
      setRows(list);
    } catch {
      addToast({
        type: "error",
        title: "Error al cargar",
        message: "No se pudieron cargar los pagos del mes.",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const all = await listCategories();
        setCats(all);
      } catch {
      } finally {
        setCatsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    void load(month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const groups = useMemo(() => groupPayments(rows), [rows]);

  // Mapa por día (orderDay) para el mes actual
  const groupsByDay = useMemo(() => {
    const map = new Map<string, PendingPaymentGroup[]>();
    for (const g of groups) {
      if (monthOf(g.orderDay) !== month) continue;
      const arr = map.get(g.orderDay) || [];
      arr.push(g);
      map.set(g.orderDay, arr);
    }
    // ordenar cada día: pendientes primero
    for (const arr of map.values()) {
      arr.sort((a, b) => {
        const afinal = a.hasTotalPayment || a.restante <= 0 ? 1 : 0;
        const bfinal = b.hasTotalPayment || b.restante <= 0 ? 1 : 0;
        if (afinal !== bfinal) return afinal - bfinal;
        return a.categoryName.localeCompare(b.categoryName);
      });
    }
    return map;
  }, [groups, month]);

  // Seleccionar día por defecto
  useEffect(() => {
    const today = localToday();
    if (monthOf(today) === month && groupsByDay.has(today)) {
      setSelectedDay(today);
    } else {
      const firstWith = [...groupsByDay.keys()].sort()[0] || null;
      setSelectedDay(firstWith);
    }
  }, [month, groupsByDay]);

  // Helper: construir partes seleccionadas con labels bonitos para el modal
  function buildSelectedPartsForNoStock(group: PendingPaymentGroup) {
    const cat = catById[group.categoryId] ?? null;
    const steps = (cat?.steps || []).filter((s) => s.affectsStock);
    return steps.map((s) => {
      const optKey = String(group.selections?.[s.key] ?? "");
      const opt = (s.options || []).find((o) => o.key === optKey);
      return {
        stepKey: s.key,
        stepLabel: s.label,
        optionKey: optKey,
        optionLabel: opt?.label || optKey || "",
      };
    });
  }

  // Intento de finalización con manejo de stock
  const onConfirm = async () => {
    if (!selected) return;
    try {
      setLoading(true);
      const today = localToday();

      // Si ya estaba descontado, solo finalizamos (marca didDeduct=true)
      if (selected.deductedFromStock) {
        await finalizePaymentGroup(selected, today, {
          didDeductFromStock: true,
          seller: {
            name: sellerName,
            uid: user?.uid,
            email: user?.email || undefined,
          },
        });
        addToast({
          type: "success",
          title: "Pago finalizado",
          message:
            selected.restante > 0
              ? "Se marcó el pago como finalizado y se creó la venta del restante."
              : "Se marcó el pago como finalizado.",
          duration: 5000,
        });
        setSelected(null);
        await load(month);
        return;
      }

      // No descontado aún: intentar descontar ahora
      const dec = await tryDecrementStockGeneric(
        selected.categoryId,
        selected.variantKey,
        selected.quantity
      );

      if (!dec.decremented) {
        // Mostrar modal “sin stock”: decidir si continuar sin descontar
        setPendingFinalize(selected);
        setNoStockCtx({
          selectedParts: buildSelectedPartsForNoStock(selected),
          currentStock: dec.current ?? 0,
          requestedQty: selected.quantity,
        });
        setShowNoStock(true);
        return;
      }

      // Se logró descontar; finalizar marcando didDeduct=true
      await finalizePaymentGroup(selected, today, {
        didDeductFromStock: true,
        seller: {
          name: sellerName,
          uid: user?.uid,
          email: user?.email || undefined,
        },
      });
      addToast({
        type: "success",
        title: "Pago finalizado",
        message:
          selected.restante > 0
            ? "Se finalizó y se creó la venta del restante. Inventario descontado."
            : "Se finalizó el pago. Inventario descontado.",
        duration: 5000,
      });
      setSelected(null);
      await load(month);
    } catch {
      addToast({
        type: "error",
        title: "Error al finalizar",
        message: "No pudimos actualizar el pago. Inténtalo nuevamente.",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Continuar finalizando sin descontar
  const handleFinalizeWithoutStock = async () => {
    if (!pendingFinalize) return;
    try {
      setLoading(true);
      const today = localToday();
      await finalizePaymentGroup(pendingFinalize, today, {
        didDeductFromStock: false,
        seller: {
          name: sellerName,
          uid: user?.uid,
          email: user?.email || undefined,
        },
      });
      addToast({
        type: "success",
        title: "Pago finalizado (sin stock)",
        message:
          pendingFinalize.restante > 0
            ? "Se finalizó y se creó la venta del restante (no se descontó inventario)."
            : "Se finalizó el pago (no se descontó inventario).",
        duration: 5000,
      });
      setPendingFinalize(null);
      setShowNoStock(false);
      setSelected(null);
      await load(month);
    } catch {
      addToast({
        type: "error",
        title: "Error al finalizar",
        message: "No pudimos actualizar el pago. Inténtalo nuevamente.",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || catsLoading)
    return <FullScreenLoader message="Cargando información..." />;

  /* ------------------------------- Calendar UI ------------------------------ */
  const { Y, M, daysInMonth, mondayStartIndex } = getMonthMeta(month);
  const totalCells = 42; // 6 semanas x 7 días
  const cells: Array<{ day: number | null; date: string | null }> = [];
  for (let i = 0; i < mondayStartIndex; i++)
    cells.push({ day: null, date: null });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, date: ymd(Y, M, d) });
  while (cells.length < totalCells) cells.push({ day: null, date: null });

  const weekdayHeaders = ["L", "M", "X", "J", "V", "S", "D"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex flex-col">
      <main className="flex-grow p-6 sm:p-12 max-w-6xl mx-auto w-full">
        {/* ====== PageHero + Back ====== */}
        <div className="relative mb-6">
          <PageHero
            icon="💳"
            title="Gestión de Abonos"
            subtitle="Finaliza pedidos desde el calendario"
          />
          <div className="absolute top-4 left-4 z-20">
            <BackButton fallback="/payment-management" />
          </div>
        </div>

        {/* ====== Controles ====== */}
        <section className="rounded-3xl border-2 border-white/60 bg-white/80 backdrop-blur-xl shadow-2xl p-4 sm:p-6 mb-6">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Mes</label>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="px-3 py-2 rounded-lg border-2 border-purple-200 bg-white/90 text-sm font-medium text-purple-700"
              />
            </div>
            {selectedDay && (
              <div className="text-xs text-gray-600">
                Día seleccionado: <strong>{selectedDay}</strong>
              </div>
            )}
          </div>
        </section>

        {/* ====== Calendario + Lista del día ====== */}
        <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
          {/* Calendario */}
          <div className="rounded-3xl border-2 border-white/60 bg-white/80 backdrop-blur-xl shadow-2xl p-6">
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-gray-500 mb-2">
              {weekdayHeaders.map((h) => (
                <div key={h} className="py-1">
                  {h}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {cells.map((c, idx) => {
                if (!c.date || !c.day) {
                  return (
                    <div
                      key={idx}
                      className="h-20 rounded-xl border border-transparent bg-transparent"
                    />
                  );
                }
                const dayGroups = groupsByDay.get(c.date) || [];
                const pending = dayGroups.filter(
                  (g) => !(g.hasTotalPayment || g.restante <= 0)
                ).length;
                const any = dayGroups.length > 0;
                const isSelected = selectedDay === c.date;

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDay(c.date)}
                    className={[
                      "h-20 w-full rounded-xl border text-left p-2 transition",
                      isSelected
                        ? "border-[#8E2DA8] ring-2 ring-[#8E2DA8]/30 bg-purple-50"
                        : any
                        ? "border-purple-200/70 bg-purple-50/40 hover:bg-purple-50"
                        : "border-slate-200 bg-white hover:bg-slate-50",
                    ].join(" ")}
                    title={c.date}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-800">
                        {c.day}
                      </span>
                      {any && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border bg-white text-[#8E2DA8] border-[#E8D4F2]">
                          {pending > 0
                            ? `${pending} pend.`
                            : `${dayGroups.length} pedidos`}
                        </span>
                      )}
                    </div>
                    {/* Dots */}
                    <div className="mt-2 flex gap-1 flex-wrap">
                      {dayGroups.slice(0, 4).map((g) => (
                        <span
                          key={g.groupKey}
                          className={[
                            "inline-block w-2 h-2 rounded-full",
                            g.hasTotalPayment || g.restante <= 0
                              ? "bg-emerald-500"
                              : "bg-[#8E2DA8]",
                          ].join(" ")}
                          title={`${g.categoryName} · ${
                            g.quantity
                          } · pendiente ${g.restante.toLocaleString("es-CO")}`}
                        />
                      ))}
                      {dayGroups.length > 4 && (
                        <span className="text-[10px] text-gray-500 ml-1">
                          +{dayGroups.length - 4}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lista del día */}
          <div className="rounded-3xl border-2 border-white/60 bg-white/80 backdrop-blur-xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                {selectedDay ? `Pedidos ${selectedDay}` : "Selecciona un día"}
              </h3>
              {selectedDay && (
                <span className="text-xs text-gray-500">
                  {groupsByDay.get(selectedDay)?.length || 0} pedido(s)
                </span>
              )}
            </div>

            {!selectedDay ||
            (groupsByDay.get(selectedDay)?.length ?? 0) === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No hay pedidos para este día.
              </div>
            ) : (
              <div className="space-y-4">
                {groupsByDay.get(selectedDay)!.map((g) => {
                  const cat = catById[g.categoryId] ?? null;
                  const pretty = buildPrettySelections(
                    cat,
                    g.selections,
                    g.variantKey
                  );

                  return (
                    <div
                      key={g.groupKey}
                      className="border border-[#E8D4F2] rounded-xl p-4 hover:shadow-sm transition bg-white/90"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm text-gray-500">
                            {g.categoryName}
                          </div>
                          <div className="mt-1 text-sm text-gray-700 flex flex-wrap gap-2">
                            {pretty.map(({ label, value }) => (
                              <span
                                key={label}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200"
                              >
                                <span className="text-gray-500">{label}:</span>
                                <span className="font-medium">{value}</span>
                              </span>
                            ))}
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200">
                              <span className="text-gray-500">Cantidad:</span>
                              <span className="font-medium">x{g.quantity}</span>
                            </span>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-4 text-sm">
                            <span className="font-semibold text-[#8E2DA8]">
                              Total: ${g.totalAmountCOP.toLocaleString("es-CO")}
                            </span>
                            <span>
                              Abonado: ${g.abonado.toLocaleString("es-CO")}
                            </span>
                            <span
                              className={
                                g.restante > 0
                                  ? "text-yellow-700 font-semibold"
                                  : "text-emerald-700 font-semibold"
                              }
                            >
                              Pendiente: ${g.restante.toLocaleString("es-CO")}
                            </span>
                            <span
                              className={
                                g.deductedFromStock
                                  ? "text-emerald-700"
                                  : "text-orange-700"
                              }
                            >
                              {g.deductedFromStock
                                ? "Inventario descontado"
                                : "Inventario pendiente"}
                            </span>
                          </div>
                        </div>

                        <div>
                          {g.hasTotalPayment || g.restante <= 0 ? (
                            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200">
                              ✓{" "}
                              <span className="font-semibold">Finalizado</span>
                            </div>
                          ) : (
                            <button
                              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#8E2DA8] to-[#A855F7] text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:opacity-95 transition"
                              onClick={() => setSelected(g)}
                            >
                              ✓ Finalizar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ====== Tip ====== */}
        <div className="mt-8">
          <ProTipBanner
            title="Tip de finalización"
            text="Selecciona un día con pedidos: los puntos morados son pendientes y los verdes finalizados. Si no hay stock, puedes finalizar sin descontar."
          />
        </div>
      </main>

      {selected && (
        <PaymentFinalizeModal
          isOpen={true}
          onClose={() => setSelected(null)}
          group={selected}
          category={catById[selected.categoryId] ?? null}
          onConfirm={onConfirm}
          loading={loading}
        />
      )}

      {/* Modal: continuar finalizando sin stock (reutilizable) */}
      <NoStockModal
        isOpen={showNoStock}
        onClose={() => {
          setShowNoStock(false);
          setPendingFinalize(null);
        }}
        onContinue={handleFinalizeWithoutStock}
        selectedParts={noStockCtx.selectedParts}
        currentStock={noStockCtx.currentStock}
        requestedQty={noStockCtx.requestedQty}
      />

      {/* ====== Footer ====== */}
      <AppFooter appName="InManager" />
    </div>
  );
}

export default FinalizePayment;
