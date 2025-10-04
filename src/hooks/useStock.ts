import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchCategoryStockOnce,
  setVariantStock,
  watchCategoryStock,
  type VariantStockDoc,
} from "../pages/stock/stock.repository";

type UseStockArgs = {
  categoryId: string;
  realtime?: boolean;
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

  const resetVariant = useCallback(
    async (variantKey: string, to = 0) => {
      if (!categoryId || !variantKey) return;
      setPendingVariant(variantKey);
      try {
        await setVariantStock(categoryId, variantKey, to);
      } finally {
        setTimeout(() => setPendingVariant(null), 600);
      }
    },
    [categoryId]
  );

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
