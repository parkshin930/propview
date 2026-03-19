"use client";

import Link from "next/link";
import { Heart, MessageCircle, FileText } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import type { Post } from "@/types/database";

interface GenericPostCardProps {
  post: Post;
}

export function GenericPostCard({ post }: GenericPostCardProps) {
  const { user } = useAuth();
  const nickname = post.profiles?.display_name ?? post.profiles?.full_name ?? "익명";
  const showVerified = !!(post.profiles?.is_certified ?? post.profiles?.is_verified);
  const isAdminAuthor = post.profiles?.role === "admin";

  return (
    <Link href={`/community/${post.id}`}>
      <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition duration-200 hover:-translate-y-1 hover:shadow-lg">
        <div className="relative mx-4 mt-4 aspect-video overflow-hidden rounded-xl bg-gray-100">
          {post.image_url ? (
            <img
              src={post.image_url}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              <FileText className="h-10 w-10" aria-hidden />
            </div>
          )}
        </div>
        <div className="mt-auto p-4">
          <h3 className="line-clamp-2 text-sm font-medium text-foreground">
            {post.title}
          </h3>
          <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="truncate flex items-center gap-0.5">
              {showVerified && !isAdminAuthor && (
                <span className="shrink-0 text-[11px]" aria-label="출금 인증">
                  🔰
                </span>
              )}
              {nickname}
              {isAdminAuthor && (
                <span
                  className="ml-1 text-[11px] font-semibold text-black dark:text-white flex items-center gap-1"
                  aria-label="관리자"
                >
                  💎 관리자
                </span>
              )}
            </span>
            <div className="flex shrink-0 items-center gap-3">
              <span className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                {post.likes}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" />
                0
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
