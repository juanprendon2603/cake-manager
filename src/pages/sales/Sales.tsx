// src/pages/sales/Sales.tsx
import {
  ShoppingCart,
  ReceiptText,
  CreditCard,
  CheckCircle2,
  BarChart3,
  Rocket,
} from "lucide-react";
import { AppFooter } from "../../components/AppFooter";
import { ActionCard, type ActionItem } from "../../components/ui/ActionCard";
import { InfoCard } from "../../components/ui/InfoCard";
import { PageHero } from "../../components/ui/PageHero";
import { ProTipBanner } from "../../components/ui/ProTipBanner";
import { QuickLinksRow } from "../../components/ui/QuickLinksRow";

export function Sales() {
  const actions: ActionItem[] = [
    {
      to: "/sales/add-sale",
      title: "Agregar Venta",
      desc: "Registra una nueva venta de forma rápida y segura.",
      icon: <ReceiptText className="w-6 h-6 text-fuchsia-700" />,
      gradient: "from-fuchsia-500 to-purple-500",
      bgGradient: "from-fuchsia-50 to-purple-50",
      borderColor: "border-fuchsia-200",
      textColor: "text-fuchsia-700",
      features: [
        "Múltiples métodos de pago",
        "Descuentos y notas",
        "Cálculo automático",
      ],
    },
    {
      to: "/sales/add-expense",
      title: "Agregar Gasto",
      desc: "Registra gastos operativos vinculados a la venta.",
      icon: <CreditCard className="w-6 h-6 text-amber-700" />,
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-50 to-orange-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-700",
      features: [
        "Clasificación por tipo",
        "Adjunta notas",
        "Impacto en balance",
      ],
    },
    {
      to: "/sales/add-general-expense",
      title: "Gasto General",
      desc: "Registra gastos generales del negocio.",
      icon: <ReceiptText className="w-6 h-6 text-sky-700" />,
      gradient: "from-sky-500 to-cyan-500",
      bgGradient: "from-sky-50 to-cyan-50",
      borderColor: "border-sky-200",
      textColor: "text-sky-700",
      features: [
        "Recurrentes u ocasionales",
        "Centros de costo",
        "Historial claro",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex flex-col">
      <main className="flex-grow p-6 sm:p-12 max-w-6xl mx-auto w-full">
        <PageHero
          icon={<ShoppingCart className="w-8 h-8" />}
          title="Gestión de Ventas"
          subtitle="Registra ventas, controla gastos y visualiza el rendimiento"
        />

        {/* La última ocupa todo el ancho en sm+ */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
          <ActionCard item={actions[0]} />
          <ActionCard item={actions[1]} />
          <ActionCard item={actions[2]} fullSpanOnSmall />
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <InfoCard
            icon={<CheckCircle2 className="w-6 h-6" />}
            title="Registro Preciso"
            text="Cada venta y gasto con detalle y claridad"
            gradientClass="from-green-500 to-emerald-500"
          />
          <InfoCard
            icon={<BarChart3 className="w-6 h-6" />}
            title="Indicadores"
            text="Visualiza ingresos, egresos y balance"
            gradientClass="from-blue-500 to-cyan-500"
          />
          <InfoCard
            icon={<Rocket className="w-6 h-6" />}
            title="Agilidad"
            text="Optimiza tu flujo de caja sin fricción"
            gradientClass="from-purple-500 to-pink-500"
          />
        </section>

        <QuickLinksRow
          links={[
            { to: "/sales/add-sale", label: "Agregar Venta" },
            { to: "/sales/add-expense", label: "Agregar Gasto" },
            { to: "/sales/add-general-expense", label: "Gasto General" },
            { to: "/stock", label: "Ir a Stock" },
          ]}
        />

        <ProTipBanner
          title="Tip de Ventas"
          text="Registra tus ventas al momento y concilia los gastos para mantener tu flujo de caja al día."
        />
      </main>

      <AppFooter appName="InManager" />
    </div>
  );
}
