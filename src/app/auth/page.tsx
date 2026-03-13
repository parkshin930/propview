"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await signInWithEmail(email, password);
        router.push("/");
      } else {
        await signUpWithEmail(email, password);
        setMessage("입력하신 이메일로 확인 메일을 보냈어요. 메일을 확인해 주세요.");
      }
    } catch (err) {
      setError(
        mode === "login"
          ? "이메일 또는 비밀번호를 다시 확인해 주세요."
          : "회원가입 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.",
      );
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setMessage(null);
    try {
      await signInWithGoogle();
      // OAuth 리다이렉트 후 세션이 설정되면 메인으로 이동
      router.push("/");
    } catch (err) {
      setError("구글 로그인 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col">
      <header className="w-full border-b bg-white/95 backdrop-blur" style={{ borderBottomColor: 'var(--header-border, #f0f0f0)', borderBottomWidth: '1px' }}>
        <div className="mx-auto flex h-14 max-w-screen-md items-center justify-between pl-5 pr-4">
          <Link href="/" className="flex items-end gap-1.5">
            <img
              src="/pv-logo.png"
              alt=""
              width={34}
              height={34}
              className="h-[34px] w-[34px] shrink-0 object-contain object-center"
            />
            <span className="-mb-0.5 text-base font-semibold leading-none tracking-tight" style={{ color: 'var(--brand-charcoal, #222222)' }}>
              PROPVIEW
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            메인으로 돌아가기
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border bg-background/80 backdrop-blur shadow-lg p-8">
          <div className="mb-6 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#52c68f]">
              WELCOME
            </p>
            <h1 className="text-2xl font-semibold text-foreground">
              커뮤니티에 로그인
            </h1>
            <p className="text-xs text-muted-foreground">
              코인프랍 전용 뉴스 피드와 실시간 토론,
              <br />
              오직 트레이더를 위한 시스템을 한곳에서 만나보세요.
            </p>
          </div>

          <div className="mb-6 inline-flex items-center gap-1 rounded-full bg-muted p-1 text-xs">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-full px-3 py-1.5 transition-colors ${
                mode === "login"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              로그인
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 rounded-full px-3 py-1.5 transition-colors ${
                mode === "register"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              회원가입
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                이메일
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="mt-0.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-[#52c68f] focus-visible:ring-offset-1"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                비밀번호
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="최소 6자 이상 입력해 주세요"
                className="mt-0.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-[#52c68f] focus-visible:ring-offset-1"
              />
            </div>

            {mode === "login" && (
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  비밀번호를 잊으셨나요?
                </button>
              </div>
            )}

            {error && (
              <p className="text-xs text-destructive bg-destructive/5 border border-destructive/40 rounded-md px-3 py-2">
                {error}
              </p>
            )}
            {message && (
              <p className="text-xs text-[#52c68f] bg-[#52c68f]/5 border border-[#52c68f]/40 rounded-md px-3 py-2">
                {message}
              </p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 w-full rounded-md bg-[#52c68f] text-xs font-semibold tracking-wide text-white hover:bg-[#42b67f]"
            >
              {mode === "login" ? "이메일로 로그인" : "이메일로 회원가입"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            <span>또는 소셜 계정으로 계속하기</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="flex flex-col items-stretch">
            <Button
              type="button"
              variant="outline"
              className="w-full justify-center rounded-md bg-background text-xs font-medium"
              onClick={handleGoogle}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              구글로 계속하기
            </Button>
          </div>

          <p className="mt-6 text-[10px] leading-relaxed text-muted-foreground">
            계속 진행하면{" "}
            <button
              type="button"
              className="underline underline-offset-2 hover:text-foreground"
            >
              이용약관
            </button>{" "}
            및{" "}
            <button
              type="button"
              className="underline underline-offset-2 hover:text-foreground"
            >
              개인정보 처리방침
            </button>
            에 동의하는 것으로 간주됩니다.
          </p>
        </div>
      </main>
    </div>
  );
}

