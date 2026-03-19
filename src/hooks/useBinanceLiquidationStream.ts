"use client";

import { useEffect, useRef, useState } from "react";

type StreamSums = {
  long: number;
  short: number;
};

const WS_URL = "wss://fstream.binance.com/ws/!forceOrder@arr";

/**
 * Binance 공식 웹소켓(!forceOrder@arr)으로 BTCUSDT 강제청산 금액을 실시간 누적.
 * - 초기값은 REST 24h 합계(longBase/shortBase)로 시딩
 * - 이후 들어오는 tick의 price * qty 를 계속 더해감
 */
export function useBinanceLiquidationStream(symbol: string, longBase: number, shortBase: number) {
  const [sums, setSums] = useState<StreamSums>({ long: longBase, short: shortBase });
  const wsRef = useRef<WebSocket | null>(null);

  // base 값이 바뀌면 누적도 리셋
  useEffect(() => {
    setSums({ long: longBase, short: shortBase });
  }, [longBase, shortBase]);

  useEffect(() => {
    if (!symbol) return;
    let closed = false;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data as string);
        const arr = Array.isArray(payload) ? payload : [payload];
        let longDelta = 0;
        let shortDelta = 0;

        for (const item of arr) {
          const o = (item && typeof item === "object" && "o" in item ? (item as any).o : item) as {
            s?: string;
            S?: string;
            p?: string;
            ap?: string;
            q?: string;
            origQty?: string;
            executedQty?: string;
          } | null;
          if (!o || o.s !== symbol) continue;
          const side = o.S;
          const price = parseFloat(o.p ?? o.ap ?? "0");
          const qty = parseFloat(o.q ?? o.origQty ?? o.executedQty ?? "0");
          if (!side || !Number.isFinite(price) || !Number.isFinite(qty)) continue;
          const notional = price * qty;
          if (!Number.isFinite(notional) || notional <= 0) continue;
          if (side === "SELL") longDelta += notional;
          else if (side === "BUY") shortDelta += notional;
        }

        if (longDelta === 0 && shortDelta === 0) return;

        setSums((prev) => ({
          long: prev.long + longDelta,
          short: prev.short + shortDelta,
        }));
      } catch {
        // 무시
      }
    };

    ws.onerror = () => {
      // eslint-disable-next-line no-console
      console.error("Binance liquidation WebSocket error");
    };

    ws.onclose = () => {
      if (!closed) {
        // eslint-disable-next-line no-console
        console.log("Binance liquidation WebSocket closed");
      }
    };

    return () => {
      closed = true;
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [symbol]);

  return sums;
}

