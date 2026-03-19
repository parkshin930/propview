"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Heart } from "lucide-react";
import { POST_CATEGORIES, type Post, type Profile, type StrategyPost } from "@/types/database";
import { createClient } from "@/lib/supabase/client";

const CATEGORY_MAP: Record<string, string> = Object.fromEntries(
  POST_CATEGORIES.map((c) => [c.value, c.labelKo])
);

type PostWithProfile = Post & { profiles?: Profile };
type StrategyWithProfile = StrategyPost & { profiles?: Profile };

type FeedItem = {
  id: string;
  href: string;
  title: string;
  categoryBadge: string;
  created_at: string;
  likes: number;
  views: number;
  profiles?: Profile;
};

function formatRelativeTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}일 전`;
}

export function CommunityList() {
  const [tab, setTab] = useState<"popular" | "latest">("popular");
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      setLoading(true);
      try {
        const [postsRes, strategyRes] = await Promise.all([
          supabase
            .from("posts")
            .select(
              `
              *,
              profiles!posts_user_id_fkey (
                id,
                full_name,
                display_name,
                role
              )
            `
            )
            .limit(30),
          supabase
            .from("strategy_posts")
            .select(
              `
              *,
              profiles!strategy_posts_user_id_fkey (
                id,
                full_name,
                display_name,
                role
              )
            `
            )
            .limit(30),
        ]);

        if (postsRes.error) {
          console.error("커뮤니티 게시글 조회 실패:", postsRes.error);
        }
        if (strategyRes.error) {
          console.error("전략 게시글 조회 실패:", strategyRes.error);
        }

        const posts = (postsRes.data || []) as PostWithProfile[];
        const strategies = (strategyRes.data || []) as StrategyWithProfile[];

        const postItems: FeedItem[] = posts.map((post) => ({
          id: post.id,
          href: `/community/${post.id}`,
          title: post.title,
          categoryBadge: CATEGORY_MAP[post.category] ?? post.category,
          created_at: post.created_at,
          likes: post.likes ?? 0,
          views: post.views ?? 0,
          profiles: post.profiles,
        }));

        const strategyItems: FeedItem[] = strategies.map((s) => ({
          id: s.id,
          href: `/strategy/${s.id}`,
          title: s.symbol ? `${s.symbol} 오늘의 전략` : "오늘의 전략",
          categoryBadge: "오늘의 전략",
          created_at: s.created_at,
          likes: s.likes ?? 0,
          // 전략 글에는 조회수 필드가 없으므로 0으로 처리
          views: 0,
          profiles: s.profiles,
        }));

        let merged: FeedItem[] = [...postItems, ...strategyItems];

        if (tab === "popular") {
          merged = merged.sort((a, b) => {
            if (b.likes !== a.likes) return b.likes - a.likes;
            return (b.views || 0) - (a.views || 0);
          });
        } else {
          merged = merged.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        }

        setItems(merged.slice(0, 10));
      } catch (e) {
        console.error("홈 커뮤니티 피드 조회 에러:", e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();

    const channel = supabase
      .channel("home-community-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        () => {
          load();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "strategy_posts" },
        () => {
          load();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tab]);

  return (
    <div className="h-full flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm dark:border-[#1f2937] dark:bg-[#111827]">
      <div className="flex border-b border-gray-200 px-4 py-2 dark:border-gray-700">
        <button
          type="button"
          className={`mr-4 text-sm pb-2 ${
            tab === "popular"
              ? "font-semibold text-foreground border-b-2 border-[#2d9d78] dark:text-gray-100"
              : "font-medium text-muted-foreground hover:text-foreground dark:hover:text-gray-100"
          }`}
          onClick={() => setTab("popular")}
        >
          인기글
        </button>
        <button
          type="button"
          className={`text-sm ${
            tab === "latest"
              ? "font-semibold text-foreground border-b-2 border-[#2d9d78] pb-2 dark:text-gray-100"
              : "font-medium text-muted-foreground hover:text-foreground dark:hover:text-gray-100"
          }`}
          onClick={() => setTab("latest")}
        >
          최신글
        </button>
      </div>
      <ul className="divide-y divide-gray-50 dark:divide-gray-700">
        {loading ? (
          <li className="px-4 py-3 text-sm text-muted-foreground">로딩 중...</li>
        ) : items.length === 0 ? (
          <li className="px-4 py-6 text-center text-sm text-muted-foreground">
            아직 등록된 게시글이 없습니다. 첫 번째 소식을 공유해보세요!
          </li>
        ) : (
          items.map((item) => {
            const author =
              item.profiles?.display_name?.trim() ||
              item.profiles?.full_name?.trim() ||
              "익명";
            const time = formatRelativeTime(item.created_at);
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2 transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-800/80"
                >
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-muted-foreground dark:bg-gray-700 dark:text-gray-400">
                    {item.categoryBadge}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground dark:text-gray-100">
                    {item.title}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-gray-400">
                    <span className="h-6 w-6 shrink-0 rounded-full bg-gray-200 dark:bg-gray-600" aria-hidden />
                    <span>{author}</span>
                    <span>{time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {item.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5" />
                      {item.likes}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
