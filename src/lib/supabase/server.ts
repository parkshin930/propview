import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// ============================================
// Supabase 서버 클라이언트 (Server Components용)
// ============================================

export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("⚠️ Supabase 환경 변수가 설정되지 않았습니다.");
    return createServerClient(
      "https://placeholder.supabase.co",
      "placeholder-key",
      {
        cookies: {
          getAll() {
            return [];
          },
          setAll() {},
        },
      }
    );
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Component에서 호출된 경우 무시
        }
      },
    },
  });
}
