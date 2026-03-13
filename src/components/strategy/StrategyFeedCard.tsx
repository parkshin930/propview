"use client";

import { Medal } from "lucide-react";

interface StrategyFeedCardProps {
  nickname: string;
  totalWithdrawal: string;
  position: "long" | "short";
  entry: string;
  target: string;
  stop: string;
}

export function StrategyFeedCard({
  nickname,
  totalWithdrawal,
  position,
  entry,
  target,
  stop,
}: StrategyFeedCardProps) {
  const isLong = position === "long";

  return (
    <article className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* 상단: 아바타, 닉네임, 누적 출금 뱃지 | 포지션 태그 */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
            {nickname.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground">{nickname}</p>
            <p className="flex items-center gap-1.5 text-xs text-amber-600">
              <Medal className="h-3.5 w-3.5" aria-hidden />
              누적 출금 {totalWithdrawal}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            isLong
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {isLong ? "LONG 🟢" : "SHORT 🔴"}
        </span>
      </div>

      {/* 본문: 차트 썸네일 + 진입/목표/손절 */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="w-full shrink-0 sm:w-48">
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              <span className="text-xs">차트</span>
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-1 text-sm">
          <p className="text-foreground">
            <span className="text-muted-foreground">진입가</span> {entry}
          </p>
          <p className="text-foreground">
            <span className="text-muted-foreground">목표가</span> {target}
          </p>
          <p className="text-foreground">
            <span className="text-muted-foreground">손절가</span> {stop}
          </p>
        </div>
      </div>
    </article>
  );
}
