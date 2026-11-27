"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight, BarChart3, Building2, CalendarDays, Car, ChevronRight, Download,
  UsersRound, LayoutDashboard, CircleHelp, Plus, RefreshCw, ShieldCheck,
  CircleCheck, CircleAlert, SquareParking, LogOut, Search,
} from "lucide-react";
import { ReportSummaryCard } from "../../(components)/report-summary-card";

type Classification = "Occupied" | "Vacant" | "Unassigned";
type ClassificationFilter = Classification | "All";
type Household = {
  id: string;
  resident: string;
  paidThrough: string | null;
  currentHoaPaid: boolean;
  currentParkingPaid: boolean;
  pending: number;
};
type ParkingSlot = { id: string; householdId: string | null; updated: string };
type AuditEntry = {
  id: string;
  timestamp: string;
  slotId: string;
  from: Classification | null;
  to: Classification;
  reference: string;
  event: "Payment" | "Period expiry" | "Allocation" | "Inventory";
};
type Reservation = {
  id: string;
  householdId: string;
  requestedSlot: string;
  status: "Pending" | "Confirmed" | "Cancelled";
};

// Fixed October 2026 demonstration snapshot. Not live payment data.
const households: Household[] = [
  { id: "A-101", resident: "Adrian Lleva", paidThrough: "31 Oct 2026", currentHoaPaid: true, currentParkingPaid: true, pending: 0 },
  { id: "A-102", resident: "Owen Clarke", paidThrough: "31 Oct 2026", currentHoaPaid: true, currentParkingPaid: true, pending: 0 },
  { id: "A-103", resident: "", paidThrough: "30 Sep 2026", currentHoaPaid: false, currentParkingPaid: false, pending: 120 },
  { id: "B-202", resident: "", paidThrough: "30 Sep 2026", currentHoaPaid: false, currentParkingPaid: false, pending: 120 },
  { id: "B-201", resident: "Leo Santos", paidThrough: null, currentHoaPaid: true, currentParkingPaid: false, pending: 0 },
  { id: "B-203", resident: "Nina Shah", paidThrough: null, currentHoaPaid: true, currentParkingPaid: false, pending: 0 },
];
const initialSlots: ParkingSlot[] = [
  { id: "P-01", householdId: "A-101", updated: "18 Oct · 10:42" },
  { id: "P-02", householdId: "A-102", updated: "05 Oct · 09:30" },
  { id: "P-03", householdId: "A-103", updated: "01 Oct · 00:00" },
  { id: "P-04", householdId: "B-202", updated: "01 Oct · 00:00" },
  { id: "P-05", householdId: null, updated: "01 Oct · 00:00" },
  { id: "P-06", householdId: null, updated: "01 Oct · 00:00" },
];
const initialAudit: AuditEntry[] = [
  { id: "audit-1", timestamp: "18 Oct · 10:42", slotId: "P-01", from: "Vacant", to: "Occupied", reference: "SIM-261018-0042 · ₱120.00 posted", event: "Payment" },
  { id: "audit-2", timestamp: "01 Oct · 00:00", slotId: "P-03", from: "Occupied", to: "Vacant", reference: "AUTO-OCT-003 · Paid period ended", event: "Period expiry" },
  { id: "audit-3", timestamp: "01 Oct · 00:00", slotId: "P-04", from: "Occupied", to: "Vacant", reference: "AUTO-OCT-004 · Paid period ended", event: "Period expiry" },
];
// Illustrative requests only; reservations do not change payment classification.
const reservations: Reservation[] = [
  { id: "DEMO-RES-001", householdId: "B-201", requestedSlot: "P-05", status: "Pending" },
  { id: "DEMO-RES-002", householdId: "B-203", requestedSlot: "P-06", status: "Pending" },
];
const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });
function getHousehold(id: string | null) {
  return households.find((item) => item.id === id);
}
function classify(slot: ParkingSlot): Classification {
  if (!slot.householdId) return "Unassigned";
  const household = getHousehold(slot.householdId);
  return household?.currentHoaPaid && household.currentParkingPaid ? "Occupied" : "Vacant";
}
function getCompliance(slot: ParkingSlot): string {
  const household = getHousehold(slot.householdId);
  if (!slot.householdId) return "No allocation";
  if (classify(slot) === "Occupied") return "Current · Fully paid";
  if (household && household.pending > 0) return `${peso.format(household.pending)} pending`;
  return "Current parking payment not verified";
}
function summarize(slots: ParkingSlot[]) {
  const counts = { Occupied: 0, Vacant: 0, Unassigned: 0 };
  for (const slot of slots) counts[classify(slot)] += 1;
  return { ...counts, total: slots.length, percentage: slots.length ? (counts.Occupied / slots.length) * 100 : 0 };
}

const card = "min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40";
const button = "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold shadow-sm hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-orange-500 disabled:cursor-not-allowed disabled:opacity-50";
const primary = "inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-orange-500 disabled:cursor-not-allowed disabled:opacity-50";
const input = "min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-orange-500";
const cell = "px-3 py-4 align-middle text-sm text-slate-700";
const head = "px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600";
const tableWrap = "mt-4 overflow-x-auto rounded-lg focus-visible:outline-2 focus-visible:outline-orange-500";
const classifications: ClassificationFilter[] = ["All", "Occupied", "Vacant", "Unassigned"];
const auditFilters = ["All", "Payment", "Period expiry", "Allocation", "Inventory"] as const;
type AuditFilter = (typeof auditFilters)[number];

function timestamp() {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Asia/Manila" }).format(new Date());
}
function csvCell(value: string | number) {
  const text = String(value);
  const safe = /^[\s]*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text) ? "'" + text : text;
  return `"${safe.replace(/"/g, '""')}"`;
}
function exportAudit(slots: ParkingSlot[], audit: AuditEntry[]) {
  const rows: (string | number)[][] = [
    ["Demonstration data - October 2026 snapshot with local edits"],
    ["Slot", "Household", "Active payer", "Paid through", "Compliance", "Classification", "Last updated"],
    ...slots.map((slot) => {
      const household = getHousehold(slot.householdId);
      return [slot.id, slot.householdId ?? "None", classify(slot) === "Occupied" ? household?.resident || "Unknown" : "None", household?.paidThrough ?? "", getCompliance(slot), classify(slot), slot.updated];
    }),
    [], ["Audit timestamp", "Slot", "From", "To", "Event", "Reference"],
    ...audit.map((entry) => [entry.timestamp, entry.slotId, entry.from ?? "New slot", entry.to, entry.event, entry.reference]),
  ];
  const blob = new Blob(["\uFEFF", rows.map((row) => row.map(csvCell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "subtrack-parking-audit-demo.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function ParkingInventoryDashboard() {
  const [slots, setSlots] = useState(initialSlots);
  const [audit, setAudit] = useState(initialAudit);
  const [search, setSearch] = useState("");
  const [auditSearch, setAuditSearch] = useState("");
  const [filter, setFilter] = useState<ClassificationFilter>("All");
  const [auditFilter, setAuditFilter] = useState<AuditFilter>("All");
  const [selectedId, setSelectedId] = useState("P-05");
  const [householdId, setHouseholdId] = useState("");
  const [newId, setNewId] = useState("");
  const [adding, setAdding] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [slotError, setSlotError] = useState("");
  const counts = summarize(slots);
  const selected = slots.find((slot) => slot.id === selectedId);
  const available = households.filter((household) => !slots.some((slot) => slot.id !== selectedId && slot.householdId === household.id));
  const visibleSlots = slots.filter((slot) => {
    const query = search.trim().toLowerCase();
    const household = getHousehold(slot.householdId);
    const matches = [slot.id, slot.householdId ?? "", household?.resident ?? "", classify(slot)].some((value) => value.toLowerCase().includes(query));
    return matches && (filter === "All" || classify(slot) === filter);
  });
  const visibleAudit = audit.filter((entry) => {
    const query = auditSearch.trim().toLowerCase();
    return (auditFilter === "All" || entry.event === auditFilter) && [entry.slotId, entry.reference, entry.event, entry.timestamp, entry.from ?? "", entry.to].some((value) => value.toLowerCase().includes(query));
  });
  const proposed = selected ? { ...selected, householdId: householdId || null } : null;
  const changed = !!selected && selected.householdId !== (householdId || null);

  function chooseSlot(slot: ParkingSlot) {
    setSelectedId(slot.id);
    setHouseholdId(slot.householdId ?? "");
    setReviewing(false);
    setError("");
    setMessage("");
    document.getElementById("parking-assignment")?.scrollIntoView({ block: "nearest" });
  }
  function addSlot() {
    const id = newId.trim().toUpperCase();
    if (!/^P-\d{2,4}$/.test(id)) { setSlotError("Enter a slot ID such as P-07 (2–4 digits)."); return; }
    if (slots.some((slot) => slot.id === id)) { setSlotError("This slot ID already exists."); return; }
    const updated = timestamp();
    const slot = { id, householdId: null, updated };
    setSlots((previous) => [...previous, slot]);
    setAudit((previous) => [{ id: `demo-${previous.length + 1}`, timestamp: updated, slotId: id, from: null, to: "Unassigned", reference: "Demo · New slot created", event: "Inventory" }, ...previous]);
    setNewId(""); setSlotError(""); setAdding(false); setFilter("All"); setSearch(""); chooseSlot(slot);
    setMessage(`${id} added as Unassigned.`);
  }
  function saveAssignment() {
    if (!selected || !proposed || !changed || !reviewing) return;
    if (householdId && !available.some((item) => item.id === householdId)) { setError("This household is unavailable or already has a slot."); setReviewing(false); return; }
    const updated = timestamp();
    const nextSlot = { ...proposed, updated };
    const oldId = selected.householdId ?? "None";
    const nextId = nextSlot.householdId ?? "None";
    setSlots((previous) => previous.map((slot) => slot.id === nextSlot.id ? nextSlot : slot));
    setAudit((previous) => [{ id: `demo-${previous.length + 1}`, timestamp: updated, slotId: nextSlot.id, from: classify(selected), to: classify(nextSlot), reference: `Demo allocation · ${oldId} → ${nextId}`, event: "Allocation" }, ...previous]);
    setReviewing(false); setError(""); setMessage(`${nextSlot.id} saved as ${classify(nextSlot)}. Demo changes are not sent to the database.`);
  }

  const cards = [
    { label: "Occupied", count: counts.Occupied, detail: "Allocated", description: "Active payer", icon: Car },
    { label: "Vacant", count: counts.Vacant, detail: "Allocated", description: "No active payer", icon: CircleAlert },
    { label: "Unassigned", count: counts.Unassigned, detail: "Available", description: "No allocation", icon: SquareParking },
    { label: "Total inventory", count: counts.total, detail: `${counts.percentage.toFixed(1)}%`, description: "Payment occupancy", icon: CircleCheck },
  ];

  return (
    <main className="min-w-0 bg-[#f5f6f8] px-4 py-8 text-slate-800 sm:px-6 lg:px-9">
      <div className="mx-auto w-full max-w-[1440px] space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">Community operations / October 2026</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Parking inventory &amp; vacancy audit</h1><p className="mt-2 text-sm leading-relaxed text-slate-500">Maple Court · Allocations and classifications driven by current-period payment compliance.</p></div>
          <button type="button" className={primary} onClick={() => exportAudit(slots, audit)}><Download size={15} aria-hidden="true" /> Export occupancy audit</button>
        </div>
        <div className="flex flex-wrap justify-between gap-2 text-xs"><p className="flex items-center gap-2 font-medium"><span aria-hidden="true" className="h-2 w-2 rounded-full bg-orange-500" />After payment · 18 Oct 2026, 10:42{audit.length > initialAudit.length ? " · Local demo edits" : ""}</p><p className="text-slate-500">PHP · Ledger</p></div>
        <section aria-label="Parking summary" className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 xl:grid-cols-4">
          {cards.map((item) => (
            <ReportSummaryCard key={item.label} label={item.label} value={String(item.count)} detail={item.detail} detailLabel={item.description} icon={item.icon} tone="orange" />
          ))}
        </section>
        <section className="flex items-start gap-3 rounded-lg border-l-2 border-orange-500 bg-orange-50 p-4 text-xs"><RefreshCw size={17} className="shrink-0 text-slate-800" aria-hidden="true" /><div><h2 className="font-semibold">Automatic classification, not a manual occupancy switch</h2><p className="mt-1 leading-relaxed text-slate-600">Occupied requires an allocation and fully paid current HOA dues + parking. An allocated slot with no active payer is vacant. With no allocation and no payer, it is unassigned.</p></div></section>
        <section className={card}>
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-base font-semibold text-slate-900">Slot inventory</h2><div className="flex flex-wrap gap-2"><label className="relative"><span className="sr-only">Search slots</span><Search size={16} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className={`${input} w-full pl-9 sm:w-44`} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search slots" /></label><button type="button" className={button} onClick={() => { setAdding(!adding); setSlotError(""); }} aria-expanded={adding}><Plus size={14} aria-hidden="true" /> Add slot</button><label><span className="sr-only">Filter classification</span><select value={filter} onChange={(event) => setFilter(event.target.value as ClassificationFilter)} className={input}>{classifications.map((status) => <option key={status} value={status}>{status === "All" ? "All classifications" : status}</option>)}</select></label></div></div>
          {adding && <form className="mt-4 rounded-lg bg-slate-50 p-3" onSubmit={(event) => { event.preventDefault(); addSlot(); }}><label htmlFor="new-parking-id" className="block text-xs font-semibold">New slot ID</label><div className="mt-2 flex flex-wrap gap-2"><input id="new-parking-id" value={newId} onChange={(event) => { setNewId(event.target.value); setSlotError(""); }} className={`${input} max-w-full`} placeholder="P-07" maxLength={6} required /><button className={primary} type="submit">Create slot</button><button type="button" className={button} onClick={() => { setAdding(false); setSlotError(""); }}>Cancel</button></div>{slotError && <p role="alert" className="mt-2 text-xs text-red-700">{slotError}</p>}</form>}
          <div className={tableWrap} role="region" aria-label="Slot inventory table" tabIndex={0}><table className="w-full min-w-[850px] border-collapse text-left"><thead className="bg-slate-50"><tr>{["Slot", "Household", "Active payer", "Paid through", "Compliance", "Classification", "Last updated", "Action"].map((title) => <th key={title} scope="col" className={head}>{title}</th>)}</tr></thead><tbody>{visibleSlots.map((slot) => { const household = getHousehold(slot.householdId); const status = classify(slot); return <tr key={slot.id} className="border-b border-slate-100 hover:bg-slate-50"><th scope="row" className={`${cell} whitespace-nowrap font-semibold`}>{slot.id}</th><td className={cell}>{slot.householdId ?? "None"}</td><td className={cell}>{status === "Occupied" ? household?.resident || "Unknown" : "None"}</td><td className={`${cell} whitespace-nowrap`}>{household?.paidThrough ?? "—"}</td><td className={cell}>{getCompliance(slot)}</td><td className={cell}><span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${status === "Occupied" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : status === "Vacant" ? "border-orange-200 bg-orange-50 text-orange-800" : "border-slate-200 bg-slate-100 text-slate-700"}`}>{status}</span></td><td className={`${cell} whitespace-nowrap`}>{slot.updated}</td><td className={cell}><button type="button" className="inline-flex items-center gap-1 whitespace-nowrap font-semibold hover:text-orange-700 hover:underline focus-visible:outline-2 focus-visible:outline-orange-500" onClick={() => chooseSlot(slot)} aria-label={`${status === "Unassigned" ? "Assign" : "Review"} ${slot.id}`}>{status === "Unassigned" ? "Assign" : "Review"}<ArrowRight size={12} aria-hidden="true" /></button></td></tr>; })}{visibleSlots.length === 0 && <tr><td colSpan={8} className="p-6 text-center text-xs text-slate-500">No slots match your search and classification.</td></tr>}</tbody></table></div>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">{counts.Occupied} occupied + {counts.Vacant} vacant + {counts.Unassigned} unassigned = {counts.total} slots · Original pending balances are due 31 Oct, not overdue as of the snapshot.</p>
        </section>
        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <section className={card}><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-base font-semibold text-slate-900">Classification audit trace</h2><label><span className="sr-only">Filter audit activities</span><select className={input} value={auditFilter} onChange={(event) => setAuditFilter(event.target.value as AuditFilter)}>{auditFilters.map((item) => <option key={item} value={item}>{item === "All" ? "All audit activities" : item}</option>)}</select></label></div><p className="mt-2 text-xs text-slate-500">Append-only in this demonstration session</p><label className="relative mt-3 block"><span className="sr-only">Search audit records</span><Search size={16} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className={`${input} w-full pl-9`} value={auditSearch} onChange={(event) => setAuditSearch(event.target.value)} placeholder="Search slot, event or reference" /></label><div className={tableWrap} role="region" aria-label="Classification audit table" tabIndex={0}><table className="w-full min-w-[490px] border-collapse text-left"><thead className="bg-slate-50"><tr>{["Timestamp", "Slot / transition", "Trigger / audit reference"].map((title) => <th key={title} scope="col" className={head}>{title}</th>)}</tr></thead><tbody>{visibleAudit.map((entry) => <tr key={entry.id} className="border-b border-slate-100"><td className={`${cell} whitespace-nowrap font-semibold`}>{entry.timestamp}</td><td className={cell}>{entry.slotId} · {entry.from ?? "New"} → {entry.to}</td><td className={cell}>{entry.reference}</td></tr>)}{visibleAudit.length === 0 && <tr><td colSpan={3} className="p-6 text-center text-xs text-slate-500">No matching audit records.</td></tr>}</tbody></table></div><p className="mt-4 text-xs leading-relaxed text-slate-500">Payment exceptions in the original snapshot: A-103 and B-202. Review verified balances before changing an allocation.</p></section>
          <section id="parking-assignment" className={`${card} scroll-mt-24`}><h2 className="text-sm font-semibold">{selected?.householdId ? "Review slot allocation" : "Assign an available slot"}</h2><div className="mt-5 flex flex-wrap justify-between gap-2 text-xs"><span className="text-slate-500">Selected slot</span><span className="font-medium">{selected ? `${selected.id} · ${classify(selected)}` : "None"}</span></div><form className="mt-5" onSubmit={(event) => { event.preventDefault(); if (reviewing) saveAssignment(); else if (changed) setReviewing(true); }}><label htmlFor="parking-household" className="block text-xs font-semibold">Household</label><select id="parking-household" className={`${input} mt-2 w-full`} value={householdId} onChange={(event) => { setHouseholdId(event.target.value); setReviewing(false); setError(""); setMessage(""); }}><option value="">{selected?.householdId ? "Remove allocation" : "Select a household"}</option>{available.map((household) => <option key={household.id} value={household.id}>{household.id}{household.resident ? ` · ${household.resident}` : ""}</option>)}</select><p className="mt-4 text-xs leading-relaxed text-slate-600">An allocation without paid current dues and parking becomes vacant, not occupied.</p>{reviewing && proposed && <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-3 text-xs"><p className="font-semibold">Confirm allocation change</p><p className="mt-2">{selected?.householdId ?? "None"} → {proposed.householdId ?? "None"}</p><p className="mt-1">Result: {classify(proposed)}</p></div>}<div className="mt-4 flex flex-wrap gap-2"><button type="submit" className={reviewing ? primary : button} disabled={!changed}><ArrowRight size={14} aria-hidden="true" />{reviewing ? "Confirm assignment" : "Review assignment"}</button>{reviewing && <button type="button" className={button} onClick={() => setReviewing(false)}>Cancel</button>}</div></form>{error && <p role="alert" className="mt-3 text-xs text-red-700">{error}</p>}{message && <p role="status" className="mt-3 text-xs text-emerald-800">{message}</p>}<p className="mt-4 text-xs leading-relaxed text-slate-500">Saving an allocation never bypasses payment compliance. Demo edits reset when the page reloads.</p></section>
        </div>
        <section className={card}><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-sm font-semibold">Parking reservation overview</h2><p className="text-xs text-slate-500">{reservations.length} demonstration records</p></div>{reservations.length === 0 ? <p className="mt-4 rounded-lg bg-slate-50 p-4 text-xs text-slate-600">No reservation records were supplied for this snapshot. Verified reservations can be displayed here after backend integration.</p> : <div className={tableWrap} role="region" aria-label="Reservations table" tabIndex={0}><table className="w-full min-w-[400px] text-left"><thead className="bg-slate-50"><tr>{["Reference", "Household", "Requested slot", "Status"].map((title) => <th scope="col" key={title} className={head}>{title}</th>)}</tr></thead><tbody>{reservations.map((item) => <tr key={item.id} className="border-b border-slate-100"><td className={cell}>{item.id}</td><td className={cell}>{item.householdId}</td><td className={cell}>{item.requestedSlot}</td><td className={cell}>{item.status}{slots.find((slot) => slot.id === item.requestedSlot)?.householdId === item.householdId ? " · Matching allocation" : slots.find((slot) => slot.id === item.requestedSlot)?.householdId ? " · Slot allocated elsewhere" : " · Slot unassigned"}</td></tr>)}</tbody></table></div>}</section>
        <footer className="text-xs text-slate-500">SubTrack · Private community records · Demonstration data only</footer>
      </div>
    </main>
  );
}

const navigation = [
  { label: "Overview", href: "/admin/overview", icon: LayoutDashboard },
  { label: "Households", href: "/admin/households", icon: UsersRound },
  { label: "Assessments", href: "/assessment-schedules", icon: CalendarDays },
  { label: "Parking inventory", href: "/admin/parking", icon: Car },
  { label: "Reports", href: "/board-reports", icon: BarChart3 },
];

export default function AdminParkingPage() {
  return (
    <div className="min-h-screen bg-[#f5f6f8] text-slate-900 lg:flex">
      <aside className="flex shrink-0 flex-col bg-[#272727] text-white lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:overflow-y-auto">
        <div className="flex h-[76px] items-center gap-3 border-b border-white/10 px-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white"><Building2 size={21} aria-hidden="true" /></span>
          <div><p className="text-sm font-bold tracking-wide">SubTrack</p><p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Homeowners association</p></div>
        </div>
        <div className="px-4 pb-4 pt-5 lg:pt-7">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Administrator portal</p>
          <nav aria-label="Administrator navigation" className="mt-3 flex flex-wrap gap-1 lg:flex-col">
            {navigation.map(({ label, href, icon: Icon }) => {
              const active = href === "/admin/parking";
              return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-orange-400 ${active ? "bg-white/10 font-semibold text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}><Icon size={17} className={active ? "text-orange-400" : "text-slate-400"} aria-hidden="true" />{label}{active && <ChevronRight size={14} className="ml-auto hidden text-slate-400 lg:block" aria-hidden="true" />}</Link>;
            })}
          </nav>
        </div>
        <div className="mt-auto hidden border-t border-white/10 p-4 lg:block">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-bold">AD</span>
            <div className="min-w-0"><p className="text-xs font-semibold">Administrator</p><p className="mt-0.5 text-[11px] text-slate-400">Board-authorized access</p></div>
            <ShieldCheck size={16} className="ml-auto shrink-0 text-emerald-400" aria-hidden="true" />
          </div>
          <div className="mt-3 flex items-center gap-2 px-3 py-2 text-xs text-slate-400"><LogOut size={14} aria-hidden="true" />Demonstration session</div>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex min-h-[68px] flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-3 sm:px-8 lg:sticky lg:top-0 lg:z-10">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500"><span className="font-medium text-slate-700">SubTrack</span><ChevronRight size={14} aria-hidden="true" /><span>Administration</span><ChevronRight size={14} aria-hidden="true" /><span className="font-semibold text-slate-800">Parking inventory</span></div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500"><span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">Demonstration data</span><span title="Demo records only"><CircleHelp size={17} aria-hidden="true" /><span className="sr-only">Demo records only</span></span></div>
        </header>
        <ParkingInventoryDashboard />
      </div>
    </div>
  );
}
