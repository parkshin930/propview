import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "초보 이용가이드 | PropView - 프랍 트레이딩 3분 만에 이해하기",
  description:
    "프랍 트레이딩이란? 챌린지, 리스크 관리, PropView 활용법을 3분 만에 알아보세요.",
};

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
