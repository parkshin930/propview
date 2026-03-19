"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MAX_VISIBLE = 5;

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** 라이트 모드에 어울리는 스타일 (기본 true) */
  light?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  light = true,
}: PaginationProps) {
  const start = Math.max(1, currentPage - Math.floor(MAX_VISIBLE / 2));
  const end = Math.min(totalPages, start + MAX_VISIBLE - 1);
  const from = Math.max(1, end - MAX_VISIBLE + 1);
  const pages: number[] = [];
  for (let i = from; i <= end; i++) pages.push(i);

  const base =
    "min-w-[2.25rem] h-9 rounded-md border text-sm font-medium transition-colors ";
  const normal = light
    ? "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300"
    : "border-border bg-background text-foreground hover:bg-muted";
  const active = light
    ? "border-black bg-black text-white hover:bg-black hover:border-black"
    : "border-white bg-white text-black hover:bg-white/90";

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-1.5 py-4"
      aria-label="페이지 네비게이션"
    >
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={`h-9 w-9 shrink-0 rounded-md ${light ? "border-gray-200 bg-white hover:bg-gray-50" : ""}`}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="이전 페이지"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="flex items-center gap-1">
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`${base} ${p === currentPage ? active : normal}`}
            aria-label={`${p}페이지`}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </button>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={`h-9 w-9 shrink-0 rounded-md ${light ? "border-gray-200 bg-white hover:bg-gray-50" : ""}`}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="다음 페이지"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
