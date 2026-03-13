"use client";

import { useState } from "react";

export function MarketSentimentCard() {
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const upPercent = 68;
  const downPercent = 32;

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-foreground">
        오늘의 시장 심리
      </h3>
      <p className="mb-4 text-sm text-muted-foreground">
        오늘 비트코인 방향은?
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setVoted("up")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            voted === "up"
              ? "bg-green-600 text-white"
              : "bg-green-50 text-green-700 hover:bg-green-100"
          }`}
        >
          <span aria-hidden>🚀</span> 상승
        </button>
        <button
          type="button"
          onClick={() => setVoted("down")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            voted === "down"
              ? "bg-red-600 text-white"
              : "bg-red-50 text-red-700 hover:bg-red-100"
          }`}
        >
          <span aria-hidden>🩸</span> 하락
        </button>
      </div>
      <div className="mt-4 space-y-1">
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-l-full bg-green-500 transition-all"
            style={{ width: `${upPercent}%` }}
          />
          <div
            className="h-full rounded-r-full bg-red-500 transition-all"
            style={{ width: `${downPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>상승 {upPercent}%</span>
          <span>하락 {downPercent}%</span>
        </div>
      </div>
    </div>
  );
}
