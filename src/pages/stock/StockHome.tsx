// src/pages/stock/StockHome.tsx
import { AppFooter } from "../../components/AppFooter";
import { ActionCard, type ActionItem } from "../../components/ui/ActionCard";
import { InfoCard } from "../../components/ui/InfoCard";
import { PageHero } from "../../components/ui/PageHero";
import { ProTipBanner } from "../../components/ui/ProTipBanner";
import { QuickLinksRow } from "../../components/ui/QuickLinksRow";

export function StockHome() {
  const actions: ActionItem[] = [
    {
      to: "/stock/agregar",
      title: "Agregar Producto",
      desc: "Añade nuevos productos a tu inventario con facilidad.",
      icon: "📦",
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50 to-teal-50",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-700",
      features: [
        "Múltiples variantes",
        "Cantidades flexibles",
        "Actualización automática",
      ],
    },
    {
      to: "/stock/listado",
      title: "Ver Inventario",
      desc: "Consulta y administra todos los productos existentes.",
      icon: "📋",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      features: [
        "Vista por tamaños",
        "Gestión de categorías",
        "Estadísticas en vivo",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex flex-col">
      <main className="flex-grow p-6 sm:p-12 max-w-6xl mx-auto w-full">
        <PageHero
          icon="📦"
          title="Gestión de Stock"
          subtitle="Administra y controla tu inventario de manera sencilla y profesional"
        />

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {actions.map((item) => (
            <ActionCard key={item.to} item={item} />
          ))}
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <InfoCard
            emoji="✅"
            title="Control Total"
            text="Gestiona cada producto con precisión y facilidad"
            gradientClass="from-green-500 to-emerald-500"
          />
          <InfoCard
            emoji="📊"
            title="Estadísticas"
            text="Visualiza el estado de tu inventario en tiempo real"
            gradientClass="from-blue-500 to-cyan-500"
          />
          <InfoCard
            emoji="🚀"
            title="Eficiencia"
            text="Optimiza tu tiempo con herramientas intuitivas"
            gradientClass="from-purple-500 to-pink-500"
          />
        </section>

        <QuickLinksRow
          links={[
            { to: "/stock/agregar", label: "Agregar Productos" },
            { to: "/stock/listado", label: "Ver Inventario" },
            { to: "/sales", label: "Ir a Ventas" },
          ]}
        />

        <ProTipBanner
          title="Tip Profesional"
          text="Mantén tu inventario actualizado diariamente para optimizar ventas y evitar faltantes."
        />
      </main>

      <AppFooter appName="InManager" />
    </div>
  );
}
