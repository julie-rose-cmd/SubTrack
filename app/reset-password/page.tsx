"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { AuthBadge } from "../(components)/auth-badge";
import { AuthHeader } from "../(components)/auth-header";
import { AuthHero } from "../(components)/auth-hero";
import { supabase } from "../../lib/supabase-client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      await supabase.auth.signOut({ scope: "local" });
      router.replace("/?passwordUpdated=1");
      router.refresh();
    } catch {
      setError("Could not reach the server. Try again.");
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
            <AuthHeader title="Choose a new password" subtitle="Use at least 8 characters, then confirm it below." />
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block text-xs font-bold text-gray-800" htmlFor="new-password">
                New password
                <input
                  id="new-password"
                  autoComplete="new-password"
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-normal text-gray-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  minLength={8}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type="password"
                  value={password}
                />
              </label>
              <label className="block text-xs font-bold text-gray-800" htmlFor="confirm-password">
                Confirm new password
                <input
                  id="confirm-password"
                  autoComplete="new-password"
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-normal text-gray-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  minLength={8}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  type="password"
                  value={confirmPassword}
                />
              </label>
              <button
                className="flex items-center justify-center rounded-xl bg-amber-500 px-5 py-3 text-xs font-bold tracking-wide text-black shadow-sm transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Updating…" : "Update password"}
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
