"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { createClient } from "@/lib/supabase/client";
import type { PostCategory } from "@/types/database";
import { POST_CATEGORIES } from "@/types/database";
import {
  REWARD_COMMUNITY_POINTS,
  REWARD_COMMUNITY_CREDITS,
} from "@/lib/rewards";
import { X, Loader2 } from "lucide-react";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreatePostModal({
  isOpen,
  onClose,
  onSuccess,
}: CreatePostModalProps) {
  const { user, profile, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<PostCategory>("free");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("로그인이 필요합니다.");
      return;
    }

    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }

    if (!content.trim()) {
      setError("내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const isProfit = category === "profit";
      const insertPayload: Record<string, unknown> = {
        user_id: user.id,
        title: title.trim(),
        content: content.trim(),
        category,
      };
      if (isProfit) {
        insertPayload.approval_status = "pending";
      }

      const { error: insertError } = await supabase.from("posts").insert(insertPayload);

      if (insertError) {
        console.error("게시글 작성 에러:", insertError);
        setError("게시글 작성에 실패했습니다. 다시 시도해주세요.");
        return;
      }

      if (!isProfit) {
        const newPoints = (profile?.points ?? 0) + REWARD_COMMUNITY_POINTS;
        const newCredits = (profile?.credits ?? 0) + REWARD_COMMUNITY_CREDITS;
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ points: newPoints, credits: newCredits })
          .eq("id", user.id);
        if (!updateError) {
          await refreshProfile();
          showToast("🟡 크레딧과 포인트가 적립되었습니다!");
        }
      } else {
        showToast("출금 인증 글이 등록되었습니다. 승인 후 랭킹에 반영됩니다.");
      }

      setTitle("");
      setContent("");
      setCategory("free");
      onSuccess();
    } catch (err) {
      console.error("게시글 작성 실패:", err);
      setError("게시글 작성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-background border border-border rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">새 글 작성</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">카테고리</label>
            <div className="flex flex-wrap gap-2">
              {POST_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    category === cat.value
                      ? "bg-[#52c68f] text-white border-[#52c68f]"
                      : "bg-background border-border hover:border-[#52c68f]"
                  }`}
                >
                  {cat.labelKo}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              제목
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[#52c68f] focus:border-transparent"
              maxLength={100}
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              내용
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요"
              rows={6}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-[#52c68f] focus:border-transparent"
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {content.length}/2000
            </p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">
              {error}
            </p>
          )}

          {/* Submit */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#52c68f] hover:bg-[#45b07d]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  작성 중...
                </>
              ) : (
                "작성하기"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
