"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import type { Post } from "@/types/database";
import { POST_CATEGORIES } from "@/types/database";

export default function MyPostsPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (!error && data) {
          setPosts(data as Post[]);
        }
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [supabase, user]);

  const getCategoryLabel = (category: Post["category"]) =>
    POST_CATEGORIES.find((c) => c.value === category)?.labelKo ?? category;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 bg-gray-50 dark:bg-[#0B1120]">
        <div className="container mx-auto max-w-screen-md px-4 py-8">
          <h1 className="text-2xl font-bold text-foreground dark:text-gray-100 mb-1">
            내가 쓴 글
          </h1>
          <p className="text-sm text-muted-foreground dark:text-gray-400 mb-6">
            커뮤니티에 작성한 모든 글을 한눈에 볼 수 있습니다.
          </p>

          {!user ? (
            <div className="mt-6 rounded-xl border border-dashed border-border bg-card/40 p-6 text-center text-sm text-muted-foreground">
              로그인 후 이용할 수 있습니다.
            </div>
          ) : loading ? (
            <div className="mt-6 rounded-xl border border-border bg-card/40 p-6 text-center text-sm text-muted-foreground">
              불러오는 중입니다...
            </div>
          ) : posts.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              아직 작성한 커뮤니티 글이 없습니다.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/community/${post.id}`}
                  className="block rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-muted-foreground dark:bg-gray-800 dark:text-gray-300">
                      {getCategoryLabel(post.category)}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(post.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="truncate text-foreground dark:text-gray-100">
                    {post.title}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

