"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserRoundPlus } from "lucide-react";

type HouseholdRecord = {
  id: string;
  unit: string;
  building: string;
  resident: string;
  contact: string;
  balance: number;
  status: "Current";
  slot: string;
};

const storageKey = "subtrack:admin:created-households";
const seededUnits = new Set([
  "A-101",
  "A-102",
  "A-103",
  "B-201",
  "B-202",
  "B-203",
  ...Array.from({ length: 39 }, (_, index) => `C-${307 + index}`),
]);

export default function CreateHouseholdPage() {
  const router = useRouter();
  const [unit, setUnit] = useState("");
  const [building, setBuilding] = useState("");
  const [resident, setResident] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [slot, setSlot] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    const normalizedUnit = unit.trim().toUpperCase();
    if (!/^[A-Z]{1,2}-\d{2,4}$/.test(normalizedUnit)) {
      setError("Enter a unit such as A-104 or C-346.");
      return;
    }

    let created: HouseholdRecord[] = [];
    try {
      const stored = localStorage.getItem(storageKey);
      const parsed: unknown = stored ? JSON.parse(stored) : [];
      if (Array.isArray(parsed)) created = parsed as HouseholdRecord[];
    } catch {
      setError("Saved demo household data could not be read. Please try again.");
      return;
    }

    const alreadyExists =
      seededUnits.has(normalizedUnit) ||
      created.some((household) => household.unit.toUpperCase() === normalizedUnit);
    if (alreadyExists) {
      setError("A household is already registered for this unit.");
      return;
    }

    const newHousehold: HouseholdRecord = {
      id: `created-${Date.now()}`,
      unit: normalizedUnit,
      building: building.trim(),
      resident: resident.trim(),
      contact: contact.trim().toLowerCase(),
      balance: 0,
      status: "Current",
      slot: slot.trim().toUpperCase() || "—",
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify([newHousehold, ...created]));
      router.push("/admin/households");
    } catch {
      setError("This household could not be saved in this browser. Please try again.");
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
                Add a household record and its primary resident contact.
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
                  onChange={(event) => setContact(event.target.value)}
                  placeholder="resident@example.com"
                  required
                  type="email"
                  value={contact}
                />
              </label>
              <label className="block text-sm font-medium">
                Password <span className="text-orange-700">*</span>
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
              </label>
              <label className="block text-sm font-medium sm:col-span-2">
                Parking slot <span className="font-normal text-slate-400">(optional)</span>
                <input
                  className={fieldClass}
                  onChange={(event) => setSlot(event.target.value)}
                  placeholder="P-07"
                  value={slot}
                />
                <span className="mt-1.5 block text-xs font-normal text-slate-500">
                  Leave blank if no slot is allocated.
                </span>
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
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                type="submit"
              >
                <UserRoundPlus size={16} aria-hidden="true" />
                Create household
              </button>
            </div>
          </form>

          <p className="mt-5 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
            This demo saves household details in this browser only. Passwords are not stored; connect account authentication to create a real sign-in.
          </p>
        </div>
      </div>
    </main>
  );
}



