"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { consumeDiaryRefetch, type DiaryEntryItem } from "@/lib/diary-storage";
import { DiaryDetailModal } from "@/components/diary/DiaryDetailModal";
import { Clock, PenSquare, ArrowUpDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [sortBy, setSortBy] = useState<"latest" | "oldest">("latest");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 15;

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!user) {
        setEntries([]);
        setTotalCount(0);
        return;
      }
      const client = createClient();
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data: rows, error, count } = await client
        .from("trading_diary")
        .select(
          "id, title, symbol, position, entry, tp, sl, profit, mistake, principle, tags, created_at, user_id",
          { count: "exact" }
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: sortBy === "oldest" })
        .range(from, to);
      if (error) {
        console.error("[매매일지 목록] DB 조회 실패:", error.message, error.code, error.details);
      }
      const fromDb = (rows || []).map(toListItem);
      setEntries(fromDb);
      setTotalCount(count ?? 0);
    } finally {
      setIsLoading(false);
    }
  }, [user, sortBy, page]);

  useEffect(() => {
    setPage(1);
  }, [sortBy]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    if (consumeDiaryRefetch()) fetchEntries();
  }, [fetchEntries]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1 border border-gray-200 bg-white text-xs font-medium shadow-sm hover:bg-gray-50"
                >
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  {sortBy === "latest" ? "최신순" : "오래된순"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-32 border border-gray-200 bg-white shadow-md"
              >
                <DropdownMenuItem
                  className="flex items-center gap-2 text-xs"
                  onClick={() => setSortBy("latest")}
                >
                  {sortBy === "latest" ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <span className="w-3" />
                  )}
                  <span className={sortBy === "latest" ? "font-semibold" : ""}>
                    최신순
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 text-xs"
                  onClick={() => setSortBy("oldest")}
                >
                  {sortBy === "oldest" ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <span className="w-3" />
                  )}
                  <span className={sortBy === "oldest" ? "font-semibold" : ""}>
                    오래된순
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* 포인트 / 어뷰징 방지 안내 */}
        <div className="mb-6 rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-xs leading-relaxed text-yellow-900">
          <p className="mb-1 font-semibold">
            ⚠️ 매매일지 포인트 지급 및 어뷰징 안내
          </p>
          <p>
            포인트 지급: 매매일지 작성 시 포인트는 하루 딱 1개까지만 지급됩니다. (중복 작성은 가능하지만 추가 포인트는 없습니다)
          </p>
          <p className="mt-1">
            어뷰징 경고: 무분별한 도배나 악용이 적발될 경우 포인트 회수 및 게시글 삭제 대상입니다.
          </p>
          <p className="mt-2 text-[11px] text-yellow-800">
            정성스러운 매매일지는 본인의 실력 향상에도 큰 도움이 됩니다. 건강한 커뮤니티를 위해 함께 노력해 주세요!
          </p>
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
              <p className="text-muted-foreground">오늘의 매매를 기록해보세요!</p>
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

        {!isLoading && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            light
          />
        )}
      </main>

      <DiaryDetailModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />

      <Footer />
    </div>
  );
}
