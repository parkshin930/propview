"use client";

import Link from "next/link";
import { Eye, Heart } from "lucide-react";
import { POST_CATEGORIES } from "@/types/database";

const CATEGORY_MAP: Record<string, string> = Object.fromEntries(
  POST_CATEGORIES.map((c) => [c.value, c.labelKo])
);

const MOCK_POSTS = [
  {
    id: "1",
    title: "BTC 7만 돌파 후 단기 전략 공유해요",
    category: "analysis" as const,
    author: "트레이더A",
    avatar: null,
    time: "5분 전",
    views: 128,
    likes: 12,
  },
  {
    id: "2",
    title: "오늘 수익 인증합니다 ㅎㅎ",
    category: "profit" as const,
    author: "달빛매매",
    avatar: null,
    time: "23분 전",
    views: 342,
    likes: 45,
  },
  {
    id: "3",
    title: "이더 방향성 어떻게 보시나요?",
    category: "question" as const,
    author: "코인초보",
    avatar: null,
    time: "1시간 전",
    views: 56,
    likes: 5,
  },
  {
    id: "4",
    title: "자유롭게 오늘 시장 이야기해요",
    category: "free" as const,
    author: "프랍러버",
    avatar: null,
    time: "2시간 전",
    views: 89,
    likes: 8,
  },
  {
    id: "5",
    title: "매매일지 3월 12일 - 스캘핑 기록",
    category: "profit" as const,
    author: "실전매매",
    avatar: null,
    time: "3시간 전",
    views: 201,
    likes: 28,
  },
];

export function CommunityList() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm dark:border-[#1f2937] dark:bg-[#111827]">
      <div className="flex border-b border-gray-100 px-4 py-2 dark:border-gray-700">
        <button
          type="button"
          className="mr-4 text-sm font-semibold text-foreground border-b-2 border-[#2d9d78] pb-2 dark:text-gray-100"
        >
          인기글
        </button>
        <button
          type="button"
          className="text-sm font-medium text-muted-foreground hover:text-foreground dark:hover:text-gray-100"
        >
          최신글
        </button>
      </div>
      <ul className="divide-y divide-gray-50 dark:divide-gray-700">
        {MOCK_POSTS.map((post) => (
          <li key={post.id}>
            <Link
              href={`/community/${post.id}`}
              className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2 transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-800/80"
            >
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-muted-foreground dark:bg-gray-700 dark:text-gray-400">
                {CATEGORY_MAP[post.category] ?? post.category}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground dark:text-gray-100">
                {post.title}
              </span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-gray-400">
                <span className="h-6 w-6 shrink-0 rounded-full bg-gray-200 dark:bg-gray-600" aria-hidden />
                <span>{post.author}</span>
                <span>{post.time}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {post.views}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5" />
                  {post.likes}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
