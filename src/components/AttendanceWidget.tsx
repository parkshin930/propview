"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { createClient } from "@/lib/supabase/client";
import { notifyActivityReward } from "@/lib/notifications";

const BASE_DAILY_POINTS = 10;
const BASE_DAILY_CREDITS = 10;
const STREAK_BONUS_POINTS = 100;
const STREAK_BONUS_CREDITS = 100;

type WeekDayKey = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Mon=0 ... Sun=6

interface AttendanceRow {
  attended_date: string; // YYYY-MM-DD
}

function getWeekRange(date: Date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun,1=Mon...
  const diffToMonday = (day + 6) % 7; // Mon=0,... Sun=6
  const monday = new Date(d);
  monday.setDate(d.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { monday, sunday };
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const WEEK_LABELS: { key: WeekDayKey; label: string }[] = [
  { key: 0, label: "월" },
  { key: 1, label: "화" },
  { key: 2, label: "수" },
  { key: 3, label: "목" },
  { key: 4, label: "금" },
  { key: 5, label: "토" },
  { key: 6, label: "일" },
];

export function AttendanceWidget() {
  const { user, profile, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState<Record<WeekDayKey, boolean>>({
    0: false,
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
  });

  // 오늘 날짜는 마운트 시 한 번만 계산해서 고정
  const [today] = useState(() => new Date());
  const { monday, sunday } = useMemo(() => getWeekRange(today), [today]);
  const todayKey: WeekDayKey = ((today.getDay() + 6) % 7) as WeekDayKey;
  const todayStr = formatDate(today);

  const hasAttendedToday = days[todayKey] === true;
  const attendedCount = WEEK_LABELS.filter(({ key }) => days[key]).length;

  // 출석 데이터는 로그인된 유저 기준으로 주간 1회 로딩
  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("attendance_logs")
          .select<"attended_date", AttendanceRow>("attended_date")
          .eq("user_id", user.id)
          .gte("attended_date", formatDate(monday))
          .lte("attended_date", formatDate(sunday));

        if (error) {
          console.error("[attendance] load error:", error);
          return;
        }

        const next: Record<WeekDayKey, boolean> = {
          0: false,
          1: false,
          2: false,
          3: false,
          4: false,
          5: false,
          6: false,
        };

        (data || []).forEach((row) => {
          const d = new Date(row.attended_date);
          const key = ((d.getDay() + 6) % 7) as WeekDayKey;
          next[key] = true;
        });

        setDays(next);
      } catch (e) {
        console.error("[attendance] load unexpected error:", e);
      } finally {
        setLoading(false);
      }
    };

    void load();
    // user.id가 바뀌었을 때만 다시 호출되도록 고정
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleAttend = async () => {
    if (!user || loading) return;
    if (hasAttendedToday) return;
    setLoading(true);
    try {
      // 중복 방지: 먼저 오늘 출석 여부 재확인
      const { data: existing, error: existError } = await supabase
        .from("attendance_logs")
        .select("id")
        .eq("user_id", user.id)
        .eq("attended_date", todayStr)
        .maybeSingle();
      if (!existError && existing) {
        showToast("이미 오늘 출석을 완료했습니다.");
        setDays((prev) => ({ ...prev, [todayKey]: true }));
        return;
      }

      const isLastDayBeforeBonus = attendedCount === 6; // 오늘 포함하면 7일째
      const pointDelta =
        BASE_DAILY_POINTS + (isLastDayBeforeBonus ? STREAK_BONUS_POINTS : 0);
      const creditDelta =
        BASE_DAILY_CREDITS + (isLastDayBeforeBonus ? STREAK_BONUS_CREDITS : 0);

      const { error: insertError } = await supabase.from("attendance_logs").insert({
        user_id: user.id,
        attended_date: todayStr,
      });
      if (insertError) {
        console.error("[attendance] insert error:", insertError);
        showToast("출석 체크에 실패했습니다. 다시 시도해주세요.");
        return;
      }

      const prevPoints =
        (profile as unknown as { points?: number; point?: number } | null)?.points ??
        (profile as unknown as { points?: number; point?: number } | null)?.point ??
        0;
      const prevCredits =
        (profile as unknown as { credits?: number; credit?: number } | null)?.credits ??
        (profile as unknown as { credits?: number; credit?: number } | null)?.credit ??
        0;
      const newPoints = prevPoints + pointDelta;
      const newCredits = prevCredits + creditDelta;

      const { error: updError } = await supabase
        .from("profiles")
        .update({
          points: newPoints,
          point: newPoints,
          credits: newCredits,
          credit: newCredits,
        })
        .eq("id", user.id);
      if (updError) {
        console.error("[attendance] profile update error:", updError);
      }

      await refreshProfile();
      setDays((prev) => ({ ...prev, [todayKey]: true }));

      if (isLastDayBeforeBonus) {
        showToast("일주일 개근 보너스까지 지급되었습니다! 🎉");
        await notifyActivityReward({
          userId: user.id,
          message: "일주일 개근 보너스 100C가 추가 지급되었습니다!",
          link: "/community",
        });
      } else {
        showToast("오늘 출석 완료! 10P / 10C가 지급되었습니다.");
        await notifyActivityReward({
          userId: user.id,
          message: "출석체크 보상 10C가 지급되었습니다.",
          link: "/community",
        });
      }
    } catch (e) {
      console.error("[attendance] unexpected error:", e);
      showToast("출석 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const titleText = hasAttendedToday
    ? "오늘 출석 완료! 내일도 만나요."
    : "아직 출석 전이네요. 출석하고 크레딧 받아가세요!";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gradient-to-br dark:from-gray-900 dark:via-slate-900 dark:to-indigo-900/30">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-foreground dark:text-gray-100">
          주간 출석 체크
        </div>
        <Button
          size="xs"
          variant="outline"
          disabled={!user || hasAttendedToday || loading}
          onClick={handleAttend}
          className="h-7 px-2 text-xs border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        >
          {hasAttendedToday ? "오늘 완료" : loading ? "처리 중..." : "지금 출석하기"}
        </Button>
      </div>
      <p className="mb-3 text-xs text-muted-foreground dark:text-gray-300">
        {titleText}
      </p>
      <div className="relative mt-2 flex items-center justify-between">
        {/* 연결선 */}
        <div className="pointer-events-none absolute left-[10px] right-[10px] top-1/2 h-px -translate-y-1/2 bg-gray-200/70 dark:bg-indigo-700/40" />
        {WEEK_LABELS.map(({ key, label }, idx) => {
          const active = days[key];
          const isLast = idx === WEEK_LABELS.length - 1;
          const baseCircle =
            "flex items-center justify-center rounded-full border text-[11px] font-medium relative z-10 transition-all duration-200";
          const sizeClass = isLast ? "h-8 w-8" : "h-7 w-7";
          const activeClass = active
            ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-transparent shadow-[0_0_10px_rgba(59,130,246,0.7)]"
            : "bg-white text-gray-500 border-gray-300 dark:bg-slate-900/70 dark:text-gray-300 dark:border-slate-700";
          const bonusGlow =
            isLast && active
              ? "shadow-[0_0_15px_rgba(234,179,8,0.4)] ring-1 ring-amber-400/60"
              : isLast
              ? "ring-1 ring-amber-400/30"
              : "";
          return (
            <div key={key} className="flex flex-col items-center gap-1">
              <div
                className={`${baseCircle} ${sizeClass} ${activeClass} ${bonusGlow}`}
              >
                {label}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground dark:text-gray-500">
        월요일 00:00 기준으로 한 주가 새로 시작됩니다.
      </p>
    </div>
  );
}

