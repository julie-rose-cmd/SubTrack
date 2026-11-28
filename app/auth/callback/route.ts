import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase-server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedNext = requestUrl.searchParams.get("next");
  const next = requestedNext?.startsWith("/") && !requestedNext.startsWith("//")
    ? requestedNext
    : "/reset-password";

  if (!code) {
    return NextResponse.redirect(new URL("/ForgotPassword?error=recovery", requestUrl.origin));
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL("/ForgotPassword?error=recovery", requestUrl.origin));
    }

    return NextResponse.redirect(new URL(next, requestUrl.origin));
  } catch {
    return NextResponse.redirect(new URL("/ForgotPassword?error=recovery", requestUrl.origin));
  }
}
