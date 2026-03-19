"use client";

import { useMemo, useState } from "react";
import { Flame, TrendingUp, TrendingDown } from "lucide-react";
import { useCoinGeckoMarkets, type CoinGeckoRow } from "@/hooks/useCoinGeckoMarkets";
import { CoinLogo } from "@/components/CoinLogo";
import { formatPrice } from "@/lib/format-price";

type SortId = "popular" | "gainers" | "losers";

const SORT_OPTIONS: { id: SortId; label: string; icon: React.ReactNode }[] = [
  { id: "popular", label: "인기", icon: <Flame className="h-3.5 w-3.5" /> },
  { id: "gainers", label: "상승", icon: <TrendingUp className="h-3.5 w-3.5" /> },
  { id: "losers", label: "하락", icon: <TrendingDown className="h-3.5 w-3.5" /> },
];

function formatChange(value: number): string {
  const n = Number.isFinite(value) ? value : 0;
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

export function RightSideMarketList() {
  const { list, loading, error } = useCoinGeckoMarkets();
  const [sort, setSort] = useState<SortId>("popular");

  const displayList = useMemo(() => {
    if (sort === "popular" && list.length) return list.slice(0, 100);
    if (sort === "gainers") return [...list].sort((a, b) => b.priceChangePercent24h - a.priceChangePercent24h).slice(0, 100);
    if (sort === "losers") return [...list].sort((a, b) => a.priceChangePercent24h - b.priceChangePercent24h).slice(0, 100);
    return list.slice(0, 100);
  }, [list, sort]);

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-[#1f2937] dark:bg-[#0B1120] w-full overflow-hidden">
        <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <p className="text-sm font-semibold text-foreground dark:text-gray-100">마켓</p>
        </div>
        <div className="p-4 space-y-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-10 rounded-lg bg-gray-100 dark:bg-gray-800/60 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-[#1f2937] dark:bg-[#0B1120] w-full overflow-hidden">
        <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <p className="text-sm font-semibold text-foreground dark:text-gray-100">마켓</p>
        </div>
        <div className="p-4 text-sm text-muted-foreground dark:text-gray-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-[#1f2937] dark:bg-[#0B1120] w-full overflow-hidden">
      <div className="border-b border-gray-200 px-4 py-2 dark:border-gray-800">
        <p className="text-sm font-semibold text-foreground dark:text-gray-100 mb-2">마켓</p>
        <div className="flex gap-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSort(opt.id)}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors ${
                sort === opt.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-gray-100 text-muted-foreground hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
              aria-pressed={sort === opt.id}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="max-h-[min(520px,60vh)] overflow-y-auto overflow-x-auto" aria-label="마켓 리스트 스크롤">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-white dark:bg-[#0B1120] border-b border-gray-100 dark:border-gray-800">
            <tr>
              <th className="py-2 pl-3 pr-1 font-medium text-muted-foreground dark:text-gray-400 w-8">#</th>
              <th className="py-2 pr-2 font-medium text-muted-foreground dark:text-gray-400">폐어명</th>
              <th className="py-2 pr-2 font-medium text-muted-foreground dark:text-gray-400 text-right">현재가(USDT)</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground dark:text-gray-400 text-right">24H 변동</th>
            </tr>
          </thead>
          <tbody>
            {displayList.map((row, idx) => (
              <Row key={row.id} rank={idx + 1} row={row} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ rank, row }: { rank: number; row: CoinGeckoRow }) {
  const change = row.priceChangePercent24h ?? 0;
  const isUp = change >= 0;
  const priceStr = formatPrice(String(row.currentPrice));

  return (
    <tr className="border-b border-gray-100 dark:border-gray-800/80 hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-colors">
      <td className="py-1.5 pl-3 pr-1 text-muted-foreground dark:text-gray-500 tabular-nums">{rank}</td>
      <td className="py-1.5 pr-2">
        <div className="flex items-center gap-2">
          <CoinLogo baseAsset={row.symbolUpper} imageUrl={row.image || undefined} size={20} />
          <span className="font-medium text-foreground dark:text-gray-100">{row.symbolUpper}</span>
        </div>
      </td>
      <td className={`py-1.5 pr-2 text-right tabular-nums ${isUp ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"}`}>
        {priceStr}
      </td>
      <td className={`py-1.5 pr-3 text-right tabular-nums font-medium ${isUp ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"}`}>
        {formatChange(change)}
      </td>
    </tr>
  );
}
