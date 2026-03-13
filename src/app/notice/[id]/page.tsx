"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NOTICE_BODY: Record<string, { title: string; body: string; date: string; isPinned: boolean }> = {
  "1": {
    title: "PropView 정식 런칭 및 포인트 시스템 안내",
    date: "2025.03.10",
    isPinned: true,
    body: "PropView가 정식 런칭되었습니다. 매매일지 작성, 출금 인증, 출석체크를 통해 포인트를 적립하고 에어드롭에서 챌린지 할인 쿠폰으로 사용할 수 있습니다. 자세한 내용은 에어드롭 페이지를 확인해 주세요.",
  },
  "2": {
    title: "무바이트(Mubite) 점검 시간 안내",
    date: "2025.03.08",
    isPinned: false,
    body: "무바이트 서비스 점검으로 3월 9일 02:00~06:00( KST ) 동안 접속이 제한될 예정입니다. 불편을 드려 죄송합니다.",
  },
  "3": {
    title: "3월 시스템 점검 안내",
    date: "2025.03.01",
    isPinned: false,
    body: "원활한 서비스 제공을 위해 정기 점검을 실시합니다. 일정은 추후 공지하겠습니다.",
  },
  "4": {
    title: "출금 인증 절차 개선 안내",
    date: "2025.02.28",
    isPinned: false,
    body: "출금 인증 절차가 개선되었습니다. 커뮤니티의 출금 인증 카테고리에서 인증 방법을 확인해 주세요.",
  },
};

export default function NoticeDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const notice = id ? NOTICE_BODY[id] : null;

  if (!notice) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto max-w-screen-md px-4 py-12 text-center">
          <p className="text-muted-foreground">공지를 찾을 수 없습니다.</p>
          <Button asChild variant="link" className="mt-4">
            <Link href="/notice">목록으로</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto max-w-screen-md px-4 py-8">
          <Button variant="ghost" size="sm" asChild className="mb-6 gap-1 text-muted-foreground">
            <Link href="/notice">
              <ArrowLeft className="h-4 w-4" />
              목록으로
            </Link>
          </Button>

          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {notice.isPinned && (
                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                  중요
                </span>
              )}
              <time className="text-sm text-muted-foreground">{notice.date}</time>
            </div>
            <h1 className="text-xl font-bold text-foreground mb-6">{notice.title}</h1>
            <div className="prose prose-sm text-muted-foreground whitespace-pre-line">
              {notice.body}
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
