import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import BaseModal from "../../../components/BaseModal";
import { useAuth } from "../../../contexts/AuthContext";
import { useToast } from "../../../hooks/useToast";
import type { ProductCategory } from "../../../types/catalog";
import {
  deleteCategory,
  listCategories,
  upsertCategory,
} from "../../catalog/catalog.service";
import CategoryList from "./components/CategoriesList";
import CategoryEditor from "./components/CategoryEditor";
import {
  draftFromCategory,
  generateCombos,
  makeEmptyDraft,
  validateDraft,
  type DraftCat,
} from "./utils";

import { Boxes } from "lucide-react";
import { AppFooter } from "../../../components/AppFooter";
import { BackButton } from "../../../components/BackButton";
import { PageHero } from "../../../components/ui/PageHero";
import { ProTipBanner } from "../../../components/ui/ProTipBanner";

export default function CategoriesAdmin() {
  const { role } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ProductCategory[]>([]);

  const [openEditor, setOpenEditor] = useState(false);
  const [draft, setDraft] = useState<DraftCat>(makeEmptyDraft());
  const [editingId, setEditingId] = useState<string | null>(null);

  const [toDelete, setToDelete] = useState<ProductCategory | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const cats = await listCategories({ includeInactive: true });
      setItems(cats);
      setLoading(false);
    })();
  }, []);

  if (role !== "admin") return <Navigate to="/" replace />;

  async function refresh() {
    const cats = await listCategories({ includeInactive: true });
    setItems(cats);
  }

  function onNew() {
    setEditingId(null);
    setDraft(makeEmptyDraft());
    setOpenEditor(true);
  }

  function onEdit(cat: ProductCategory) {
    setEditingId(cat.id);
    setDraft(draftFromCategory(cat));
    setOpenEditor(true);
  }

  async function onSave() {
    const combos = generateCombos(draft.steps);
    const err = validateDraft(draft, combos);
    if (err) {
      addToast({ type: "warning", title: "Validación", message: err });
      return;
    }

    try {
      await upsertCategory({
        id: editingId ?? undefined,
        name: draft.name.trim(),
        active: draft.active !== false,
        pricingMode: "fixed_per_combo",
        steps: draft.steps,
        variantPrices: draft.variantPrices,
      } as ProductCategory);

      await refresh();
      setOpenEditor(false);
      setEditingId(null);
      addToast({
        type: "success",
        title: "Guardado",
        message: "Categoría guardada.",
      });
    } catch (e: any) {
      addToast({
        type: "error",
        title: "Error",
        message: e?.message ?? "No se pudo guardar.",
      });
    }
  }

  async function doDelete() {
    if (!toDelete) return;
    await deleteCategory(toDelete.id);
    await refresh();
    setToDelete(null);
    addToast({
      type: "success",
      title: "Eliminada",
      message: "Categoría eliminada.",
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex flex-col">
      <main className="flex-grow p-6 sm:p-12 max-w-7xl mx-auto w-full">
        <div className="relative">
          <PageHero
            icon={<Boxes className="w-10 h-10" />}
            title="Catálogo de Categorías"
            subtitle="Crea atributos y define precios por combinación"
          />

          <div className="absolute top-4 left-4">
            <BackButton fallback="/admin" />
          </div>
        </div>

        <section className="bg-white/80 backdrop-blur-xl border-2 border-white/60 shadow-2xl rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div className="text-sm text-gray-600">
              {items.length} categoría{items.length === 1 ? "" : "s"}
            </div>
            <button
              onClick={onNew}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-white bg-gradient-to-r from-[#8E2DA8] via-[#A855F7] to-[#C084FC] hover:shadow-[0_12px_30px_rgba(142,45,168,0.35)]"
            >
              <span>➕</span> Nueva categoría
            </button>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#8E2DA8]" />
              <p className="mt-3 text-gray-600">Cargando…</p>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl p-6 bg-white/80 backdrop-blur border border-white/60 text-center text-gray-600">
              Aún no hay categorías. ¡Agrega la primera!
            </div>
          ) : (
            <CategoryList
              items={items}
              onEdit={onEdit}
              onDelete={setToDelete}
            />
          )}
        </section>

        <div className="mt-8">
          <ProTipBanner
            title="Tip del catálogo"
            text="Mantén tus atributos simples (ej. Tamaño, Sabor) y usa precios por combinación solo cuando realmente cambie el costo."
          />
        </div>
      </main>

      <AppFooter appName="InManager" />

      <CategoryEditor
        open={openEditor}
        draft={draft}
        setDraft={setDraft}
        onClose={() => setOpenEditor(false)}
        onSave={onSave}
      />

      <BaseModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        headerAccent="pink"
        title="Eliminar categoría"
        description="Esta acción no borra ventas ni stock, pero no podrás usarla en nuevas ventas."
        primaryAction={{ label: "Eliminar", onClick: doDelete }}
        secondaryAction={{
          label: "Cancelar",
          onClick: () => setToDelete(null),
        }}
      >
        {toDelete && (
          <div className="rounded-xl border bg-white px-4 py-3 text-sm">
            <div className="text-gray-500">Categoría</div>
            <div className="font-semibold">{toDelete.name}</div>
          </div>
        )}
      </BaseModal>
    </div>
  );
}
