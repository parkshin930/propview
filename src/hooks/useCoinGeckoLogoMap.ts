"use client";

import { useState, useEffect, useMemo } from "react";
import { coingeckoFetch, type CoinGeckoMarketItem } from "@/lib/coingecko";

/** CoinGecko /coins/markets 기반 심볼(대문자) → image URL 맵. 시세판 로고 1순위 소스. */
export function useCoinGeckoLogoMap() {
  const [list, setList] = useState<CoinGeckoMarketItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await coingeckoFetch<CoinGeckoMarketItem[]>("/coins/markets", {
          vs_currency: "usd",
          order: "market_cap_desc",
          per_page: 250,
          page: 1,
          sparkline: "false",
        });
        if (!cancelled) setList(data ?? []);
      } catch {
        if (!cancelled) setList([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const logoMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of list) {
      const sym = (c.symbol ?? "").toUpperCase();
      const img = (c.image ?? "").trim();
      if (sym && img && !map[sym]) map[sym] = img;
    }
    return map;
  }, [list]);

  return { logoMap, loading };
}
