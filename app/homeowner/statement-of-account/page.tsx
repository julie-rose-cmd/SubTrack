"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Download, ReceiptText, X } from "lucide-react";

type Transaction = {
  id: string;
  date: string;
  description: string;
  reference?: string;
  debit: number;
  credit: number;
};

type LedgerRow = Transaction & {
  balance: number;
};

type StatementMonth = "2026-09" | "2026-10";

// Demonstration household information.
const household = {
  unit: "A-101",
  id: "HH-001",
  owner: "Adrian Lleva",
  snapshot: "Before payment · 18 Oct 2026, 10:40",
};

// Replace with Supabase records once the backend
// and database tables have been integrated.
const transactions: Transaction[] = [
  {
    id: "sep-hoa",
    date: "2026-09-01",
    description: "September HOA dues",
    debit: 100,
    credit: 0,
  },
  {
    id: "sep-parking",
    date: "2026-09-01",
    description: "September parking · P-01",
    debit: 20,
    credit: 0,
  },
  {
    id: "sep-payment",
    date: "2026-09-15",
    description: "Simulated payment",
    reference: "SIM-260915-0038",
    debit: 0,
    credit: 120,
  },
  {
    id: "oct-hoa",
    date: "2026-10-01",
    description: "Monthly HOA dues",
    reference: "ASM-2610-H",
    debit: 100,
    credit: 0,
  },
  {
    id: "oct-parking",
    date: "2026-10-01",
    description: "Parking P-01",
    reference: "ASM-2610-P",
    debit: 20,
    credit: 0,
  },
];

const currentMonth: StatementMonth = "2026-10";

const statementPeriods: Record<
  StatementMonth,
  {
    label: string;
    period: string;
    issued: string;
    due: string;
    reference: string;
  }
> = {
  "2026-09": {
    label: "September 2026",
    period: "01–30 September 2026",
    issued: "Not available",
    due: "Not available",
    reference: "SOA-A101-202609",
  },
  "2026-10": {
    label: "October 2026",
    period: "01–31 October 2026",
    issued: "18 Oct 2026",
    due: "31 Oct 2026",
    reference: "SOA-A101-202610",
  },
};

const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function getLedger(month: StatementMonth) {
  const firstDay = `${month}-01`;

  const openingBalance = transactions
    .filter((item) => item.date < firstDay)
    .reduce((sum, item) => sum + item.debit - item.credit, 0);

  const monthlyTransactions = transactions
    .filter((item) => item.date.startsWith(month))
    .sort((a, b) => a.date.localeCompare(b.date));

  let runningBalance = openingBalance;

  const rows: LedgerRow[] = monthlyTransactions.map((item) => {
    runningBalance += item.debit - item.credit;

    return {
      ...item,
      balance: runningBalance,
    };
  });

  const debits = monthlyTransactions.reduce((sum, item) => sum + item.debit, 0);

  const credits = monthlyTransactions.reduce(
    (sum, item) => sum + item.credit,
    0,
  );

  return {
    openingBalance,
    rows,
    debits,
    credits,
    closingBalance: runningBalance,
  };
}

// Consistent styles with the other homeowner pages.
const cardClass =
  "min-w-0 rounded-2xl border border-neutral-100 bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.05)] print:break-inside-avoid print:shadow-none";

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-800 shadow-sm transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500";

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-[#FF8A00] px-4 py-2.5 text-sm font-semibold text-neutral-900 shadow-sm transition-colors hover:bg-[#E67C00] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500";

function MoneyCell({
  amount,
  showZero = false,
}: {
  amount: number;
  showZero?: boolean;
}) {
  return (
    <td className="whitespace-nowrap px-3 py-4 text-right text-xs font-medium tabular-nums">
      {amount === 0 && !showZero ? "—" : peso.format(amount)}
    </td>
  );
}

function LedgerTable({
  rows,
  openingBalance,
  month,
  showOpening = false,
  onReceipt,
}: {
  rows: LedgerRow[];
  openingBalance: number;
  month: StatementMonth;
  showOpening?: boolean;
  onReceipt: (transaction: Transaction) => void;
}) {
  return (
    <div
      tabIndex={0}
      role="region"
      aria-label={`${statementPeriods[month].label} transaction ledger`}
      className="mt-4 overflow-x-auto rounded-lg focus-visible:outline-2 focus-visible:outline-orange-500 print:overflow-visible"
    >
      <table className="w-full min-w-[620px] border-collapse text-left text-sm print:min-w-0">
        <thead className="bg-neutral-100 text-xs text-neutral-700">
          <tr>
            <th scope="col" className="rounded-l-lg px-3 py-3 font-semibold">
              Date
            </th>

            <th scope="col" className="px-3 py-3 font-semibold">
              Reference / description
            </th>

            <th scope="col" className="px-3 py-3 text-right font-semibold">
              Debit
            </th>

            <th scope="col" className="px-3 py-3 text-right font-semibold">
              Credit
            </th>

            <th
              scope="col"
              className="rounded-r-lg px-3 py-3 text-right font-semibold"
            >
              Balance
            </th>
          </tr>
        </thead>

        <tbody>
          {showOpening && (
            <tr className="border-b border-neutral-100">
              <td className="whitespace-nowrap px-3 py-4 text-xs font-medium">
                {formatDate(`${month}-01`)}
              </td>

              <td className="px-3 py-4 text-xs">Opening balance</td>

              <MoneyCell amount={0} showZero />
              <MoneyCell amount={0} showZero />

              <MoneyCell amount={openingBalance} showZero />
            </tr>
          )}

          {rows.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-3 py-8 text-center text-sm text-neutral-500"
              >
                No transactions for this period.
              </td>
            </tr>
          )}

          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-neutral-100 hover:bg-neutral-50"
            >
              <td className="whitespace-nowrap px-3 py-4 text-xs font-medium">
                {formatDate(row.date)}
              </td>

              <td className="px-3 py-4 text-xs leading-relaxed">
                {row.credit > 0 && row.reference ? (
                  <>
                    <p className="font-semibold">{row.reference}</p>

                    <p className="mt-1 text-neutral-500">
                      {row.description}

                      <button
                        type="button"
                        onClick={() => onReceipt(row)}
                        className="ml-1 font-medium text-neutral-700 hover:text-orange-700 hover:underline focus-visible:outline-2 focus-visible:outline-orange-500 print:hidden"
                      >
                        · View receipt
                      </button>
                    </p>
                  </>
                ) : (
                  <p>
                    {row.reference ? `${row.reference} · ` : ""}
                    {row.description}
                  </p>
                )}
              </td>

              <MoneyCell amount={row.debit} />
              <MoneyCell amount={row.credit} />
              <MoneyCell amount={row.balance} showZero />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReceiptDetails({
  transaction,
  onClose,
}: {
  transaction: Transaction;
  onClose: () => void;
}) {
  const details = [
    {
      label: "Receipt reference",
      value: transaction.reference ?? "Unavailable",
    },
    {
      label: "Household",
      value: household.unit,
    },
    {
      label: "Resident",
      value: household.owner,
    },
    {
      label: "Payment date",
      value: formatDate(transaction.date),
    },
    {
      label: "Description",
      value: transaction.description,
    },
    {
      label: "Amount paid",
      value: peso.format(transaction.credit),
    },
    {
      label: "Transaction type",
      value: "Demonstration payment",
    },
  ];

  return (
    <section
      aria-labelledby="receipt-heading"
      className={`${cardClass} mt-5 print:hidden`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
            <ReceiptText size={20} aria-hidden="true" />
          </div>

          <h2 id="receipt-heading" className="text-sm font-semibold">
            Payment receipt details
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close receipt details"
          className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-orange-500"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        {details.map((detail) => (
          <div
            key={detail.label}
            className="min-w-0 rounded-lg bg-neutral-50 p-3"
          >
            <dt className="text-xs text-neutral-500">{detail.label}</dt>

            <dd className="mt-1 break-words text-sm font-semibold">
              {detail.value}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-xs text-neutral-500">
        This receipt is for demonstration purposes only. It does not represent a
        real banking transaction.
      </p>
    </section>
  );
}

export default function HomeownerStatementOfAccountPage() {
  const [month, setMonth] = useState<StatementMonth>(currentMonth);

  const [selectedReceipt, setSelectedReceipt] = useState<Transaction | null>(
    null,
  );

  const statement = statementPeriods[month];
  const ledger = getLedger(month);

  const historicalMonth: StatementMonth = "2026-09";

  const historicalLedger = getLedger(historicalMonth);

  const isCurrentStatement = month === currentMonth;

  const hasOutstandingBalance = ledger.closingBalance > 0;

  const showHistory = month !== historicalMonth;

  function changeMonth(value: string) {
    if (value === "2026-09" || value === "2026-10") {
      setMonth(value);
      setSelectedReceipt(null);
    }
  }

  function downloadStatement() {
    window.print();
  }

  return (
    <main
      id="soa-print-area"
      className="min-w-0 flex-1 bg-[#F7F7F7] px-4 py-6 text-neutral-800 sm:px-6 lg:px-8 print:bg-white print:p-0"
    >
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }

          #soa-print-area,
          #soa-print-area * {
            visibility: visible;
          }

          #soa-print-area {
            position: absolute;
            inset: 0 auto auto 0;
            width: 100%;
            min-width: 0;
            background: white;
          }

          @page {
            size: A4 landscape;
            margin: 12mm;
          }
        }
      `}</style>

      <div className="mx-auto w-full max-w-[1440px]">
        {/* Page heading */}
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Household {household.unit} / {statement.label}
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Statement of account
            </h1>

            <p className="mt-2 text-xs leading-relaxed text-neutral-500">
              {household.owner} · Unit {household.unit} · Household{" "}
              {household.id}
            </p>
          </div>

          <button
            type="button"
            onClick={downloadStatement}
            className={`${secondaryButton} print:hidden`}
          >
            <Download size={15} aria-hidden="true" />
            Download SOA · PDF
          </button>
        </header>

        {/* Snapshot information */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <p className="flex items-center gap-2 font-medium">
            <span
              aria-hidden="true"
              className="h-2 w-2 shrink-0 rounded-full bg-orange-500"
            />

            {isCurrentStatement
              ? household.snapshot
              : "Historical statement · Demonstration data"}
          </p>

          <p className="text-neutral-500">PHP · Ledger</p>
        </div>

        {/* Statement summary */}
        <section className={`${cardClass} mt-5`}>
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                Statement {statement.reference}
              </p>

              <h2 className="mt-2 text-sm font-bold">{statement.period}</h2>

              <p className="mt-2 text-xs text-neutral-500">
                {isCurrentStatement
                  ? `Issued ${statement.issued} · Due ${statement.due}`
                  : "Historical account statement"}
              </p>
            </div>

            <div className="sm:text-right">
              <span
                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                  hasOutstandingBalance
                    ? "border-orange-300 bg-orange-50 text-orange-800"
                    : "border-emerald-300 bg-emerald-50 text-emerald-800"
                }`}
              >
                {hasOutstandingBalance
                  ? "Payment pending"
                  : ledger.closingBalance < 0
                    ? "Credit balance"
                    : "Fully paid"}
              </span>

              <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums">
                {peso.format(ledger.closingBalance)}
              </p>

              <p className="mt-1 text-xs text-neutral-500">
                {ledger.closingBalance < 0
                  ? "Account credit"
                  : "Amount outstanding"}
              </p>
            </div>
          </div>
        </section>

        {/* Monthly transaction ledger */}
        <section className={`${cardClass} mt-5`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">
              {statement.label.split(" ")[0]} ledger
            </h2>

            <label className="print:hidden">
              <span className="sr-only">Select statement month</span>

              <select
                value={month}
                onChange={(event) => changeMonth(event.target.value)}
                className="cursor-pointer rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 focus-visible:outline-2 focus-visible:outline-orange-500"
              >
                <option value="2026-10">October 2026</option>

                <option value="2026-09">September 2026</option>
              </select>
            </label>

            <p className="hidden text-xs font-medium print:block">
              {statement.label}
            </p>
          </div>

          <LedgerTable
            rows={ledger.rows}
            openingBalance={ledger.openingBalance}
            month={month}
            showOpening
            onReceipt={setSelectedReceipt}
          />

          {/* Ledger totals */}
          <div className="mt-5 grid grid-cols-1 items-center gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className="text-xs text-neutral-500">Assessments</p>

              <p className="mt-1 text-sm font-bold tabular-nums">
                {peso.format(ledger.debits)}
              </p>
            </div>

            <div>
              <p className="text-xs text-neutral-500">Payments / credits</p>

              <p className="mt-1 text-sm font-bold tabular-nums">
                {peso.format(ledger.credits)}
              </p>
            </div>

            <div>
              <p className="text-xs text-neutral-500">
                {isCurrentStatement
                  ? "Closing balance · 18 Oct"
                  : "Closing balance"}
              </p>

              <p className="mt-1 text-sm font-bold tabular-nums">
                {peso.format(ledger.closingBalance)}
              </p>
            </div>

            <div className="xl:justify-self-end print:hidden">
              {isCurrentStatement && hasOutstandingBalance && (
                <Link href="/homeowner/payment-checkout?assessments=hoa-dues%2Cparking" className={primaryButton}>
                  <ArrowRight size={16} aria-hidden="true" />
                  {peso.format(ledger.closingBalance)} payment
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Historical ledger */}
        {showHistory && (
          <section className={`${cardClass} mt-5`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">
                Historical ledger &amp; receipts
              </h2>

              <p className="text-xs font-medium text-neutral-600">
                {statementPeriods[historicalMonth].label}
              </p>
            </div>

            <LedgerTable
              rows={historicalLedger.rows}
              openingBalance={historicalLedger.openingBalance}
              month={historicalMonth}
              onReceipt={setSelectedReceipt}
            />

            <p className="mt-4 text-xs leading-relaxed text-neutral-500">
              September opening balance{" "}
              {peso.format(historicalLedger.openingBalance)}
              {" · Debits "}
              {peso.format(historicalLedger.debits)}
              {" · Credits "}
              {peso.format(historicalLedger.credits)}
              {" · Closing balance "}
              {peso.format(historicalLedger.closingBalance)}
            </p>
          </section>
        )}

        {/* Receipt details */}
        {selectedReceipt && (
          <ReceiptDetails
            transaction={selectedReceipt}
            onClose={() => setSelectedReceipt(null)}
          />
        )}

        {/* Statement information */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <p className="leading-relaxed text-neutral-500">
            Statements reflect recorded transactions. Receipts remain available
            in your ledger.
          </p>

          <p className="font-medium text-neutral-700">
            Questions? Contact the HOA office
          </p>
        </div>

        <footer className="mt-6 text-xs text-neutral-500">
          <p>SineGANG HOA · Private community records</p>

          <p className="mt-1">
            Demonstration data · Not an official financial statement
          </p>
        </footer>
      </div>
    </main>
  );
}

