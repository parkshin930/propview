"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useFreshForm } from "@/hooks/useFreshForm";

type PropId = "mubite" | "propw";

const REVIEW_DATA: Record<PropId, { pros: string[]; cons: string[] }> = {
  mubite: {
    pros: [
      "최대 1:100 레버리지 제공",
      "Soft Breach 구제 제도 제공",
      "Bybit / Binance 기반 우수한 유동성",
    ],
    cons: [
      "규정이 비교적 복잡해 숙지가 필요함",
      "1회 최대 출금이 계정 크기의 5%로 제한됨",
    ],
  },
  propw: {
    pros: [
      "규정이 단순·명확하여 초보자도 이해하기 쉬움",
      "입문자에게 적합한 챌린지 구조",
    ],
    cons: [
      "출금 심사 기간이 길어질 수 있음",
    ],
  },
};

interface CommentItem {
  id: string;
  nickname: string;
  rating: number;
  content: string;
  date: string;
}

interface ReviewRow {
  id: string;
  nickname: string | null;
  rating: number;
  content: string;
  created_at: string;
}

interface PropReviewSectionProps {
  selectedProp: PropId;
}

export function PropReviewSection({ selectedProp }: PropReviewSectionProps) {
  const { user, profile } = useAuth();
  const supabase = createClient();
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newRating, setNewRating] = useState(0);
  const [loading, setLoading] = useState(true);

  const resetReviewDraft = () => {
    setNewComment("");
    setNewRating(0);
  };

  // "입력창 = 새 도화지" 강제 (페이지 재진입/캐시 상황 대비)
  useFreshForm(resetReviewDraft);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("prop_reviews")
          .select("id, nickname, rating, content, created_at")
          .eq("prop_id", selectedProp)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("프랍 리뷰 조회 실패:", error);
          setComments([]);
          return;
        }

        const mapped: CommentItem[] = (data as ReviewRow[]).map((row) => ({
          id: row.id,
          nickname: row.nickname?.trim() || "익명",
          rating: row.rating,
          content: row.content,
          date: row.created_at.slice(0, 10),
        }));

        setComments(mapped);
      } catch (e) {
        console.error("프랍 리뷰 조회 에러:", e);
        setComments([]);
      } finally {
        setLoading(false);
        resetReviewDraft();
      }
    };

    load();
  }, [selectedProp, supabase]);

  const data = REVIEW_DATA[selectedProp];

  const averageRating =
    comments.length === 0
      ? 0
      : Number(
          (
            comments.reduce((sum, c) => sum + c.rating, 0) / comments.length
          ).toFixed(1)
        );
  const reviewCount = comments.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || newRating === 0) return;

    const nickname =
      profile?.display_name?.trim() ||
      profile?.full_name?.trim() ||
      user?.email?.split("@")[0] ||
      "익명";

    const insert = async () => {
      try {
        const { data, error } = await supabase
          .from("prop_reviews")
          .insert({
            prop_id: selectedProp,
            user_id: user?.id ?? null,
            nickname,
            rating: newRating,
            content: newComment.trim(),
          })
          .select("id, nickname, rating, content, created_at")
          .single();

        if (error) {
          console.error("프랍 리뷰 등록 실패:", error);
          return;
        }

        const row = data as ReviewRow;
        const newItem: CommentItem = {
          id: row.id,
          nickname: row.nickname?.trim() || nickname,
          rating: row.rating,
          content: row.content,
          date: row.created_at.slice(0, 10),
        };

        setComments((prev) => [newItem, ...prev]);
        setNewComment("");
        setNewRating(0);
      } catch (e) {
        console.error("프랍 리뷰 등록 에러:", e);
      }
    };

    void insert();
  };

  return (
    <section className="mt-8 rounded-2xl bg-gray-50 p-8 dark:bg-gray-900 dark:border dark:border-gray-700">
      {/* 종합 별점 */}
      <div className="mb-6 flex flex-wrap items-baseline gap-2">
        <div className="flex items-center gap-1.5">
          <Star className="h-8 w-8 fill-amber-400 text-amber-400" aria-hidden />
          <span className="text-2xl font-bold text-foreground dark:text-gray-100">
            {averageRating.toFixed(1)}
          </span>
          <span className="text-lg text-muted-foreground dark:text-gray-300">/ 5.0</span>
        </div>
        <span className="text-sm text-muted-foreground dark:text-gray-300">
          총 {reviewCount}개의 리뷰
        </span>
      </div>

      {/* 장단점 반반 (리뷰 작성 영역 바로 위) */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-green-500" aria-hidden />
            <span className="font-semibold text-foreground dark:text-gray-100">장점 (Pros)</span>
          </div>
          <ul className="space-y-2 text-sm text-foreground dark:text-gray-100">
            {data.pros.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-green-500">·</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="mb-3 flex items-center gap-2">
            <ThumbsDown className="h-5 w-5 text-red-500" aria-hidden />
            <span className="font-semibold text-foreground dark:text-gray-100">단점 (Cons)</span>
          </div>
          <ul className="space-y-2 text-sm text-foreground dark:text-gray-100">
            {data.cons.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-red-500">·</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 별점 선택 + 리뷰 작성 */}
      <div>
        <h4 className="mb-3 font-semibold text-foreground dark:text-gray-100">별점 선택 & 리뷰 작성</h4>
        <form onSubmit={handleSubmit} className="mb-6 space-y-3">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => {
              const value = i + 1;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setNewRating(value)}
                  className="p-0.5"
                  aria-label={`${value}점 선택`}
                >
                  <Star
                    className={`h-7 w-7 ${
                      value <= newRating
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-200"
                    }`}
                    aria-hidden
                  />
                </button>
              );
            })}
            {newRating > 0 && (
                  <span className="ml-2 text-sm text-muted-foreground dark:text-gray-300">
                {newRating} / 5
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="리뷰를 입력하세요"
              className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              등록
            </button>
          </div>
        </form>
        {loading ? (
          <p className="text-sm text-muted-foreground dark:text-gray-300">리뷰를 불러오는 중입니다...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground dark:text-gray-300">
            아직 리뷰가 없습니다. 이 업체에 대한 첫 별점을 남겨주세요! ⭐
          </p>
        ) : (
          <ul className="space-y-4">
            {comments.map((c) => (
              <li
                key={c.id}
                className="flex gap-3 rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-200">
                  {c.nickname.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-foreground dark:text-gray-100">{c.nickname}</span>
                    <span className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < c.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"
                          }`}
                          aria-hidden
                        />
                      ))}
                    </span>
                    <span className="text-xs text-muted-foreground dark:text-gray-400">{c.date}</span>
                  </div>
                  <p className="mt-1 text-sm text-foreground dark:text-gray-100">{c.content}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
