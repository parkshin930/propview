"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";

interface SentimentData {
  bull: number;
  bear: number;
  total: number;
  bullPercent: number;
  bearPercent: number;
  day_key?: string;
  my_vote?: "bull" | "bear";
}

export function MarketSentimentCard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [data, setData] = useState<SentimentData | null>(null);
  const [myVote, setMyVote] = useState<"bull" | "bear" | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  const fetchSentiment = useCallback(async () => {
    try {
      const res = await fetch("/api/sentiment");
      const json = await res.json();
      if (res.ok && json.bullPercent != null) {
        setData({
          bull: json.bull ?? 0,
          bear: json.bear ?? 0,
          total: json.total ?? 0,
          bullPercent: json.bullPercent ?? 50,
          bearPercent: json.bearPercent ?? 50,
          my_vote: json.my_vote,
        });
        setMyVote(json.my_vote ?? null);
      } else {
        setData({
          bull: 0,
          bear: 0,
          total: 0,
          bullPercent: 50,
          bearPercent: 50,
        });
      }
    } catch {
      setData({
        bull: 0,
        bear: 0,
        total: 0,
        bullPercent: 50,
        bearPercent: 50,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSentiment();
    const interval = setInterval(fetchSentiment, 30_000);
    return () => clearInterval(interval);
  }, [fetchSentiment]);

  const handleVote = async (choice: "bull" | "bear") => {
    if (!user) {
      showToast("로그인 후 투표할 수 있습니다.");
      return;
    }
    if (voting) return;
    setVoting(true);
    try {
      const res = await fetch("/api/sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice }),
      });
      const json = await res.json();
      if (!res.ok) {
        showToast(json?.error || "투표에 실패했습니다.");
        return;
      }
      setMyVote(choice);
      if (json.bullPercent != null) {
        setData({
          bull: json.bull ?? 0,
          bear: json.bear ?? 0,
          total: json.total ?? 0,
          bullPercent: json.bullPercent ?? 50,
          bearPercent: json.bearPercent ?? 50,
        });
      }
      showToast(choice === "bull" ? "Bull(상승) 투표 완료" : "Bear(하락) 투표 완료");
    } catch {
      showToast("투표에 실패했습니다.");
    } finally {
      setVoting(false);
    }
  };

  const bullPercent = data?.bullPercent ?? 50;
  const bearPercent = data?.bearPercent ?? 50;
  const total = data?.total ?? 0;

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h3 className="mb-2 text-base font-semibold tracking-tight text-foreground">
        오늘의 시장 심리
      </h3>
      <p className="mb-5 text-xs text-muted-foreground">
        오늘 비트코인 방향은? (매일 00:00 초기화)
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => handleVote("bull")}
          disabled={voting}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
            myVote === "bull"
              ? "bg-[#E6F4EA] border-green-600 text-green-700 shadow-sm scale-[1.02]"
              : "bg-[#E6F4EA] border-green-500 text-green-700 hover:shadow-md hover:scale-[1.02]"
          }`}
        >
          Bull (상승)
        </button>
        <button
          type="button"
          onClick={() => handleVote("bear")}
          disabled={voting}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
            myVote === "bear"
              ? "bg-[#FCE8E6] border-red-600 text-red-700 shadow-sm scale-[1.02]"
              : "bg-[#FCE8E6] border-red-500 text-red-700 hover:shadow-md hover:scale-[1.02]"
          }`}
        >
          Bear (하락)
        </button>
      </div>
      <div className="mt-5 space-y-2">
        <div className="relative h-8 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-green-500 to-green-400 transition-[width] duration-500 ease-in-out"
            style={{ width: `${bullPercent}%` }}
          />
          <div
            className="absolute right-0 top-0 h-full rounded-full bg-gradient-to-l from-red-500 to-red-400 transition-[width] duration-500 ease-in-out"
            style={{ width: `${bearPercent}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-between px-3 text-[11px] font-medium text-white">
            <span>Bull {bullPercent}%</span>
            <span>Bear {bearPercent}%</span>
          </div>
        </div>
        {total > 0 && (
          <p className="text-xs text-muted-foreground">
            총 {total}명 참여
          </p>
        )}
      </div>
      {loading && !data && (
        <p className="mt-2 text-xs text-muted-foreground">로딩 중...</p>
      )}
    </div>
  );
}
