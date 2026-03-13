"use client";

import Link from "next/link";
import { Heart, MessageCircle, ImageIcon, Crown, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import type { Post } from "@/types/database";

interface WithdrawalVerificationCardProps {
  post: Post;
  /** 프랍 회사명 (콘텐츠/메타에서 추출 또는 기본값) */
  propCompany?: string;
  /** 출금 금액 표시 (콘텐츠/메타에서 추출 또는 기본값) */
  amount?: string;
  /** 인증 이미지 URL (없으면 플레이스홀더) */
  imageUrl?: string | null;
  /** 관리자 여부 → 승인 버튼 노출 */
  isAdmin?: boolean;
  /** 관리자가 승인 시 콜백 */
  onApprove?: (post: Post) => void;
}

export function WithdrawalVerificationCard({
  post,
  propCompany = "APEX",
  amount = "+ $10,000",
  imageUrl = null,
  isAdmin: isAdminProp = false,
  onApprove,
}: WithdrawalVerificationCardProps) {
  const { user } = useAuth();
  const nickname = post.profiles?.display_name ?? post.profiles?.full_name ?? "익명";
  const commentCount = 0;
  const isPending = post.category === "profit" && post.approval_status === "pending";
  const showApproveButton = isPending && isAdminProp && onApprove;
  const showCrown = user && post.user_id === user.id;

  return (
    <article
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      <Link href={`/community/${post.id}`} className="flex flex-col flex-1 min-h-0">
        {/* [상단] 태그 & 금액 & 승인 대기 뱃지 */}
        <div className="p-4 pb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-block rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
              {propCompany}
            </span>
            {isPending && (
              <span className="inline-block rounded-full bg-amber-100 text-amber-800 px-2.5 py-1 text-xs font-medium">
                승인 대기
              </span>
            )}
          </div>
          <p className="mt-2 text-2xl font-bold text-green-500">{amount}</p>
        </div>

        {/* [중단] 인증샷 썸네일 */}
        <div className="relative mx-4 mb-4 aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              <ImageIcon className="h-12 w-12" aria-hidden />
            </div>
          )}
        </div>

        {/* [하단] 제목 & 작성자 & 반응 */}
        <div className="mt-auto px-4 pb-4">
          <h3 className="truncate text-sm font-medium text-foreground">
            {post.title}
          </h3>
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
              <Crown className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden />
              <span className="truncate flex items-center gap-0.5">
                {nickname}
                {showCrown && <span className="shrink-0" aria-label="마스터">👑</span>}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                {post.likes}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" />
                {commentCount}
              </span>
            </div>
          </div>
        </div>
      </Link>
      {showApproveButton && (
        <div className="px-4 pb-4 pt-0">
          <Button
            type="button"
            size="sm"
            className="w-full gap-1.5 bg-[#52c68f] hover:bg-[#45b07d] text-white"
            onClick={(e) => {
              e.preventDefault();
              onApprove?.(post);
            }}
          >
            <CheckCircle className="h-4 w-4" />
            승인 (포인트 지급)
          </Button>
        </div>
      )}
    </article>
  );
}
