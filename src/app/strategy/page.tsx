"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OfficialBriefingCard } from "@/components/strategy/OfficialBriefingCard";
import { StrategyFeedCard } from "@/components/strategy/StrategyFeedCard";
import { MarketSentimentCard } from "@/components/strategy/MarketSentimentCard";
import { TopTraderRanking } from "@/components/strategy/TopTraderRanking";

const MOCK_STRATEGIES = [
  {
    id: "1",
    nickname: "트레이더김",
    totalWithdrawal: "$50,000",
    position: "long" as const,
    entry: "71,200",
    target: "73,500",
    stop: "70,500",
  },
  {
    id: "2",
    nickname: "코인매니아",
    totalWithdrawal: "$32,000",
    position: "short" as const,
    entry: "72,000",
    target: "69,000",
    stop: "73,200",
  },
  {
    id: "3",
    nickname: "프랍마스터",
    totalWithdrawal: "$28,500",
    position: "long" as const,
    entry: "70,800",
    target: "74,000",
    stop: "70,000",
  },
];

export default function StrategyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto max-w-screen-xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">오늘의 전략</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            출금 인증 상위 트레이더의 프리미엄 뷰
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[7fr_3fr]">
          {/* 좌측 메인 피드 70% */}
          <section className="min-w-0 space-y-6">
            {/* 최상단: 비트신 공식 브리핑 */}
            <OfficialBriefingCard />

            {/* 인증 트레이더 전략 카드 피드 */}
            <div className="space-y-4">
              {MOCK_STRATEGIES.map((s) => (
                <StrategyFeedCard
                  key={s.id}
                  nickname={s.nickname}
                  totalWithdrawal={s.totalWithdrawal}
                  position={s.position}
                  entry={s.entry}
                  target={s.target}
                  stop={s.stop}
                />
              ))}
            </div>
          </section>

          {/* 우측 사이드바 30% */}
          <aside className="flex min-w-0 flex-col gap-6">
            <MarketSentimentCard />
            <TopTraderRanking />
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
