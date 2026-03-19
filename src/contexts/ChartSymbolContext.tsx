"use client";

import { createContext, useContext, useCallback, useState } from "react";

export type ChartSymbol = { id: string; label: string };

const ChartSymbolContext = createContext<{
  symbol: ChartSymbol;
  setSymbol: (s: ChartSymbol) => void;
} | null>(null);

const DEFAULT_SYMBOL: ChartSymbol = { id: "BINANCE:BTCUSDT", label: "BTC" };

export function ChartSymbolProvider({ children }: { children: React.ReactNode }) {
  const [symbol, setSymbolState] = useState<ChartSymbol>(DEFAULT_SYMBOL);
  const setSymbol = useCallback((s: ChartSymbol) => setSymbolState(s), []);
  return (
    <ChartSymbolContext.Provider value={{ symbol, setSymbol }}>
      {children}
    </ChartSymbolContext.Provider>
  );
}

export function useChartSymbol() {
  const ctx = useContext(ChartSymbolContext);
  if (!ctx) return { symbol: DEFAULT_SYMBOL, setSymbol: () => {} };
  return ctx;
}

export function useChartSymbolOptional() {
  return useContext(ChartSymbolContext);
}
