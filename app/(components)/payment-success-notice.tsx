import { CheckCircle2, Download, FileText, Receipt } from "lucide-react";
import Link from "next/link";

type PaymentSuccessNoticeProps = {
  amount?: string;
  method?: string;
  receipt?: string;
  assessments?: string;
  date?: string;
  homeowner?: string;
  household?: string;
};

const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

const paymentMethods = ["QR payment", "Credit or debit card", "Online banking"];

export default function PaymentSuccessNotice({
  amount: amountParam,
  method: methodParam,
  receipt: receiptParam,
  assessments: assessmentsParam,
  date: dateParam,
  homeowner: homeownerParam,
  household: householdParam,
}: PaymentSuccessNoticeProps) {
  const amount = Number(amountParam);
  const receipt = receiptParam?.trim() ?? "";
  const method = methodParam?.trim() ?? "";
  const homeowner = homeownerParam?.trim() ?? "";
  const household = householdParam?.trim() ?? "";
  const assessments = assessmentsParam
    ?.split(",")
    .map((assessment) => assessment.trim())
    .filter(Boolean) ?? [];
  const date = dateParam ? new Date(dateParam) : null;
  const isValid =
    Number.isFinite(amount) &&
    amount > 0 &&
    /^ST-\d{8}$/.test(receipt) &&
    paymentMethods.includes(method) &&
    homeowner.length > 0 &&
    household.length > 0 &&
    assessments.length > 0 &&
    date !== null &&
    Number.isFinite(date.getTime());

  if (!isValid || !date) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f6] px-5 py-10 text-[#292927]">
        <section className="w-full max-w-lg rounded-3xl border border-neutral-100 bg-white p-7 text-center shadow-sm sm:p-10">
          <h1 className="text-2xl font-semibold">Payment details unavailable</h1>
          <p className="mt-3 text-sm leading-relaxed text-neutral-500">
            Start a payment from your statement to see its confirmation details.
          </p>
          <Link
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-3 text-xs font-semibold text-neutral-950 transition hover:bg-amber-400"
            href="/homeowner/statement-of-account"
          >
            <FileText size={15} />
            Return to statement
          </Link>
        </section>
      </main>
    );
  }

  const transactionDate = date.toISOString();
  const status = "Completed · Simulation";
  const receiptQuery = new URLSearchParams({
    amount: amount.toFixed(2),
    method,
    receipt,
    assessments: assessments.join(", "),
    date: transactionDate,
    homeowner,
    household,
    status,
  });
  const parkingWasPaid = assessments.some((assessment) =>
    assessment.toLowerCase().includes("parking"),
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f7f6] px-5 py-10 text-[#292927]">
      <section className="w-full max-w-xl rounded-3xl border border-neutral-100 bg-white p-7 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
          <CheckCircle2 size={34} strokeWidth={1.8} />
        </div>
        <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Simulation complete
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          Payment successful
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-neutral-500">
          Your simulated payment has been recorded for demonstration. No real money was transferred.
        </p>

        <div className="mt-8 rounded-2xl bg-neutral-50 p-5 text-left sm:p-6">
          <div className="flex items-center justify-between gap-4 border-b border-neutral-200 pb-4">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-neutral-600">
              <Receipt size={15} /> Demonstration receipt
            </span>
            <span className="text-xs font-semibold">{receipt}</span>
          </div>
          <div className="py-5 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-500">Amount paid</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">{peso.format(amount)}</p>
          </div>
          <dl className="space-y-3 border-t border-neutral-200 pt-4 text-xs">
            <div className="flex justify-between gap-3">
              <dt className="text-neutral-500">Homeowner</dt>
              <dd className="font-medium">{homeowner} · {household}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-neutral-500">Payment method</dt>
              <dd className="font-medium">{method}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-neutral-500">Assessments</dt>
              <dd className="max-w-[65%] text-right font-medium">{assessments.join(", ")}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-neutral-500">Parking status</dt>
              <dd className="text-right font-semibold text-emerald-700">
                {parkingWasPaid ? "P-01 renewed · Simulation" : "P-01 unchanged"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-neutral-500">Status</dt>
              <dd className="font-semibold text-emerald-700">{status}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-7 grid gap-2 sm:grid-cols-2">
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-3 text-xs font-semibold text-neutral-950 transition hover:bg-amber-400"
            href={`/homeowner/receipt?${receiptQuery.toString()}`}
          >
            <Download size={15} /> View / download receipt
          </Link>
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 px-5 py-3 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
            href="/homeowner/statement-of-account"
          >
            <FileText size={15} /> Return to statement
          </Link>
        </div>
        <p className="mt-4 text-[10px] text-neutral-500">
          SineGANG HOA · Household {household}
        </p>
      </section>
    </main>
  );
}
