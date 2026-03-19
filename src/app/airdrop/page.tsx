"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Gift, FileText, Trophy, CheckCircle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { getLocalCreditsDelta } from "@/lib/diary-storage";
import { createClient } from "@/lib/supabase/client";

interface AirdropPrize {
  id: string;
  name: string;
  cost: number;
  slots: number;
}

const PRIZES: AirdropPrize[] = [
  { id: "chicken", name: "치킨 기프티콘 (1명)", cost: 100, slots: 1 },
  { id: "coffee", name: "커피 기프티콘 (3명)", cost: 100, slots: 3 },
  { id: "discount_mubite", name: "Mubite 20% 할인권 (5명)", cost: 100, slots: 5 },
  { id: "discount_propw", name: "PropW 20% 할인권 (5명)", cost: 100, slots: 5 },
];

const CREDIT_GUIDES = [
  { emoji: "💰", label: "출금 인증", detail: "+500C (관리자 승인 시)" },
  { emoji: "📝", label: "매매일지", detail: "+50C (일 1회)" },
  { emoji: "✅", label: "7일 연속 출석", detail: "+100C (보너스)" },
  { emoji: "🏆", label: "전략왕(주간/당일)", detail: "최대 +300C" },
  { emoji: "📅", label: "일반 출석", detail: "+10C" },
];

export default function AirdropPage() {
  const { user, profile } = useAuth();
  const creditsDelta = getLocalCreditsDelta();
  const supabase = createClient();
  const [latestWinners, setLatestWinners] = useState<string | null>(null);
  const [submittingPrizeId, setSubmittingPrizeId] = useState<string | null>(null);

  const credits = useMemo(
    () => {
      const baseCredits =
        (profile as unknown as { credits?: number; credit?: number } | null)?.credits ??
        (profile as unknown as { credits?: number; credit?: number } | null)?.credit ??
        0;
      return user ? baseCredits + creditsDelta : 0;
    },
    [user, profile, creditsDelta]
  );

  useEffect(() => {
    const loadWinners = async () => {
      try {
        const { data, error } = await supabase
          .from("airdrop_rounds")
          .select("summary_text")
          .order("draw_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!error && data?.summary_text) {
          setLatestWinners(data.summary_text);
        }
      } catch (e) {
        console.error("에어드랍 당첨자 조회 실패:", e);
      }
    };
    loadWinners();
  }, [supabase]);

  const handleEnter = async (prize: AirdropPrize) => {
    if (!user) return;
    if (credits < prize.cost) return;
    if (submittingPrizeId) return;
    setSubmittingPrizeId(prize.id);
    try {
      const { data: profileRow, error: profileError } = await supabase
        .from("profiles")
        .select("credits, credit, display_name, full_name")
        .eq("id", user.id)
        .single();
      if (profileError || !profileRow) {
        console.error("프로필 조회 실패:", profileError);
        return;
      }
      const currentCredits = (profileRow as { credits?: number; credit?: number }).credits
        ?? (profileRow as { credits?: number; credit?: number }).credit
        ?? 0;
      if (currentCredits < prize.cost) {
        return;
      }
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          credits: currentCredits - prize.cost,
          credit: currentCredits - prize.cost,
        })
        .eq("id", user.id);
      if (updateError) {
        console.error("크레딧 차감 실패:", updateError);
        return;
      }
      await supabase.from("airdrop_entries").insert({
        prize_id: prize.id,
        user_id: user.id,
      });
    } catch (e) {
      console.error("에어드랍 응모 실패:", e);
    } finally {
      setSubmittingPrizeId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 bg-gray-50 dark:bg-[#0B1120]">
        <div className="container mx-auto max-w-screen-md px-4 py-8">
          <h1 className="text-2xl font-bold text-foreground dark:text-gray-100 mb-1">에어드롭</h1>
          <p className="text-sm text-muted-foreground dark:text-gray-400 mb-2">
            에어드랍 샵에서 보유 크레딧으로 상품 응모권을 획득하세요.
          </p>
          {latestWinners && (
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mb-6 font-medium">
              지난주 당첨자: {latestWinners}
            </p>
          )}

          {/* 보유 크레딧 배너 (실제 잔액 연동) */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 text-white shadow-lg mb-8 dark:from-emerald-700 dark:to-emerald-800">
            <p className="text-sm font-medium opacity-90">내 보유 크레딧</p>
            <p className="text-3xl font-bold mt-1 flex items-center gap-2 tabular-nums">
              <span aria-hidden>🪙</span> {credits.toLocaleString()} C
            </p>
            <p className="text-sm mt-3 opacity-95 leading-relaxed">
              매매일지, 출금 인증, 출석으로 크레딧을 모아 다양한 상품에 응모해 보세요.
            </p>
          </div>

          {/* 상품 응모 리스트 */}
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-foreground dark:text-gray-100 mb-4">이번 주 에어드랍 상품</h2>
            <div className="space-y-4">
              {PRIZES.map((prize) => (
                <div
                  key={prize.id}
                  className="relative rounded-2xl border-2 border-dashed border-blue-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md dark:border-gray-600 dark:bg-[#111827] dark:hover:border-gray-500"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-blue-100 p-2.5 dark:bg-blue-900/50">
                        <Gift className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground dark:text-gray-100">
                          {prize.name}
                        </h3>
                        <p className="text-sm text-muted-foreground dark:text-gray-400 mt-0.5">
                          응모권 1장당 {prize.cost.toLocaleString()}C 소모 · 중복 응모 가능
                        </p>
                      </div>
                    </div>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 shrink-0"
                      disabled={!user || credits < prize.cost || submittingPrizeId === prize.id}
                      onClick={() => handleEnter(prize)}
                    >
                      {!user
                        ? "로그인 필요"
                        : credits < prize.cost
                        ? "크레딧 부족"
                        : submittingPrizeId === prize.id
                        ? "응모 중..."
                        : "응모하기"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 크레딧 획득 방법 안내 */}
          <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm dark:bg-[#111827] dark:border dark:border-gray-700">
            <h2 className="text-lg font-semibold text-foreground dark:text-gray-100 mb-4">
              크레딧 획득 방법
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {CREDIT_GUIDES.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-lg dark:bg-emerald-900/40">
                      <span aria-hidden>{item.emoji}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground dark:text-gray-100">
                        {item.label}
                      </p>
                      <p className="text-xs text-muted-foreground dark:text-gray-400">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
