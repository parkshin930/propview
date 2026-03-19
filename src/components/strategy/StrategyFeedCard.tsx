"use client";

import { useState } from "react";
import Link from "next/link";
import { Medal, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { isAdmin as isAdminUtil } from "@/lib/admin";
import type { StrategyPost } from "@/types/database";

interface StrategyFeedCardProps {
  post: StrategyPost;
  isLiked?: boolean;
  likeCount?: number;
  onLikeChange?: () => void;
  /** 상세 페이지에서 렌더 시 true (링크 비활성화, 본문 전체 표시) */
  asDetail?: boolean;
}

function formatWithdrawal(amount: number | null | undefined): string {
  if (amount == null || amount <= 0) return "-";
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  return `$${new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(amount)}`;
}

export function StrategyFeedCard({
  post,
  isLiked: isLikedProp = false,
  likeCount: likeCountProp,
  onLikeChange,
  asDetail = false,
}: StrategyFeedCardProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(isLikedProp);
  const [likeCount, setLikeCount] = useState(likeCountProp ?? post.likes ?? 0);
  const [isToggling, setIsToggling] = useState(false);
  const supabase = createClient();

  const nickname =
    post.profiles?.display_name?.trim() ||
    post.profiles?.full_name?.trim() ||
    "익명";
  const isAdminAuthor = post.profiles?.role === "admin";
  const totalWithdrawal = formatWithdrawal(post.profiles?.total_withdrawal_amount);
  const isLong = post.position === "long";

  const handleLike = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!user || isToggling) return;
    setIsToggling(true);
    const nextLiked = !isLiked;
    const nextCount = likeCount + (nextLiked ? 1 : -1);
    setIsLiked(nextLiked);
    setLikeCount(nextCount);

    try {
      if (nextLiked) {
        await supabase.from("strategy_post_likes").insert({
          user_id: user.id,
          strategy_post_id: post.id,
        });
      } else {
        await supabase
          .from("strategy_post_likes")
          .delete()
          .eq("user_id", user.id)
          .eq("strategy_post_id", post.id);
      }
      onLikeChange?.();
    } catch (e) {
      console.error("좋아요 처리 실패:", e);
      setIsLiked(isLiked);
      setLikeCount(likeCount);
    } finally {
      setIsToggling(false);
    }
  };

  const cardContent = (
    <>
      {/* 상단: 아바타, 닉네임, 누적 출금 뱃지 | 포지션 태그 */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            {nickname.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground flex items-center gap-1">
              {nickname}
              {isAdminAuthor && (
                <span
                  className="text-[11px] font-semibold text-black dark:text-white flex items-center gap-1"
                  aria-label="관리자"
                >
                  💎 관리자
                </span>
              )}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
              <Medal className="h-3.5 w-3.5" aria-hidden />
              누적 출금 {totalWithdrawal}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            isLong
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
          }`}
        >
          {isLong ? "LONG 🟢" : "SHORT 🔴"}
        </span>
      </div>

      {/* 본문: 차트 썸네일 + 분석 근거 + 목표/손절 */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="w-full shrink-0 sm:w-48">
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
            {post.chart_image_url ? (
              <img
                src={post.chart_image_url}
                alt="차트"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                <span className="text-xs">차트</span>
              </div>
            )}
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-2 text-sm">
          {post.analysis_rationale && (
            <p className={`text-foreground ${asDetail ? "" : "line-clamp-3"}`}>
              {post.analysis_rationale}
            </p>
          )}
          <p className="text-foreground">
            <span className="text-muted-foreground">종목</span> {post.symbol}
          </p>
          {post.target_price?.trim() && (
            <p className="text-foreground">
              <span className="text-muted-foreground">목표가</span> {post.target_price}
            </p>
          )}
          {post.stop_loss?.trim() && (
            <p className="text-foreground">
              <span className="text-muted-foreground">손절가</span> {post.stop_loss}
            </p>
          )}
        </div>
      </div>

      {/* 하단: 좋아요 (클릭 시 상세로 가지 않도록 stopPropagation) */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-red-500"
          onClick={(e) => handleLike(e)}
          disabled={!user || isToggling}
        >
          <Heart
            className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
            aria-hidden
          />
          <span>{likeCount}</span>
        </Button>
      </div>
    </>
  );

  const articleClass =
    "rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900";

  if (asDetail) {
    return <article className={articleClass}>{cardContent}</article>;
  }

  return (
    <Link href={`/strategy/${post.id}`} className="block">
      <article className={articleClass}>{cardContent}</article>
    </Link>
  );
}
