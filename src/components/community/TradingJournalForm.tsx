"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { createClient } from "@/lib/supabase/client";
import {
  REWARD_TRADING_DIARY_POINTS,
  REWARD_TRADING_DIARY_CREDITS,
} from "@/lib/rewards";
import { notifyTradingDiaryReward, maybeNotifyLevelUp } from "@/lib/notifications";
import {
  LOCAL_DIARY_KEY,
  loadLocalEntries as loadLocalFromStorage,
  saveLocalEntries as saveLocalToStorage,
  setDiaryRefetch,
  addLocalPointsDelta,
  type DiaryEntryItem,
} from "@/lib/diary-storage";
import { useFreshForm } from "@/hooks/useFreshForm";

const QUICK_TAGS = ["#뇌동매매", "#원칙준수", "#추격매수", "#분할익절"] as const;
const MIN_CHARS_FOR_REWARD = 20;
const MAX_DAILY_DIARY_REWARDS = 1;

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getDailyRewardCount(userId: string | undefined): number {
  if (!userId || typeof window === "undefined") return 0;
  try {
    const key = `diary_rewards_count_${userId}_${getTodayKey()}`;
    const raw = localStorage.getItem(key);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

function incrementDailyRewardCount(userId: string | undefined) {
  if (!userId || typeof window === "undefined") return;
  const key = `diary_rewards_count_${userId}_${getTodayKey()}`;
  const n = getDailyRewardCount(userId) + 1;
  localStorage.setItem(key, String(n));
}

function loadLocalEntries(): DiaryEntryItem[] {
  return loadLocalFromStorage();
}

function saveLocalEntries(entries: DiaryEntryItem[]) {
  saveLocalToStorage(entries);
}

export type { DiaryEntryItem } from "@/lib/diary-storage";

export function TradingJournalForm() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const supabase = createClient();

  const [localEntries, setLocalEntries] = useState<DiaryEntryItem[]>([]);
  const [title, setTitle] = useState("");
  const [symbol, setSymbol] = useState("");
  const [position, setPosition] = useState<"long" | "short">("long");
  const [entry, setEntry] = useState("");
  const [tp, setTp] = useState("");
  const [sl, setSl] = useState("");
  const [profit, setProfit] = useState("");
  const [mistake, setMistake] = useState("");
  const [principle, setPrinciple] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setSymbol("");
    setPosition("long");
    setEntry("");
    setTp("");
    setSl("");
    setProfit("");
    setMistake("");
    setPrinciple("");
    setSelectedTags([]);
    setError(null);
  };

  // "글쓰기 창 = 새 도화지" 강제: 페이지 진입 시 무조건 초기화
  useFreshForm(resetForm);

  useEffect(() => {
    setLocalEntries(loadLocalEntries());
  }, []);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const runSuccessFlow = (message: "points" | "saved" | "limit" | "short") => {
    resetForm();
    if (message === "points") showToast("🟡 크레딧과 포인트가 적립되었습니다!");
    else if (message === "limit") showToast("저장되었습니다. (오늘 보상 한도 1회 도달)");
    else if (message === "short") showToast("저장되었습니다. (20자 이상 작성 시 보상)");
    else showToast("매매일지가 저장되었습니다.");
    router.push("/trading-diary");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      title: title.trim(),
      symbol: symbol.trim() || "",
      position,
      entry: entry === "" ? null : Number(entry),
      tp: tp === "" ? null : Number(tp),
      sl: sl === "" ? null : Number(sl),
      profit: profit === "" ? null : Number(profit),
      mistake: mistake.trim() || "",
      principle: principle.trim() || "",
      tags: selectedTags,
      createdAt: new Date().toISOString(),
      userId: user?.id,
    };

    const totalChars =
      payload.title.length +
      payload.symbol.length +
      payload.mistake.length +
      payload.principle.length +
      payload.tags.join(" ").length;
    const eligibleForReward = totalChars >= MIN_CHARS_FOR_REWARD;
    const dailyCount = getDailyRewardCount(user?.id);
    const underDailyLimit = dailyCount < MAX_DAILY_DIARY_REWARDS;
    const grantPoints = eligibleForReward && underDailyLimit && user;

    try {
      if (user) {
        const { error: insertError } = await supabase.from("trading_diary").insert({
          user_id: user.id,
          title: payload.title,
          symbol: payload.symbol || null,
          position: payload.position,
          entry: payload.entry,
          tp: payload.tp,
          sl: payload.sl,
          profit: payload.profit,
          mistake: payload.mistake || null,
          principle: payload.principle || null,
          tags: payload.tags,
        });

        if (!insertError) {
          setDiaryRefetch();
          if (grantPoints) {
            const prevPoints =
              (profile as unknown as { points?: number; point?: number } | null)?.points ??
              (profile as unknown as { points?: number; point?: number } | null)?.point ??
              0;
            const newPoints = prevPoints + REWARD_TRADING_DIARY_POINTS;
            const prevCredits =
              (profile as unknown as { credits?: number; credit?: number } | null)?.credits ??
              (profile as unknown as { credits?: number; credit?: number } | null)?.credit ??
              0;
            const newCredits = prevCredits + REWARD_TRADING_DIARY_CREDITS;
            const { error: updateError } = await supabase
              .from("profiles")
              .update({
                points: newPoints,
                point: newPoints,
                credits: newCredits,
                credit: newCredits,
              })
              .eq("id", user.id);
            if (!updateError) {
              await refreshProfile();
              incrementDailyRewardCount(user.id);
              await notifyTradingDiaryReward(user.id);
              await maybeNotifyLevelUp({
                userId: user.id,
                previousPoints: prevPoints,
                newPoints,
                rankOverride: profile?.rank_override ?? null,
              });
              runSuccessFlow("points");
            } else {
              console.error("[매매일지] 포인트 반영 실패:", updateError?.message, updateError?.code, updateError?.details);
              addLocalPointsDelta(REWARD_TRADING_DIARY_POINTS, REWARD_TRADING_DIARY_CREDITS);
              await refreshProfile();
              runSuccessFlow("points");
            }
          } else if (!eligibleForReward) {
            runSuccessFlow("short");
          } else if (!underDailyLimit) {
            runSuccessFlow("limit");
          } else {
            runSuccessFlow("saved");
          }
          setIsSubmitting(false);
          return;
        }
        console.error("[매매일지] 저장 실패 (DB insert):", insertError?.message, insertError?.code, insertError?.details);
      }

      // API 실패 또는 비로그인: 로컬 스토리지 + 메모리 배열에 저장 (목업 성공)
      const newEntry: DiaryEntryItem = {
        ...payload,
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      };
      const next = [...localEntries, newEntry];
      setLocalEntries(next);
      saveLocalEntries(next);
      setDiaryRefetch();
      if (grantPoints) {
        incrementDailyRewardCount(user?.id);
        addLocalPointsDelta(REWARD_TRADING_DIARY_POINTS, REWARD_TRADING_DIARY_CREDITS);
        await refreshProfile();
        runSuccessFlow("points");
      } else {
        runSuccessFlow(!eligibleForReward ? "short" : !underDailyLimit ? "limit" : "saved");
      }
    } catch (err) {
      console.error("[매매일지] 제출 예외:", err);
      setError("저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mx-auto mb-4 max-w-xl rounded-xl bg-yellow-50 px-4 py-3 text-xs leading-relaxed text-yellow-900">
        <p className="font-semibold">📢 매매일지는 하루 1개까지만 포인트가 지급됩니다.</p>
        <p className="mt-1">
          ⚠️ 무성의한 작성(단순 초성, 의미 없는 내용 등) 적발 시 포인트 회수 및 제재 대상이 될 수 있습니다.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-6">
        {/* 제목 · 종목 · 포지션 카드 */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 루시드 나스닥 롱 익절 복기"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none transition-colors focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">종목명</label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="예: BTCUSDT, NQ1!"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none transition-colors focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">포지션</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPosition("long")}
                  className={`flex-1 rounded-xl border-2 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
                    position === "long"
                      ? "border-rose-500 bg-rose-500 text-white shadow-md shadow-rose-500/25"
                      : "border-gray-200 bg-white text-gray-500 hover:border-rose-200 hover:bg-rose-50/50"
                  }`}
                >
                  LONG
                </button>
                <button
                  type="button"
                  onClick={() => setPosition("short")}
                  className={`flex-1 rounded-xl border-2 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
                    position === "short"
                      ? "border-blue-500 bg-blue-500 text-white shadow-md shadow-blue-500/25"
                      : "border-gray-200 bg-white text-gray-500 hover:border-blue-200 hover:bg-blue-50/50"
                  }`}
                >
                  SHORT
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 가격 정보 카드 */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">가격 정보</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">진입가</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base" aria-hidden>
                  🎯
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">익절가격</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base" aria-hidden>
                  🟢
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={tp}
                  onChange={(e) => setTp(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">손절가격</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base" aria-hidden>
                  🛑
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={sl}
                  onChange={(e) => setSl(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">최종 수익금</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base" aria-hidden>💰</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={profit}
                  onChange={(e) => setProfit(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 복기 섹션 카드 */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">복기</h3>
          <div className="space-y-4">
            <div className="rounded-xl bg-red-50 p-4">
              <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-red-700">
                <AlertCircle className="h-4 w-4" />
                🚨 오늘의 실수
              </label>
              <textarea
                value={mistake}
                onChange={(e) => setMistake(e.target.value)}
                placeholder="실수한 부분을 적어주세요."
                rows={3}
                className="w-full rounded-lg border border-red-100 bg-white px-3 py-2 text-sm outline-none focus:border-red-300 focus:ring-1 focus:ring-red-300"
              />
            </div>
            <div className="rounded-xl bg-emerald-50 p-4">
              <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                <Check className="h-4 w-4" />
                💡 내일의 원칙
              </label>
              <textarea
                value={principle}
                onChange={(e) => setPrinciple(e.target.value)}
                placeholder="한 줄 원칙을 적어주세요."
                rows={3}
                className="w-full rounded-lg border border-emerald-100 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-1 focus:ring-emerald-300"
              />
            </div>
          </div>
        </div>

        {/* 알약 태그 카드 */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="mb-3 text-sm font-medium text-foreground">자주 쓰는 태그</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  selectedTags.includes(tag)
                    ? "bg-blue-500 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* 포인트 / 어뷰징 방지 안내 */}
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-xs leading-relaxed text-yellow-900">
          <p className="mb-1 font-semibold">
            ⚠️ 매매일지 포인트 지급 및 어뷰징 안내
          </p>
          <p>
            포인트 지급: 매매일지 작성 시 포인트는 하루 딱 1개까지만 지급됩니다. (중복 작성은 가능하지만 추가 포인트는 없습니다)
          </p>
          <p className="mt-1">
            어뷰징 경고: 무분별한 도배나 악용이 적발될 경우 포인트 회수 및 게시글 삭제 대상입니다.
          </p>
          <p className="mt-2 text-[11px] text-yellow-800">
            정성스러운 매매일지는 본인의 실력 향상에도 큰 도움이 됩니다. 건강한 커뮤니티를 위해 함께 노력해 주세요!
          </p>
        </div>

        {/* 하단 버튼 */}
        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-xl">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3 pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-14 w-full rounded-2xl bg-blue-600 text-base font-semibold text-white shadow-md hover:bg-blue-700 active:scale-[0.99]"
          >
            {isSubmitting ? "저장 중..." : "매매일지 기록하기"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetForm();
              router.back();
            }}
            className="rounded-xl"
            disabled={isSubmitting}
          >
            취소
          </Button>
        </div>
      </form>
    </>
  );
}
