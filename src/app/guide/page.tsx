"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PenSquare } from "lucide-react";

const STEPS = [
  {
    step: 1,
    emoji: "🚀",
    title: "프랍 트레이딩이란?",
    description:
      "내 돈이 아닌 '프랍사'의 자본으로 거래하고 수익을 나누는 혁신적인 트레이딩 방식입니다.",
    bgClass: "bg-blue-50",
    borderClass: "border-blue-100",
  },
  {
    step: 2,
    emoji: "🎯",
    title: "챌린지의 이해",
    description:
      "실력을 증명하는 '평가 단계'를 거쳐 합격하면 실제 운용 계정을 받습니다.",
    bgClass: "bg-green-50",
    borderClass: "border-green-100",
  },
  {
    step: 3,
    emoji: "🛡️",
    title: "리스크 관리의 핵심",
    description:
      "MDD(최대손실)와 DDD(일일손실)만 지키면 당신도 펀드매니저!",
    bgClass: "bg-amber-50",
    borderClass: "border-amber-100",
  },
  {
    step: 4,
    emoji: "📝",
    title: "PropView 활용법",
    description:
      "매매일지를 써서 포인트를 받고, 그 포인트로 챌린지 할인 쿠폰을 챙기세요.",
    bgClass: "bg-violet-50",
    borderClass: "border-violet-100",
  },
];

export default function GuidePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-[#0B1120]">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto max-w-screen-md px-4 py-8">
          <h1 className="text-2xl font-bold text-foreground dark:text-gray-100 mb-1">
            초보 이용가이드
          </h1>
          <p className="text-sm text-muted-foreground dark:text-gray-400 mb-10">
            프랍 트레이딩, 3분 만에 이해하기
          </p>

          {/* 스텝 카드 섹션 */}
          <div className="space-y-6">
            {STEPS.map((item) => (
              <section
                key={item.step}
                className={`rounded-2xl border-2 ${item.borderClass} ${item.bgClass} p-6 shadow-sm`}
              >
                <div className="flex gap-4 items-start">
                  <span
                    className="text-5xl shrink-0 leading-none"
                    aria-hidden
                  >
                    {item.emoji}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      STEP {item.step}
                    </p>
                    <h2 className="text-xl font-bold text-foreground dark:text-gray-100 mb-2">
                      {item.title}
                    </h2>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              </section>
            ))}
          </div>

          {/* 지금 바로 매매일지 쓰러 가기 CTA */}
          <div className="mt-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-8 text-center text-white shadow-lg">
            <p className="text-lg font-semibold mb-4">
              이제 실천해 보세요!
            </p>
            <Button
              asChild
              size="lg"
              className="h-14 rounded-2xl bg-white px-8 text-blue-600 shadow-md hover:bg-gray-100"
            >
              <Link href="/trading-diary/write" className="gap-2">
                <PenSquare className="h-5 w-5" />
                지금 바로 매매일지 쓰러 가기
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
