import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "공지사항 | PropView",
  description: "PropView 공지사항과 서비스 안내를 확인하세요.",
};

export default function NoticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
