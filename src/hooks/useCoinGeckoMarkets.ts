"use client";

import { useState, useEffect, useMemo } from "react";
import { coingeckoFetch, type CoinGeckoMarketItem } from "@/lib/coingecko";

const EXCLUDE_IDS = new Set(["qtum", "qtum-2"]);

export type CoinGeckoRow = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
  priceChangePercent24h: number;
  symbolUpper: string;
};

export type TabId = "popular" | "gainers" | "losers";

export function useCoinGeckoMarkets() {
  const [list, setList] = useState<CoinGeckoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    coingeckoFetch<CoinGeckoMarketItem[]>("/coins/markets", {
      vs_currency: "usd",
      order: "market_cap_desc",
      per_page: 100,
      page: 1,
      sparkline: "false",
      price_change_percentage: "24h",
    })
      .then((data) => {
        if (cancelled) return;
        const rows: CoinGeckoRow[] = data
          .filter((c) => !EXCLUDE_IDS.has(c.id))
          .map((c) => ({
            id: c.id,
            symbol: c.symbol,
            name: c.name,
            image: c.image ?? "",
            currentPrice: c.current_price ?? 0,
            priceChangePercent24h: c.price_change_percentage_24h ?? 0,
            symbolUpper: (c.symbol ?? "").toUpperCase(),
          }));
        setList(rows);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? "데이터를 불러올 수 없습니다.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const byTab = useMemo(() => {
    const popular = list.slice(0, 10);
    const gainers = [...list].sort((a, b) => b.priceChangePercent24h - a.priceChangePercent24h).slice(0, 10);
    const losers = [...list].sort((a, b) => a.priceChangePercent24h - b.priceChangePercent24h).slice(0, 10);
    return { popular, gainers, losers };
  }, [list]);

  return { list, byTab, loading, error };
}
