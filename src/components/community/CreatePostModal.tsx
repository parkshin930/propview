"use client";

import { useState, useRef } from "react";
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
import { notifyActivityReward, maybeNotifyLevelUp } from "@/lib/notifications";
import { X, Loader2, Upload, Image as ImageIcon } from "lucide-react";
import { useFreshForm } from "@/hooks/useFreshForm";

const VERIFICATION_BUCKET = "verification";
const POST_IMAGE_BUCKET = "post-images";
const PROP_COMPANIES = ["PROPW", "MUBITE"];

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

  // 출금 인증 전용
  const [propCompany, setPropCompany] = useState("");
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [reviewOneLine, setReviewOneLine] = useState("");
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [verificationPreview, setVerificationPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null);
  const postImageInputRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);

  const supabase = createClient();
  const isProfit = category === "profit";

  const resetForm = () => {
    setTitle("");
    setContent("");
    setCategory("free");
    setError(null);

    setPropCompany("");
    setWithdrawalAmount("");
    setReviewOneLine("");

    setVerificationFile(null);
    if (verificationPreview) URL.revokeObjectURL(verificationPreview);
    setVerificationPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    setPostImageFile(null);
    if (postImagePreview) URL.revokeObjectURL(postImagePreview);
    setPostImagePreview(null);
    if (postImageInputRef.current) postImageInputRef.current.value = "";
  };

  // "글쓰기 창 = 새 도화지" 강제: 모달 열릴 때마다 초기화
  useFreshForm(resetForm, { active: isOpen });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드 가능합니다.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("이미지는 5MB 이하여야 합니다.");
      return;
    }
    setError(null);
    setVerificationFile(file);
    const url = URL.createObjectURL(file);
    setVerificationPreview(url);
  };

  const handlePostImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드 가능합니다.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("이미지는 5MB 이하여야 합니다.");
      return;
    }
    setError(null);
    setPostImageFile(file);
    const url = URL.createObjectURL(file);
    setPostImagePreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 중복 클릭/중복 제출 즉시 차단 (state set은 비동기라 ref로 동기 가드)
    if (submittingRef.current) return;

    if (!user) {
      setError("로그인이 필요합니다.");
      return;
    }

    if (isProfit) {
      if (!withdrawalAmount.trim() || Number(withdrawalAmount) <= 0) {
        setError("출금 금액을 입력해주세요.");
        return;
      }
      if (!verificationFile) {
        setError("인증 이미지를 업로드해주세요.");
        return;
      }
      if (!reviewOneLine.trim()) {
        setError("한 줄 후기를 입력해주세요.");
        return;
      }
    } else {
      if (!title.trim()) {
        setError("제목을 입력해주세요.");
        return;
      }
      if (!content.trim()) {
        setError("내용을 입력해주세요.");
        return;
      }
    }

    setIsSubmitting(true);
    submittingRef.current = true;
    setError(null);

    try {
      let verificationImageUrl: string | null = null;
      let postImageUrl: string | null = null;

      if (isProfit && verificationFile) {
        const ext = verificationFile.name.split(".").pop() || "jpg";
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from(VERIFICATION_BUCKET)
          .upload(path, verificationFile, { upsert: true });

        if (uploadError) {
          console.error("이미지 업로드 실패:", uploadError);
          setError("이미지 업로드에 실패했습니다. 스토리지 버킷을 확인해주세요.");
          setIsSubmitting(false);
          return;
        }
        const { data: urlData } = supabase.storage.from(VERIFICATION_BUCKET).getPublicUrl(path);
        verificationImageUrl = urlData?.publicUrl ?? null;
      }

      if (!isProfit && postImageFile) {
        const ext = postImageFile.name.split(".").pop() || "jpg";
        const path = `${user.id}/posts/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from(POST_IMAGE_BUCKET)
          .upload(path, postImageFile, { upsert: true });

        if (uploadError) {
          console.error("게시글 이미지 업로드 실패:", uploadError);
          setError("이미지 업로드에 실패했습니다. 스토리지 버킷을 확인해주세요.");
          setIsSubmitting(false);
          return;
        }
        const { data: postUrlData } = supabase.storage.from(POST_IMAGE_BUCKET).getPublicUrl(path);
        postImageUrl = postUrlData?.publicUrl ?? null;
      }

      const insertPayload: Record<string, unknown> = {
        user_id: user.id,
        title: isProfit ? (reviewOneLine.trim().slice(0, 100) || "출금 인증") : title.trim(),
        content: isProfit ? reviewOneLine.trim() : content.trim(),
        category,
      };

      // (요청사항) id는 DB가 UUID 자동 생성하도록 절대 전송하지 않음
      if ("id" in insertPayload) delete (insertPayload as Record<string, unknown>).id;

      if (isProfit) {
        insertPayload.approval_status = "pending";
        insertPayload.prop_company = propCompany.trim() || null;
        insertPayload.withdrawal_amount = Number(withdrawalAmount);
        insertPayload.verification_image_url = verificationImageUrl;
      } else {
        insertPayload.image_url = postImageUrl;
      }

      // 전송 직전 payload 확인 (409 원인 파악용)
      console.log("👉 [요청 데이터] posts 테이블로 전송할 Payload:", insertPayload);

      const { error: insertError } = await supabase.from("posts").insert(insertPayload);

      if (insertError) {
        console.error(
          "❌ [게시글 INSERT 거절 상세]:",
          JSON.stringify(
            {
              message: (insertError as unknown as { message?: string })?.message,
              details: (insertError as unknown as { details?: string })?.details,
              hint: (insertError as unknown as { hint?: string })?.hint,
              code: (insertError as unknown as { code?: string })?.code,
            },
            null,
            2
          )
        );
        setError("게시글 작성에 실패했습니다. 다시 시도해주세요.");
        return;
      }

      if (!isProfit) {
        const prevPoints =
          (profile as unknown as { points?: number; point?: number } | null)?.points ??
          (profile as unknown as { points?: number; point?: number } | null)?.point ??
          0;
        const newPoints = prevPoints + REWARD_COMMUNITY_POINTS;
        const prevCredits =
          (profile as unknown as { credits?: number; credit?: number } | null)?.credits ??
          (profile as unknown as { credits?: number; credit?: number } | null)?.credit ??
          0;
        const newCredits = prevCredits + REWARD_COMMUNITY_CREDITS;
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            points: newPoints,
            point: newPoints,
            credits: newCredits,
            credit: newCredits,
          })
          .eq("id", user.id);
        if (!updateError) {
          await refreshProfile();
          showToast("🟡 크레딧과 포인트가 적립되었습니다!");
          await notifyActivityReward({
            userId: user.id,
            message: "커뮤니티 글 작성 보상 포인트가 지급되었습니다.",
            link: "/community",
          });
          await maybeNotifyLevelUp({
            userId: user.id,
            previousPoints: prevPoints,
            newPoints,
            rankOverride: profile?.rank_override ?? null,
          });
        }
      } else {
        showToast("출금 인증 글이 등록되었습니다. 승인 후 랭킹에 반영됩니다.");
      }

      resetForm();
      onSuccess();
    } catch (err) {
      console.error("게시글 작성 실패:", err);
      setError("게시글 작성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
      submittingRef.current = false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => {
          resetForm();
          onClose();
        }}
      />

      <div className="relative w-full max-w-lg mx-4 bg-background border border-border rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background z-10">
          <h2 className="text-lg font-semibold">
            {isProfit ? "출금 인증 글쓰기" : "새 글 작성"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
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

          {isProfit ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">프랍 업체명 (선택)</label>
                <select
                  value={propCompany}
                  onChange={(e) => setPropCompany(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[#52c68f]"
                >
                  <option value="">선택 안 함</option>
                  {PROP_COMPANIES.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">출금 금액 ($) *</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  placeholder="예: 10000"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[#52c68f]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">인증 이미지 *</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-[#52c68f] hover:bg-muted/30 transition-colors"
                >
                  {verificationPreview ? (
                    <img
                      src={verificationPreview}
                      alt="미리보기"
                      className="mx-auto max-h-40 object-contain rounded"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Upload className="h-10 w-10" />
                      <span className="text-sm">클릭하여 이미지 업로드</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">5MB 이하 이미지 (JPG, PNG 등)</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">한 줄 후기 *</label>
                <input
                  type="text"
                  value={reviewOneLine}
                  onChange={(e) => setReviewOneLine(e.target.value)}
                  placeholder="출금 후기를 한 줄로 적어주세요"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[#52c68f]"
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">{reviewOneLine.length}/200</p>
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">제목</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="제목을 입력하세요"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[#52c68f]"
                  maxLength={100}
                />
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium mb-2">내용</label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="내용을 입력하세요"
                  rows={6}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-[#52c68f]"
                  maxLength={2000}
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">{content.length}/2000</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">이미지 (선택)</label>
                <input
                  ref={postImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePostImageChange}
                  className="hidden"
                />
                <div
                  onClick={() => postImageInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-[#52c68f] hover:bg-muted/30 transition-colors"
                >
                  {postImagePreview ? (
                    <img
                      src={postImagePreview}
                      alt="미리보기"
                      className="mx-auto max-h-40 object-contain rounded"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ImageIcon className="h-8 w-8" />
                      <span className="text-sm">본문에 함께 보여줄 이미지를 선택하세요 (선택 사항)</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">5MB 이하 이미지 (JPG, PNG 등)</p>
              </div>
            </>
          )}

          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">{error}</p>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="flex-1"
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button type="submit" className="flex-1 bg-[#52c68f] hover:bg-[#45b07d]" disabled={isSubmitting}>
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
