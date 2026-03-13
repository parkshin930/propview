"use client";

import { useState } from "react";

const TABS = [
  { id: "longShort" as const, label: "롱숏 비율" },
  { id: "liquidation" as const, label: "강제청산 비율" },
  { id: "funding" as const, label: "펀딩 비율" },
  { id: "openInterest" as const, label: "미결제 약정" },
] as const;

const TAB_CONTENT = {
  longShort: {
    emoji: "😎",
    message: "현재 롱 62% / 숏 38%로 롱이 우위예요.",
    longPercent: 62,
    shortPercent: 38,
  },
  liquidation: {
    emoji: "😨",
    message: "24시간 동안 103,804명이 강제청산 되었어요.",
    longPercent: 55,
    shortPercent: 45,
  },
  funding: {
    emoji: "📊",
    message: "BTC 펀딩비 0.01%로 롱이 숏에게 지불 중이에요.",
    longPercent: 52,
    shortPercent: 48,
  },
  openInterest: {
    emoji: "📈",
    message: "미결제 약정이 전일 대비 3.2% 증가했어요.",
    longPercent: 58,
    shortPercent: 42,
  },
};

export function MarketDataSection() {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]["id"]>("longShort");
  const content = TAB_CONTENT[activeTab];

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-[#1f2937] dark:bg-[#111827]">
      <h2 className="mb-2 text-base font-semibold text-foreground dark:text-gray-100">
        선물 트레이딩 마켓 데이터
      </h2>
      {/* 알약 모양 탭 */}
      <div className="mb-3 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-[#222222] text-white dark:bg-gray-700 dark:text-gray-100"
                : "bg-gray-100 text-muted-foreground hover:bg-gray-200 hover:text-foreground dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* 요약 말풍선 + 게이지 바 */}
      <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/80 dark:border dark:border-gray-700">
        <p className="mb-2 flex items-center gap-2 text-sm text-foreground dark:text-gray-100">
          <span className="text-lg" aria-hidden>{content.emoji}</span>
          {content.message}
        </p>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground dark:text-gray-400">
            <span>롱 {content.longPercent}%</span>
            <span>숏 {content.shortPercent}%</span>
          </div>
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full rounded-l-full bg-green-500 transition-all duration-300"
              style={{ width: `${content.longPercent}%` }}
            />
            <div
              className="h-full rounded-r-full bg-blue-500 transition-all duration-300"
              style={{ width: `${content.shortPercent}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
