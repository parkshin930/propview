"use client";

import { useState, useEffect, useCallback } from "react";

const BINANCE_TICKER_24HR = "https://api.binance.com/api/v3/ticker/24hr";
const UPBIT_TICKER = "https://api.upbit.com/v1/ticker";
/** 국내 테더가(업비트 KRW-USDT) vs 실시간 환율(open.er-api)로 김프 계산 */
const ER_API_URL = "https://open.er-api.com/v6/latest/USD";
const DOMINANCE_API = "/api/coingecko/global";

export type TickerData = {
  btcPrice: string;
  btcChange24h: number;
  ethPrice: string;
  ethChange24h: number;
  kimchiPremiumPercent: number;
  exchangeRateKrw: number;
  btcDominancePercent: number;
};

const defaultData: TickerData = {
  btcPrice: "0",
  btcChange24h: 0,
  ethPrice: "0",
  ethChange24h: 0,
  kimchiPremiumPercent: 0,
  exchangeRateKrw: 0,
  btcDominancePercent: 0,
};

/** BTC/ETH 표시용: 24hr 티커 */
async function fetchBinance24hr(): Promise<{
  btc: { price: string; change: number };
  eth: { price: string; change: number };
}> {
  const [btcRes, ethRes] = await Promise.all([
    fetch(`${BINANCE_TICKER_24HR}?symbol=BTCUSDT`),
    fetch(`${BINANCE_TICKER_24HR}?symbol=ETHUSDT`),
  ]);
  const btc = await btcRes.json();
  const eth = await ethRes.json();
  return {
    btc: { price: btc?.lastPrice ?? "0", change: Number(btc?.priceChangePercent ?? 0) },
    eth: { price: eth?.lastPrice ?? "0", change: Number(eth?.priceChangePercent ?? 0) },
  };
}

/** 업비트 KRW-USDT 현재가 (국내 테더가 A) */
async function fetchUpbitUsdtKrw(): Promise<number> {
  const res = await fetch(`${UPBIT_TICKER}?markets=KRW-USDT`);
  const arr = await res.json();
  if (!Array.isArray(arr)) return 0;
  const item = arr.find((x: { market: string }) => x.market === "KRW-USDT");
  return item?.trade_price ? Number(item.trade_price) : 0;
}

/** 실시간 환율 B: open.er-api.com → rates.KRW (1 USD = N KRW) */
async function fetchErApiRate(): Promise<number> {
  try {
    const res = await fetch(ER_API_URL, { cache: "no-store" });
    const json = await res.json();
    const krw = json?.rates?.KRW;
    return typeof krw === "number" && krw > 0 ? krw : 0;
  } catch {
    return 0;
  }
}

/**
 * 테더(USDT) 기준 김프
 * A = 국내 테더가 (업비트 KRW-USDT), B = 실시간 환율 (er-api rates.KRW)
 * 공식: ((A / B) - 1) * 100  → 국내가 환율보다 싸면(역프) 음수, 빨간색
 */
function calcKimpUsdt(domesticUsdtKrw: number, rateKrw: number): number {
  if (!domesticUsdtKrw || !rateKrw) return 0;
  return ((domesticUsdtKrw / rateKrw) - 1) * 100;
}

/** BTC 도미넌스: CoinGecko global (서버 API 경유) */
async function fetchBtcDominance(): Promise<number> {
  try {
    const res = await fetch(DOMINANCE_API, { cache: "no-store" });
    const json = await res.json();
    const btcDominance = json?.btcDominance;
    return typeof btcDominance === "number" ? btcDominance : 0;
  } catch {
    return 0;
  }
}

const REFRESH_INTERVAL_MS = 10000;

export function useTickerData(intervalMs = REFRESH_INTERVAL_MS) {
  const [data, setData] = useState<TickerData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    const [binance24Result, upbitResult, erApiResult, dominanceResult] = await Promise.allSettled([
      fetchBinance24hr(),
      fetchUpbitUsdtKrw(),
      fetchErApiRate(),
      fetchBtcDominance(),
    ]);

    const binance24 = binance24Result.status === "fulfilled" ? binance24Result.value : null;
    const domesticUsdtKrw = upbitResult.status === "fulfilled" ? upbitResult.value : 0;
    const rateKrw = erApiResult.status === "fulfilled" ? erApiResult.value : 0;
    const btcDom = dominanceResult.status === "fulfilled" ? dominanceResult.value : 0;

    if (!binance24) {
      setError("Binance 데이터를 불러올 수 없습니다.");
      setLoading(false);
      return;
    }

    const kimchiPercent = calcKimpUsdt(domesticUsdtKrw, rateKrw);

    setData({
      btcPrice: binance24.btc.price,
      btcChange24h: binance24.btc.change,
      ethPrice: binance24.eth.price,
      ethChange24h: binance24.eth.change,
      kimchiPremiumPercent: kimchiPercent,
      exchangeRateKrw: rateKrw,
      btcDominancePercent: btcDom,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, intervalMs);
    return () => clearInterval(id);
  }, [refresh, intervalMs]);

  return { data, loading, error, refresh };
}
