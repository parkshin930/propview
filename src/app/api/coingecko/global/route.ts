import { NextResponse } from "next/server";

const COINGECKO_GLOBAL = "https://api.coingecko.com/api/v3/global";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** 서버에서 CoinGecko /global 호출 (CORS 회피, API 키 사용 가능) */
export async function GET() {
  try {
    const key = process.env.NEXT_PUBLIC_COINGECKO_API_KEY;
    const url = new URL(COINGECKO_GLOBAL);
    if (key) url.searchParams.set("x_cg_demo_api_key", key);

    const res = await fetch(url.toString(), { cache: "no-store" });
    const text = await res.text();
    let json: unknown = null;
    if (text?.trim()) {
      try {
        json = JSON.parse(text);
      } catch {
        json = null;
      }
    }

    if (!res.ok || !json) {
      return NextResponse.json(
        { error: "CoinGecko error", btcDominance: 0 },
        { status: 502 }
      );
    }

    const data = (json as { data?: { market_cap_percentage?: { btc?: number } } })?.data ?? (json as { market_cap_percentage?: { btc?: number } });
    const btc = data?.market_cap_percentage?.btc;
    const btcDominance = typeof btc === "number" ? btc : 0;

    return NextResponse.json({ btcDominance });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch dominance", btcDominance: 0 },
      { status: 500 }
    );
  }
}
