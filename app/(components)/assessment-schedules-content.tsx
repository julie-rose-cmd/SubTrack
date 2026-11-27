"use client";

import { useMemo, useState } from "react";
import { ChevronRight, CircleHelp, Plus } from "lucide-react";
import { AssessmentScheduleFormModal } from "./assessment-schedule-form-modal";
import { AssessmentScheduleSummary } from "./assessment-schedule-summary";
import { AssessmentScheduleTable } from "./assessment-schedule-table";
import type { AssessmentSchedule, AssessmentStatus, BillingPeriod } from "./assessment-schedule-types";

type ScheduleFormValues = Omit<AssessmentSchedule, "id">;

function dateAfter(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function initialSchedules(): AssessmentSchedule[] {
  return [
    { id: "ASM-2026-001", title: "Monthly HOA Dues", period: "Monthly", amount: 1250, deadline: dateAfter(7), households: "All households · Zones A–D", status: "Active" },
    { id: "ASM-2026-002", title: "Security & Maintenance Fee", period: "Monthly", amount: 450, deadline: dateAfter(14), households: "All households · Zones A–D", status: "Active" },
    { id: "ASM-2026-003", title: "Quarterly Water System Upkeep", period: "Quarterly", amount: 900, deadline: dateAfter(21), households: "Zones A and B", status: "Upcoming" },
    { id: "ASM-2026-004", title: "Special Infrastructure Assessment", period: "One-Time", amount: 2500, deadline: dateAfter(34), households: "Phase 2 · 48 households", status: "Upcoming" },
    { id: "ASM-2026-005", title: "Annual Community Insurance", period: "Annual", amount: 1800, deadline: dateAfter(-12), households: "All households · Zones A–D", status: "Closed" },
    { id: "ASM-2026-006", title: "Gate Access Upgrade", period: "One-Time", amount: 750, deadline: dateAfter(45), households: "Zone C · 22 households", status: "Draft" },
  ];
}

export function AssessmentSchedulesContent() {
  const [schedules, setSchedules] = useState<AssessmentSchedule[]>(initialSchedules);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AssessmentStatus | "All statuses">("All statuses");
  const [periodFilter, setPeriodFilter] = useState<BillingPeriod | "All periods">("All periods");
  const [editingSchedule, setEditingSchedule] = useState<AssessmentSchedule | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const visibleSchedules = useMemo(() => {
    const query = search.trim().toLowerCase();
    return schedules.filter((schedule) => {
      const matchesSearch =
        !query ||
        [schedule.id, schedule.title, schedule.period, schedule.households, schedule.status].some((value) =>
          value.toLowerCase().includes(query),
        );
      return (
        matchesSearch &&
        (statusFilter === "All statuses" || schedule.status === statusFilter) &&
        (periodFilter === "All periods" || schedule.period === periodFilter)
      );
    });
  }, [schedules, search, statusFilter, periodFilter]);

  const today = new Date().toISOString().slice(0, 10);
  const upcomingDeadlines = schedules.filter(
    (schedule) => (schedule.status === "Active" || schedule.status === "Upcoming") && schedule.deadline >= today,
  ).length;
  const activeCycles = schedules.filter((schedule) => schedule.status === "Active").length;
  const scheduledAmount = schedules
    .filter((schedule) => schedule.status === "Active" || schedule.status === "Upcoming")
    .reduce((total, schedule) => total + schedule.amount, 0);

  function saveSchedule(values: ScheduleFormValues) {
    if (editingSchedule) {
      setSchedules((current) => current.map((item) => item.id === editingSchedule.id ? { ...values, id: item.id } : item));
      setEditingSchedule(null);
      return;
    }

    const nextNumber = schedules.reduce((highest, item) => {
      const match = item.id.match(/(\d+)$/);
      return Math.max(highest, match ? Number(match[1]) : 0);
    }, 0) + 1;
    setSchedules((current) => [...current, { ...values, id: `ASM-${new Date().getFullYear()}-${String(nextNumber).padStart(3, "0")}` }]);
    setIsCreating(false);
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 flex h-[68px] items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="font-medium text-slate-700">SubTrack</span>
            <ChevronRight size={14} aria-hidden="true" />
            <span>Administration</span>
            <ChevronRight size={14} aria-hidden="true" />
            <span className="font-semibold text-slate-800">Assessments</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 sm:inline-flex">Demonstration data</span>
            <CircleHelp size={17} aria-label="Help" />
          </div>
        </header>

        <main className="mx-auto max-w-[1480px] px-4 py-7 sm:px-7 lg:px-9 lg:py-9">
          <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-orange-700">Community operations</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Assessment schedules</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">Define recurring charges and one-time assessments for your community.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white shadow-sm shadow-orange-500/25 transition hover:bg-orange-600 sm:self-auto"
            >
              <Plus size={17} aria-hidden="true" />
              Create schedule
            </button>
          </div>

          <div className="mb-6">
            <AssessmentScheduleSummary
              totalSchedules={schedules.length}
              activeCycles={activeCycles}
              upcomingDeadlines={upcomingDeadlines}
              scheduledAmount={scheduledAmount}
            />
          </div>
          <AssessmentScheduleTable
            schedules={visibleSchedules}
            search={search}
            statusFilter={statusFilter}
            periodFilter={periodFilter}
            onSearchChange={setSearch}
            onStatusFilterChange={setStatusFilter}
            onPeriodFilterChange={setPeriodFilter}
            onEdit={setEditingSchedule}
          />
          <p className="mt-5 text-xs leading-5 text-slate-400">
            Schedule changes affect future billing cycles only. Previously posted assessments and household balances remain unchanged.
          </p>
        </main>
      </div>

      {(isCreating || editingSchedule) && (
        <AssessmentScheduleFormModal
          key={editingSchedule?.id ?? "new"}
          schedule={editingSchedule}
          onClose={() => {
            setIsCreating(false);
            setEditingSchedule(null);
          }}
          onSave={saveSchedule}
        />
      )}
    </div>
  );
}



