import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";

const ADMIN_EMAIL = "freefeel0701@gmail.com";
const ADMIN_DISPLAY_NAMES = ["비트신"];

/**
 * 관리자 여부 (freefeel0701@gmail.com 또는 닉네임 비트신)
 */
export function isAdmin(user: User | null, profile: Profile | null): boolean {
  if (!user) return false;
  const email = user.email?.toLowerCase();
  const displayName = profile?.display_name?.trim();
  const fullName = profile?.full_name?.trim();
  if (email === ADMIN_EMAIL) return true;
  if (ADMIN_DISPLAY_NAMES.some((n) => n === displayName || n === fullName)) return true;
  return false;
}
