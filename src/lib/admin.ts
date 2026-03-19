import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";

/**
 * 관리자 여부
 * 1순위: profiles.role === 'admin'
 * 2순위(레거시): 특정 이메일/닉네임
 */
export function isAdmin(user: User | null, profile: Profile | null): boolean {
  if (!user) return false;
  if (profile?.role === "admin") return true;

  // 레거시 fallback: 특정 계정에 대해 관리자 권한 유지
  const ADMIN_EMAIL = "freefeel0701@gmail.com";
  const ADMIN_DISPLAY_NAMES = ["비트신"];
  const email = user.email?.toLowerCase();
  const displayName = profile?.display_name?.trim();
  const fullName = profile?.full_name?.trim();
  if (email === ADMIN_EMAIL) return true;
  if (ADMIN_DISPLAY_NAMES.some((n) => n === displayName || n === fullName)) return true;
  return false;
}
