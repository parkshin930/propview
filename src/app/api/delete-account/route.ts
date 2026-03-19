import { NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { userId } = (await request.json()) as { userId?: string };
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const supabase = getServiceRoleClient();
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      console.error("[delete-account] deleteUser error:", error);
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error("[delete-account] unexpected error:", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

