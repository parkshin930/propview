"use client";

import { StrategyFeedCard } from "@/components/strategy/StrategyFeedCard";
import type { StrategyPost } from "@/types/database";
import { Sparkles } from "lucide-react";

interface TodayBestSectionProps {
  /** 오늘 작성된 글 중 좋아요 1위 (없으면 null) */
  bestPost: StrategyPost | null;
  likedPostIds: Set<string>;
  onLikeChange: () => void;
  loading?: boolean;
}

function getTodayStartUTC(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

export function TodayBestSection({
  bestPost,
  likedPostIds,
  onLikeChange,
  loading = false,
}: TodayBestSectionProps) {
  if (loading) {
    return (
      <div className="rounded-xl border-2 border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20 p-6">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 mb-4">
          <Sparkles className="h-5 w-5" aria-hidden />
          <h2 className="text-lg font-bold">오늘의 베스트 전략</h2>
        </div>
        <p className="text-sm text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  if (!bestPost) {
    return (
      <div className="rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 dark:border-amber-800 p-8 text-center">
        <div className="flex justify-center mb-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 dark:bg-amber-900/40 px-4 py-1.5 text-sm font-semibold text-amber-800 dark:text-amber-200">
            <Sparkles className="h-4 w-4" aria-hidden />
            오늘의 베스트 전략
          </span>
        </div>
        <p className="text-base text-foreground leading-relaxed max-w-md mx-auto">
          오늘의 베스트 전략을 기다리고 있습니다!
          <br />
          <span className="text-amber-700 dark:text-amber-300 font-medium">
            🔰 인증 유저라면 전략을 공유해보세요.
          </span>
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          출금 인증을 완료한 유저만 글을 쓸 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" aria-hidden />
        <h2 className="text-lg font-bold text-amber-800 dark:text-amber-200">
          오늘의 베스트 전략
        </h2>
        <span className="rounded-full bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 text-xs font-semibold px-2.5 py-0.5">
          실시간 좋아요 1위
        </span>
      </div>
      <StrategyFeedCard
        post={bestPost}
        isLiked={likedPostIds.has(bestPost.id)}
        likeCount={bestPost.likes}
        onLikeChange={onLikeChange}
      />
    </div>
  );
}

/** 오늘(UTC) 작성된 글 중 좋아요 1위 추출 */
export function getTodayBestPost(posts: StrategyPost[]): StrategyPost | null {
  const todayStart = getTodayStartUTC();
  const todayPosts = posts.filter((p) => p.created_at >= todayStart);
  if (todayPosts.length === 0) return null;
  const sorted = [...todayPosts].sort(
    (a, b) => (b.likes ?? 0) - (a.likes ?? 0)
  );
  return sorted[0] ?? null;
}
