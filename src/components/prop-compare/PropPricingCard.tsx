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
      className={`w-full rounded-2xl border-2 bg-white p-6 text-left shadow-lg transition duration-200 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
        isSelected ? "border-green-500" : "border-gray-100 hover:border-gray-200"
      } cursor-pointer`}
    >
      {/* 헤더: 로고 자리 + 제목 */}
      <div className="mb-4 flex items-start gap-4">
        <div className="h-14 w-14 shrink-0 rounded-full bg-gray-100" aria-hidden />
        <div>
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
          <span
            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${
              badgeGreen ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
            }`}
          >
            {badge}
          </span>
        </div>
      </div>

      {/* 스펙 리스트 */}
      <ul className="mb-6 space-y-3">
        {specs.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
            <CheckCircle className="h-5 w-5 shrink-0 text-green-500" aria-hidden />
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
