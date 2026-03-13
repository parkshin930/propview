"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, BarChart3 } from "lucide-react";
import type { DiaryEntryItem } from "@/lib/diary-storage";

interface DiaryDetailModalProps {
  entry: DiaryEntryItem | null;
  onClose: () => void;
}

export function DiaryDetailModal({ entry, onClose }: DiaryDetailModalProps) {
  useEffect(() => {
    if (!entry) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [entry, onClose]);

  if (!entry) return null;

  const hasSummary =
    entry.entry != null || entry.tp != null || entry.sl != null || entry.profit != null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-gray-700 bg-[#111827] shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal
        aria-labelledby="diary-modal-title"
      >
        <div className="flex items-center justify-between border-b border-gray-700/80 px-5 py-4 shrink-0">
          <h2 id="diary-modal-title" className="text-lg font-semibold text-gray-100 truncate pr-4">
            {entry.title}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 shrink-0 text-gray-400 hover:text-gray-100 hover:bg-gray-700/50 rounded-full"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <p className="text-xs text-gray-500">
            {new Date(entry.createdAt).toLocaleString("ko-KR")}
            {entry.id.startsWith("local-") && (
              <span className="ml-2 text-amber-500">(로컬 저장)</span>
            )}
          </p>

          {(entry.symbol || entry.position) && (
            <p className="text-sm text-gray-400">
              {entry.symbol} · {entry.position === "long" ? "롱" : "숏"}
            </p>
          )}

          {hasSummary && (
            <section className="rounded-xl border border-gray-700/80 bg-gray-900/50 p-4">
              <h3 className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                <BarChart3 className="h-4 w-4 text-emerald-500" />
                매매 요약
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                {entry.entry != null && (
                  <div>
                    <span className="text-gray-500">진입가</span>
                    <p className="font-medium text-gray-100">{entry.entry.toLocaleString()}</p>
                  </div>
                )}
                {entry.tp != null && (
                  <div>
                    <span className="text-gray-500">목표가</span>
                    <p className="font-medium text-emerald-400">{entry.tp.toLocaleString()}</p>
                  </div>
                )}
                {entry.sl != null && (
                  <div>
                    <span className="text-gray-500">손절가</span>
                    <p className="font-medium text-rose-400">{entry.sl.toLocaleString()}</p>
                  </div>
                )}
                {entry.profit != null && (
                  <div>
                    <span className="text-gray-500">수익</span>
                    <p className={`font-medium ${entry.profit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {entry.profit >= 0 ? "+" : ""}{entry.profit}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {(entry.mistake || entry.principle) && (
            <section className="space-y-4">
              {entry.mistake && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">잘못한 점 / 복기</h3>
                  <p className="text-gray-100 whitespace-pre-wrap leading-relaxed">{entry.mistake}</p>
                </div>
              )}
              {entry.principle && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">다음 원칙</h3>
                  <p className="text-gray-100 whitespace-pre-wrap leading-relaxed">{entry.principle}</p>
                </div>
              )}
            </section>
          )}

          {entry.tags && entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-700/80 px-3 py-1 text-xs text-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {!entry.mistake && !entry.principle && !hasSummary && (
            <p className="text-gray-500 text-sm">작성된 내용이 없습니다.</p>
          )}
        </div>

        <div className="shrink-0 border-t border-gray-700/80 px-5 py-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full border-gray-600 text-gray-200 hover:bg-gray-700/50 hover:text-gray-100"
          >
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
}
