"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { isAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/client";
import { Shield, ArrowLeft } from "lucide-react";

export default function AdminPage() {
  const { user, profile } = useAuth();
  const [targetUserInput, setTargetUserInput] = useState("");
  const [deductCredits, setDeductCredits] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const admin = isAdmin(user, profile);

  useEffect(() => {
    if (!user && !profile) return;
    if (!admin) setMessage({ type: "err", text: "관리자만 접근할 수 있습니다." });
  }, [user, profile, admin]);

  const handleRevokeCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admin || !targetUserInput.trim()) return;
    const amount = parseInt(deductCredits, 10);
    if (isNaN(amount) || amount <= 0) {
      setMessage({ type: "err", text: "차감할 크레딧을 양수로 입력하세요." });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    const supabase = createClient();
    const input = targetUserInput.trim();
    const isUuid = /^[0-9a-f-]{36}$/i.test(input);
    let targetId: string | null = null;
    if (isUuid) {
      targetId = input;
    } else {
      const { data: row } = await supabase
        .from("profiles")
        .select("id")
        .ilike("email", input)
        .limit(1)
        .single();
      targetId = row?.id ?? null;
    }
    if (!targetId) {
      setMessage({ type: "err", text: "해당 이메일 또는 유저 ID를 찾을 수 없습니다." });
      setSubmitting(false);
      return;
    }
    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", targetId)
      .single();
    const current = (targetProfile?.credits ?? 0) - amount;
    const newCredits = Math.max(0, current);
    const { error } = await supabase
      .from("profiles")
      .update({ credits: newCredits })
      .eq("id", targetId);
    setSubmitting(false);
    if (error) {
      setMessage({ type: "err", text: "처리 실패: " + error.message });
      return;
    }
    setMessage({ type: "ok", text: `크레딧 ${amount} 회수 완료. 잔여 ${newCredits} C` });
    setTargetUserInput("");
    setDeductCredits("");
  };

  if (!admin && user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto max-w-screen-md px-4 py-12 text-center">
          <p className="text-muted-foreground">관리자만 접근할 수 있습니다.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/">홈으로</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto max-w-screen-md px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="gap-1 text-muted-foreground">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              홈으로
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-6 w-6 text-amber-500" />
          <h1 className="text-2xl font-bold text-foreground">관리자</h1>
        </div>

        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">포인트/크레딧 회수</h2>
          <p className="text-sm text-muted-foreground mb-4">
            대상 유저 이메일 또는 유저 ID(UUID)와 차감할 크레딧을 입력하세요. (크레딧만 차감)
          </p>
          <form onSubmit={handleRevokeCredits} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">대상 이메일 또는 유저 ID</label>
              <input
                type="text"
                value={targetUserInput}
                onChange={(e) => setTargetUserInput(e.target.value)}
                placeholder="user@example.com 또는 UUID"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">차감 크레딧 (C)</label>
              <input
                type="number"
                min={1}
                value={deductCredits}
                onChange={(e) => setDeductCredits(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            {message && (
              <p className={`text-sm ${message.type === "ok" ? "text-green-600" : "text-red-600"}`}>
                {message.text}
              </p>
            )}
            <Button type="submit" disabled={submitting} className="bg-amber-600 hover:bg-amber-700">
              {submitting ? "처리 중..." : "크레딧 회수"}
            </Button>
          </form>
        </section>

        <p className="mt-6 text-xs text-muted-foreground">
          출금 인증 승인은 커뮤니티 → 출금 인증 탭에서 &quot;승인 대기&quot; 카드의 [승인] 버튼으로 처리할 수 있습니다.
        </p>
      </main>

      <Footer />
    </div>
  );
}
