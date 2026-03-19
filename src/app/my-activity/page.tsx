"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import type { Post, Comment } from "@/types/database";
import { Pagination } from "@/components/ui/pagination";

type ActivityTab = "posts" | "comments";

const PAGE_SIZE = 15;

export default function MyActivityPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [tab, setTab] = useState<ActivityTab>("posts");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchActivity = async () => {
      setLoading(true);
      try {
        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        if (tab === "posts") {
          const { data, count, error } = await supabase
            .from("posts")
            .select("*", { count: "exact" })
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .range(from, to);
          if (!error && data) {
            setPosts(data as Post[]);
            setTotal(count ?? 0);
          }
        } else {
          const { data, count, error } = await supabase
            .from("comments")
            .select("*", { count: "exact" })
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .range(from, to);
          if (!error && data) {
            setComments(data as Comment[]);
            setTotal(count ?? 0);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    void fetchActivity();
  }, [user, supabase, tab, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 bg-gray-50 dark:bg-[#0B1120]">
        <div className="container mx-auto max-w-screen-md px-4 py-8">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-foreground dark:text-gray-100">
              내 활동
            </h1>
            <p className="mt-1 text-sm text-muted-foreground dark:text-gray-400">
              커뮤니티에 남긴 글과 댓글을 한눈에 확인할 수 있습니다.
            </p>
          </div>

          {/* 토글 탭 */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="inline-flex rounded-full border border-border bg-muted/40 p-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setTab("posts");
                  setPage(1);
                }}
                className={`px-4 py-1.5 rounded-full transition-colors ${
                  tab === "posts"
                    ? "bg-white text-foreground shadow-sm dark:bg-gray-900 dark:text-gray-100"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                내가 쓴 글
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab("comments");
                  setPage(1);
                }}
                className={`px-4 py-1.5 rounded-full transition-colors ${
                  tab === "comments"
                    ? "bg-white text-foreground shadow-sm dark:bg-gray-900 dark:text-gray-100"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                내 댓글
              </button>
            </div>
            {user && (
              <p className="text-xs text-muted-foreground dark:text-gray-400">
                총{" "}
                <span className="font-semibold text-foreground dark:text-gray-100">
                  {total.toLocaleString()}
                </span>
                건
              </p>
            )}
          </div>

          {/* 리스트 */}
          {!user ? (
            <div className="mt-4 rounded-xl border border-dashed border-border bg-card/40 p-6 text-center text-sm text-muted-foreground">
              로그인 후 이용할 수 있습니다.
            </div>
          ) : loading ? (
            <div className="mt-4 rounded-xl border border-border bg-card/40 p-6 text-center text-sm text-muted-foreground">
              불러오는 중입니다...
            </div>
          ) : tab === "posts" ? (
            <div className="mt-2">
              {posts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  아직 작성한 커뮤니티 글이 없습니다.
                </p>
              ) : (
                <ul className="space-y-2">
                  {posts.map((post) => (
                    <li key={post.id}>
                      <Link
                        href={`/community/${post.id}`}
                        className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
                      >
                        <span className="truncate text-foreground dark:text-gray-100">
                          {post.title}
                        </span>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {new Date(post.created_at).toLocaleString()}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="mt-2">
              {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  아직 작성한 댓글이 없습니다.
                </p>
              ) : (
                <ul className="space-y-2">
                  {comments.map((c) => (
                    <li key={c.id}>
                      <div className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-900">
                        <p className="truncate text-foreground dark:text-gray-100">
                          {c.content}
                        </p>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {new Date(c.created_at).toLocaleString()}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {user && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              light
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

