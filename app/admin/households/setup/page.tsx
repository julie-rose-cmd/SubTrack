"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserRoundPlus } from "lucide-react";

export default function CreateHouseholdPage() {
  const router = useRouter();
  const [unit, setUnit] = useState("");
  const [building, setBuilding] = useState("");
  const [resident, setResident] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [slot, setSlot] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/households", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unit, building, resident, email, password, slot }),
      });
      const result = await response.json();

      if (response.status === 401) {
        router.replace("/");
        return;
      }

      if (!response.ok) {
        setError(result.error ?? "Could not create the household.");
        return;
      }

      const createdUnit = String(result.household.unit ?? unit).toUpperCase();
      router.push(`/admin/households?created=${encodeURIComponent(createdUnit)}`);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const fieldClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100";

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href="/admin/households"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to households
        </Link>

        <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="flex items-start gap-4 border-b border-slate-100 pb-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
              <UserRoundPlus size={21} aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-700">
                Administrator · Household directory
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">Create household</h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Create the household record and a Supabase Auth sign-in for its homeowner.
              </p>
            </div>
          </div>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium">
                Unit number <span className="text-orange-700">*</span>
                <input
                  autoComplete="off"
                  className={fieldClass}
                  maxLength={7}
                  onChange={(event) => { setUnit(event.target.value); setError(""); }}
                  placeholder="A-104"
                  required
                  value={unit}
                />
              </label>
              <label className="block text-sm font-medium">
                Building / court <span className="text-orange-700">*</span>
                <input
                  className={fieldClass}
                  onChange={(event) => setBuilding(event.target.value)}
                  placeholder="Maple Court"
                  required
                  value={building}
                />
              </label>
              <label className="block text-sm font-medium">
                Resident name <span className="text-orange-700">*</span>
                <input
                  autoComplete="name"
                  className={fieldClass}
                  onChange={(event) => setResident(event.target.value)}
                  placeholder="Full name"
                  required
                  value={resident}
                />
              </label>
              <label className="block text-sm font-medium">
                Email address <span className="text-orange-700">*</span>
                <input
                  autoComplete="email"
                  className={fieldClass}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="resident@example.com"
                  required
                  type="email"
                  value={email}
                />
              </label>
              <label className="block text-sm font-medium">
                Temporary password <span className="text-orange-700">*</span>
                <input
                  autoComplete="new-password"
                  className={fieldClass}
                  minLength={6}
                  onChange={(event) => { setPassword(event.target.value); setError(""); }}
                  placeholder="At least 6 characters"
                  required
                  type="password"
                  value={password}
                />
                <span className="mt-1.5 block text-xs font-normal text-slate-500">
                  Supabase Auth stores the credential securely; this app never saves the raw password.
                </span>
              </label>
              <label className="block text-sm font-medium">
                Parking slot <span className="font-normal text-slate-400">(optional)</span>
                <input
                  className={fieldClass}
                  onChange={(event) => setSlot(event.target.value)}
                  placeholder="P-07"
                  value={slot}
                />
              </label>
            </div>

            {error && <p className="text-sm text-red-700" role="alert">{error}</p>}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <Link
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                href="/admin/households"
              >
                Cancel
              </Link>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
                type="submit"
              >
                <UserRoundPlus size={16} aria-hidden="true" />
                {isSubmitting ? "Creating account…" : "Create household"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
