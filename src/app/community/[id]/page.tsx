"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DiaryDetailView } from "@/components/community/DiaryDetailView";
import { createClient } from "@/lib/supabase/client";
import type { Post } from "@/types/database";

export default function CommunityPostPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          profiles (
            id,
            full_name,
            avatar_url
          )
        `
        )
        .eq("id", id)
        .single();

      if (error || !data) {
        setPost(null);
        return;
      }
      setPost(data as Post);
    };

    fetchPost().finally(() => setIsLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        ) : !post ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4">
            <p className="text-muted-foreground">글을 찾을 수 없습니다.</p>
            <Link
              href="/community"
              className="text-sm font-medium text-green-600 hover:underline"
            >
              커뮤니티로 돌아가기
            </Link>
          </div>
        ) : (
          <DiaryDetailView post={post} />
        )}
      </main>

      <Footer />
    </div>
  );
}
