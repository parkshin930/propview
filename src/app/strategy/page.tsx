"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { isAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/client";
import { TodayBestSection } from "@/components/strategy/TodayBestSection";
import { StrategyFeedCard } from "@/components/strategy/StrategyFeedCard";
import { CreateStrategyModal } from "@/components/strategy/CreateStrategyModal";
import { MarketSentimentCard } from "@/components/strategy/MarketSentimentCard";
import { TopTraderRanking } from "@/components/strategy/TopTraderRanking";
import type { StrategyPost } from "@/types/database";
import { Pagination } from "@/components/ui/pagination";
import { PenLine } from "lucide-react";

const STRATEGY_PAGE_SIZE = 15;

function getTodayStartUTC(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

export default function StrategyPage() {
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [posts, setPosts] = useState<StrategyPost[]>([]);
  const [todayBestPost, setTodayBestPost] = useState<StrategyPost | null>(null);
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<number>(
    Number(searchParams.get("page") || "1") || 1
  );
  const [sortBy, setSortBy] = useState<"latest" | "likes">("latest");
  const [totalCount, setTotalCount] = useState(0);
  const supabase = createClient();

  const admin = isAdmin(user, profile);
  const isCertified = !!(profile?.is_certified ?? profile?.is_verified);
  const canWrite = !!user && (admin || isCertified);
  const totalPages = Math.max(1, Math.ceil(totalCount / STRATEGY_PAGE_SIZE));

  const profileSelect = `
    *,
    profiles (
      id,
      display_name,
      full_name,
      total_withdrawal_amount,
      role
    )
  `;

  const fetchTodayBest = useCallback(async () => {
    const todayStart = getTodayStartUTC();
    const { data } = await supabase
      .from("strategy_posts")
      .select(profileSelect)
      .gte("created_at", todayStart)
      .order("likes", { ascending: false })
      .limit(1)
      .maybeSingle();
    setTodayBestPost((data as StrategyPost) ?? null);
  }, [supabase]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const from = (page - 1) * STRATEGY_PAGE_SIZE;
      const to = from + STRATEGY_PAGE_SIZE - 1;
      let query = supabase
        .from("strategy_posts")
        .select(profileSelect)
        .range(from, to);

      if (sortBy === "likes") {
        query = query.order("likes", { ascending: false }).order("created_at", {
          ascending: false,
        });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error("전략 글 목록 조회 실패:", error);
        setPosts([]);
        return;
      }
      setPosts((data as StrategyPost[]) || []);
    } finally {
      setLoading(false);
    }
  }, [supabase, page, sortBy]);

  const fetchTotalCount = useCallback(async () => {
    const { count } = await supabase
      .from("strategy_posts")
      .select("id", { count: "exact", head: true });
    setTotalCount(count ?? 0);
  }, [supabase]);

  const fetchLikedIds = useCallback(async () => {
    if (!user) {
      setLikedPostIds(new Set());
      return;
    }
    const { data } = await supabase
      .from("strategy_post_likes")
      .select("strategy_post_id")
      .eq("user_id", user.id);
    setLikedPostIds(new Set((data || []).map((r) => r.strategy_post_id)));
  }, [supabase, user]);

  useEffect(() => {
    fetchTodayBest();
    fetchTotalCount();
  }, [fetchTodayBest, fetchTotalCount]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // URL page 동기화
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) params.delete("page");
    else params.set("page", String(page));
    router.replace(`?${params.toString()}`);
  }, [page, router, searchParams]);

  useEffect(() => {
    fetchLikedIds();
  }, [fetchLikedIds]);

  const handleWriteClick = () => {
    if (!user) {
      showToast("로그인이 필요합니다.");
      return;
    }
    if (!canWrite) {
      showToast("🔰 출금 인증 배지가 있는 유저만 작성 가능합니다.");
      return;
    }
    setIsCreateOpen(true);
  };

  const handleCreateSuccess = () => {
    setPage(1);
    fetchTodayBest();
    fetchTotalCount();
    fetchPosts();
  };

  const handlePageChange = (next: number) => {
    setPage(next);
    const topEl = document.getElementById("strategy-top");
    if (topEl) {
      topEl.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main
        id="strategy-top"
        className="flex-1 container mx-auto max-w-screen-xl px-4 py-8"
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">오늘의 전략</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              출금 인증 상위 트레이더의 프리미엄 뷰
            </p>
          </div>
          {canWrite && (
            <Button onClick={handleWriteClick} className="shrink-0 gap-2">
              <PenLine className="h-4 w-4" />
              글쓰기
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[7fr_3fr]">
          <section className="min-w-0 space-y-6">
            <TodayBestSection
              bestPost={todayBestPost}
              likedPostIds={likedPostIds}
              onLikeChange={fetchLikedIds}
              loading={loading}
            />

            {/* 정렬 토글 */}
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                오늘의 전략 피드 ({totalCount.toLocaleString()}개)
              </p>
              <div className="inline-flex rounded-full border border-gray-200 bg-white p-1 text-xs dark:border-gray-700 dark:bg-gray-900">
                <button
                  type="button"
                  onClick={() => {
                    setSortBy("latest");
                    setPage(1);
                  }}
                  className={`rounded-full px-3 py-1 transition-colors ${
                    sortBy === "latest"
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  최신순
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSortBy("likes");
                    setPage(1);
                  }}
                  className={`rounded-full px-3 py-1 transition-colors ${
                    sortBy === "likes"
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  좋아요순
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <p className="text-sm text-muted-foreground">로딩 중...</p>
              ) : posts.length === 0 ? (
                <p className="text-sm text-muted-foreground">등록된 전략이 없습니다.</p>
              ) : (
                posts.map((post) => (
                  <StrategyFeedCard
                    key={post.id}
                    post={post}
                    isLiked={likedPostIds.has(post.id)}
                    likeCount={post.likes}
                    onLikeChange={fetchLikedIds}
                  />
                ))
              )}
            </div>

            {!loading && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                light
              />
            )}
          </section>

          <aside className="flex min-w-0 flex-col gap-6">
            <MarketSentimentCard />
            <TopTraderRanking />
          </aside>
        </div>
      </main>

      <Footer />

      <CreateStrategyModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
