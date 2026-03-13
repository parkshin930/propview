"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Star } from "lucide-react";

type PropId = "mubite" | "propw";

const REVIEW_DATA: Record<
  PropId,
  { rating: number; reviewCount: number; pros: string[]; cons: string[] }
> = {
  mubite: {
    rating: 4.8,
    reviewCount: 128,
    pros: [
      "출금이 진짜 1시간 만에 들어옴",
      "규정이 투명해서 억울한 탈락 없음",
      "인스턴트 펀딩으로 바로 실전 가능",
    ],
    cons: [
      "챌린지 비용이 타사 대비 소폭 높음",
      "지원 통화가 제한적",
    ],
  },
  propw: {
    rating: 4.2,
    reviewCount: 86,
    pros: [
      "입문 단계 요금이 저렴함",
      "한국어 고객 지원 가능",
    ],
    cons: [
      "출금 대기 기간이 있음",
      "규정 해석이 다소 엄격함",
      "2단계 평가 조건이 까다로움",
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

const MOCK_COMMENTS: Record<PropId, CommentItem[]> = {
  mubite: [
    {
      id: "1",
      nickname: "트레이더김",
      rating: 5,
      content: "첫 출금 1시간 컷이 진짜라서 믿고 쓰는 중입니다.",
      date: "2025-03-10",
    },
    {
      id: "2",
      nickname: "코인매니아",
      rating: 4,
      content: "규정이 깔끔하게 정리돼 있어서 부담 없어요.",
      date: "2025-03-09",
    },
  ],
  propw: [
    {
      id: "1",
      nickname: "프랍초보",
      rating: 4,
      content: "가격이 저렴해서 도전해봤어요. 출금은 아직 진행 중.",
      date: "2025-03-11",
    },
  ],
};

interface PropReviewSectionProps {
  selectedProp: PropId;
}

export function PropReviewSection({ selectedProp }: PropReviewSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<CommentItem[]>(
    MOCK_COMMENTS[selectedProp]
  );

  useEffect(() => {
    setComments(MOCK_COMMENTS[selectedProp]);
  }, [selectedProp]);

  const data = REVIEW_DATA[selectedProp];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments((prev) => [
      {
        id: String(Date.now()),
        nickname: "나",
        rating: 5,
        content: newComment.trim(),
        date: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
    setNewComment("");
  };

  return (
    <section className="mt-8 rounded-2xl bg-gray-50 p-8">
      {/* 종합 별점 */}
      <div className="mb-6 flex flex-wrap items-baseline gap-2">
        <div className="flex items-center gap-1.5">
          <Star className="h-8 w-8 fill-amber-400 text-amber-400" aria-hidden />
          <span className="text-2xl font-bold text-foreground">
            {data.rating}
          </span>
          <span className="text-lg text-muted-foreground">/ 5.0</span>
        </div>
        <span className="text-sm text-muted-foreground">
          총 {data.reviewCount}개의 리뷰
        </span>
      </div>

      {/* 장단점 반반 */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-green-500" aria-hidden />
            <span className="font-semibold text-foreground">장점 (Pros)</span>
          </div>
          <ul className="space-y-2 text-sm text-foreground">
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
            <span className="font-semibold text-foreground">단점 (Cons)</span>
          </div>
          <ul className="space-y-2 text-sm text-foreground">
            {data.cons.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-red-500">·</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 실시간 댓글 */}
      <div>
        <h4 className="mb-3 font-semibold text-foreground">실시간 댓글</h4>
        <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="리뷰를 입력하세요"
            className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            등록
          </button>
        </form>
        <ul className="space-y-4">
          {comments.map((c) => (
            <li
              key={c.id}
              className="flex gap-3 rounded-xl border border-gray-100 bg-white p-4"
            >
              <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                {c.nickname.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-foreground">{c.nickname}</span>
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
                  <span className="text-xs text-muted-foreground">{c.date}</span>
                </div>
                <p className="mt-1 text-sm text-foreground">{c.content}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
