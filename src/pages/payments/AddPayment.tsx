// src/pages/payments/AddPayment.tsx
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { BackButton } from "../../components/BackButton";
import { FullScreenLoader } from "../../components/FullScreenLoader";
import { useToast } from "../../hooks/useToast";

import type {
  PaymentFormState,
  RegisterPaymentInput,
} from "../../types/payments";
import AddPaymentForm from "./AddPaymentForm";
import PaymentConfirmModal from "./components/PaymentConfirmModal";

import {
  buildVariantKeyFromSelections,
  registerPayment,
} from "./payment.service";

import { useAuth } from "../../contexts/AuthContext";
import {
  listCategories,
  tryDecrementStockGeneric,
} from "../catalog/catalog.service";
import type { CategoryStep, ProductCategory } from "../stock/stock.model";

// UI consistente
import { AppFooter } from "../../components/AppFooter";
import { PageHero } from "../../components/ui/PageHero";
import { ProTipBanner } from "../../components/ui/ProTipBanner";
import { EmptyStateCTA } from "../../components/EmptyStateCTA";

// Modal reutilizable de “sin stock”
import { CreditCard } from "lucide-react";
import NoStockModal from "../../components/NoStockModal";

export function AddPayment() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user, profile, role } = useAuth();
  const isAdmin = role === "admin";

  const [loadingCats, setLoadingCats] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

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

  // Modal “sin stock”
  const [showNoStock, setShowNoStock] = useState(false);
  const [pendingInput, setPendingInput] = useState<RegisterPaymentInput | null>(
    null
  );

  // Contexto para NoStockModal
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

  const [cats, setCats] = useState<ProductCategory[]>([]);
  const [cat, setCat] = useState<ProductCategory | null>(null);

  const [state, setState] = useState<PaymentFormState>(() => ({
    categoryId: "",
    selections: {},
    quantity: "1",
    totalAmount: "",
    partialAmount: "",
    paymentMethod: "cash",
    deductFromStock: false,
    isTotalPayment: false,
    orderDate: format(new Date(), "yyyy-MM-dd"),
  }));

  // Cargar categorías
  useEffect(() => {
    (async () => {
      try {
        const all = await listCategories();
        setCats(all);
        setCat(all[0] || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingCats(false);
      }
    })();
  }, []);

  // ⚠️ AHORA: usamos TODOS los steps
  const allSteps = useMemo<CategoryStep[]>(() => cat?.steps || [], [cat]);

  // Inicializar selections cuando hay categoría (TODOS los steps)
  useEffect(() => {
    if (!cat) return;
    const baseSel = Object.fromEntries((cat.steps || []).map((s) => [s.key, ""]));
    setState((s) => ({ ...s, categoryId: cat.id, selections: baseSel }));
  }, [cat]);

  // Auto “pago total”
  useEffect(() => {
    if (state.totalAmount && state.partialAmount) {
      setState((s) => ({
        ...s,
        isTotalPayment: parseFloat(s.partialAmount) === parseFloat(s.totalAmount),
      }));
    } else {
      setState((s) => ({ ...s, isTotalPayment: false }));
    }
  }, [state.totalAmount, state.partialAmount]);

  const validateBeforeConfirm = (): string | null => {
    if (!cat) return "Selecciona una categoría.";
    for (const st of allSteps) {
      if (!state.selections[st.key]) return `Selecciona “${st.label}”.`;
    }
    const qty = parseInt(state.quantity, 10);
    if (!Number.isFinite(qty) || qty <= 0) return "Ingresa una cantidad válida.";
    const total = parseFloat(state.totalAmount);
    if (!Number.isFinite(total) || total <= 0)
      return "Ingresa un valor total válido.";
    if (!state.isTotalPayment) {
      const part = parseFloat(state.partialAmount);
      if (!Number.isFinite(part) || part <= 0)
        return "Ingresa un valor válido para el abono.";
      if (part > total) return "El abono no puede ser mayor al valor total.";
    }
    return null;
  };

  const openConfirm = () => {
    const err = validateBeforeConfirm();
    if (err) {
      setErrorMessage(err);
      return;
    }
    setErrorMessage("");
    setShowConfirm(true);
  };

  // Partes con labels (TODOS los steps)
  function buildSelectedParts() {
    if (!cat) return [];
    return (cat.steps || []).map((s) => {
      const optKey = String(state.selections[s.key] ?? "");
      const opt = (s.options || []).find((o) => o.key === optKey);
      return {
        stepKey: s.key,
        stepLabel: s.label,
        optionKey: optKey,
        optionLabel: opt?.label || optKey || "",
      };
    });
  }

  const onConfirm = async () => {
    if (!cat) return;
    const qty = parseInt(state.quantity, 10);
    const total = parseFloat(state.totalAmount);
    const paid = state.isTotalPayment ? total : parseFloat(state.partialAmount);

    // LLAVE DE STOCK (solo steps affectsStock)
    const variantKey = buildVariantKeyFromSelections(cat, state.selections);

    setSaving(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");

      const baseInput: RegisterPaymentInput = {
        today,
        categoryId: cat.id,
        categoryName: cat.name,
        selections: state.selections, // guardamos TODO
        variantKey, // para stock/reconciliación
        quantity: qty,
        totalAmount: total,
        paidAmountToday: paid,
        paymentMethod: state.paymentMethod,
        totalPayment: state.isTotalPayment,
        deductedFromStock: false,
        orderDate: state.orderDate,
        seller: {
          name: sellerName,
          uid: user?.uid,
          email: user?.email || undefined,
        },
      };

      if (state.deductFromStock) {
        const dec = await tryDecrementStockGeneric(cat.id, variantKey, qty);
        if (!dec.decremented) {
          setPendingInput(baseInput);
          setNoStockCtx({
            selectedParts: buildSelectedParts(),
            currentStock: dec.current ?? 0,
            requestedQty: qty,
          });
          setShowNoStock(true);
          setShowConfirm(false);
          return;
        }
        baseInput.deductedFromStock = true;
      }

      await registerPayment(baseInput);

      addToast({
        type: "success",
        title: "¡Abono registrado!",
        message: state.deductFromStock
          ? "Abono/pago registrado y se descontó inventario."
          : "Abono/pago registrado.",
        duration: 5000,
      });
      navigate("/payment-management");
    } catch (e) {
      const msg = (e as Error).message ?? "Error al registrar el abono.";
      setErrorMessage(msg);
      addToast({
        type: "error",
        title: "Ups, algo salió mal",
        message: msg,
        duration: 5000,
      });
    } finally {
      setSaving(false);
      setShowConfirm(false);
    }
  };

  const handleConfirmWithoutStock = async () => {
    if (!pendingInput) return;
    try {
      setSaving(true);
      await registerPayment({
        ...pendingInput,
        deductedFromStock: false,
        seller: pendingInput.seller ?? {
          name: sellerName,
          uid: user?.uid,
          email: user?.email || undefined,
        },
      });
      addToast({
        type: "success",
        title: "Abono registrado",
        message: "Se registró el abono (no se descontó inventario).",
        duration: 5000,
      });
      navigate("/payment-management");
    } catch (e) {
      addToast({
        type: "error",
        title: "Ups, algo salió mal",
        message: (e as Error).message ?? "Error al registrar el abono.",
        duration: 5000,
      });
    } finally {
      setSaving(false);
      setShowNoStock(false);
      setPendingInput(null);
    }
  };

  const patch = (p: Partial<PaymentFormState>) =>
    setState((s) => ({ ...s, ...p }));

  const hasCategories = cats.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex flex-col">
      <main className="flex-grow p-6 sm:p-12 max-w-6xl mx-auto w-full">
        {/* ===== Hero + Back (siempre) ===== */}
        <div className="relative mb-6">
          <PageHero
            icon={<CreditCard className="w-10 h-10" />}
            title="Registrar Abono/Pago"
            subtitle="Registra abonos o pagos totales y actualiza el inventario si lo deseas"
          />
          <div className="absolute top-4 left-4 z-20">
            <BackButton fallback="/payment-management" />
          </div>
        </div>

        {/* ===== Loader debajo del hero ===== */}
        {loadingCats ? (
          <FullScreenLoader message="Cargando catálogo..." />
        ) : (
          <>
            {/* ===== Estado vacío SIN contenedor (sin doble fondo) ===== */}
            {!hasCategories ? (
              <EmptyStateCTA
                title="No hay categorías"
                description={
                  isAdmin
                    ? "Crea una categoría de productos para poder registrar abonos/pagos."
                    : "Aún no hay categorías disponibles. Pide a un administrador que las cree."
                }
                to="/admin/catalog"
                buttonLabel="➕ Crear categorías"
                showButton={isAdmin}
                icon={<CreditCard className="w-8 h-8" />}
              />
            ) : (
              <>
                {/* ===== Formulario ===== */}
                <AddPaymentForm
                  state={state}
                  setState={patch}
                  errorMessage={errorMessage}
                  onClickOpenConfirm={openConfirm}
                  loading={saving}
                  categories={cats}
                  selectedCategory={cat}
                  onChangeCategory={setCat}
                  steps={allSteps}
                />

                {/* ===== Tip ===== */}
                <div className="mt-8">
                  <ProTipBanner
                    title="Tip de abonos"
                    text="Si el cliente paga el total, marca ‘Pago total’ para cerrar el pedido automáticamente al finalizar."
                  />
                </div>
              </>
            )}
          </>
        )}
      </main>

      {/* ===== Footer ===== */}
      <AppFooter appName="InManager" />

      {/* ===== Modal de confirmación ===== */}
      <PaymentConfirmModal
        isOpen={!!showConfirm}
        onClose={() => setShowConfirm(false)}
        categoryName={cat?.name || ""}
        selections={state.selections}
        quantity={parseInt(state.quantity || "0", 10)}
        orderDate={state.orderDate}
        paymentMethod={state.paymentMethod}
        deductFromStock={state.deductFromStock}
        totalAmount={Number(state.totalAmount || 0)}
        paidAmountToday={
          state.isTotalPayment
            ? Number(state.totalAmount || 0)
            : Number(state.partialAmount || 0)
        }
        onConfirm={onConfirm}
        loading={saving}
        affectingSteps={allSteps} // mostramos todos
        sellerName={sellerName}
      />

      {/* ===== Modal: continuar sin stock ===== */}
      <NoStockModal
        isOpen={showNoStock}
        onClose={() => {
          setShowNoStock(false);
          setPendingInput(null);
        }}
        onContinue={handleConfirmWithoutStock}
        selectedParts={noStockCtx.selectedParts}
        currentStock={noStockCtx.currentStock}
        requestedQty={noStockCtx.requestedQty}
      />
    </div>
  );
}

export default AddPayment;
