"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import type { Post, Comment } from "@/types/database";

interface CommentWithPost extends Comment {
  posts?: Post;
}

export default function MyCommentsPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [comments, setComments] = useState<CommentWithPost[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("comments")
          .select(
            `
            *,
            posts (*)
          `
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (!error && data) {
          setComments(data as CommentWithPost[]);
        }
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [supabase, user]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 bg-gray-50 dark:bg-[#0B1120]">
        <div className="container mx-auto max-w-screen-md px-4 py-8">
          <h1 className="text-2xl font-bold text-foreground dark:text-gray-100 mb-1">
            내 댓글
          </h1>
          <p className="text-sm text-muted-foreground dark:text-gray-400 mb-6">
            커뮤니티에 남긴 댓글을 모아서 볼 수 있습니다.
          </p>

          {!user ? (
            <div className="mt-6 rounded-xl border border-dashed border-border bg-card/40 p-6 text-center text-sm text-muted-foreground">
              로그인 후 이용할 수 있습니다.
            </div>
          ) : loading ? (
            <div className="mt-6 rounded-xl border border-border bg-card/40 p-6 text-center text-sm text-muted-foreground">
              불러오는 중입니다...
            </div>
          ) : comments.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              아직 작성한 댓글이 없습니다.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {comments.map((c) => (
                <Link
                  key={c.id}
                  href={c.posts ? `/community/${c.posts.id}` : "#"}
                  className="block rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-muted-foreground">
                      {c.posts?.title ?? "삭제된 게시글"}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(c.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="truncate text-foreground dark:text-gray-100">
                    {c.content}
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

