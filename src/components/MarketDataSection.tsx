"use client";

import Link from "next/link";
import { useBinanceFuturesData } from "@/hooks/useBinanceFuturesData";
import { useFearGreedIndex } from "@/hooks/useFearGreedIndex";
import { useBinanceLiquidationStream } from "@/hooks/useBinanceLiquidationStream";

const TV_GREEN = "#26A69A";
const TV_RED = "#F23645";
const LIQ_LONG_COLOR = "#3b82f6"; // 파란색 (롱 청산)
const LIQ_SHORT_COLOR = "#f97316"; // 주황색 (숏 청산)

function RatioBar({
  leftPercent,
  rightPercent,
  leftLabel,
  rightLabel,
  leftColor,
  rightColor,
}: {
  leftPercent: number;
  rightPercent: number;
  leftLabel: string;
  rightLabel: string;
  leftColor: string;
  rightColor: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-muted-foreground dark:text-gray-400">
        <span>
          {leftLabel} {leftPercent}%
        </span>
        <span>
          {rightLabel} {rightPercent}%
        </span>
      </div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full rounded-l-full transition-all duration-500 ease-out"
          style={{ width: `${leftPercent}%`, backgroundColor: leftColor }}
        />
        <div
          className="h-full rounded-r-full transition-all duration-500 ease-out"
          style={{ width: `${rightPercent}%`, backgroundColor: rightColor }}
        />
      </div>
    </div>
  );
}

function formatNotional(v: number) {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(2)}K`;
  return `$${v.toFixed(0)}`;
}

export function MarketDataSection() {
  const { longShort, funding, openInterest, liquidation, loading, error } = useBinanceFuturesData();
  const { data: fearGreed, loading: fgLoading } = useFearGreedIndex();

  const fgValue = fearGreed?.value ?? 50;
  const fgLabel = fearGreed?.classification ?? "Neutral";

  // WebSocket으로 BTCUSDT 강제청산 실시간 누적 (REST 24h 합계를 베이스로 사용)
  const liqStream = useBinanceLiquidationStream("BTCUSDT", liquidation.longLiquidated, liquidation.shortLiquidated);
  const liqTotal = liqStream.long + liqStream.short;
  const liqLongPct = liqTotal > 0 ? Math.round((liqStream.long / liqTotal) * 100) : 50;
  const liqShortPct = 100 - liqLongPct;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-[#1f2937] dark:bg-[#111827]">
      <h2 className="mb-3 text-base font-semibold text-foreground dark:text-gray-100">
        선물 마켓 데이터 (24h)
      </h2>
      {error && (
        <p className="mb-2 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
        {/* 롱/숏 비율 */}
        <div className="rounded-lg border border-gray-100 bg-gray-50/80 p-3 dark:border-gray-700 dark:bg-gray-800/60">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-gray-400">
            롱/숏 비율 (BTCUSDT)
          </p>
          {loading ? (
            <div className="h-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
          ) : (
            <RatioBar
              leftPercent={longShort.longPercent}
              rightPercent={longShort.shortPercent}
              leftLabel="롱"
              rightLabel="숏"
              leftColor={TV_GREEN}
              rightColor={TV_RED}
            />
          )}
          <p className="mt-1.5 text-xs text-foreground/80 dark:text-gray-300">
            {longShort.message}
          </p>
        </div>

        {/* BTC 24H 청산 (중앙) — REST 24h + WebSocket 실시간 누적 */}
        <div className="rounded-lg border border-gray-100 bg-gray-50/80 p-3 dark:border-gray-700 dark:bg-gray-800/60">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-gray-400">
            BTC 24H 청산
          </p>
          {loading ? (
            <div className="h-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          ) : (
            <>
              <RatioBar
                leftPercent={liqLongPct}
                rightPercent={liqShortPct}
                leftLabel="롱 청산"
                rightLabel="숏 청산"
                leftColor={LIQ_LONG_COLOR}
                rightColor={LIQ_SHORT_COLOR}
              />
              <p className="mt-1.5 text-[11px] text-foreground/80 dark:text-gray-300">
                {formatNotional(liqStream.long)} / {formatNotional(liqStream.short)}
              </p>
            </>
          )}
        </div>

        {/* 공포탐욕 지수 */}
        <div className="rounded-lg border border-gray-100 bg-gray-50/80 p-3 dark:border-gray-700 dark:bg-gray-800/60">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-gray-400">
            공포·탐욕 지수 (Crypto)
          </p>
          {fgLoading ? (
            <div className="h-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
          ) : (
            <>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground dark:text-gray-400">
                  <span>공포</span>
                  <span>탐욕</span>
                </div>
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${fgValue}%`,
                      background: "linear-gradient(90deg, #ef4444, #eab308, #22c55e)",
                    }}
                  />
                </div>
              </div>
              <p className="mt-1.5 text-xs text-foreground/80 dark:text-gray-300">
                현재 지수: <span className="font-semibold">{fgValue}</span>{" "}
                <span className="uppercase tracking-wide text-[11px] text-muted-foreground dark:text-gray-400">
                  ({fgLabel})
                </span>
              </p>
            </>
          )}
        </div>
      </div>

      {/* 펀딩 비율 한 줄 + OI 요약 */}
      <div className="mt-3 rounded-lg border border-gray-100 py-2 px-3 text-xs text-muted-foreground dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-400">
        <p>{funding.message}</p>
        <p className="mt-0.5">
          BTC 미결제 약정 24h 변화:{" "}
          <span
            className="font-medium"
            style={{ color: openInterest.changePercent >= 0 ? TV_GREEN : TV_RED }}
          >
            {openInterest.changePercent >= 0 ? "+" : ""}
            {openInterest.changePercent.toFixed(2)}%
          </span>
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
        <span>Data: Binance Futures API, alternative.me</span>
        <span className="text-border">|</span>
        <Link
          href="https://www.binance.com/en/futures"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground/80 hover:underline"
        >
          Binance Futures
        </Link>
      </div>
    </section>
  );
}
