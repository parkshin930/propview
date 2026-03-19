import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServiceRoleClient } from "@/lib/supabase/admin";

export async function POST() {
  try {
    // 1) 요청자가 로그인한 관리자인지 확인 (세션은 쿠키 기반)
    const supabaseUser = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) 관리자 권한 확인은 서비스 롤로 수행 (RLS 영향 제거)
    const admin = getServiceRoleClient();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("[purge-notices] profile lookup error:", profileError);
      return NextResponse.json({ error: "Profile lookup failed" }, { status: 500 });
    }

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3) notices 전체 삭제
    const { error: purgeError } = await admin
      .from("notices")
      .delete()
      .neq("id", "");

    if (purgeError) {
      console.error("[purge-notices] delete error:", purgeError);
      return NextResponse.json({ error: "Failed to purge notices" }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error("[purge-notices] unexpected error:", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

