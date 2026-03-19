"use client";

import { useState, useEffect, useMemo } from "react";

/** 바이낸스 현물 24hr 티커 (USDT 페어) */
const BINANCE_TICKER_24HR_URL = "https://api.binance.com/api/v3/ticker/24hr";

export type BinanceTickerRow = {
  symbol: string;
  baseAsset: string;
  lastPrice: string;
  priceChangePercent: string;
  quoteVolume: string;
};

export type TabId = "popular" | "gainers" | "losers";

function parseTicker(item: Record<string, string>): BinanceTickerRow | null {
  const symbol = item.symbol;
  if (!symbol || !symbol.endsWith("USDT")) return null;
  const baseAsset = symbol.replace("USDT", "");
  return {
    symbol,
    baseAsset,
    lastPrice: item.lastPrice ?? "0",
    priceChangePercent: item.priceChangePercent ?? "0",
    quoteVolume: item.quoteVolume ?? "0",
  };
}

export function useBinanceTicker24() {
  const [rows, setRows] = useState<BinanceTickerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(BINANCE_TICKER_24HR_URL)
      .then((res) => res.json())
      .then((data: Record<string, string>[]) => {
        if (cancelled) return;
        const list = data
          .map(parseTicker)
          .filter((r): r is BinanceTickerRow => r !== null);
        setRows(list);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? "Failed to fetch");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const byTab = useMemo(() => {
    const popular = [...rows]
      .sort((a, b) => Number(b.quoteVolume) - Number(a.quoteVolume))
      .slice(0, 10);
    const gainers = [...rows]
      .sort((a, b) => Number(b.priceChangePercent) - Number(a.priceChangePercent))
      .slice(0, 10);
    const losers = [...rows]
      .sort((a, b) => Number(a.priceChangePercent) - Number(b.priceChangePercent))
      .slice(0, 10);
    return { popular, gainers, losers };
  }, [rows]);

  return { rows, byTab, loading, error };
}
