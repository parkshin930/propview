"use client";

import { CheckCircle } from "lucide-react";

interface SpecItem {
  text: string;
}

interface PropPricingCardProps {
  id: "mubite" | "propw";
  title: string;
  subtitle: string;
  badge: string;
  badgeGreen?: boolean;
  specs: SpecItem[];
  buttonLabel: string;
  buttonGreen?: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onExpandRules?: () => void;
}

export function PropPricingCard({
  id,
  title,
  subtitle,
  badge,
  badgeGreen = true,
  specs,
  buttonLabel,
  buttonGreen = true,
  isSelected,
  onSelect,
  onExpandRules,
}: PropPricingCardProps) {
  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    onExpandRules?.();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`w-full rounded-2xl border-2 bg-white p-6 text-left shadow-lg transition duration-200 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 cursor-pointer dark:bg-gray-900 dark:border-gray-700 ${
        isSelected
          ? "border-green-500 dark:border-green-500"
          : "border-gray-100 hover:border-gray-200 dark:border-gray-700 dark:hover:border-gray-500"
      }`}
    >
      {/* 헤더: 로고 + 제목 */}
      <div className="mb-4 flex items-start gap-4">
        <div className="h-14 w-14 shrink-0 flex items-center justify-center rounded-full bg-white border border-gray-200 overflow-hidden dark:bg-gray-800 dark:border-gray-600" aria-hidden>
          <img
            src={id === "mubite" ? "/images/mubite-logo.png" : "/images/propw-logo.png"}
            alt={id === "mubite" ? "무바이트" : "PROP W"}
            className="h-10 w-10 object-contain"
            width={40}
            height={40}
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xl font-bold text-foreground dark:text-gray-100">{title}</h3>
          </div>
          <p className="text-sm text-muted-foreground dark:text-gray-300">{subtitle}</p>
          <span
            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${
              badgeGreen
                ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
            }`}
          >
            {badge}
          </span>
        </div>
      </div>

      {/* 스펙 리스트 */}
      <ul className="mb-6 space-y-3">
        {specs.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground dark:text-gray-100">
            <CheckCircle className="h-5 w-5 shrink-0 text-green-500 dark:text-green-400" aria-hidden />
            <span>{item.text}</span>
          </li>
        ))}
      </ul>

      {/* CTA 버튼 */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        className={`mb-3 w-full rounded-xl py-3.5 text-center font-semibold text-white transition-colors ${
          buttonGreen ? "bg-green-500 hover:bg-green-600" : "bg-gray-700 hover:bg-gray-800"
        }`}
      >
        {buttonLabel}
      </button>

      {/* 상세 규정 보기 링크 */}
      <button
        type="button"
        onClick={handleExpandClick}
        className="block w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        상세 규정 및 리뷰 보기 ▾
      </button>
    </div>
  );
}
