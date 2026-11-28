import { NextResponse } from "next/server";
import { isAdminUser } from "./auth-role";
import { createSupabaseServerClient } from "./supabase-server";

export async function requireAdmin() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return {
        ok: false as const,
        response: NextResponse.json({ error: "Sign in to continue." }, { status: 401 }),
      };
    }

    if (!isAdminUser(data.user)) {
      return {
        ok: false as const,
        response: NextResponse.json({ error: "Administrator access is required." }, { status: 403 }),
      };
    }

    return { ok: true as const, user: data.user };
  } catch {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Supabase is not configured yet." }, { status: 503 }),
    };
  }
}
