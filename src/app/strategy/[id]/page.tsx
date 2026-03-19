"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StrategyFeedCard } from "@/components/strategy/StrategyFeedCard";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import type { StrategyPost } from "@/types/database";
import { ArrowLeft } from "lucide-react";

export default function StrategyPostPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const { user } = useAuth();
  const [post, setPost] = useState<StrategyPost | null>(null);
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from("strategy_posts")
        .select(
          `
          *,
          profiles (
            id,
            display_name,
            full_name,
            total_withdrawal_amount,
            role
          )
        `
        )
        .eq("id", id)
        .single();
      if (error || !data) {
        setPost(null);
        return;
      }
      setPost(data as StrategyPost);
    };
    fetchPost().finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!user) {
      setLikedPostIds(new Set());
      return;
    }
    const load = async () => {
      const { data } = await supabase
        .from("strategy_post_likes")
        .select("strategy_post_id")
        .eq("user_id", user.id);
      setLikedPostIds(new Set((data || []).map((r) => r.strategy_post_id)));
    };
    load();
  }, [user, id]);

  const refreshLiked = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("strategy_post_likes")
      .select("strategy_post_id")
      .eq("user_id", user.id);
    setLikedPostIds(new Set((data || []).map((r) => r.strategy_post_id)));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/strategy"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </Link>

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        ) : !post ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
            <p className="text-muted-foreground">글을 찾을 수 없습니다.</p>
            <Link
              href="/strategy"
              className="text-sm font-medium text-[#52c68f] hover:underline"
            >
              오늘의 전략 목록으로
            </Link>
          </div>
        ) : (
          <StrategyFeedCard
            post={post}
            isLiked={likedPostIds.has(post.id)}
            likeCount={post.likes}
            onLikeChange={refreshLiked}
            asDetail
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
