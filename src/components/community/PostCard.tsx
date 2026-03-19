"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import type { Post } from "@/types/database";
import { POST_CATEGORIES } from "@/types/database";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { isAdmin as isAdminUtil } from "@/lib/admin";
import { Heart, MessageCircle, Eye, MoreHorizontal, Trash2, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { notifyPostLiked } from "@/lib/notifications";

interface PostCardProps {
  post: Post;
  onUpdate: () => void;
}

export function PostCard({ post, onUpdate }: PostCardProps) {
  const { user, profile } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  const supabase = createClient();

  const categoryInfo = POST_CATEGORIES.find((c) => c.value === post.category);
  const isAuthor = user?.id === post.user_id;
  const isAdminUser = isAdminUtil(user, profile);

  // 좋아요
  const handleLike = async () => {
    if (!user || isLiking) return;

    setIsLiking(true);
    try {
      const { error } = await supabase
        .from("posts")
        .update({ likes: post.likes + 1 })
        .eq("id", post.id);

      if (error) throw error;
      if (post.user_id && post.user_id !== user.id) {
        await notifyPostLiked({ postAuthorId: post.user_id, postId: post.id });
      }
      onUpdate();
    } catch (error) {
      console.error("좋아요 에러:", error);
    } finally {
      setIsLiking(false);
    }
  };

  // 삭제
  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", post.id);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error("삭제 에러:", error);
    }
  };

  // 조회수 증가
  const handleView = async () => {
    try {
      await supabase
        .from("posts")
        .update({ views: post.views + 1 })
        .eq("id", post.id);
    } catch (error) {
      console.error("조회수 에러:", error);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <article
      className="p-4 border border-border rounded-lg bg-card hover:bg-muted/30 transition-colors cursor-pointer"
      onClick={handleView}
    >
      {/* Author Info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {post.profiles?.avatar_url ? (
            <img
              src={post.profiles.avatar_url}
              alt={post.profiles.full_name || "User"}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#52c68f] flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          )}
          <div>
            <p className="font-medium text-sm flex items-center gap-1">
              {post.profiles?.is_certified ?? post.profiles?.is_verified
                ? !(post.profiles?.role === "admin") && (
                    <span className="shrink-0 text-[11px]" aria-label="출금 인증">
                      🔰
                    </span>
                  )
                : null}
              {post.profiles?.display_name ?? post.profiles?.full_name ?? "Anonymous"}
              {post.profiles?.role === "admin" && (
                <span
                  className="ml-1 text-[11px] font-semibold text-black dark:text-white flex items-center gap-1"
                  aria-label="관리자"
                >
                  💎 관리자
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">{timeAgo}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Category Badge */}
          <span
            className={`px-2 py-0.5 text-xs rounded-full ${
              post.category === "profit"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : post.category === "analysis"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : post.category === "question"
                ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {categoryInfo?.labelKo || post.category}
          </span>

          {/* Actions Menu (Author or Admin) */}
          {(isAuthor || isAdminUser) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
        {post.title}
      </h3>

      {/* Content */}
      <p className="text-sm text-muted-foreground mb-4 line-clamp-3 whitespace-pre-wrap">
        {post.content}
      </p>

      {/* Metrics */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleLike();
          }}
          disabled={!user || isLiking}
          className="flex items-center gap-1 hover:text-red-500 transition-colors disabled:opacity-50"
        >
          <Heart
            className={`h-4 w-4 ${post.likes > 0 ? "fill-red-500 text-red-500" : ""}`}
          />
          {post.likes}
        </button>
        <span className="flex items-center gap-1">
          <MessageCircle className="h-4 w-4" />0
        </span>
        <span className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          {post.views}
        </span>
      </div>
    </article>
  );
}
