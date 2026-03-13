"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { ThumbsUp, Lightbulb } from "lucide-react";
import type { Post } from "@/types/database";

export interface DiaryMeta {
  symbol: string;
  position: "long" | "short";
  entry: string;
  tp: string;
  sl: string;
  result: "win" | "loss";
  profitAmount: string;
  rationale: string;
  mistake: string;
  principle: string;
  tags: string[];
  chartImageUrl?: string | null;
}

const DEFAULT_META: DiaryMeta = {
  symbol: "크루드 오일",
  position: "long",
  entry: "$95.50",
  tp: "$97.00",
  sl: "$94.50",
  result: "win",
  profitAmount: "+ $1,250",
  rationale:
    "아시아 세션에서 95.20 구간이 이중 바닥으로 확인되며 롱 진입. 목표는 전고점 97.00, 손절은 94.50으로 설정했다. 유럽 세션 진입 후 거래량이 붙으며 TP 도달.",
  mistake: "조급함을 이기지 못하고 뇌동매매함. 원래 계획은 95.00 아래 이탈 시에만 숏을 보려 했는데, 중간에 흔들리며 불필요한 리스크를 감수했다.",
  principle: "아시아 세션에서는 절대 박스권 돌파 매매를 하지 않겠다.",
  tags: ["#뇌동매매", "#원칙준수", "#크루드오일"],
};

interface DiaryDetailViewProps {
  post: Post;
  meta?: Partial<DiaryMeta>;
}

export function DiaryDetailView({ post, meta: metaOverride }: DiaryDetailViewProps) {
  const [niceCount, setNiceCount] = useState(12);
  const [learnCount, setLearnCount] = useState(8);
  const meta: DiaryMeta = { ...DEFAULT_META, ...metaOverride };
  const nickname = post.profiles?.full_name || "익명";
  const avatarUrl = post.profiles?.avatar_url;
  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        {/* 상단: 작성자 + 제목 */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
                {nickname.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-foreground">{nickname}</p>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            {post.title}
          </h1>
        </div>

        {/* 트레이드 데이터 요약 카드 */}
        <div className="rounded-xl bg-gray-100 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">종목 / 포지션</p>
              <p className="mt-0.5 text-lg font-semibold text-foreground">
                {meta.symbol}{" "}
                <span
                  className={
                    meta.position === "long"
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {meta.position === "long" ? "LONG 🟢" : "SHORT 🔴"}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">진입가 (Entry)</p>
              <p className="mt-0.5 text-lg font-semibold text-foreground">
                {meta.entry}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">익절가 (TP) / 손절가 (SL)</p>
              <p className="mt-0.5 text-lg font-semibold text-foreground">
                {meta.tp} / {meta.sl}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">최종 결과</p>
              <p className="mt-0.5 text-lg font-bold">
                <span
                  className={
                    meta.result === "win" ? "text-green-600" : "text-red-600"
                  }
                >
                  {meta.result === "win" ? "Win" : "Loss"}
                </span>{" "}
                <span className="text-foreground">{meta.profitAmount}</span>
              </p>
            </div>
          </div>
        </div>

        {/* 차트 이미지 */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-200">
            {meta.chartImageUrl ? (
              <img
                src={meta.chartImageUrl}
                alt="차트"
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-500">
                <span className="text-sm">차트 이미지</span>
              </div>
            )}
          </div>
          <h3 className="mt-4 text-base font-semibold text-foreground">
            진입 및 청산 근거
          </h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {meta.rationale}
          </p>
        </div>

        {/* 복기 섹션 */}
        <div className="space-y-4">
          <div className="rounded-xl border-2 border-red-200 bg-white p-5 shadow-sm">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-700">
              <span aria-hidden>🚨</span> 오늘의 아쉬운 점 / 실수
            </p>
            <p className="text-sm leading-relaxed text-foreground">
              {meta.mistake}
            </p>
          </div>
          <div className="rounded-xl border-2 border-green-200 bg-white p-5 shadow-sm">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-green-700">
              <span aria-hidden>💡</span> 내일을 위한 한 줄 원칙
            </p>
            <p className="text-sm leading-relaxed text-foreground">
              {meta.principle}
            </p>
          </div>
        </div>

        {/* 태그 */}
        <div className="flex flex-wrap gap-2">
          {meta.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* 인터랙션 버튼 */}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setNiceCount((c) => c + 1)}
            className="flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-600"
          >
            <ThumbsUp className="h-4 w-4" aria-hidden />
            나이스 트레이딩 ({niceCount})
          </button>
          <button
            type="button"
            onClick={() => setLearnCount((c) => c + 1)}
            className="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600"
          >
            <Lightbulb className="h-4 w-4" aria-hidden />
            배우고 갑니다 ({learnCount})
          </button>
        </div>
      </div>
    </div>
  );
}
