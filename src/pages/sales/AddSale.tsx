// src/pages/sales/AddSale.tsx
import { AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseModal from "../../components/BaseModal";
import { FullScreenLoader } from "../../components/FullScreenLoader";
import { useToast } from "../../hooks/useToast";

import type { ProductCategory, SelectedValues } from "../../types/catalog";
import { buildVariantKey } from "../../types/catalog"; // o desde catalog.service si lo tienes allí
import {
  computePrice,
  listCategories,
  tryDecrementStockGeneric,
} from "../catalog/catalog.service";
import { buildKeys, registerGenericSale } from "./sales.service";

import { useAuth } from "../../contexts/AuthContext";
import type { PaymentMethod } from "../inform/types";
import Step1Category from "./steps/Step1Category";
import StepDetailsGeneric from "./steps/StepDetailsGeneric";
import StepSelectOption from "./steps/StepSelectOption";

// ⬇️ NUEVO: UI consistente
import { AppFooter } from "../../components/AppFooter";
import { BackButton } from "../../components/BackButton";
import { PageHero } from "../../components/ui/PageHero";
import { ProTipBanner } from "../../components/ui/ProTipBanner";

// ⬇️ NUEVO: modal específico
import NoStockModal from "../../components/NoStockModal";

const getErr = (e: unknown) =>
  e instanceof Error ? e.message : "Error al procesar la venta.";

type Part = {
  stepKey: string;
  stepLabel: string;
  optionKey: string;
  optionLabel: string;
};

export default function AddSale() {
  const nav = useNavigate();
  const { addToast } = useToast();
  const { user, profile } = useAuth();

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

  const [loading, setLoading] = useState(true);
  const [cats, setCats] = useState<ProductCategory[]>([]);
  const [cat, setCat] = useState<ProductCategory | null>(null);

  const [stepIdx, setStepIdx] = useState(-1); // -1: categoría; 0..N-1: steps; N: detalles
  const steps = useMemo(
    () => (cat?.steps || []).filter((s) => s.affectsStock),
    [cat]
  );

  const [sel, setSel] = useState<SelectedValues>({});
  const [qty, setQty] = useState("1");
  const unitPrice = useMemo(
    () => (cat ? computePrice(cat, sel) : 0),
    [cat, sel]
  );
  const [totalPrice, setTotalPrice] = useState("");
  const [pm, setPm] = useState<PaymentMethod>("cash");

  const [showConfirm, setShowConfirm] = useState(false);
  const [showNoStock, setShowNoStock] = useState(false);

  // ⬇️ NUEVO: contexto para el modal de “sin stock”
  const [noStockCtx, setNoStockCtx] = useState<{
    selectedParts: Part[];
    currentStock: number;
    requestedQty: number;
  }>({
    selectedParts: [],
    currentStock: 0,
    requestedQty: 0,
  });

  // Carga de categorías
  useEffect(() => {
    (async () => {
      try {
        const all = await listCategories();
        setCats(all);
      } catch (e) {
        addToast({
          type: "error",
          title: "Error",
          message: getErr(e),
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [addToast]);

  // Recalcular total cuando cambian precio o cantidad
  useEffect(() => {
    const q = Math.max(1, parseInt(qty || "1", 10) || 1);
    if (cat && steps.length && Object.keys(sel).length === steps.length) {
      setTotalPrice(String(unitPrice * q));
    } else {
      setTotalPrice("");
    }
  }, [cat, steps.length, sel, unitPrice, qty]);

  const goNext = () => setStepIdx((i) => i + 1);
  const goBack = () => setStepIdx((i) => i - 1);

  const handleSelectCategory = (c: ProductCategory) => {
    setCat(c);
    setSel({});
    setStepIdx(0); // primer step
  };

  const handleSelectOption = (stepKey: string, value: string) => {
    setSel((prev) => ({ ...prev, [stepKey]: value }));
    if (stepIdx + 1 < steps.length) goNext();
    else setStepIdx(steps.length); // ir a detalles
  };

  // ⬇️ NUEVO: helper para construir las partes con labels
  function buildSelectedParts(
    cat: ProductCategory,
    selections: SelectedValues
  ): Part[] {
    const out: Part[] = [];
    for (const s of (cat.steps || []).filter((st) => st.affectsStock)) {
      const optKey = String(selections[s.key] ?? "");
      const opt = (s.options || []).find((o) => o.key === optKey);
      out.push({
        stepKey: s.key,
        stepLabel: s.label,
        optionKey: optKey,
        optionLabel: opt?.label || optKey || "",
      });
    }
    return out;
  }

  const handleConfirm = async () => {
    try {
      if (!cat) throw new Error("Selecciona una categoría.");
      if (steps.length === 0)
        throw new Error("La categoría no tiene pasos de stock.");
      if (Object.keys(sel).length !== steps.length)
        throw new Error("Completa todas las opciones.");
      const q = parseInt(qty || "0", 10);
      if (!Number.isFinite(q) || q <= 0) throw new Error("Cantidad inválida.");
      const total = parseFloat(totalPrice || "0");
      if (!Number.isFinite(total) || total <= 0)
        throw new Error("Total inválido.");

      const variantKey = buildVariantKey(cat, sel);
      const { dayKey, monthKey } = buildKeys();

      // Intenta decrementar
      const dec = await tryDecrementStockGeneric(cat.id, variantKey, q);
      if (!dec.decremented) {
        // ⬇️ NUEVO: llena contexto para el modal
        setNoStockCtx({
          selectedParts: buildSelectedParts(cat, sel),
          currentStock: dec.current ?? 0,
          requestedQty: q,
        });
        setShowNoStock(true);
        return;
      }

      await registerGenericSale({
        categoryId: cat.id,
        variantKey,
        selections: sel,
        quantity: q,
        unitPriceCOP: unitPrice,
        amountCOP: total,
        paymentMethod: pm,
        dayKey,
        monthKey,
        seller: {
          name: sellerName,
          uid: user?.uid,
          email: user?.email || undefined,
        },
      });

      addToast({
        type: "success",
        title: "¡Venta registrada! 🎉",
        message: "Se registró y descontó el inventario.",
        duration: 5000,
      });
      setTimeout(() => nav("/sales"), 700);
    } catch (e) {
      addToast({
        type: "error",
        title: "Ups 😞",
        message: getErr(e),
        duration: 5000,
      });
    } finally {
      setShowConfirm(false);
    }
  };

  const handleConfirmWithoutStock = async () => {
    if (!cat) return;
    const q = Math.max(1, parseInt(qty || "1", 10) || 1);
    const variantKey = buildVariantKey(cat, sel);
    const { dayKey, monthKey } = buildKeys();
    try {
      await registerGenericSale({
        categoryId: cat.id,
        variantKey,
        selections: sel,
        quantity: q,
        unitPriceCOP: unitPrice,
        amountCOP: Number(totalPrice || 0),
        paymentMethod: pm,
        dayKey,
        monthKey,
        seller: {
          name: sellerName,
          uid: user?.uid,
          email: user?.email || undefined,
        },
      });
      addToast({
        type: "success",
        title: "Venta sin stock",
        message: "Se registró la venta (no se descontó inventario).",
        duration: 5000,
      });
      setTimeout(() => nav("/sales"), 700);
    } catch (e) {
      addToast({
        type: "error",
        title: "Error al registrar 😞",
        message: getErr(e),
        duration: 5000,
      });
    } finally {
      setShowNoStock(false);
    }
  };

  if (loading) return <FullScreenLoader message="Cargando categorías..." />;

  const onConfirmClick = () => setShowConfirm(true);

  const title =
    stepIdx < 0
      ? "¿Qué vas a vender?"
      : stepIdx < steps.length
      ? steps[stepIdx]?.label || "Selecciona una opción"
      : "Detalles de la venta";

  const subtitle =
    stepIdx < 0
      ? "Elige la categoría"
      : stepIdx < steps.length
      ? "Selecciona una opción para continuar"
      : "Confirma y registra la venta";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex flex-col">
      <main className="flex-grow px-6 py-10 sm:p-12 max-w-5xl mx-auto w-full">
        {/* ====== PageHero + Back ====== */}
        <div className="relative mb-6">
          <PageHero
            icon="🛒"
            title="Registrar Venta"
            subtitle="Vende productos, descuenta inventario y registra el método de pago"
          />
          <div className="absolute top-4 left-4 z-20">
            <BackButton fallback="/sales" />
          </div>
        </div>

        {/* ====== Card principal ====== */}
        <div className="bg-white/80 backdrop-blur-xl border-2 border-white/60 rounded-3xl p-8 shadow-2xl space-y-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              {title}
            </h1>
            <p className="text-gray-600 text-lg">{subtitle}</p>
          </div>

          <AnimatePresence mode="wait">
            {stepIdx < 0 && (
              <Step1Category
                categories={cats}
                onSelect={handleSelectCategory}
              />
            )}

            {stepIdx >= 0 && stepIdx < steps.length && cat && (
              <StepSelectOption
                step={steps[stepIdx]}
                value={sel[steps[stepIdx].key] ?? null}
                onSelect={(opt) => handleSelectOption(steps[stepIdx].key, opt)}
                onBack={() => (stepIdx === 0 ? setStepIdx(-1) : goBack())}
              />
            )}

            {stepIdx === steps.length && cat && (
              <StepDetailsGeneric
                selections={sel}
                quantity={qty}
                setQuantity={setQty}
                unitPrice={unitPrice}
                totalPrice={totalPrice}
                setTotalPrice={setTotalPrice}
                paymentMethod={pm}
                setPaymentMethod={setPm}
                onBack={() => setStepIdx(Math.max(0, steps.length - 1))}
                onConfirm={onConfirmClick}
              />
            )}
          </AnimatePresence>
        </div>

        {/* ====== Tip ====== */}
        <div className="mt-8">
          <ProTipBanner
            title="Tip de caja"
            text="Antes de confirmar, revisa el método de pago y el precio. El nombre del vendedor se guarda junto con la venta."
          />
        </div>
      </main>

      {/* ====== Modales ====== */}
      <BaseModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        headerAccent="purple"
        title="Confirmar venta"
        description="Revisa los detalles antes de registrar:"
        secondaryAction={{
          label: "Cancelar",
          onClick: () => setShowConfirm(false),
        }}
        primaryAction={{ label: "🚀 Registrar venta", onClick: handleConfirm }}
      >
        <div className="space-y-2 text-sm">
          {Object.entries(sel).map(([k, v]) => (
            <div className="flex justify-between" key={k}>
              <span className="text-gray-600 capitalize">{k}:</span>
              <span className="font-semibold capitalize">{v}</span>
            </div>
          ))}
          <div className="flex justify-between">
            <span className="text-gray-600">Cantidad:</span>
            <span className="font-semibold">x{parseInt(qty || "0", 10)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Vendedor:</span>
            <span className="font-semibold">{sellerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total:</span>
            <span className="font-bold text-green-600">
              ${Number(totalPrice || 0).toLocaleString("es-CO")}
            </span>
          </div>
        </div>
      </BaseModal>

      {/* ⬇️ NUEVO: Modal específico de sin stock */}
      <NoStockModal
        isOpen={showNoStock}
        onClose={() => setShowNoStock(false)}
        onContinue={handleConfirmWithoutStock}
        selectedParts={noStockCtx.selectedParts}
        currentStock={noStockCtx.currentStock}
        requestedQty={noStockCtx.requestedQty}
      />

      {/* ====== Footer ====== */}
      <AppFooter appName="InManager" />
    </div>
  );
}
