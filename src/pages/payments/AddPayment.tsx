// src/pages/payments/AddPayment.tsx
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { BackButton } from "../../components/BackButton";
import BaseModal from "../../components/BaseModal";
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

import {
  listCategories,
  tryDecrementStockGeneric,
} from "../catalog/catalog.service";
import type { CategoryStep, ProductCategory } from "../stock/stock.model";
import { useAuth } from "../../contexts/AuthContext";

export function AddPayment() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user, profile } = useAuth(); // 👈 NUEVO


  const [loadingCats, setLoadingCats] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const sellerName = useMemo(() => {
    const f = (profile?.firstName || "").trim();
    const l = (profile?.lastName || "").trim();
    const byFL = [f, l].filter(Boolean).join(" ");
    const dn =
      (profile?.displayName || "").trim() ||
      (user?.displayName || "").trim();
    const mail = (user?.email || "").trim();
    const fromEmail = mail ? mail.split("@")[0] : "";
    return byFL || dn || fromEmail || "Usuario";
  }, [profile, user]);



  // Modal “sin stock”
  const [showNoStock, setShowNoStock] = useState(false);
  const [pendingInput, setPendingInput] = useState<RegisterPaymentInput | null>(
    null
  );

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

  // Steps que afectan stock
  const affectingSteps = useMemo<CategoryStep[]>(
    () => (cat?.steps || []).filter((s) => s.affectsStock),
    [cat]
  );

  // Inicializar selections cuando hay categoría
  useEffect(() => {
    if (!cat) return;
    const baseSel = Object.fromEntries(
      (cat.steps || []).filter((s) => s.affectsStock).map((s) => [s.key, ""])
    );
    setState((s) => ({ ...s, categoryId: cat.id, selections: baseSel }));
  }, [cat]);

  // Auto “pago total”
  useEffect(() => {
    if (state.totalAmount && state.partialAmount) {
      setState((s) => ({
        ...s,
        isTotalPayment:
          parseFloat(s.partialAmount) === parseFloat(s.totalAmount),
      }));
    } else {
      setState((s) => ({ ...s, isTotalPayment: false }));
    }
  }, [state.totalAmount, state.partialAmount]);

  const validateBeforeConfirm = (): string | null => {
    if (!cat) return "Selecciona una categoría.";
    for (const st of affectingSteps) {
      if (!state.selections[st.key]) return `Selecciona “${st.label}”.`;
    }
    const qty = parseInt(state.quantity, 10);
    if (!Number.isFinite(qty) || qty <= 0)
      return "Ingresa una cantidad válida.";
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

  const onConfirm = async () => {
    if (!cat) return;
    const qty = parseInt(state.quantity, 10);
    const total = parseFloat(state.totalAmount);
    const paid = state.isTotalPayment ? total : parseFloat(state.partialAmount);
    const variantKey = buildVariantKeyFromSelections(cat, state.selections);

    setSaving(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");

      // Payload base
      const baseInput: RegisterPaymentInput = {
        today,
        categoryId: cat.id,
        categoryName: cat.name,
        selections: state.selections,
        variantKey,
        quantity: qty,
        totalAmount: total,
        paidAmountToday: paid,
        paymentMethod: state.paymentMethod,
        totalPayment: state.isTotalPayment,
        deductedFromStock: false, // se pondrá en true si logramos descontar
        orderDate: state.orderDate,
        seller: {
          name: sellerName,
          uid: user?.uid,
          email: user?.email || undefined,
        },
      };

      if (state.deductFromStock) {
        // Intentar descontar stock primero
        const dec = await tryDecrementStockGeneric(cat.id, variantKey, qty);
        if (!dec.decremented) {
          // No hay stock suficiente: preguntamos qué hacer
          setPendingInput(baseInput); // si continúa, se registra sin descontar
          setShowNoStock(true);
          setShowConfirm(false);
          return;
        }
        baseInput.deductedFromStock = true;
      }

      // Registrar pago/abono
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
      await registerPayment({ ...pendingInput, deductedFromStock: false,  seller: pendingInput.seller ?? {
        name: sellerName,
        uid: user?.uid,
        email: user?.email || undefined,
      }, });
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

  if (loadingCats) return <FullScreenLoader message="Cargando catálogo..." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex flex-col">
      <main className="flex-grow p-6 sm:p-12 max-w-6xl mx-auto w-full">
        <header className="mb-12 text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl opacity-10" />
          <div className="relative z-10 py-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl shadow-xl ring-4 ring-purple-200">
                💳
              </div>
            </div>
            <h1 className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-[#8E2DA8] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent mb-4 drop-shadow-[0_2px_12px_rgba(142,45,168,0.25)]">
              Registrar Abono/Pago
            </h1>
            <p className="text-xl text-gray-700 font-medium mb-8">
              Registra abonos o pagos totales y actualiza el inventario si lo
              deseas.
            </p>
            <div className="absolute top-4 left-4">
              <BackButton />
            </div>
          </div>
        </header>

        <AddPaymentForm
          state={state}
          setState={patch}
          errorMessage={errorMessage}
          onClickOpenConfirm={openConfirm}
          loading={saving}
          categories={cats}
          selectedCategory={cat}
          onChangeCategory={setCat}
          affectingSteps={affectingSteps}
        />
      </main>

      <footer className="text-center text-sm text-gray-400 py-6">
        © 2025 CakeManager. Todos los derechos reservados.
      </footer>

      {/* Modal de confirmación estándar */}
      <PaymentConfirmModal
        isOpen={showConfirm}
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
        affectingSteps={affectingSteps}
        sellerName={sellerName}  // 👈 NUEVO (ver componente abajo)

      />

      {/* Modal: continuar sin stock */}
      <BaseModal
        isOpen={showNoStock}
        onClose={() => {
          setShowNoStock(false);
          setPendingInput(null);
        }}
        headerAccent="amber"
        title="Inventario insuficiente"
        description="No hay stock suficiente para esta combinación. ¿Deseas registrar el abono sin descontar inventario?"
        secondaryAction={{
          label: "Cancelar",
          onClick: () => {
            setShowNoStock(false);
            setPendingInput(null);
          },
        }}
        primaryAction={{
          label: "Registrar sin descontar",
          onClick: handleConfirmWithoutStock,
        }}
      >
        {cat && (
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between">
              <span className="text-gray-500">Categoría</span>
              <span className="font-medium">{cat.name}</span>
            </div>
            {Object.entries(state.selections).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-gray-500 capitalize">{k}</span>
                <span className="font-medium capitalize">{v || "—"}</span>
              </div>
            ))}
            <div className="flex justify-between">
              <span className="text-gray-500">Cantidad</span>
              <span className="font-medium">
                x{parseInt(state.quantity || "0", 10)}
              </span>
            </div>
          </div>
        )}
      </BaseModal>
    </div>
  );
}

export default AddPayment;
