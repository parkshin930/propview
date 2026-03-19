"use client";

import { useTickerData } from "@/hooks/useTickerData";
import { formatPrice } from "@/lib/format-price";

const REFRESH_MS = 10000;

const TICKER_GAP = "1.5rem";

function TickerItem({
  label,
  children,
  isFirst = false,
}: {
  label: string;
  children: React.ReactNode;
  isFirst?: boolean;
}) {
  return (
    <span
      className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap py-1 text-sm ${
        isFirst ? "" : "border-l border-gray-200 dark:border-gray-600"
      }`}
      style={{ marginLeft: isFirst ? 0 : TICKER_GAP, paddingLeft: isFirst ? 0 : TICKER_GAP }}
    >
      <span className="font-medium text-foreground dark:text-gray-100">{label}</span>
      {children}
    </span>
  );
}

const TV_GREEN = "#26A69A";
const TV_RED = "#F23645";

function ChangePercent({ value }: { value: number }) {
  const isUp = value >= 0;
  return (
    <span className="tabular-nums font-medium text-sm" style={{ color: isUp ? TV_GREEN : TV_RED }}>
      {isUp ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );
}

export function TickerBar() {
  const { data, loading, error } = useTickerData(REFRESH_MS);

  return (
    <div className="w-full border-b border-gray-200 bg-gray-50/95 py-0.5 dark:border-[#1f2937] dark:bg-[#111827]">
      <div className="overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div
          className="flex min-w-max items-center justify-center px-4 py-1.5"
          style={{ gap: 0 }}
        >
          <TickerItem label="비트" isFirst>
            <span className="tabular-nums text-foreground dark:text-gray-100 text-sm">
              ${formatPrice(data.btcPrice)}
            </span>
            <ChangePercent value={data.btcChange24h} />
          </TickerItem>

          <TickerItem label="이더">
            <span className="tabular-nums text-foreground dark:text-gray-100 text-sm">
              ${formatPrice(data.ethPrice)}
            </span>
            <ChangePercent value={data.ethChange24h} />
          </TickerItem>

          <TickerItem label="김프">
            <span className="tabular-nums font-medium text-sm" style={{ color: data.kimchiPremiumPercent >= 0 ? TV_GREEN : TV_RED }}>
              {data.kimchiPremiumPercent >= 0 ? "+" : ""}
              {data.kimchiPremiumPercent.toFixed(2)}%
            </span>
          </TickerItem>

          <TickerItem label="BTC 도미넌스">
            <a
              href="https://kr.tradingview.com/symbols/BTC.D/"
              target="_blank"
              rel="noopener noreferrer"
              className="tabular-nums font-medium text-sm hover:underline"
              style={{ color: TV_GREEN }}
            >
              {data.btcDominancePercent > 0 ? `${data.btcDominancePercent.toFixed(2)}%` : "—"}
            </a>
          </TickerItem>
        </div>
      </div>
      {error && (
        <p className="text-center text-[10px] text-amber-600 dark:text-amber-400 py-0.5">{error}</p>
      )}
    </div>
  );
}
