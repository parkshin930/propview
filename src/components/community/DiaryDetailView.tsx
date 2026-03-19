"use client";

import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import type { Post } from "@/types/database";

interface DiaryDetailViewProps {
  post: Post;
}

export function DiaryDetailView({ post }: DiaryDetailViewProps) {
  const nickname = post.profiles?.full_name || "익명";
  const avatarUrl = post.profiles?.avatar_url;
  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020617]">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        {/* 상단: 작성자 + 제목 */}
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900 dark:border dark:border-gray-800">
          <div className="mb-3 flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-200">
                {nickname.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-foreground dark:text-gray-100">{nickname}</p>
              <p className="text-xs text-muted-foreground dark:text-gray-400">{timeAgo}</p>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl dark:text-gray-100">
            {post.title}
          </h1>
        </div>

        {/* 본문 + 이미지 */}
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900 dark:border dark:border-gray-800">
          {post.image_url || post.verification_image_url ? (
            <div className="mb-4 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
              <img
                src={post.image_url ?? post.verification_image_url ?? ""}
                alt={post.title}
                className="max-h-[480px] w-full object-contain"
              />
            </div>
          ) : null}
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground dark:text-gray-100">
            {post.content}
          </p>
        </div>
      </div>
    </div>
  );
}
