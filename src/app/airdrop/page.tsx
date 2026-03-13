"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Gift, FileText, Trophy, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { getLocalCreditsDelta } from "@/lib/diary-storage";

const COUPONS = [
  { id: "1", name: "MUBITE 10% 챌린지 할인 코드", cost: 500, credits: "500 C" },
  { id: "2", name: "PROP W 20% 챌린지 할인 코드", cost: 800, credits: "800 C" },
];

const POINT_GUIDES = [
  { icon: FileText, emoji: "📝", label: "매매일지 작성", points: "+50 P", href: "/trading-diary/write" },
  { icon: Trophy, emoji: "🥇", label: "출금 인증", points: "+300 P", href: "/community?category=profit" },
  { icon: CheckCircle, emoji: "✅", label: "매일 출석체크", points: "+10 P", href: "#" },
];

export default function AirdropPage() {
  const { user, profile } = useAuth();
  const creditsDelta = getLocalCreditsDelta();
  const credits = user ? (profile?.credits ?? 1000) + creditsDelta : 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 bg-gray-50 dark:bg-[#0B1120]">
        <div className="container mx-auto max-w-screen-md px-4 py-8">
          <h1 className="text-2xl font-bold text-foreground dark:text-gray-100 mb-1">에어드롭</h1>
          <p className="text-sm text-muted-foreground dark:text-gray-400 mb-8">할인 쿠폰을 크레딧으로 교환해 프랍 챌린지 비용을 아끼세요.</p>

          {/* 보유 크레딧 배너 (실제 잔액 연동) */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 text-white shadow-lg mb-8 dark:from-emerald-700 dark:to-emerald-800">
            <p className="text-sm font-medium opacity-90">내 보유 크레딧</p>
            <p className="text-3xl font-bold mt-1 flex items-center gap-2 tabular-nums">
              <span aria-hidden>🪙</span> {credits.toLocaleString()} C
            </p>
            <p className="text-sm mt-3 opacity-95 leading-relaxed">
              매매일지를 쓰고 크레딧을 모아 쿠폰으로 교환하세요!
            </p>
          </div>

          {/* 쿠폰 티켓 리스트 (크레딧 C 표기) */}
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-foreground dark:text-gray-100 mb-4">쿠폰 교환</h2>
            <div className="space-y-4">
              {COUPONS.map((coupon) => (
                <div
                  key={coupon.id}
                  className="relative rounded-2xl border-2 border-dashed border-blue-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md dark:border-gray-600 dark:bg-[#111827] dark:hover:border-gray-500"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-blue-100 p-2.5 dark:bg-blue-900/50">
                        <Gift className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground dark:text-gray-100">{coupon.name}</h3>
                        <p className="text-sm text-muted-foreground dark:text-gray-400 mt-0.5">{coupon.credits} 사용</p>
                      </div>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 shrink-0" disabled={credits < coupon.cost}>
                      {credits >= coupon.cost ? "교환하기" : "크레딧 부족"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 포인트 획득 안내 */}
          <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#111827] dark:border dark:border-gray-700">
            <h2 className="text-lg font-semibold text-foreground dark:text-gray-100 mb-4">포인트 획득 안내</h2>
            <div className="space-y-4">
              {POINT_GUIDES.map((item) => {
                const Icon = item.icon;
                const content = (
                  <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-blue-50 p-2 dark:bg-blue-900/50">
                        <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground dark:text-gray-100">
                          {item.emoji} {item.label} ({item.points})
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{item.points}</span>
                  </div>
                );
                return item.href !== "#" ? (
                  <Link key={item.label} href={item.href}>
                    {content}
                  </Link>
                ) : (
                  <div key={item.label}>{content}</div>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
