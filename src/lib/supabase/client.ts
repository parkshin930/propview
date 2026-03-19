import { createBrowserClient } from "@supabase/ssr";

// ============================================
// Supabase 브라우저 클라이언트
// ============================================
// 환경 변수 설정 방법:
// 1. .env.local.example 파일을 .env.local로 복사
// 2. Supabase 대시보드 → Settings → API 에서 값 복사
// 3. NEXT_PUBLIC_SUPABASE_URL 과 NEXT_PUBLIC_SUPABASE_ANON_KEY 입력
// ============================================

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "⚠️ Supabase 환경 변수가 설정되지 않았습니다.\n" +
      ".env.local 파일을 만들고 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정하세요."
    );
    return createBrowserClient(
      "https://placeholder.supabase.co",
      "placeholder-key"
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
