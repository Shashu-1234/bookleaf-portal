import { AlertTriangle, ArrowRight, Bot, CheckCircle2, Clock3, Inbox } from "lucide-react";
import Link from "next/link";

import { formatAge, priorityRank } from "../formatters";
import type { AdminOverviewTicket } from "../types";
import { PriorityBadge, StatusBadge } from "./ticket-badges";

export function OverviewDashboard({ tickets, adminName }: { tickets: AdminOverviewTicket[]; adminName: string }) {
  const unresolved = tickets.filter((entry) => entry.status === "Open" || entry.status === "In Progress");
  const urgent = unresolved.filter((entry) => entry.priority === "Critical" || entry.priority === "High");
  const unassigned = unresolved.filter((entry) => !entry.assignedTo);
  const manual = unresolved.filter((entry) => entry.ai.state === "manual_review");
  const oldest = unresolved.length ? Math.max(...unresolved.map((entry) => entry.ageHours)) : 0;
  const queue = [...unresolved]
    .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority] || b.ageHours - a.ageHours)
    .slice(0, 5);

  const metrics = [
    { label: "Unresolved tickets", value: unresolved.length, detail: `${unassigned.length} unassigned`, icon: Inbox, tone: "bg-[#e9f5f7] text-[#176786]" },
    { label: "Critical & high", value: urgent.length, detail: "Needs prompt attention", icon: AlertTriangle, tone: "bg-orange-50 text-orange-700" },
    { label: "Oldest unresolved", value: `${Math.floor(oldest / 24)}d`, detail: `${oldest} total hours`, icon: Clock3, tone: "bg-amber-50 text-amber-700" },
    { label: "Manual AI review", value: manual.length, detail: "Workflow still available", icon: Bot, tone: "bg-violet-50 text-violet-700" },
  ];

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#176786]">Operations overview</p>
          <h1 className="text-balance text-2xl font-bold tracking-[-0.03em] text-[#172b36] sm:text-3xl">Welcome back, {adminName.split(" ")[0]}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#687f89]">Here is the support workload requiring attention. Urgent and older unresolved tickets are surfaced first.</p>
        </div>
        <Link href="/admin/tickets" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#176786] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#125a76]">Open ticket queue<ArrowRight className="size-4" /></Link>
      </div>

      <section aria-label="Support metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article key={metric.label} className="rounded-2xl border border-[#dfe7ea] bg-white p-5 shadow-[0_8px_30px_rgba(24,57,70,0.04)]">
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-sm font-medium text-[#687f89]">{metric.label}</p><p className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#172b36]">{metric.value}</p><p className="mt-1 text-xs text-[#8a9da5]">{metric.detail}</p></div>
                <span className={`grid size-10 place-items-center rounded-xl ${metric.tone}`}><Icon className="size-[18px]" /></span>
              </div>
            </article>
          );
        })}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,.65fr)]">
        <section className="overflow-hidden rounded-2xl border border-[#dfe7ea] bg-white shadow-[0_8px_30px_rgba(24,57,70,0.04)]">
          <div className="flex items-center justify-between border-b border-[#e7edef] px-5 py-4 sm:px-6">
            <div><h2 className="font-bold text-[#172b36]">Priority queue</h2><p className="mt-1 text-xs text-[#78909b]">Urgency first, then oldest unresolved</p></div>
            <Link href="/admin/tickets" className="text-sm font-semibold text-[#176786] hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-[#edf1f2]">
            {queue.map((entry) => (
              <Link key={entry.id} href={`/admin/tickets/${entry.id}`} className="group grid gap-3 px-5 py-4 transition hover:bg-[#f8fbfc] sm:grid-cols-[100px_minmax(0,1fr)_140px_100px] sm:items-center sm:px-6">
                <div className="flex items-center gap-2 sm:block"><PriorityBadge priority={entry.priority} /><span className="text-xs font-semibold text-[#78909b] sm:mt-2 sm:block">{entry.id}</span></div>
                <div className="min-w-0"><p className="truncate text-sm font-semibold text-[#243e49] group-hover:text-[#176786]">{entry.subject}</p><p className="mt-1 truncate text-xs text-[#78909b]">{entry.author.name} · {entry.book?.title ?? "General / Account Level"}</p></div>
                <StatusBadge status={entry.status} />
                <span className={`text-xs font-semibold ${entry.ageHours >= 48 ? "text-red-600" : "text-[#687f89]"}`}>{formatAge(entry.ageHours)}</span>
              </Link>
            ))}
          </div>
        </section>

        <aside>
          <section className="rounded-2xl bg-[#123346] p-6 text-white shadow-[0_14px_40px_rgba(18,51,70,0.18)]">
            <div className="mb-5 flex items-center justify-between"><span className="grid size-10 place-items-center rounded-xl bg-white/10 text-sky-100"><Bot className="size-5" /></span><span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-200">Ready</span></div>
            <h2 className="font-bold">AI assistance with human control</h2>
            <p className="mt-2 text-sm leading-6 text-sky-50/65">Suggestions remain editable. No author response is sent without an administrator’s approval.</p>
            <div className="mt-5 space-y-3 border-t border-white/10 pt-5 text-xs text-sky-50/70">
              {["Category and priority overrides", "Policy-grounded editable drafts", "Manual fallback on provider failure"].map((label) => <div key={label} className="flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-300" />{label}</div>)}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
