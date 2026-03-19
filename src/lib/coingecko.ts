/**
 * CoinGecko API v3
 * Docs: https://docs.coingecko.com/reference/coins-markets
 * Auth: x-cg-demo-api-key header or x_cg_demo_api_key query
 */

const BASE = "https://api.coingecko.com/api/v3";

function getApiKey(): string | undefined {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_COINGECKO_API_KEY;
  }
  return process.env.NEXT_PUBLIC_COINGECKO_API_KEY;
}

export async function coingeckoFetch<T>(
  path: string,
  params?: Record<string, string | number | undefined>
): Promise<T> {
  const key = getApiKey();
  const url = new URL(path, BASE);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
    }
  }
  if (key) url.searchParams.set("x_cg_demo_api_key", key);

  const res = await fetch(url.toString(), { cache: "no-store" });
  const text = await res.text();
  if (!text?.trim()) {
    throw new Error(res.ok ? "CoinGecko API returned empty response" : `CoinGecko API error (${res.status})`);
  }
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(res.ok ? "CoinGecko API returned invalid JSON" : `CoinGecko API error (${res.status})`);
  }
  if (!res.ok) throw new Error(typeof data === "object" && data && "error" in data ? String((data as { error?: string }).error) : `CoinGecko API error (${res.status})`);
  return data as T;
}

/** /coins/markets 응답 항목 */
export type CoinGeckoMarketItem = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number | null;
  market_cap: number;
  total_volume: number;
};

/** /global 응답 */
export type CoinGeckoGlobal = {
  data?: {
    market_cap_percentage?: { btc?: number };
  };
};
