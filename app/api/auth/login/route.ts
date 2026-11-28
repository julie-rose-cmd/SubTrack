import { NextResponse } from "next/server";
import { getUserRole } from "../../../../lib/auth-role";
import { createSupabaseServerClient } from "../../../../lib/supabase-server";

export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 6) {
    return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    }

    return NextResponse.json({ role: getUserRole(data.user) });
  } catch {
    return NextResponse.json({ error: "Supabase is not configured yet." }, { status: 503 });
  }
}
