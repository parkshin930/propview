"use client";

import { useEffect, useState } from "react";

type FearGreedData = {
  value: number;
  classification: string;
};

const API_URL = "https://api.alternative.me/fng/?limit=1&format=json";

export function useFearGreedIndex() {
  const [data, setData] = useState<FearGreedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(API_URL, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message ?? "Failed to load fear & greed index");
        if (cancelled) return;
        const item = json?.data?.[0];
        const value = item ? Number(item.value) : NaN;
        const classification = item?.value_classification ?? "";
        if (!Number.isFinite(value)) throw new Error("Invalid fear & greed value");
        setData({ value, classification });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "지수를 불러올 수 없습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    const id = setInterval(fetchData, 60 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return { data, loading, error };
}

