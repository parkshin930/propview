import { NextResponse } from "next/server";

const FAPI = "https://fapi.binance.com";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** 서버에서만 Binance 선물 데이터 조회 (키 노출 방지). 24h 기준. */
export async function GET() {
  try {
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

    const [longShortRes, fundingRes, oiHistRes, forceOrdersRes] = await Promise.all([
      fetch(
        `${FAPI}/futures/data/globalLongShortAccountRatio?symbol=BTCUSDT&period=1d&limit=1`,
        { cache: "no-store" }
      ),
      fetch(`${FAPI}/fapi/v1/fundingRate?symbol=BTCUSDT&limit=1`, { cache: "no-store" }),
      fetch(
        `${FAPI}/futures/data/openInterestHist?symbol=BTCUSDT&period=1d&limit=2`,
        { cache: "no-store" }
      ),
      fetch(
        // allForceOrders: 최근 강제청산 레코드. 이후 24h 필터는 서버에서 수행.
        `${FAPI}/fapi/v1/allForceOrders?symbol=BTCUSDT&limit=1000`,
        { cache: "no-store" }
      ),
    ]);

    const [lsArr, frArr, oiArr, forceRaw] = await Promise.all([
      longShortRes.json(),
      fundingRes.json(),
      oiHistRes.json(),
      forceOrdersRes.json(),
    ]);

    const forceArr = Array.isArray(forceRaw)
      ? forceRaw
      : (typeof forceRaw === "object" && forceRaw !== null && Array.isArray((forceRaw as { data?: unknown }).data)
          ? (forceRaw as { data: unknown[] }).data
          : []);
    // 디버깅: 데이터가 0이면 API 응답 구조 확인용
    // eslint-disable-next-line no-console
    console.log("allForceOrders (BTCUSDT) array length:", forceArr.length, forceArr.length === 0 && forceRaw != null ? "| raw keys: " + Object.keys(forceRaw as object).join(",") : "");

    const longShort = Array.isArray(lsArr) && lsArr[0]
      ? {
          longPercent: Math.round(parseFloat(lsArr[0].longAccount) * 100),
          shortPercent: Math.round(parseFloat(lsArr[0].shortAccount) * 100),
        }
      : { longPercent: 50, shortPercent: 50 };

    const funding = Array.isArray(frArr) && frArr[0]
      ? { rate: parseFloat(frArr[0].fundingRate) * 100 }
      : { rate: 0 };

    let openInterest = { value: 0, changePercent: 0 };
    if (Array.isArray(oiArr) && oiArr.length >= 2) {
      const curr = parseFloat(oiArr[0].sumOpenInterestValue);
      const prev = parseFloat(oiArr[1].sumOpenInterestValue);
      openInterest = {
        value: curr,
        changePercent: prev ? ((curr - prev) / prev) * 100 : 0,
      };
    }

    let longLiquidated = 0;
    let shortLiquidated = 0;
    for (const o of forceArr as Array<{
      side?: string;
      price?: string;
      avgPrice?: string;
      origQty?: string;
      executedQty?: string;
      time?: number;
    }>) {
      const ts = typeof o.time === "number" ? o.time : undefined;
      if (!ts || ts < twentyFourHoursAgo) continue;
      const side = o.side;
      const price = parseFloat(o.price ?? o.avgPrice ?? "0");
      const qty = parseFloat(o.origQty ?? o.executedQty ?? "0");
      if (!side || !Number.isFinite(price) || !Number.isFinite(qty)) continue;
      const notional = price * qty;
      if (!Number.isFinite(notional) || notional <= 0) continue;
      if (side === "SELL") longLiquidated += notional;
      else if (side === "BUY") shortLiquidated += notional;
    }

    // 서버 로그: 집계 결과 검증
    // eslint-disable-next-line no-console
    console.log("Liquidation Data:", { longLiquidated, shortLiquidated });

    return NextResponse.json({
      longShort,
      funding,
      openInterest,
      liquidation: { longLiquidated, shortLiquidated },
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : "Failed to fetch futures data",
        longShort: { longPercent: 50, shortPercent: 50 },
        funding: { rate: 0 },
        openInterest: { value: 0, changePercent: 0 },
        liquidation: { longLiquidated: 0, shortLiquidated: 0 },
      },
      { status: 500 }
    );
  }
}
