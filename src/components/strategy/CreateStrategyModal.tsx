"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { createClient } from "@/lib/supabase/client";
import type { StrategyPosition } from "@/types/database";
import {
  REWARD_STRATEGY_POINTS,
  REWARD_STRATEGY_CREDITS,
} from "@/lib/rewards";
import { X, Loader2, Upload, ImageIcon } from "lucide-react";
import { useFreshForm } from "@/hooks/useFreshForm";

const STRATEGY_CHARTS_BUCKET = "strategy-charts";

interface CreateStrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateStrategyModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateStrategyModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const supabase = createClient();

  const [chartFile, setChartFile] = useState<File | null>(null);
  const [chartPreview, setChartPreview] = useState<string | null>(null);
  const [symbol, setSymbol] = useState("");
  const [position, setPosition] = useState<StrategyPosition>("long");
  const [analysisRationale, setAnalysisRationale] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setError(null);
    setChartFile(null);
    if (chartPreview) URL.revokeObjectURL(chartPreview);
    setChartPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setSymbol("");
    setPosition("long");
    setAnalysisRationale("");
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
    setChartFile(file);
    setChartPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("로그인이 필요합니다.");
      return;
    }
    if (!chartFile) {
      setError("차트 분석 스크린샷을 업로드해주세요.");
      return;
    }
    if (!symbol.trim()) {
      setError("종목을 입력해주세요.");
      return;
    }
    if (!analysisRationale.trim()) {
      setError("분석 근거를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const ext = chartFile.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(STRATEGY_CHARTS_BUCKET)
        .upload(path, chartFile, { upsert: true });

      if (uploadError) {
        console.error("차트 이미지 업로드 실패:", uploadError);
        setError("이미지 업로드에 실패했습니다. 스토리지 버킷 'strategy-charts'를 확인해주세요.");
        setIsSubmitting(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from(STRATEGY_CHARTS_BUCKET)
        .getPublicUrl(path);
      const chartImageUrl = urlData?.publicUrl ?? "";

      const { error: insertError } = await supabase.from("strategy_posts").insert({
        user_id: user.id,
        chart_image_url: chartImageUrl,
        symbol: symbol.trim(),
        position,
        analysis_rationale: analysisRationale.trim(),
        target_price: "",
        stop_loss: "",
      });

      if (insertError) {
        console.error("전략 글 작성 실패:", insertError);
        setError("저장에 실패했습니다. 다시 시도해주세요.");
        setIsSubmitting(false);
        return;
      }

      // 전략 글 보상: 포인트 + 크레딧 지급
      const { data: profile } = await supabase
        .from("profiles")
        .select("points, credits")
        .eq("id", user.id)
        .single();
      const prevPoints =
        (profile as unknown as { points?: number; point?: number } | null)?.points ??
        (profile as unknown as { points?: number; point?: number } | null)?.point ??
        0;
      const prevCredits =
        (profile as unknown as { credits?: number; credit?: number } | null)?.credits ??
        (profile as unknown as { credits?: number; credit?: number } | null)?.credit ??
        0;
      const newPoints = prevPoints + REWARD_STRATEGY_POINTS;
      const newCredits = prevCredits + REWARD_STRATEGY_CREDITS;
      const { error: rewardError } = await supabase
        .from("profiles")
        .update({
          points: newPoints,
          point: newPoints,
          credits: newCredits,
          credit: newCredits,
        })
        .eq("id", user.id);
      if (rewardError) {
        console.error("전략 글 보상 지급 실패:", rewardError);
      }

      showToast("전략 글이 등록되었습니다. 포인트와 크레딧이 지급되었습니다.");
      resetForm();
      onSuccess();
      onClose();
    } catch (err) {
      console.error("전략 글 작성 실패:", err);
      setError("작성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
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
        aria-hidden
      />
      <div className="relative w-full max-w-lg mx-4 bg-background border border-border rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background z-10">
          <h2 className="text-lg font-semibold">오늘의 전략 작성</h2>
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
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded">
              {error}
            </p>
          )}

          {/* 차트 이미지 (필수) */}
          <div>
            <label className="block text-sm font-medium mb-2">
              차트 분석 스크린샷 <span className="text-red-500">*</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
              className="border border-dashed border-border rounded-lg p-4 text-center hover:bg-muted/50 transition-colors cursor-pointer"
            >
              {chartPreview ? (
                <img
                  src={chartPreview}
                  alt="차트 미리보기"
                  className="mx-auto max-h-48 rounded object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageIcon className="h-10 w-10" />
                  <span className="text-sm">클릭하여 이미지 업로드</span>
                </div>
              )}
            </div>
          </div>

          {/* 종목 */}
          <div>
            <label className="block text-sm font-medium mb-2">종목 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="예: BTCUSDT, ETHUSDT"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          {/* 포지션 */}
          <div>
            <label className="block text-sm font-medium mb-2">포지션 <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPosition("long")}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  position === "long"
                    ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300"
                    : "border-border hover:bg-muted"
                }`}
              >
                Long
              </button>
              <button
                type="button"
                onClick={() => setPosition("short")}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  position === "short"
                    ? "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300"
                    : "border-border hover:bg-muted"
                }`}
              >
                Short
              </button>
            </div>
          </div>

          {/* 분석 근거 */}
          <div>
            <label className="block text-sm font-medium mb-2">분석 근거 <span className="text-red-500">*</span></label>
            <textarea
              value={analysisRationale}
              onChange={(e) => setAnalysisRationale(e.target.value)}
              placeholder="차트/지표 근거를 간단히 작성해주세요."
              rows={4}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none"
            />
          </div>

          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground border-t border-border pt-3">
            ※ 도용, 스팸, 허위사실 유포, 욕설, 금전유도 등의 게시글은 사전 경고 없이 삭제되며,
            적발 시 계정이 영구 정지될 수 있습니다.
          </p>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="flex-1"
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  등록 중...
                </>
              ) : (
                "등록"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
