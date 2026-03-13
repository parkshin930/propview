"use client";

import { useState, useRef } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PropPricingCard } from "@/components/prop-compare/PropPricingCard";
import { PropRulesPanel } from "@/components/prop-compare/PropRulesPanel";
import { PropReviewSection } from "@/components/prop-compare/PropReviewSection";

type PropId = "mubite" | "propw";

const MUBITE_SPECS = [
  { text: "출금: 첫 출금 즉시 / 이후 14일 주기 (영업일 1시간 내 처리 ⚡)" },
  { text: "평가 기간: 무제한 (30일 미접속만 주의)" },
  { text: "챌린지: 1단계 / 2단계 / 인스턴트 펀딩 지원" },
  { text: "레버리지: 최대 1:100 (바이비트 기반)" },
  { text: "규정: 투명한 금지 규정 (억울한 탈락 없음)" },
];

const PROPW_SPECS = [
  { text: "출금: 평가 통과 후 5~7 영업일 (첫 출금 검토)" },
  { text: "평가 기간: 30일 (연장 옵션 있음)" },
  { text: "챌린지: 1단계 / 2단계 (인스턴트 미지원)" },
  { text: "레버리지: 최대 1:50" },
  { text: "규정: 표준 규정 (일부 스캘핑 제한)" },
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
    setRulesExpanded(true);
    setTimeout(() => rulesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
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
            badge="투명한 규정 & 빠른 출금"
            badgeGreen
            specs={MUBITE_SPECS}
            buttonLabel="무바이트 챌린지 시작하기"
            buttonGreen
            isSelected={selectedProp === "mubite"}
            onSelect={() => handleSelect("mubite")}
            onExpandRules={handleExpandRules}
          />
          <PropPricingCard
            id="propw"
            title="PROP W (프랍더블류)"
            subtitle="프랍더블류"
            badge="저렴한 입문 & 한국어 지원"
            badgeGreen={false}
            specs={PROPW_SPECS}
            buttonLabel="프랍더블류 알아보기"
            buttonGreen={false}
            isSelected={selectedProp === "propw"}
            onSelect={() => handleSelect("propw")}
            onExpandRules={handleExpandRules}
          />
        </div>

        {/* 상세 규정 보기 (선택 카드에 따라 동적, 펼침/접힘) */}
        <div ref={rulesRef}>
          <PropRulesPanel selectedProp={selectedProp} isExpanded={rulesExpanded} />
        </div>

        {/* 하단 상세 리뷰 & 댓글 (선택 카드에 따라 동적) */}
        <section ref={reviewRef} aria-label="리뷰 및 댓글">
          <PropReviewSection selectedProp={selectedProp} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
