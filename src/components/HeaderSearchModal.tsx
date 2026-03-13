"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Post } from "@/types/database";
import { Search, X } from "lucide-react";

const CATEGORY_LABEL: Record<string, string> = {
  analysis: "매매일지",
  profit: "출금 인증",
  free: "자유글",
  question: "질문",
};

interface HeaderSearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function HeaderSearchModal({ open, onClose }: HeaderSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Post[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const supabase = createClient();

  const search = useCallback(
    async (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("id, title, content, category, created_at")
          .or(`title.ilike.%${trimmed}%,content.ilike.%${trimmed}%`)
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) {
          console.error("Search error:", error);
          setResults([]);
          return;
        }
        setResults((data as Post[]) || []);
      } finally {
        setIsSearching(false);
      }
    },
    [supabase]
  );

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, open, search]);

  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 backdrop-blur-sm pt-[15vh] px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="통합 검색"
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-background border border-border shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="손절, 익절, 나스닥 등 검색..."
            className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
            autoFocus
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {isSearching && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              검색 중...
            </div>
          )}
          {!isSearching && query.trim() && results.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              검색 결과가 없습니다.
            </div>
          )}
          {!isSearching && results.length > 0 && (
            <ul className="py-2">
              {results.map((post) => (
                <li key={post.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      router.push(`/community/${post.id}`);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex items-baseline gap-2"
                  >
                    <span className="shrink-0 text-xs font-medium text-blue-600 dark:text-blue-400">
                      [{CATEGORY_LABEL[post.category] || post.category}]
                    </span>
                    <span className="truncate text-sm text-foreground">
                      {post.title}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
