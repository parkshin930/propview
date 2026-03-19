"use client";

import { TickerBar } from "@/components/TickerBar";
import { TradingViewChart } from "@/components/TradingViewChart";
import { HomeSidebar } from "@/components/HomeSidebar";
import { WithdrawalTimeline } from "@/components/WithdrawalTimeline";
import { MarketDataSection } from "@/components/MarketDataSection";
import { RecommendedCreators } from "@/components/RecommendedCreators";
import { CommunityList } from "@/components/CommunityList";
import { NoticeAndGuide } from "@/components/NoticeAndGuide";
import { ChartSymbolProvider } from "@/contexts/ChartSymbolContext";

export function HomeDashboard() {
  return (
    <>
      <TickerBar />
      <div className="container mx-auto max-w-screen-xl px-4 pt-0 pb-6 overflow-x-hidden min-h-[calc(100vh-8rem)]">
        <ChartSymbolProvider>
        {/* 75% : 25% 황금 비율, 좌측 메인 | 우측 사이드바, 하단 라인 정렬 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch min-h-[calc(100vh-8rem)]">
          {/* 좌측 메인 (75%) — 차트 → 선물 마켓 데이터 → 커뮤니티(높이 우측에 맞춤) */}
          <main className="min-w-0 lg:col-span-9 flex flex-col gap-3 min-h-0">
            {/* 최상단: 랭킹 + 트레이딩뷰 차트 */}
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-9 shrink-0">
              <section className="min-w-0 lg:col-span-3 w-full">
                <WithdrawalTimeline />
              </section>
              <section className="min-w-0 lg:col-span-6 w-full lg:h-[min(660px,68vh)] lg:min-h-0">
                <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:bg-[#111827] dark:border-[#1f2937] flex flex-col h-full min-h-[280px] lg:min-h-0 overflow-hidden">
                  <TradingViewChart />
                </div>
              </section>
            </div>
            {/* 중단: 선물 마켓 데이터 (24h) — 차트 바로 아래 */}
            <div className="shrink-0">
              <MarketDataSection />
            </div>
            {/* 하단: 커뮤니티 — 우측 사이드바 하단과 일직선 맞춤 (flex-1로 늘어남) */}
            <section className="flex-1 min-h-0 flex flex-col">
              <h2 className="mb-1 shrink-0 text-base font-semibold text-foreground dark:text-gray-100">
                커뮤니티 (인기글 / 최신글)
              </h2>
              <div className="flex-1 min-h-[200px] overflow-y-auto">
                <CommunityList />
              </div>
            </section>
          </main>

          {/* 우측 사이드바 (25%) — 마켓 오버뷰, 추천, 공지·가이드 */}
          <aside className="min-w-0 lg:col-span-3 flex flex-col gap-3 w-full">
            <HomeSidebar />
            <RecommendedCreators />
            <NoticeAndGuide />
          </aside>
        </div>
        </ChartSymbolProvider>
      </div>
    </>
  );
}
