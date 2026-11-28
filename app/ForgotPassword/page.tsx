"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthBadge } from "../(components)/auth-badge";
import { AuthHeader } from "../(components)/auth-header";
import { AuthHero } from "../(components)/auth-hero";
import { InputField } from "../(components)/input-field";
import { supabase } from "../../lib/supabase-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("error") === "recovery") {
      setError("That reset link is invalid or expired. Request a new one.");
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("next", "/reset-password");
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: callbackUrl.toString(),
      });
      if (resetError) {
        setError("Could not send the reset email. Check Supabase Auth email settings and allowed redirect URLs.");
        return;
      }
      setMessage("If an account exists for that email, a reset link has been sent.");
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex w-full bg-[#FAF9F6]">
      <AuthHero />
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 md:p-16">
        <div className="w-full max-w-md">
          <AuthBadge />
          <div className="space-y-6 rounded-3xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-200/50 sm:p-10">
            <AuthHeader title="Reset your password" subtitle="We’ll email you a secure link to choose a new password." />

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
            {message && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800" role="status">{message}</p>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <InputField
                id="reset-email"
                type="email"
                label="Email address"
                placeholder="name@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <button
                className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-xs font-bold tracking-wide text-black shadow-sm transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Sending…" : "Send reset link"}
              </button>
            </form>

            <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-amber-700">
              <ArrowLeft size={14} aria-hidden="true" /> Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
