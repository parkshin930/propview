"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { Button } from "@/components/ui/button";
import { User, Flame, TrendingUp, TrendingDown, Pencil, Coins, Zap } from "lucide-react";
import { getRankLabel } from "@/lib/rewards";
import { getLocalPointsDelta, getLocalCreditsDelta } from "@/lib/diary-storage";
import { createClient } from "@/lib/supabase/client";

const RANKING_TABS = [
  { id: "popular" as const, label: "인기", icon: Flame },
  { id: "gainers" as const, label: "상승", icon: TrendingUp },
  { id: "losers" as const, label: "하락", icon: TrendingDown },
];

const RANK_LIST_POPULAR = [
  { rank: 1, name: "BTC", price: "71,972.37", change: 2.09 },
  { rank: 2, name: "ETH", price: "2,136.14", change: 3.04 },
  { rank: 3, name: "USDT", price: "1.00", change: 0.01 },
  { rank: 4, name: "BNB", price: "612.45", change: 1.62 },
  { rank: 5, name: "XRP", price: "2.18", change: -0.03 },
  { rank: 6, name: "TRX", price: "0.22", change: 0.85 },
  { rank: 7, name: "SOL", price: "168.22", change: 1.21 },
];

const RANK_LIST_GAINERS = [
  { rank: 1, name: "ETH", price: "2,136.14", change: 3.04 },
  { rank: 2, name: "BTC", price: "71,972.37", change: 2.09 },
  { rank: 3, name: "BNB", price: "612.45", change: 1.62 },
  { rank: 4, name: "SOL", price: "168.22", change: 1.21 },
  { rank: 5, name: "XRP", price: "2.18", change: 0.85 },
  { rank: 6, name: "TRX", price: "0.22", change: 0.72 },
  { rank: 7, name: "DOGE", price: "0.38", change: 0.55 },
];

const RANK_LIST_LOSERS = [
  { rank: 1, name: "DOGE", price: "0.38", change: -2.1 },
  { rank: 2, name: "ADA", price: "0.52", change: -1.5 },
  { rank: 3, name: "XRP", price: "2.18", change: -0.03 },
  { rank: 4, name: "AVAX", price: "32.45", change: -0.5 },
  { rank: 5, name: "LINK", price: "14.22", change: -0.2 },
  { rank: 6, name: "TRX", price: "0.22", change: -0.15 },
  { rank: 7, name: "SOL", price: "168.22", change: -0.08 },
];

function getRankList(tab: "popular" | "gainers" | "losers") {
  if (tab === "gainers") return RANK_LIST_GAINERS;
  if (tab === "losers") return RANK_LIST_LOSERS;
  return RANK_LIST_POPULAR;
}

export function HomeSidebar() {
  const { user, profile, isLoading, signOut, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const supabase = createClient();
  const [rankingTab, setRankingTab] = useState<"popular" | "gainers" | "losers">("popular");
  const [editingName, setEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [settingMaster, setSettingMaster] = useState(false);
  const rankList = getRankList(rankingTab);

  const displayName =
    profile?.display_name ?? profile?.full_name ?? user?.email?.split("@")[0] ?? "User";
  const pointsDelta = getLocalPointsDelta();
  const creditsDelta = getLocalCreditsDelta();
  const points = user ? (profile?.points ?? 5000) + pointsDelta : 0;
  const credits = user ? (profile?.credits ?? 1000) + creditsDelta : 0;
  const rankLabel = user ? "마스터" : getRankLabel(points, profile?.rank_override);
  const showCrown = !!user;
  const [, setPointsTick] = useState(0);
  useEffect(() => {
    const onUpdate = () => setPointsTick((n) => n + 1);
    window.addEventListener("diary-points-updated", onUpdate);
    return () => window.removeEventListener("diary-points-updated", onUpdate);
  }, []);

  const startEditName = () => {
    setEditNameValue(displayName);
    setEditingName(true);
  };

  const saveName = async () => {
    if (!user) return;
    const value = editNameValue.trim() || null;
    const lastChange = profile?.last_nickname_change_date;
    if (lastChange) {
      const last = new Date(lastChange);
      const nextAllowed = new Date(last);
      nextAllowed.setDate(nextAllowed.getDate() + 30);
      if (new Date() < nextAllowed) {
        const d = nextAllowed;
        showToast(`닉네임은 월 1회만 변경 가능합니다. 다음 변경 가능일은 ${d.getMonth() + 1}월 ${d.getDate()}일입니다.`);
        setEditingName(false);
        return;
      }
    }
    setSavingName(true);
    const updatePayload: { display_name: string | null; last_nickname_change_date?: string } = {
      display_name: value,
    };
    updatePayload.last_nickname_change_date = new Date().toISOString();
    const { error } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", user.id)
      .select("id, display_name, full_name, last_nickname_change_date")
      .single();
    setSavingName(false);
    setEditingName(false);
    if (error) {
      console.error("[닉네임 변경] 실패:", error.message, error.code, error.details);
      showToast("닉네임 변경에 실패했습니다. 프로필 테이블에 display_name 컬럼이 있는지 확인해 주세요.");
      return;
    }
    showToast("닉네임이 변경되었습니다.");
    await refreshProfile();
  };

  const setMasterForTest = async () => {
    if (!user) return;
    setSettingMaster(true);
    const { error } = await supabase
      .from("profiles")
      .update({ rank_override: "마스터" })
      .eq("id", user.id);
    setSettingMaster(false);
    if (!error) await refreshProfile();
  };

  return (
    <aside className="flex flex-col gap-6 w-full">
      {/* 회원 프로필 카드 */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-[#1f2937] dark:bg-[#111827] w-full">
        <div className="flex flex-col items-center gap-4">
          {!isLoading && user ? (
            <>
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="h-14 w-14 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2d9d78] text-white">
                  <User className="h-7 w-7" />
                </div>
              )}
              <div className="w-full text-center">
                <div className="flex items-center justify-center gap-1.5">
                  {editingName ? (
                    <div className="flex items-center gap-1 w-full justify-center">
                      <input
                        type="text"
                        value={editNameValue}
                        onChange={(e) => setEditNameValue(e.target.value)}
                        className="w-32 rounded border border-border px-2 py-1 text-sm"
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && saveName()}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2"
                        onClick={saveName}
                        disabled={savingName}
                      >
                        {savingName ? "..." : "확인"}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <p className="font-semibold text-foreground dark:text-gray-100">
                        {displayName}
                        {showCrown && (
                          <span className="ml-1 inline-block text-lg" aria-label="마스터" title="마스터">👑</span>
                        )}
                      </p>
                      <button
                        type="button"
                        onClick={startEditName}
                        className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label="닉네임 수정"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{rankLabel}</p>
                <div className="mt-3 flex flex-col gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-2 text-left">
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span className="text-muted-foreground">내 포인트</span>
                    <span className="font-semibold text-foreground tabular-nums">{points} P</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Coins className="h-4 w-4 text-emerald-500" />
                    <span className="text-muted-foreground">내 크레딧</span>
                    <span className="font-semibold text-foreground tabular-nums">{credits} C</span>
                  </div>
                </div>
                {profile?.rank_override !== "마스터" && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-2 w-full text-xs text-muted-foreground"
                    onClick={setMasterForTest}
                    disabled={settingMaster}
                  >
                    {settingMaster ? "설정 중..." : "테스트: 마스터 등급 👑 적용"}
                  </Button>
                )}
              </div>
                <Button
                variant="outline"
                size="sm"
                className="w-full border-gray-200 text-sm dark:border-gray-600 dark:text-gray-100"
                onClick={() => signOut()}
              >
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500">
                <User className="h-7 w-7" />
              </div>
              <div className="w-full text-center">
                <p className="text-sm text-muted-foreground">로그인하고 포인트를 받아가세요</p>
              </div>
              <Button asChild className="w-full bg-[#2d9d78] text-sm font-medium text-white hover:bg-[#258f6a]">
                <Link href="/auth">로그인</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 자산 변동 랭킹 카드 */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm dark:border-[#1f2937] dark:bg-[#111827] w-full">
        <div className="flex border-b border-gray-100 dark:border-gray-700">
          {RANKING_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === rankingTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRankingTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors hover:text-foreground dark:hover:text-gray-100 ${
                  isActive
                    ? "border-b-2 border-[#2d9d78] text-foreground dark:text-gray-100"
                    : "text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
        <ul className="divide-y divide-gray-50 p-3 dark:divide-gray-700">
          {rankList.map((row) => (
            <li
              key={row.rank}
              className="flex items-center justify-between gap-2 py-2.5 text-sm"
            >
              <span className="w-5 shrink-0 font-medium text-muted-foreground">
                {row.rank}
              </span>
              <span className="min-w-0 flex-1 font-medium text-foreground dark:text-gray-100">
                {row.name}
              </span>
              <span className="shrink-0 text-right tabular-nums text-foreground dark:text-gray-100">
                {row.price}
              </span>
              <span
                className={`w-14 shrink-0 text-right tabular-nums font-medium ${
                  row.change >= 0 ? "text-green-500 dark:text-up" : "text-red-500 dark:text-down"
                }`}
              >
                {row.change >= 0 ? "+" : ""}
                {row.change}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
