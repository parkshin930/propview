"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Guide } from "@/types/database";

export default function GuideDetailByIdPage() {
  const params = useParams();
  const idParam = params?.id as string | undefined;
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    if (!idParam) return;
    const numericId = Number(idParam);
    if (Number.isNaN(numericId)) return;

    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("guides")
          .select("*")
          .eq("id", numericId)
          .single();

        if (error || !data) {
          console.error("가이드 상세 조회 실패:", error);
          setGuide(null);
          return;
        }
        setGuide(data as Guide);
      } catch (e) {
        console.error("가이드 상세 에러:", e);
        setGuide(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [idParam, supabase]);

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-[#020617]">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto max-w-screen-md px-4 py-8">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="mb-6 gap-1 text-muted-foreground"
          >
            <Link href="/guide">
              <ArrowLeft className="h-4 w-4" />
              초보 이용 가이드 목록
            </Link>
          </Button>

          {loading ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center text-sm text-muted-foreground">
              불러오는 중입니다...
            </div>
          ) : !guide ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center text-sm text-muted-foreground">
              가이드를 찾을 수 없습니다.
            </div>
          ) : (
            <article className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm dark:border-slate-800 dark:bg-[#020617]">
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-300 uppercase tracking-wider mb-2">
                PROPVIEW 이용 가이드
              </p>
              <h1 className="text-xl font-bold text-foreground dark:text-gray-100 mb-4">
                {guide.title}
              </h1>
              <div className="prose prose-sm text-slate-800 dark:text-gray-200 whitespace-pre-wrap">
                {guide.body}
              </div>
            </article>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

