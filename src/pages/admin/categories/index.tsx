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
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 w-20 h-20 rounded-3xl bg-white/70 backdrop-blur border border-white/60 shadow flex items-center justify-center ring-2 ring-purple-200">
          <span className="text-3xl">🧩</span>
        </div>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Catálogo de Categorías
        </h1>
        <p className="text-gray-600 mt-1">
          Crea <b>atributos</b> y define <b>precios por combinación</b>.
        </p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          {items.length} categoría{items.length === 1 ? "" : "s"}
        </div>
        <button
          onClick={onNew}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-[0_12px_30px_rgba(147,51,234,0.35)]"
        >
          <span>➕</span> Nueva categoría
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-10">Cargando…</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl p-6 bg-white/80 backdrop-blur border border-white/60 text-center text-gray-600">
          Aún no hay categorías. ¡Agrega la primera!
        </div>
      ) : (
        <CategoryList items={items} onEdit={onEdit} onDelete={setToDelete} />
      )}

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
