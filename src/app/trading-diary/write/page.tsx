"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TradingJournalForm } from "@/components/community/TradingJournalForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TradingDiaryWritePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto max-w-screen-xl px-4 py-6">
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild className="gap-1 text-muted-foreground">
              <Link href="/trading-diary">
                <ArrowLeft className="h-4 w-4" />
                매매일지 목록으로
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">매매일지 작성</h1>
          <p className="text-sm text-muted-foreground mb-6">데이터 입력 후 하단에서 기록하기를 눌러주세요.</p>

          <TradingJournalForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
