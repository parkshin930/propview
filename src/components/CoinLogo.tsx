"use client";

import { useState, useMemo } from "react";
import {
  getOrderedLogoUrls,
  getBinanceLogoUrl,
  getFallbackLogoUrls,
  getFallbackLogoUrlsWithoutBinance,
  getCoinBrandColor,
} from "@/lib/coin-logo";

type CoinLogoProps = {
  baseAsset: string;
  className?: string;
  size?: number;
  /** 최우선 사용할 로고 URL (지정 시 이 URL 먼저 시도) */
  imageUrl?: string;
  /** true면 imageUrl 실패 시 다른 URL 시도 없이 알파벳 배지로만 폴백 */
  singleSource?: boolean;
};

/**
 * 순서: (imageUrl) | 로컬(상위50) → 바이낸스 → 코인게코 → CryptoIcons → 알파벳 배지(브랜드 색)
 */
export function CoinLogo({ baseAsset, className = "", size = 20, imageUrl, singleSource = false }: CoinLogoProps) {
  const ordered = useMemo(() => getOrderedLogoUrls(baseAsset), [baseAsset]);
  const primarySrc = useMemo(() => {
    if (imageUrl?.trim()) return imageUrl.trim();
    return ordered[0] ?? "";
  }, [baseAsset, imageUrl, ordered]);
  const fallbackUrls = useMemo(() => {
    if (singleSource && imageUrl?.trim()) return [];
    if (imageUrl?.trim()) return getFallbackLogoUrlsWithoutBinance(baseAsset);
    return ordered.slice(1);
  }, [baseAsset, imageUrl, singleSource, ordered]);
  const [tryIndex, setTryIndex] = useState(0);
  const currentSrc = tryIndex === 0 ? primarySrc : fallbackUrls[tryIndex - 1] ?? "";

  const handleError = () => {
    if (tryIndex < fallbackUrls.length) setTryIndex((i) => i + 1);
    else setTryIndex(-1); // 모든 URL 실패 → 알파벳 배지
  };

  const badgeColor = getCoinBrandColor(baseAsset);

  if (tryIndex === -1) {
    return (
      <span
        className={`shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white ${className}`}
        style={{
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
          backgroundColor: badgeColor,
        }}
        aria-hidden
      >
        {baseAsset.slice(0, 1)}
      </span>
    );
  }

  return (
    <img
      src={currentSrc}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      className={`shrink-0 rounded-full object-contain ${className}`}
      style={{ minWidth: size, minHeight: size }}
      onError={handleError}
    />
  );
}
