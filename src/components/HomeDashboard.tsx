"use client";

import { TickerBar } from "@/components/TickerBar";
import { TradingViewChart } from "@/components/TradingViewChart";
import { HomeSidebar } from "@/components/HomeSidebar";
import { WithdrawalTimeline } from "@/components/WithdrawalTimeline";
import { MarketDataSection } from "@/components/MarketDataSection";
import { RecommendedCreators } from "@/components/RecommendedCreators";
import { CommunityList } from "@/components/CommunityList";
import { NoticeAndGuide } from "@/components/NoticeAndGuide";

export function HomeDashboard() {
  return (
    <>
      <TickerBar />
      <div className="container mx-auto max-w-screen-xl px-4 pt-0 pb-6 overflow-x-hidden">
        {/* Row 1: 랭킹(슬림) · 차트(최대 폭) · 사이드바 — 하단 끝선 맞춤 */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 items-stretch">
          <section className="min-w-0 lg:col-span-3 flex h-full flex-col">
            <WithdrawalTimeline />
          </section>
          <section className="min-w-0 lg:col-span-6 flex flex-col">
            <div className="rounded-xl border border-border bg-card p-3 shadow-sm dark:bg-[#111827] dark:border-[#1f2937] flex flex-col flex-1 min-h-0">
              <TradingViewChart />
            </div>
          </section>
          <section className="min-w-0 lg:col-span-3 flex flex-col w-full">
            <HomeSidebar />
          </section>
        </div>

        {/* Row 2: 선물 마켓 데이터(9) + 추천 크리에이터(3) — 커뮤니티는 마켓데이터 바로 아래 */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 mt-1">
          <section className="min-w-0 flex flex-col gap-0 lg:col-span-9">
            <MarketDataSection />
            <div className="mt-2">
              <h2 className="mb-1 text-base font-semibold text-foreground dark:text-gray-100">
                커뮤니티 (인기글 / 최신글)
              </h2>
              <CommunityList />
            </div>
          </section>
          <section className="min-w-0 flex flex-col gap-0 lg:col-span-3 w-full">
            <RecommendedCreators />
            <div className="mt-2">
              <NoticeAndGuide />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
