"use client";

import { useState, useEffect } from "react";

interface WeeklyTrader {
  rank: number;
  user_id: string;
  display_name: string;
  total_likes: number;
}

export function TopTraderRanking() {
  const [list, setList] = useState<WeeklyTrader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/weekly-top-traders")
      .then((res) => res.json())
      .then((data) => {
        setList(Array.isArray(data?.list) ? data.list : []);
      })
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  const top3 = list.slice(0, 3);

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h3 className="mb-1 text-sm font-semibold text-foreground">
        주간 인기 트레이더
      </h3>
      <p className="mb-4 text-xs text-muted-foreground">
        이번 주 받은 좋아요 수 기준 1~3위
      </p>
      {loading ? (
        <p className="text-sm text-muted-foreground">로딩 중...</p>
      ) : top3.length === 0 ? (
        <p className="text-sm text-muted-foreground">이번 주 데이터가 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {top3.map((item) => (
            <li
              key={`${item.rank}-${item.user_id}`}
              className="flex items-center justify-between gap-2 rounded-lg py-2"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-foreground dark:bg-gray-700">
                  {item.rank}
                </span>
                <span className="text-sm font-medium text-foreground truncate">
                  {item.display_name}
                </span>
              </div>
              <span className="text-sm font-semibold text-green-600 dark:text-green-400 shrink-0">
                ♥ {item.total_likes}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
