"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { loadLocalEntries, consumeDiaryRefetch, type DiaryEntryItem } from "@/lib/diary-storage";
import { DiaryDetailModal } from "@/components/diary/DiaryDetailModal";
import { Clock, PenSquare } from "lucide-react";

function toListItem(row: { id: string; title: string; created_at: string; [k: string]: unknown }): DiaryEntryItem {
  return {
    id: row.id,
    title: row.title,
    symbol: (row.symbol as string) ?? "",
    position: (row.position as "long" | "short") ?? "long",
    entry: row.entry as number | null,
    tp: row.tp as number | null,
    sl: row.sl as number | null,
    profit: row.profit as number | null,
    mistake: (row.mistake as string) ?? "",
    principle: (row.principle as string) ?? "",
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    createdAt: row.created_at as string,
    userId: row.user_id as string,
  };
}

export default function TradingDiaryPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DiaryEntryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntryItem | null>(null);

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const local = loadLocalEntries();
      if (!user) {
        setEntries(local.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setIsLoading(false);
        return;
      }
      const client = createClient();
      const { data: rows, error } = await client
        .from("trading_diary")
        .select("id, title, symbol, position, entry, tp, sl, profit, mistake, principle, tags, created_at, user_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) {
        console.error("[매매일지 목록] DB 조회 실패:", error.message, error.code, error.details);
      }
      const fromDb = (rows || []).map(toListItem);
      const merged = [...fromDb];
      const localIds = new Set(fromDb.map((e) => e.id));
      local.forEach((e) => {
        if (!localIds.has(e.id)) merged.push(e);
      });
      merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setEntries(merged);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    if (consumeDiaryRefetch()) fetchEntries();
  }, [fetchEntries]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto max-w-screen-xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">매매일지</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              트레이더들의 매매 기록과 복기를 확인하세요
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild size="sm" className="gap-1.5 bg-green-600 hover:bg-green-700">
              <Link href="/trading-diary/write">
                <PenSquare className="h-4 w-4" />
                글쓰기
              </Link>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="gap-1"
            >
              <Clock className="h-4 w-4" />
              최신순
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-2xl border border-gray-100 bg-white shadow-sm animate-pulse"
              >
                <div className="p-4">
                  <div className="h-4 w-24 rounded bg-gray-200" />
                  <div className="mt-3 h-6 w-full rounded bg-gray-200" />
                  <div className="mt-4 aspect-video rounded-lg bg-gray-200" />
                </div>
              </div>
            ))
          ) : entries.length === 0 ? (
            <div className="col-span-full py-12 text-center">
              <p className="text-muted-foreground">아직 매매일지 글이 없습니다.</p>
              <Button asChild className="mt-4 gap-1.5 bg-green-600 hover:bg-green-700">
                <Link href="/trading-diary/write">
                  <PenSquare className="h-4 w-4" />
                  매매일지 글쓰기
                </Link>
              </Button>
            </div>
          ) : (
            entries.map((entry) => (
              <article
                key={entry.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedEntry(entry)}
                onKeyDown={(e) => e.key === "Enter" && setSelectedEntry(entry)}
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md cursor-pointer dark:border-gray-700 dark:bg-[#111827] dark:hover:bg-gray-800/80"
              >
                <div className="flex items-center gap-2 p-4 pb-2">
                  <div className="h-8 w-8 shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600 dark:bg-gray-600 dark:text-gray-300">
                    {entry.title.charAt(0) || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleDateString("ko-KR")}
                      {entry.id.startsWith("local-") && (
                        <span className="ml-1 text-amber-600">(로컬)</span>
                      )}
                    </p>
                  </div>
                </div>
                <h2 className="line-clamp-2 px-4 py-2 text-base font-semibold text-foreground dark:text-gray-100">
                  {entry.title}
                </h2>
                {(entry.symbol || entry.position) && (
                  <p className="px-4 text-xs text-muted-foreground">
                    {entry.symbol} {entry.position.toUpperCase()}
                  </p>
                )}
                <div className="mt-auto border-t border-gray-50 px-4 py-3 dark:border-gray-700">
                  <span className="text-xs text-muted-foreground">클릭하여 상세 보기</span>
                </div>
              </article>
            ))
          )}
        </div>
      </main>

      <DiaryDetailModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />

      <Footer />
    </div>
  );
}
