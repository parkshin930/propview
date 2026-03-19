"use client";

import { useState, useEffect, useMemo } from "react";

const FUTURES_DATA_API = "/api/binance/futures-data";

export type LongShortData = {
  longPercent: number;
  shortPercent: number;
  message: string;
};

export type FundingData = {
  rate: number;
  message: string;
  longPercent: number;
  shortPercent: number;
};

export type OpenInterestData = {
  value: number;
  changePercent: number;
  message: string;
  longPercent: number;
  shortPercent: number;
};

export type LiquidationData = {
  longLiquidated: number;
  shortLiquidated: number;
  message: string;
  longPercent: number;
  shortPercent: number;
};

export function useBinanceFuturesData(refreshMs = 60_000) {
  const [longShort, setLongShort] = useState<LongShortData>({ longPercent: 50, shortPercent: 50, message: "로딩 중..." });
  const [funding, setFunding] = useState<FundingData>({ rate: 0, message: "로딩 중...", longPercent: 50, shortPercent: 50 });
  const [openInterest, setOpenInterest] = useState<OpenInterestData>({ value: 0, changePercent: 0, message: "로딩 중...", longPercent: 50, shortPercent: 50 });
  const [liquidation, setLiquidation] = useState<LiquidationData>({ longLiquidated: 0, shortLiquidated: 0, message: "로딩 중...", longPercent: 50, shortPercent: 50 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const res = await fetch(FUTURES_DATA_API, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "Request failed");
        if (cancelled) return;

        const ls = data.longShort ?? {};
        const l = ls.longPercent ?? 50;
        const s = ls.shortPercent ?? 50;
        setLongShort({
          longPercent: l,
          shortPercent: s,
          message: `24시간 기준 롱 ${l}% / 숏 ${s}% (${l >= s ? "롱" : "숏"} 우세)`,
        });

        const fr = data.funding ?? {};
        const rate = fr.rate ?? 0;
        setFunding({
          rate,
          message: `BTC 펀딩비 ${rate.toFixed(4)}% (${rate >= 0 ? "롱→숏" : "숏→롱"} 지불)`,
          longPercent: rate >= 0 ? 48 : 52,
          shortPercent: rate >= 0 ? 52 : 48,
        });

        const oi = data.openInterest ?? {};
        const value = oi.value ?? 0;
        const chg = oi.changePercent ?? 0;
        setOpenInterest({
          value,
          changePercent: chg,
          message: `BTC 미체결약정 24h ${chg >= 0 ? "+" : ""}${chg.toFixed(2)}%`,
          longPercent: 50,
          shortPercent: 50,
        });

        const liq = data.liquidation ?? {};
        const longLiq = liq.longLiquidated ?? 0;
        const shortLiq = liq.shortLiquidated ?? 0;
        const total = longLiq + shortLiq;
        const lPct = total > 0 ? Math.round((longLiq / total) * 100) : 50;
        setLiquidation({
          longLiquidated: longLiq,
          shortLiquidated: shortLiq,
          message: total > 0 ? `24h 청산: 롱 ${longLiq.toLocaleString()} / 숏 ${shortLiq.toLocaleString()} BTC` : "24시간 청산 데이터는 별도 연동 시 표시됩니다.",
          longPercent: lPct,
          shortPercent: 100 - lPct,
        });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "데이터를 불러올 수 없습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    setLoading(true);
    setError(null);
    fetchData();
    const id = setInterval(fetchData, refreshMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [refreshMs]);

  return useMemo(
    () => ({ longShort, funding, openInterest, liquidation, loading, error }),
    [longShort, funding, openInterest, liquidation, loading, error]
  );
}
