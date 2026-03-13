"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Check, ChevronUp } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

/* CoinGecko CDN - 공식 컬러 로고 (안정적 로드) */
const COIN_LOGOS: Record<string, string> = {
  BTC: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  ETH: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  BNB: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  NEO: "https://assets.coingecko.com/coins/images/480/small/NEO_512_512.png",
  LTC: "https://assets.coingecko.com/coins/images/2/small/litecoin.png",
  QTUM: "https://assets.coingecko.com/coins/images/1191/small/qtum.png",
  ADA: "https://assets.coingecko.com/coins/images/975/small/cardano.png",
};

const SYMBOLS = [
  { id: "BINANCE:BTCUSDT", label: "BTC" },
  { id: "BINANCE:ETHUSDT", label: "ETH" },
  { id: "BINANCE:BNBUSDT", label: "BNB" },
  { id: "BINANCE:NEOUSDT", label: "NEO" },
  { id: "BINANCE:LTCUSDT", label: "LTC" },
  { id: "BINANCE:QTUMUSDT", label: "QTUM" },
  { id: "BINANCE:ADAUSDT", label: "ADA" },
] as const;

function getTradingViewEmbedUrl(symbol: string, isDark: boolean) {
  const params = new URLSearchParams({
    symbol,
    interval: "D",
    timezone: "Etc/UTC",
    theme: isDark ? "dark" : "light",
    style: "1",
    locale: "en",
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
  const [symbol, setSymbol] = useState<(typeof SYMBOLS)[number]>(SYMBOLS[0]);
  const [open, setOpen] = useState(false);
  const isDark = theme === "dark";
  const embedUrl = useMemo(
    () => getTradingViewEmbedUrl(symbol.id, isDark),
    [symbol.id, isDark]
  );
  const ref = useRef<HTMLDivElement>(null);

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
    <div className="flex flex-col gap-3 flex-1 min-h-0">
      <div className="relative w-full max-w-[200px] shrink-0" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-left text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
        >
          <img
            src={COIN_LOGOS[symbol.label]}
            alt=""
            width={20}
            height={20}
            className="h-5 w-5 shrink-0 rounded-full object-contain align-middle"
          />
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
                    setSymbol(s);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 px-2.5 py-2 text-left text-sm font-medium transition-colors ${
                    isSelected
                      ? "bg-gray-100 text-foreground dark:bg-gray-700 dark:text-gray-100"
                      : "text-foreground hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  <img
                    src={COIN_LOGOS[s.label]}
                    alt=""
                    width={20}
                    height={20}
                    className="h-5 w-5 shrink-0 rounded-full object-contain align-middle"
                  />
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

      <div className="flex-1 min-h-[280px] sm:min-h-[400px] lg:min-h-[520px] w-full max-w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900/50">
        <iframe
          title="TradingView Chart"
          src={embedUrl}
          className="h-full w-full border-0"
          allowFullScreen
        />
      </div>
    </div>
  );
}
