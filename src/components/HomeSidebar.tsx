"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { useTheme } from "@/components/ThemeProvider";
import { CHART_SYMBOLS } from "@/components/TradingViewChart";
import { Button } from "@/components/ui/button";
import { User, Pencil, Coins, Zap, Gift } from "lucide-react";
import { getStarIcons, getStarLabel } from "@/lib/rewards";
import { getLocalPointsDelta, getLocalCreditsDelta } from "@/lib/diary-storage";
import { createClient } from "@/lib/supabase/client";
import { AttendanceWidget } from "@/components/AttendanceWidget";

const TV_MARKET_OVERVIEW_SCRIPT = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";

const MARKET_OVERVIEW_SYMBOLS = CHART_SYMBOLS.map((s) => ({ s: s.id }));

/** 20위권 출금 랭킹 높이에 맞춘 마켓 오버뷰 높이 */
const WIDGET_HEIGHT = 480;

function getMarketOverviewConfig(colorTheme: "light" | "dark") {
  const isDark = colorTheme === "dark";
  return {
    title: "Crypto",
    title_raw: "Crypto",
    tabs: [{ title: "Overview", title_raw: "Overview", symbols: MARKET_OVERVIEW_SYMBOLS }],
    width: "100%",
    height: WIDGET_HEIGHT,
    showChart: false,
    showFloatingTooltip: true,
    locale: "en",
    colorTheme,
    showSymbolLogo: true,
    symbolActiveColor: "rgba(41, 98, 255, 0.12)",
    plotLineColorGrowing: "#26A69A",
    plotLineColorFalling: "#F23645",
    belowLineFillColorGrowing: "rgba(38, 166, 154, 0.12)",
    belowLineFillColorFalling: "rgba(246, 54, 69, 0.12)",
    belowLineFillColorGrowingBottom: "rgba(38, 166, 154, 0)",
    belowLineFillColorFallingBottom: "rgba(246, 54, 69, 0)",
    gridLineColor: isDark ? "rgba(42, 46, 57, 0.6)" : "rgba(240, 243, 250, 0.8)",
    scaleFontColor: isDark ? "rgba(134, 137, 147, 1)" : "rgba(120, 123, 134, 1)",
  };
}

export function HomeSidebar() {
  const { theme } = useTheme();
  const { user, profile, isLoading, signOut } = useAuth();
  const { showToast } = useToast();
  const supabase = createClient();
  const colorTheme = theme === "dark" ? "dark" : "light";
  const marketOverviewRef = useRef<HTMLDivElement>(null);

  const displayName =
    profile?.display_name ?? profile?.full_name ?? user?.email?.split("@")[0] ?? "User";
  const pointsDelta = getLocalPointsDelta();
  const creditsDelta = getLocalCreditsDelta();
  const basePoints =
    (profile as unknown as { points?: number; point?: number } | null)?.points ??
    (profile as unknown as { points?: number; point?: number } | null)?.point ??
    0;
  const baseCredits =
    (profile as unknown as { credits?: number; credit?: number } | null)?.credits ??
    (profile as unknown as { credits?: number; credit?: number } | null)?.credit ??
    0;
  const points = user ? basePoints + pointsDelta : 0;
  const credits = user ? baseCredits + creditsDelta : 0;
  const starLabel = getStarLabel(points);
  const starIcons = getStarIcons(points);
  const isAdminUser = profile?.role === "admin";
  const isCertified = !!(
    (profile as (typeof profile & { is_certified?: boolean }) | null)?.is_certified ??
    profile?.is_verified
  );
  const [, setPointsTick] = useState(0);
  useEffect(() => {
    const onUpdate = () => setPointsTick((n) => n + 1);
    window.addEventListener("diary-points-updated", onUpdate);
    return () => window.removeEventListener("diary-points-updated", onUpdate);
  }, []);

  useEffect(() => {
    const container = marketOverviewRef.current;
    if (!container) return;
    container.innerHTML = "";
    const config = getMarketOverviewConfig(colorTheme);
    const wrapper = document.createElement("div");
    wrapper.className = "tradingview-widget-container";
    wrapper.style.cssText = `height:${WIDGET_HEIGHT}px;width:100%;background:transparent;`;
    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = "100%";
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = TV_MARKET_OVERVIEW_SCRIPT;
    script.async = true;
    script.textContent = JSON.stringify(config);
    wrapper.appendChild(widgetDiv);
    wrapper.appendChild(script);
    container.appendChild(wrapper);
    return () => { container.innerHTML = ""; };
  }, [colorTheme]);

  return (
    <aside className="flex flex-col gap-4 w-full">
      {/* 회원 프로필 카드 + 퀵 링크 */}
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-900 w-full">
        {/* 상단: 좌측 보상함, 우측 로그아웃 (프로필을 가리지 않도록 상단 바에 정렬) */}
        {!isLoading && user && (
          <div className="mb-2 flex w-full items-center justify-between">
            <Link
              href="/vault"
              className="inline-flex h-7 items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-3 text-[11px] font-semibold text-amber-700 shadow-sm hover:bg-amber-100 dark:border-amber-500/60 dark:bg-amber-900/30 dark:text-amber-200"
            >
              <Gift className="h-3.5 w-3.5" />
              보상함
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="h-7 rounded-full border-gray-200 px-3 text-[11px] dark:border-gray-600 dark:text-gray-100"
              onClick={() => signOut()}
            >
              로그아웃
            </Button>
          </div>
        )}
        <div className="flex flex-col items-center gap-3 mt-1">
          {!isLoading && user ? (
            <>
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="h-11 w-11 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2d9d78] text-white">
                  <User className="h-6 w-6" />
                </div>
              )}
              <div className="w-full text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <p className="font-semibold text-foreground dark:text-gray-100 flex items-center flex-wrap gap-1">
                    <span className="flex items-center gap-0.5">
                      {isCertified && !isAdminUser && (
                        <span
                          className="shrink-0 text-xs"
                          aria-label="출금 인증"
                          title="출금 인증"
                        >
                          🔰
                        </span>
                      )}
                      {displayName}
                    </span>
                    {isAdminUser ? (
                      <span className="text-xs font-semibold text-black dark:text-white ml-0.5 flex items-center gap-1" aria-label="관리자">
                        💎 관리자
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-yellow-500 ml-0.5 flex items-center gap-0.5">
                        <span aria-label="등급" className="text-yellow-400">
                          {starIcons}
                        </span>
                        <span className="text-[11px] text-muted-foreground dark:text-gray-400">
                          {starLabel}
                        </span>
                      </span>
                    )}
                  </p>
                </div>
                <div className="mt-2 flex flex-col gap-1 rounded-lg border border-border bg-muted/30 px-2.5 py-2 text-left text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-muted-foreground">포인트</span>
                    </div>
                    <span className="font-semibold text-foreground tabular-nums">{points} P</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Coins className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-muted-foreground">크레딧</span>
                    </div>
                    <span className="font-semibold text-foreground tabular-nums">{credits} C</span>
                  </div>
                </div>
              </div>
              {/* 퀵 링크 행 (프로필 박스 안) */}
              <div className="mt-2 w-full rounded-lg border border-gray-200 bg-white text-xs dark:border-gray-700 dark:bg-gray-800">
                <div className="grid grid-cols-3 divide-x divide-gray-200 text-center dark:divide-gray-700">
                  <Link
                    href={user ? "/my-activity" : "/auth"}
                    className="px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-l-lg transition-colors"
                  >
                    <span className="block text-[11px] font-medium text-foreground dark:text-gray-100">
                      내가 쓴 글
                    </span>
                  </Link>
                  <Link
                    href={user ? "/my-activity" : "/auth"}
                    className="px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="block text-[11px] font-medium text-foreground dark:text-gray-100">
                      내 댓글
                    </span>
                  </Link>
                  <Link
                    href={user ? "/mypage" : "/auth"}
                    className="px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-r-lg transition-colors"
                  >
                    <span className="block text-[11px] font-medium text-foreground dark:text-gray-100">
                      마이페이지
                    </span>
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500">
                <User className="h-6 w-6" />
              </div>
              <div className="w-full text-center">
                <p className="text-xs text-muted-foreground">로그인하고 포인트를 받아가세요</p>
              </div>
              <Button asChild className="w-full bg-[#2d9d78] text-xs font-medium text-white hover:bg-[#258f6a]">
                <Link href="/auth">로그인</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 주간 출석 체크 위젯 */}
      <AttendanceWidget />

      {/* 우측 시세판: TradingView Market Overview (테마 연동) */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-[#1f2937] dark:bg-[#0B1120] w-full overflow-hidden">
        <div className="border-b border-gray-200 px-4 py-2 dark:border-gray-800">
          <p className="text-sm font-semibold text-foreground dark:text-gray-100">마켓 오버뷰</p>
        </div>
        <div className="max-h-[min(480px,55vh)] overflow-y-auto">
          <div ref={marketOverviewRef} className="p-2 w-full" style={{ minHeight: WIDGET_HEIGHT }} />
        </div>
      </div>
    </aside>
  );
}
