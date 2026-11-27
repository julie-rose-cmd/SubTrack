import Link from "next/link";
import { ArrowRight, CalendarDays, FileText, House } from "lucide-react";

type ParkingStatus = "Occupied" | "Vacant" | "Unassigned";

type Activity = {
  id: string;
  date: string;
  description: string;
  amount: number;
};

type Parking = {
  slot: string | null;
  status: ParkingStatus;
  paidThrough: string;
};

// Demonstration data.
// Replace with Supabase queries once the backend is integrated.
const household = {
  unit: "A-101",
  court: "Maple Court",
  id: "HH-001",
  owner: "Adrian Lleva",
  greetingName: "Adrian",
  email: "adrian.lleva@example.com",
  account: "Registered",
  cycle: "Monthly",
  period: "October 2026",
  asOf: "Before payment · 18 Oct 2026, 10:40",
};

const balance = {
  due: "31 Oct 2026",
  hoa: 100,
  parking: 20,
  prior: 0,
};

const parking: Parking = {
  slot: "P-01",
  status: "Vacant",
  paidThrough: "30 Sep 2026",
};

const activity: Activity[] = [
  {
    id: "a1",
    date: "01 Oct 2026",
    description: "October HOA dues assessed",
    amount: 100,
  },
  {
    id: "a2",
    date: "01 Oct 2026",
    description: "October parking assessed · P-01",
    amount: 20,
  },
  {
    id: "a3",
    date: "15 Sep 2026",
    description: "Payment · SIM-260915-0038",
    amount: -120,
  },
];

const nextAssessment = {
  date: "01 Nov",
  hoa: 100,
  parking: 20,
  due: "30 Nov 2026",
};

// Currency formatting.
const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatAmount(amount: number) {
  return amount < 0
    ? `− ${peso.format(Math.abs(amount))}`
    : peso.format(amount);
}

// Shared page styles.
const cardClass =
  "min-w-0 rounded-2xl border border-neutral-100 bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.05)]";

const badgeClass =
  "inline-flex items-center whitespace-nowrap rounded-full border border-orange-300 bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-800";

const secondaryButton =
  "inline-flex w-fit items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-800 shadow-sm transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500";

const primaryButton =
  "inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-[#FF8A00] px-4 py-2.5 text-sm font-semibold text-neutral-900 shadow-sm transition-colors hover:bg-[#E67C00] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500";

const textLink =
  "inline-flex items-center gap-1 text-xs font-semibold text-neutral-700 transition-colors hover:text-orange-700 hover:underline focus-visible:outline-2 focus-visible:outline-orange-500";

const parkingStyles: Record<ParkingStatus, string> = {
  Occupied: "border-orange-300 bg-orange-50 text-orange-800",
  Vacant: "border-emerald-300 bg-emerald-50 text-emerald-800",
  Unassigned: "border-neutral-300 bg-neutral-100 text-neutral-700",
};

function ParkingBadge({ status }: { status: ParkingStatus }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${parkingStyles[status]}`}
    >
      {status}
    </span>
  );
}

function getParkingMessage(status: ParkingStatus) {
  switch (status) {
    case "Occupied":
      return {
        description:
          "Your household has an active payer for the current period. Your parking allocation is eligible.",
        action: "Your HOA dues and parking charges are up to date.",
      };

    case "Vacant":
      return {
        description: `Allocated to ${household.unit}, but there is no active payer for the current period. The slot is not currently occupied in the payment ledger.`,
        action:
          "Pay the current HOA dues and parking charges to restore eligibility.",
      };

    case "Unassigned":
      return {
        description:
          "There is currently no parking slot allocated to your household.",
        action: "Contact the HOA office for allocation assistance.",
      };
  }
}

export default function HomeownerOverviewPage() {
  const outstanding = balance.hoa + balance.parking + balance.prior;

  const hasOutstandingBalance = outstanding > 0;

  const assessmentTotal = nextAssessment.hoa + nextAssessment.parking;

  const parkingMessage = getParkingMessage(parking.status);

  const breakdown = [
    {
      label: "October HOA dues",
      value: balance.hoa,
    },
    {
      label: `October parking · ${parking.slot ?? "None"}`,
      value: balance.parking,
    },
    {
      label: "Prior balance / fees",
      value: balance.prior,
    },
  ];

  const householdDetails = [
    {
      label: "Household ID",
      value: household.id,
    },
    {
      label: "Resident account",
      value: household.account,
    },
    {
      label: "Assessment cycle",
      value: household.cycle,
    },
  ];

  return (
    <main className="min-w-0 flex-1 bg-[#F7F7F7] px-4 py-6 text-neutral-800 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1440px]">
        {/* Page heading */}
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Household {household.unit} / {household.period}
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Good morning, {household.greetingName}.
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-neutral-500">
              Your household account, at a glance. Everything is connected to
              unit {household.unit}.
            </p>
          </div>

          <Link
            href="/homeowner/statement-of-account"
            className={secondaryButton}
          >
            <FileText size={15} aria-hidden="true" />
            View statement
          </Link>
        </header>

        {/* Ledger snapshot */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <p className="flex items-center gap-2 font-medium">
            <span
              aria-hidden="true"
              className="h-2 w-2 shrink-0 rounded-full bg-orange-500"
            />
            {household.asOf}
          </p>

          <p className="text-neutral-500">PHP · Ledger</p>
        </div>

        {/* Dashboard content */}
        <div className="mt-5 grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          {/* Left column */}
          <div className="flex min-w-0 flex-col gap-5">
            {/* Outstanding balance */}
            <section className={cardClass}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-semibold">Outstanding balance</h2>

                {hasOutstandingBalance ? (
                  <span className={badgeClass}>Due {balance.due}</span>
                ) : (
                  <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
                    {outstanding < 0 ? "Credit balance" : "Fully paid"}
                  </span>
                )}
              </div>

              <p className="mt-5 text-3xl font-bold tracking-tight tabular-nums sm:text-4xl">
                {formatAmount(outstanding)}
              </p>

              {/* Balance breakdown */}
              <dl className="mt-5 grid grid-cols-1 gap-4 min-[400px]:grid-cols-2 sm:grid-cols-3">
                {breakdown.map((item) => (
                  <div key={item.label} className="min-w-0">
                    <dt className="text-xs leading-relaxed text-neutral-500">
                      {item.label}
                    </dt>

                    <dd className="mt-1.5 text-sm font-bold tabular-nums">
                      {formatAmount(item.value)}
                    </dd>
                  </div>
                ))}
              </dl>

              {/* Payment action */}
              <div className="mt-5 border-t border-neutral-200 pt-4">
                {hasOutstandingBalance ? (
                  <Link href="/homeowner/payment-checkout?assessments=hoa-dues%2Cparking" className={primaryButton}>
                    <ArrowRight size={16} aria-hidden="true" />
                    Payment
                  </Link>
                ) : (
                  <p className="text-sm font-medium text-emerald-700">
                    You have no outstanding charges for the current period.
                  </p>
                )}
              </div>
            </section>

            {/* Recent account activity */}
            <section className={cardClass}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-semibold">
                  Recent account activity
                </h2>

                <Link
                  href="/homeowner/statement-of-account"
                  className={textLink}
                >
                  View full ledger
                  <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </div>

              <div
                tabIndex={0}
                role="region"
                aria-label="Recent account activity table"
                className="mt-4 overflow-x-auto rounded-lg focus-visible:outline-2 focus-visible:outline-orange-500"
              >
                <table className="w-full min-w-[420px] border-collapse text-left text-sm">
                  <thead className="bg-neutral-100 text-xs text-neutral-700">
                    <tr>
                      <th
                        scope="col"
                        className="rounded-l-lg px-3 py-3 font-semibold"
                      >
                        Date
                      </th>

                      <th scope="col" className="px-3 py-3 font-semibold">
                        Description
                      </th>

                      <th
                        scope="col"
                        className="rounded-r-lg px-3 py-3 text-right font-semibold"
                      >
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {activity.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-3 py-8 text-center text-sm text-neutral-500"
                        >
                          No recent account activity.
                        </td>
                      </tr>
                    ) : (
                      activity.map((entry) => (
                        <tr
                          key={entry.id}
                          className="border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50"
                        >
                          <td className="whitespace-nowrap px-3 py-4 text-xs font-medium">
                            {entry.date}
                          </td>

                          <td className="px-3 py-4 text-xs leading-relaxed">
                            {entry.description}
                          </td>

                          <td className="whitespace-nowrap px-3 py-4 text-right text-xs font-medium tabular-nums">
                            {formatAmount(entry.amount)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-neutral-500">
                {activity.length > 0
                  ? "Latest payment was applied to September dues and parking."
                  : "Recorded transactions will appear here."}
              </p>
            </section>

            {/* Next assessment */}
            <section className={cardClass}>
              <h2 className="text-sm font-semibold">Next assessment</h2>

              <div className="mt-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-bold">
                    <span>{nextAssessment.date}</span>

                    <span className="tabular-nums">
                      {peso.format(assessmentTotal)}
                    </span>
                  </p>

                  <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                    HOA {peso.format(nextAssessment.hoa)}
                    {" + parking "}
                    {peso.format(nextAssessment.parking)}
                    {" · Due "}
                    {nextAssessment.due}
                  </p>
                </div>

                <CalendarDays
                  size={21}
                  aria-hidden="true"
                  className="shrink-0 text-neutral-600"
                />
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="flex min-w-0 flex-col gap-5">
            {/* Household information */}
            <section className={cardClass}>
              <h2 className="text-sm font-semibold">Your household</h2>

              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50">
                  <House
                    size={19}
                    aria-hidden="true"
                    className="text-neutral-700"
                  />
                </div>

                <div className="min-w-0">
                  <p className="break-words text-sm font-bold">
                    {household.unit} · {household.court}
                  </p>

                  <p className="mt-1 break-words text-xs text-neutral-500">
                    {household.owner}
                  </p>
                </div>
              </div>

              <dl className="mt-5 space-y-4">
                {householdDetails.map((detail) => (
                  <div
                    key={detail.label}
                    className="flex flex-wrap items-center justify-between gap-2 text-xs"
                  >
                    <dt className="text-neutral-500">{detail.label}</dt>

                    <dd className="break-words font-medium">{detail.value}</dd>
                  </div>
                ))}
              </dl>

              <p className="mt-5 break-all text-xs text-neutral-500">
                {household.email}
              </p>
            </section>

            {/* Parking compliance */}
            <section className={cardClass}>
              <h2 className="text-sm font-semibold">Parking compliance</h2>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-3xl font-bold tracking-tight">
                  {parking.slot ?? "None"}
                </p>

                <ParkingBadge status={parking.status} />
              </div>

              <dl className="mt-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <dt className="text-neutral-500">Paid through</dt>

                  <dd className="font-medium">
                    {parking.status === "Unassigned"
                      ? "Not applicable"
                      : parking.paidThrough}
                  </dd>
                </div>
              </dl>

              <p className="mt-5 text-xs leading-relaxed text-neutral-600">
                {parkingMessage.description}
              </p>

              <p className="mt-4 text-xs font-semibold leading-relaxed">
                {parkingMessage.action}
              </p>

              <div className="mt-4 border-t border-neutral-100 pt-4">
                <Link href="/homeowner/parking" className={textLink}>
                  View my parking
                  <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </div>
            </section>

            {/* Demonstration notice */}
            <aside className="rounded-xl border border-neutral-100 bg-white p-4 shadow-sm">
              <h2 className="text-xs font-semibold">Safe to explore</h2>

              <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                Checkout is intended for simulated payments. No real banking
                transactions are performed by this overview. Account and parking
                records shown here are demonstration data.
              </p>
            </aside>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500">
          <p>SineGANG HOA · Private community records</p>
        </footer>
      </div>
    </main>
  );
}


