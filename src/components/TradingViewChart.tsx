"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Check, ChevronUp } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useLocale } from "next-intl";
import { useChartSymbolOptional } from "@/contexts/ChartSymbolContext";

/* CoinGecko CDN - 공식 컬러 로고 (안정적 로드), QTUM 제외 */
const COIN_LOGOS: Record<string, string> = {
  BTC: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  ETH: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  BNB: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  NEO: "https://assets.coingecko.com/coins/images/480/small/NEO_512_512.png",
  LTC: "https://assets.coingecko.com/coins/images/2/small/litecoin.png",
  ADA: "https://assets.coingecko.com/coins/images/975/small/cardano.png",
  SOL: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  XRP: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
  DOGE: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
  AVAX: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
  LINK: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
  UNI: "https://assets.coingecko.com/coins/images/12504/small/uniswap-logo.png",
};

export const CHART_SYMBOLS = [
  { id: "BINANCE:BTCUSDT", label: "BTC" },
  { id: "BINANCE:ETHUSDT", label: "ETH" },
  { id: "BINANCE:BNBUSDT", label: "BNB" },
  { id: "BINANCE:NEOUSDT", label: "NEO" },
  { id: "BINANCE:LTCUSDT", label: "LTC" },
  { id: "BINANCE:ADAUSDT", label: "ADA" },
  { id: "BINANCE:SOLUSDT", label: "SOL" },
  { id: "BINANCE:XRPUSDT", label: "XRP" },
  { id: "BINANCE:DOGEUSDT", label: "DOGE" },
  { id: "BINANCE:AVAXUSDT", label: "AVAX" },
  { id: "BINANCE:LINKUSDT", label: "LINK" },
  { id: "BINANCE:UNIUSDT", label: "UNI" },
] as const;

const SYMBOLS = CHART_SYMBOLS;

function getTradingViewEmbedUrl(symbol: string, isDark: boolean, locale: string) {
  const params = new URLSearchParams({
    symbol,
    interval: "D",
    timezone: "Etc/UTC",
    theme: isDark ? "dark" : "light",
    style: "1",
    locale: locale === "ko" ? "kr" : locale,
    allow_symbol_change: "true",
    saveimage: "1",
    calendar: "0",
    enable_publishing: "false",
    hide_side_toolbar: "0",
    support_host: "https://www.tradingview.com",
  });
  return `https://www.tradingview.com/widgetembed/?${params.toString()}`;
}

export function TradingViewChart() {
  const { theme } = useTheme();
  const locale = useLocale() as string;
  const chartCtx = useChartSymbolOptional();
  const [localSymbol, setLocalSymbol] = useState<(typeof SYMBOLS)[number]>(SYMBOLS[0]);
  const symbol = chartCtx ? chartCtx.symbol : localSymbol;
  const setSymbol = chartCtx ? chartCtx.setSymbol : (s: { id: string; label: string }) => setLocalSymbol(s as (typeof SYMBOLS)[number]);
  const [open, setOpen] = useState(false);
  const isDark = theme === "dark";
  const embedUrl = useMemo(
    () => getTradingViewEmbedUrl(symbol.id, isDark, locale),
    [symbol.id, isDark, locale]
  );
  const ref = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const logoUrl = COIN_LOGOS[symbol.label] ?? "";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  return (
    <div className="flex h-full flex-col gap-3 min-h-0">
      <div className="relative w-full max-w-[200px] shrink-0" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-left text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt=""
              width={20}
              height={20}
              className="h-5 w-5 shrink-0 rounded-full object-contain align-middle"
            />
          ) : (
            <span className="h-5 w-5 shrink-0 rounded-full bg-muted flex items-center justify-center text-xs font-medium align-middle">
              {symbol.label.slice(0, 1)}
            </span>
          )}
          <span className="min-w-0 flex-1 truncate align-middle">{symbol.label}</span>
          <span className="shrink-0 text-muted-foreground align-middle" aria-hidden>
            <ChevronUp
              className={`h-3.5 w-3.5 transition-transform ${open ? "" : "rotate-180"}`}
            />
          </span>
        </button>

        {open && (
          <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-80 overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            {SYMBOLS.map((s) => {
              const isSelected = s.id === symbol.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setSymbol({ id: s.id, label: s.label });
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 px-2.5 py-2 text-left text-sm font-medium transition-colors ${
                    isSelected
                      ? "bg-gray-100 text-foreground dark:bg-gray-700 dark:text-gray-100"
                      : "text-foreground hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {COIN_LOGOS[s.label] ? (
                    <img
                      src={COIN_LOGOS[s.label]}
                      alt=""
                      width={20}
                      height={20}
                      className="h-5 w-5 shrink-0 rounded-full object-contain align-middle"
                    />
                  ) : (
                    <span className="h-5 w-5 shrink-0 rounded-full bg-muted flex items-center justify-center text-xs font-medium align-middle">
                      {s.label.slice(0, 1)}
                    </span>
                  )}
                  <span className="min-w-0 flex-1 truncate align-middle">{s.label}</span>
                  {isSelected && (
                    <span className="shrink-0 text-blue-600 dark:text-blue-400 align-middle">
                      <Check className="h-4 w-4" strokeWidth={2.5} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex-1 min-h-[280px] w-full max-w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900/50 flex flex-col">
        <iframe
          ref={iframeRef}
          title="TradingView Chart"
          src={embedUrl}
          className="h-full w-full min-h-0 border-0 flex-1"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          // 외부 위젯이 contentWindow 이벤트를 시도할 때도 크래시로 번지지 않도록 최소 권한만 부여
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>
    </div>
  );
}
