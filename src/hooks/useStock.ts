import { useCallback, useEffect, useMemo, useState } from "react";
import {
  isCakeStock,
  isSpongeStock,
  type LocalStockDoc,
} from "../pages/stock/stock.model";
import { fetchStockOnce } from "../pages/stock/stock.repository";

import { clearSizeFlavors, watchStock } from "../pages/stock/stock.api";

export function useStock({ realtime = true }: { realtime?: boolean } = {}) {
  const [stocks, setStocks] = useState<LocalStockDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearingId, setClearingId] = useState<string | null>(null);

  useEffect(() => {
    let unsub: (() => void) | null = null;

    const run = async () => {
      setLoading(true);
      if (realtime) {
        unsub = watchStock((items) => {
          setStocks(items);
          setLoading(false);
        });
      } else {
        const items = await fetchStockOnce();
        setStocks(items);
        setLoading(false);
      }
    };
    run();

    return () => {
      if (unsub) unsub();
    };
  }, [realtime]);

  const clearFlavorsById = useCallback(async (id: string) => {
    await clearSizeFlavors(id);
    setClearingId(id);
    setTimeout(() => setClearingId(null), 900);
  }, []);

  const stats = useMemo(() => {
    const cakes = stocks.filter(isCakeStock);
    const sponges = stocks.filter(isSpongeStock);
    const totalFlavors = cakes.reduce(
      (acc, c) =>
        acc + Object.values(c.flavors).reduce((a, b) => a + Number(b || 0), 0),
      0
    );
    const totalSponges = sponges.reduce(
      (acc, s) => acc + Number(s.quantity || 0),
      0
    );
    return {
      cakeSizes: cakes.length,
      totalFlavors,
      spongeSizes: sponges.length,
      totalSponges,
    };
  }, [stocks]);

  return { stocks, loading, clearingId, clearFlavorsById, stats };
}
