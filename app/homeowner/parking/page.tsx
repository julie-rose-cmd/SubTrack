import { Car } from "lucide-react";

type SlotStatus = "Occupied" | "Vacant" | "Unassigned";

type Slot = {
  id: string;
  status: SlotStatus;
  mine?: boolean;
};

type HistoryEntry = {
  id: string;
  updated: string;
  event: string;
  classification: SlotStatus;
  reference: string;
};

// Demonstration data.
// Replace with Supabase data once the backend is integrated.
const household = {
  unit: "A-101",
  period: "October 2026",
  activePayer: "Adrian Lleva",
  paidThrough: "31 Oct 2026",
  lastUpdated: "18 Oct 2026, 10:42",
  receipt: "SIM-261018-0042",
};

const lotName = "Maple Court";

const slots: Slot[] = [
  { id: "P-01", status: "Occupied", mine: true },
  { id: "P-02", status: "Occupied" },
  { id: "P-03", status: "Vacant" },
  { id: "P-04", status: "Vacant" },
  { id: "P-05", status: "Unassigned" },
  { id: "P-06", status: "Unassigned" },
];

const history: HistoryEntry[] = [
  {
    id: "h1",
    updated: "18 Oct 2026, 10:42",
    event: "October dues + parking paid",
    classification: "Occupied",
    reference: "SIM-261018-0042",
  },
  {
    id: "h2",
    updated: "01 Oct 2026, 00:00",
    event: "Prior paid-through period ended",
    classification: "Vacant",
    reference: "AUTO-OCT-001",
  },
  {
    id: "h3",
    updated: "15 Sep 2026, 09:12",
    event: "September dues + parking paid",
    classification: "Occupied",
    reference: "SIM-260915-0038",
  },
];

const statusConfig: Record<
  SlotStatus,
  {
    badge: string;
    slot: string;
    dot: string;
    description: string;
  }
> = {
  Occupied: {
    badge: "border-orange-300 bg-orange-50 text-orange-800",
    slot: "border-orange-200 bg-orange-50",
    dot: "bg-orange-500",
    description:
      "Allocated to a household with an active payer for current HOA dues and parking.",
  },
  Vacant: {
    badge: "border-emerald-300 bg-emerald-50 text-emerald-800",
    slot: "border-emerald-200 bg-emerald-50",
    dot: "bg-emerald-500",
    description:
      "Allocated to a household without an active payer for the current period.",
  },
  Unassigned: {
    badge: "border-neutral-300 bg-neutral-100 text-neutral-700",
    slot: "border-neutral-200 bg-neutral-100",
    dot: "bg-neutral-400",
    description:
      "No household allocation and no active payer. Subject to administrator review.",
  },
};

const statuses: SlotStatus[] = ["Occupied", "Vacant", "Unassigned"];

const cardClass =
  "min-w-0 rounded-2xl border border-neutral-100 bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.05)]";

function StatusBadge({ status }: { status: SlotStatus }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${statusConfig[status].badge}`}
    >
      {status}
    </span>
  );
}

function countSlots(status: SlotStatus) {
  return slots.filter((slot) => slot.status === status).length;
}

export default function HomeownerParkingPage() {
  const mySlot = slots.find((slot) => slot.mine);

  const isEligible = mySlot?.status === "Occupied";

  const eligibilityMessage = isEligible
    ? "Your HOA dues and parking charges are fully paid for the current period. Your parking allocation is eligible."
    : mySlot
      ? "Your parking allocation is not currently eligible. Please contact the HOA office or review your outstanding charges."
      : "There is no parking slot allocated to your household. Contact the HOA office for assistance.";

  const householdDetails = [
    {
      label: "Household",
      value: household.unit,
    },
    {
      label: "Active payer",
      value: isEligible ? household.activePayer : "No active payer",
    },
    {
      label: "Paid through",
      value: household.paidThrough,
    },
  ];

  return (
    <main className="min-w-0 flex-1 bg-[#F7F7F7] px-4 py-6 text-neutral-800 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1440px]">
        {/* Page heading */}
        <header>
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Household {household.unit} / {household.period}
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            {isEligible
              ? "Your parking, in good standing."
              : "Your parking allocation"}
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-neutral-500">
            Payment-driven eligibility and a clear view of community
            availability.
          </p>
        </header>

        {/* Ledger snapshot */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <p className="flex items-center gap-2 font-medium">
            <span
              aria-hidden="true"
              className="h-2 w-2 shrink-0 rounded-full bg-orange-500"
            />
            {isEligible ? "After payment" : "Parking status"} ·{" "}
            {household.lastUpdated}
          </p>

          <p className="text-neutral-500">PHP · Ledger</p>
        </div>

        {/* Allocation and availability */}
        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
          {/* Household allocation */}
          <section className={cardClass}>
            <h2 className="text-sm font-semibold">Your allocated slot</h2>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <Car size={21} aria-hidden="true" />
                </div>

                <p className="text-3xl font-bold">{mySlot?.id ?? "None"}</p>
              </div>

              {mySlot && <StatusBadge status={mySlot.status} />}
            </div>

            <dl className="mt-6 space-y-4">
              {householdDetails.map((detail) => (
                <div
                  key={detail.label}
                  className="flex flex-wrap items-center justify-between gap-2 text-sm"
                >
                  <dt className="text-neutral-500">{detail.label}</dt>

                  <dd className="break-words text-right font-medium">
                    {detail.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 border-t border-neutral-200 pt-4">
              <p className="text-sm leading-relaxed text-neutral-600">
                {eligibilityMessage}
              </p>
            </div>

            <div className="mt-4 rounded-lg bg-neutral-50 p-3 text-xs leading-relaxed text-neutral-500">
              <p>Last updated {household.lastUpdated}</p>

              {isEligible && (
                <p className="mt-1 break-all">
                  Linked receipt:{" "}
                  <span className="font-medium text-neutral-700">
                    {household.receipt}
                  </span>
                </p>
              )}
            </div>
          </section>

          {/* Parking slots */}
          <section className={`${cardClass} xl:col-span-2`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold">
                  {lotName} · Parking availability
                </h2>

                <p className="mt-1 text-xs text-neutral-500">
                  Payment-based community parking classification
                </p>
              </div>

              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium">
                {slots.length} total slots
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 md:grid-cols-3">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className={`flex min-h-[136px] flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center ${statusConfig[slot.status].slot} ${
                    slot.mine
                      ? "ring-2 ring-orange-500 ring-offset-2 ring-offset-white"
                      : ""
                  }`}
                >
                  <Car
                    size={27}
                    aria-hidden="true"
                    className={
                      slot.status === "Occupied"
                        ? "text-orange-600"
                        : "text-neutral-400"
                    }
                  />

                  <p className="text-lg font-bold">{slot.id}</p>

                  <StatusBadge status={slot.status} />

                  {slot.mine && (
                    <p className="text-xs font-semibold text-orange-700">
                      Your allocation
                    </p>
                  )}
                </div>
              ))}
            </div>

            <p className="mt-5 text-xs leading-relaxed text-neutral-500">
              Parking classifications reflect payment eligibility, not the
              physical presence of vehicles.
            </p>
          </section>
        </div>

        {/* Classification summaries */}
        <section
          aria-label="Parking classification summary"
          className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          {statuses.map((status) => {
            const count = countSlots(status);

            return (
              <div key={status} className={cardClass}>
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={`h-2.5 w-2.5 rounded-full ${statusConfig[status].dot}`}
                  />

                  <h2 className="text-sm font-semibold">{status}</h2>
                </div>

                <p className="mt-3 text-2xl font-bold">
                  {count}
                  <span className="ml-2 text-sm font-normal text-neutral-500">
                    {count === 1 ? "slot" : "slots"}
                  </span>
                </p>

                <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                  {statusConfig[status].description}
                </p>
              </div>
            );
          })}
        </section>

        {/* Parking history */}
        <section className={`${cardClass} mt-5`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Your parking history</h2>

            <span className="text-xs text-neutral-500">
              Household {household.unit} only
            </span>
          </div>

          <div
            tabIndex={0}
            role="region"
            aria-label="Parking history table"
            className="mt-4 overflow-x-auto rounded-lg focus-visible:outline-2 focus-visible:outline-orange-500"
          >
            <table className="w-full min-w-[620px] border-collapse text-left text-sm">
              <thead className="bg-neutral-100 text-xs text-neutral-700">
                <tr>
                  <th
                    scope="col"
                    className="rounded-l-lg px-4 py-3 font-semibold"
                  >
                    Updated
                  </th>

                  <th scope="col" className="px-4 py-3 font-semibold">
                    Event
                  </th>

                  <th scope="col" className="px-4 py-3 font-semibold">
                    Classification
                  </th>

                  <th
                    scope="col"
                    className="rounded-r-lg px-4 py-3 font-semibold"
                  >
                    Reference
                  </th>
                </tr>
              </thead>

              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-neutral-500"
                    >
                      No parking history available.
                    </td>
                  </tr>
                ) : (
                  history.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50"
                    >
                      <td className="whitespace-nowrap px-4 py-4 text-xs font-medium">
                        {entry.updated}
                      </td>

                      <td className="px-4 py-4 text-xs">{entry.event}</td>

                      <td className="px-4 py-4">
                        <StatusBadge status={entry.classification} />
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-xs text-neutral-600">
                        {entry.reference}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-neutral-500">
            Parking classifications are based on recorded payments and household
            allocations.
          </p>
        </section>

        {/* Footer information */}
        <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500">
          <p>SineGANG HOA · Private community records</p>

          <p className="font-medium text-neutral-700">
            Questions? Contact the HOA office
          </p>
        </footer>
      </div>
    </main>
  );
}
