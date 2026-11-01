"use client";

import { ChevronRight, Filter, Search, SlidersHorizontal, UserRoundX, X } from "lucide-react";
import Link from "next/link";

import { Pagination } from "@/features/shared/components/pagination";
import { ticketCategories, ticketPriorities, type TicketCategory, type TicketPriority } from "@/lib/ai/schemas";
import type { PaginationMeta } from "@/lib/pagination";
import { formatAge } from "../formatters";
import type { AdminTicketQueueItem, TicketStatus } from "../types";
import { PriorityBadge, StatusBadge } from "./ticket-badges";

const statuses: TicketStatus[] = ["Open", "In Progress", "Resolved", "Closed"];

type QueueFilters = {
  search: string;
  status?: TicketStatus;
  category?: TicketCategory;
  priority?: TicketPriority;
  age?: "24h" | "3d" | "7d";
  assignment?: "Mine" | "Unassigned";
};

export function TicketQueue({ tickets, filters, pagination }: { tickets: AdminTicketQueueItem[]; filters: QueueFilters; pagination: PaginationMeta }) {
  const hasFilters = Boolean(filters.search || filters.status || filters.category || filters.priority || filters.age || filters.assignment);
  const paginationQuery = { q: filters.search || undefined, status: filters.status, category: filters.category, priority: filters.priority, age: filters.age, assignment: filters.assignment };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#176786]">Support operations</p><h1 className="text-2xl font-bold tracking-[-0.03em] text-[#172b36] sm:text-3xl">Ticket queue</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#687f89]">Review, prioritize, assign, and resolve author queries. Unresolved tickets are ordered by urgency and age.</p></div>
        <div className="flex items-center gap-2 text-xs text-[#687f89]"><span className="size-2 rounded-full bg-emerald-500" />Live database queue · realtime-ready</div>
      </div>

      <form method="get" className="rounded-2xl border border-[#dfe7ea] bg-white p-4 shadow-[0_8px_30px_rgba(24,57,70,0.04)] sm:p-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#687f89]"><SlidersHorizontal className="size-4" />Filters</div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(240px,1.4fr)_repeat(5,minmax(130px,.7fr))]">
          <label className="relative"><span className="sr-only">Search tickets</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8a9da5]" /><input name="q" type="search" defaultValue={filters.search} placeholder="Search ticket, subject or description…" className="h-11 w-full rounded-xl border border-[#dfe7ea] bg-[#fbfcfc] pl-10 pr-16 text-sm outline-none focus:border-[#76aabd] focus:bg-white" /><button type="submit" className="absolute right-1.5 top-1/2 h-8 -translate-y-1/2 rounded-lg bg-[#176786] px-2.5 text-[11px] font-semibold text-white">Search</button></label>
          <FilterSelect label="Status" name="status" value={filters.status} options={statuses} />
          <FilterSelect label="Category" name="category" value={filters.category} options={ticketCategories} />
          <FilterSelect label="Priority" name="priority" value={filters.priority} options={ticketPriorities} />
          <FilterSelect label="Created" name="age" value={filters.age} options={["24h", "3d", "7d"]} />
          <FilterSelect label="Assignment" name="assignment" value={filters.assignment} options={["Mine", "Unassigned"]} />
        </div>
        <div className="mt-4 flex min-h-7 items-center justify-between gap-3"><p className="text-xs text-[#78909b]">Showing <span className="font-bold text-[#29434f]">{tickets.length}</span> of {pagination.totalItems} matching tickets</p>{hasFilters ? <Link href="/admin/tickets" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#176786] hover:underline"><X className="size-3.5" />Clear filters</Link> : null}</div>
      </form>

      <section className="overflow-hidden rounded-2xl border border-[#dfe7ea] bg-white shadow-[0_8px_30px_rgba(24,57,70,0.04)]">
        <div className="hidden grid-cols-[90px_minmax(280px,1.5fr)_minmax(170px,.8fr)_125px_130px_110px_30px] gap-4 border-b border-[#dfe7ea] bg-[#f8fafb] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.13em] text-[#78909b] xl:grid"><span>Priority</span><span>Ticket</span><span>Author / Book</span><span>Status</span><span>Assignment</span><span>Age</span><span /></div>
        {tickets.length ? <div className="divide-y divide-[#edf1f2]">{tickets.map((entry) => (
          <Link key={entry.id} href={`/admin/tickets/${entry.id}`} className="group grid gap-4 px-4 py-5 transition hover:bg-[#f8fbfc] sm:px-5 xl:grid-cols-[90px_minmax(280px,1.5fr)_minmax(170px,.8fr)_125px_130px_110px_30px] xl:items-center">
            <div className="flex items-center justify-between xl:block"><PriorityBadge priority={entry.priority} /><span className="text-xs font-semibold text-[#8a9da5] xl:mt-2 xl:block">{entry.id}</span></div>
            <div className="min-w-0"><div className="flex items-center gap-2"><p className="truncate text-sm font-bold text-[#243e49] group-hover:text-[#176786]">{entry.subject}</p>{entry.ai.state === "manual_review" ? <span className="shrink-0 rounded-full bg-violet-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-violet-700">Manual AI review</span> : null}</div><p className="mt-1.5 line-clamp-1 text-xs leading-5 text-[#78909b]">{entry.description}</p><p className="mt-1 text-[11px] font-medium text-[#176786]">{entry.category}</p></div>
            <div className="min-w-0 text-xs"><p className="truncate font-semibold text-[#29434f]">{entry.author.name}</p><p className="mt-1 truncate text-[#78909b]">{entry.book?.title ?? "General / Account Level"}</p></div>
            <div><StatusBadge status={entry.status} /></div>
            <div className={`flex items-center gap-2 text-xs ${entry.assignedTo ? "text-[#4d6570]" : "font-semibold text-orange-700"}`}>{!entry.assignedTo ? <UserRoundX className="size-3.5" /> : null}{entry.assignedTo ?? "Unassigned"}</div>
            <div className={`flex items-center gap-2 text-xs font-semibold ${entry.ageHours >= 48 && entry.status !== "Resolved" && entry.status !== "Closed" ? "text-red-600" : "text-[#687f89]"}`}>{entry.ageHours >= 48 ? <span className="size-1.5 rounded-full bg-current" /> : null}{formatAge(entry.ageHours)}</div>
            <ChevronRight className="hidden size-4 text-[#9aabb2] transition group-hover:translate-x-0.5 group-hover:text-[#176786] xl:block" />
          </Link>
        ))}</div> : <div className="grid min-h-64 place-items-center px-6 py-12 text-center"><div><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#edf5f7] text-[#176786]"><Filter className="size-5" /></span><h2 className="mt-4 font-bold text-[#29434f]">No tickets match these filters</h2><p className="mt-2 text-sm text-[#78909b]">Try broadening your search or clearing the active filters.</p>{hasFilters ? <Link href="/admin/tickets" className="mt-4 inline-block rounded-xl bg-[#176786] px-4 py-2 text-sm font-semibold text-white">Clear filters</Link> : null}</div></div>}
        <Pagination meta={pagination} basePath="/admin/tickets" query={paginationQuery} itemLabel="tickets" />
      </section>
    </div>
  );
}

function FilterSelect({ label, name, value, options }: { label: string; name: string; value?: string; options: readonly string[] }) {
  return <label><span className="sr-only">{label}</span><select name={name} defaultValue={value ?? ""} onChange={(event) => event.currentTarget.form?.requestSubmit()} className="h-11 w-full rounded-xl border border-[#dfe7ea] bg-[#fbfcfc] px-3 text-sm text-[#425c67] outline-none focus:border-[#76aabd] focus:bg-white"><option value="">All {label.toLowerCase()}</option>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}
