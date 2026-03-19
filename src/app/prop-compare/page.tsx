"use client";

import { useState, useRef } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PropPricingCard } from "@/components/prop-compare/PropPricingCard";
import { PropRulesPanel } from "@/components/prop-compare/PropRulesPanel";
import { PropReviewSection } from "@/components/prop-compare/PropReviewSection";

type PropId = "mubite" | "propw";

const MUBITE_SPECS = [
  { text: "거래 환경: Bybit / Binance 유동성 기반 플랫폼" },
  { text: "챌린지 타입: 1단계 / 2단계 / Instant(즉시 펀디드) 지원" },
  { text: "레버리지: 최대 1:100 (바이비트 기반)" },
  { text: "손실 규정: 단일 3%, 일일 4~5%, 계정 최대 6~10%" },
  { text: "출금 조건: 챌린지 통과 후 첫 출금 즉시 가능 (이후 14일 주기)" },
];

const PROPW_SPECS = [
  { text: "거래 환경: CoinW 유동성 기반 자체 플랫폼" },
  { text: "챌린지 타입: 스탠다드 / 프로 (1~2단계 검증)" },
  { text: "레버리지: 최대 1:5 (거래쌍별 제한 있음)" },
  { text: "손실 규정: 일일 4~5%, 계정 최대 6~10% (01:00 리셋)" },
  { text: "출금 조건: 최소 100 USDT, 승인 후 7일 주기" },
];

export default function PropComparePage() {
  const [selectedProp, setSelectedProp] = useState<PropId>("mubite");
  const [rulesExpanded, setRulesExpanded] = useState(false);
  const reviewRef = useRef<HTMLElement>(null);
  const rulesRef = useRef<HTMLDivElement>(null);

  const handleSelect = (prop: PropId) => {
    setSelectedProp(prop);
    setRulesExpanded(true);
    reviewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleExpandRules = () => {
    setRulesExpanded((prev) => {
      const next = !prev;
      if (!prev && next) {
        setTimeout(
          () =>
            rulesRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            }),
          100
        );
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto max-w-4xl px-4 py-8">
        {/* 상단 헤더 */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-foreground dark:text-gray-100 md:text-4xl">
            당신에게 맞는 최적의 프랍은?
          </h1>
          <p className="mt-2 text-muted-foreground dark:text-gray-400">
            MUBITE vs PROP W
          </p>
        </div>

        {/* 비교 카드 2개 */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <PropPricingCard
            id="mubite"
            title="MUBITE (무바이트)"
            subtitle="무바이트"
            badge="🟢 한국어지원 & 빠른출금"
            badgeGreen
            specs={MUBITE_SPECS}
            buttonLabel="무바이트 알아보기"
            buttonGreen
            isSelected={selectedProp === "mubite"}
            onSelect={() => handleSelect("mubite")}
            onExpandRules={handleExpandRules}
          />
          <PropPricingCard
            id="propw"
            title="PROP W (프랍더블류)"
            subtitle="프랍더블류"
            badge="🟣 단순한규정 & 초보자적합"
            badgeGreen={false}
            specs={PROPW_SPECS}
            buttonLabel="프랍더블유 알아보기"
            buttonGreen={false}
            isSelected={selectedProp === "propw"}
            onSelect={() => handleSelect("propw")}
            onExpandRules={handleExpandRules}
          />
        </div>

        {/* 상세 규정 보기 & 리뷰 (선택 카드에 따라 동적, 펼침/접힘) */}
        <div ref={rulesRef}>
          <PropRulesPanel selectedProp={selectedProp} isExpanded={rulesExpanded} />
        </div>

        {rulesExpanded && (
          <section ref={reviewRef} aria-label="리뷰 및 댓글">
            <PropReviewSection selectedProp={selectedProp} />
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
