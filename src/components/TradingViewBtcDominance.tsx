"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 트레이딩뷰 BTC 도미넌스 위젯 — 1개만 렌더 (중복 방지)
 * https://kr.tradingview.com/symbols/BTC.D/
 */
const SYMBOL = "CRYPTOCAP:BTC.D";
const TV_GREEN = "#26A69A";
const WIDGET_SCRIPT_SRC = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";

export function TradingViewBtcDominance({ value: fallbackValue }: { value: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [useFallback, setUseFallback] = useState(false);
  const insertedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || useFallback) return;

    if (insertedRef.current) return;
    insertedRef.current = true;

    container.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "tradingview-widget-container tv-dominance-single";
    wrapper.setAttribute("data-tv-widget", "btc-dominance");
    wrapper.style.cssText =
      "width:180px;height:46px;overflow:hidden;background:transparent !important;";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = "100%";

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = WIDGET_SCRIPT_SRC;
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [{ proName: SYMBOL }],
      colorTheme: "dark",
      isTransparent: true,
      displayMode: "compact",
      locale: "kr",
    });
    script.onerror = () => {
      setUseFallback(true);
      insertedRef.current = false;
    };

    wrapper.appendChild(widgetDiv);
    wrapper.appendChild(script);
    container.appendChild(wrapper);

    const timeoutId = setTimeout(() => {
      if (!container.querySelector("iframe")) setUseFallback(true);
      insertedRef.current = false;
    }, 8000);

    return () => {
      clearTimeout(timeoutId);
      insertedRef.current = false;
      container.innerHTML = "";
    };
  }, [useFallback]);

  if (useFallback) {
    return (
      <a
        href="https://kr.tradingview.com/symbols/BTC.D/"
        target="_blank"
        rel="noopener noreferrer"
        className="tabular-nums font-medium hover:underline text-sm"
        style={{ color: fallbackValue > 0 ? TV_GREEN : undefined }}
      >
        {fallbackValue > 0 ? `${fallbackValue.toFixed(2)}%` : "—"}
      </a>
    );
  }

  return (
    <div
      ref={containerRef}
      className="tv-btc-dominance-widget inline-flex items-center overflow-hidden bg-transparent"
      style={{ minHeight: 46, minWidth: 180 }}
    />
  );
}
