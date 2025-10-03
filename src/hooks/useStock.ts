// src/hooks/useStock.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchCategoryStockOnce,
  setVariantStock,
  watchCategoryStock,
  type VariantStockDoc,
} from "../pages/stock/stock.repository";

type UseStockArgs = {
  categoryId: string; // p.ej. "bizcochos"
  realtime?: boolean; // default true
};

export function useStock({ categoryId, realtime = true }: UseStockArgs) {
  const [stocks, setStocks] = useState<VariantStockDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingVariant, setPendingVariant] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryId) return;
    let unsub: (() => void) | null = null;

    const run = async () => {
      setLoading(true);
      try {
        if (realtime) {
          unsub = watchCategoryStock(categoryId, (items) => {
            // items viene de /catalog_stock/{cat}/variants
            // Debe tener { variantKey, stock }
            setStocks(items);
            setLoading(false);
          });
        } else {
          const items = await fetchCategoryStockOnce(categoryId);
          setStocks(items);
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
        setStocks([]);
        setLoading(false);
      }
    };

    run();
    return () => {
      if (unsub) unsub();
    };
  }, [categoryId, realtime]);

  /** Resetear una variante específica a 0 (o a un valor dado). */
  const resetVariant = useCallback(
    async (variantKey: string, to = 0) => {
      if (!categoryId || !variantKey) return;
      setPendingVariant(variantKey);
      try {
        await setVariantStock(categoryId, variantKey, to);
      } finally {
        // pequeño delay visual para feedback
        setTimeout(() => setPendingVariant(null), 600);
      }
    },
    [categoryId]
  );

  /** Stats simples sobre la categoría actual. */
  const stats = useMemo(() => {
    const totalVariants = stocks.length;
    const totalUnits = stocks.reduce(
      (acc, v) => acc + Number(v?.stock ?? 0),
      0
    );
    return { totalVariants, totalUnits };
  }, [stocks]);

  return { stocks, loading, pendingVariant, resetVariant, stats };
}
