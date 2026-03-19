"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

const BINANCE_TICKER_24HR = "https://api.binance.com/api/v3/ticker/24hr";
const REFRESH_MS = 10000;

/** 바이낸스 마켓 오버뷰와 동일: 스테이블코인은 상승/하락 탭에서 제외 */
const STABLECOINS = new Set(
  ["USDT", "USDC", "BUSD", "DAI", "TUSD", "FDUSD", "USDP", "PYUSD", "FRAX"].map((s) => s.toUpperCase())
);

export type Binance24hRow = {
  symbol: string;
  symbolUpper: string;
  lastPrice: string;
  priceChangePercent: number;
  quoteVolume: number;
};

export type TabId = "popular" | "gainers" | "losers";

export function useBinance24hTicker(intervalMs = REFRESH_MS) {
  const [allRows, setAllRows] = useState<Binance24hRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTicker = useCallback(async () => {
    try {
      const res = await fetch(BINANCE_TICKER_24HR, { cache: "no-store" });
      const arr = await res.json();
      if (!Array.isArray(arr)) {
        setError("데이터 형식 오류");
        return;
      }
      const rows: Binance24hRow[] = arr
        .filter((x: { symbol: string }) => x.symbol?.endsWith("USDT"))
        .map((x: { symbol: string; lastPrice?: string; priceChangePercent?: string; quoteVolume?: string }) => ({
          symbol: x.symbol,
          symbolUpper: (x.symbol ?? "").replace(/USDT$/i, "").trim(),
          lastPrice: x.lastPrice ?? "0",
          priceChangePercent: Number(x.priceChangePercent ?? 0),
          quoteVolume: Number(x.quoteVolume ?? 0),
        }));
      setAllRows(rows);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "데이터를 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTicker();
    const id = setInterval(fetchTicker, intervalMs);
    return () => clearInterval(id);
  }, [fetchTicker, intervalMs]);

  const byTab = useMemo(() => {
    // 인기(Hot): 24h 거래대금(quoteVolume) 상위 10 — 바이낸스 Trading Data Rankings
    const byVolume = [...allRows].sort((a, b) => b.quoteVolume - a.quoteVolume);
    const popular = byVolume.slice(0, 10);

    // 상승(Gainers): 24h 등락률 상위 10 / 하락(Losers): 24h 등락률 하위 10 (스테이블코인 제외)
    const excludeStable = allRows.filter((r) => !STABLECOINS.has(r.symbolUpper));
    const gainers = [...excludeStable]
      .sort((a, b) => b.priceChangePercent - a.priceChangePercent)
      .slice(0, 10);
    const losers = [...excludeStable]
      .sort((a, b) => a.priceChangePercent - b.priceChangePercent)
      .slice(0, 10);

    return { popular, gainers, losers };
  }, [allRows]);

  return { byTab, loading, error };
}
