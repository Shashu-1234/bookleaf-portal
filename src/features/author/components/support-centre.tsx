"use client";

import { ArrowRight, BookOpen, CircleCheck, Clock3, Headphones, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import type { AuthorBookOption, AuthorSupportTicketSummary } from "../types";
import { AuthorTicketStatus } from "./support-badges";

export function SupportCentre({ tickets, books }: { tickets: AuthorSupportTicketSummary[]; books: AuthorBookOption[] }) {
  const [query, setQuery] = useState("");
  const open = tickets.filter((ticket) => ticket.status === "Open" || ticket.status === "In Progress").length;
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleTickets = normalizedQuery
    ? tickets.filter((ticket) => `${ticket.id} ${ticket.subject} ${ticket.category}`.toLocaleLowerCase().includes(normalizedQuery))
    : tickets;
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#176786]">Help centre</p><h1 className="text-2xl font-bold tracking-[-0.03em] text-[#172b36] sm:text-3xl">Support</h1><p className="mt-2 text-sm leading-6 text-[#687f89]">Raise a query, follow its progress and keep every response in one conversation.</p></div><Link href="/author/support/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#176786] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#125a76]"><Plus className="size-4" />New query</Link></div>
      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-[#dfe7ea] bg-white p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-700"><Clock3 className="size-5" /></span><div><p className="text-2xl font-bold text-[#172b36]">{open}</p><p className="text-xs text-[#78909b]">Open query</p></div></div></article>
        <article className="rounded-2xl border border-[#dfe7ea] bg-white p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><CircleCheck className="size-5" /></span><div><p className="text-2xl font-bold text-[#172b36]">{tickets.filter((ticket) => ticket.status === "Resolved" || ticket.status === "Closed").length}</p><p className="text-xs text-[#78909b]">Resolved queries</p></div></div></article>
        <article className="rounded-2xl border border-[#dfe7ea] bg-white p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#e9f5f7] text-[#176786]"><Headphones className="size-5" /></span><div><p className="text-sm font-bold text-[#29434f]">Within 48 hours</p><p className="text-xs text-[#78909b]">Typical first response</p></div></div></article>
      </section>
      <section className="overflow-hidden rounded-2xl border border-[#dfe7ea] bg-white shadow-[0_8px_30px_rgba(24,57,70,0.04)]">
        <div className="flex flex-col gap-3 border-b border-[#e7edef] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><h2 className="font-bold text-[#172b36]">Your queries</h2><p className="mt-1 text-xs text-[#78909b]">Newest activity first</p></div><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9aabb2]" /><input aria-label="Search support queries" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search queries" className="h-9 w-full rounded-lg border border-[#dfe7ea] bg-[#f8fafb] pl-9 pr-3 text-sm outline-none transition focus:border-[#73aabc] sm:w-56" /></div></div>
        <div className="divide-y divide-[#edf1f2]">{visibleTickets.map((ticket) => { const book = ticket.bookId ? books.find((entry) => entry.id === ticket.bookId) : null; return <Link key={ticket.id} href={`/author/support/${ticket.id}`} className="group grid gap-4 px-5 py-5 transition hover:bg-[#f8fbfc] sm:grid-cols-[minmax(0,1fr)_160px_120px_24px] sm:items-center sm:px-6"><div className="min-w-0"><div className="mb-2 flex flex-wrap items-center gap-2"><span className="text-xs font-bold text-[#176786]">{ticket.id}</span><AuthorTicketStatus status={ticket.status} /></div><p className="truncate text-sm font-bold text-[#29434f] group-hover:text-[#176786]">{ticket.subject}</p><p className="mt-1 flex items-center gap-1.5 truncate text-xs text-[#78909b]"><BookOpen className="size-3.5" />{book?.title ?? "General account query"} · {ticket.category}</p></div><div><p className="text-xs text-[#8a9da5]">Last updated</p><p className="mt-1 text-xs font-medium text-[#5f7680]">{ticket.updatedAt}</p></div><p className="text-xs text-[#78909b]">{ticket.messageCount} {ticket.messageCount === 1 ? "message" : "messages"}</p><ArrowRight className="size-4 text-[#9aabb2] transition group-hover:translate-x-0.5 group-hover:text-[#176786]" /></Link>; })}{visibleTickets.length === 0 ? <div className="px-6 py-12 text-center">{tickets.length === 0 ? <Headphones className="mx-auto size-6 text-[#9aabb2]" /> : <Search className="mx-auto size-6 text-[#9aabb2]" />}<p className="mt-3 text-sm font-semibold text-[#405963]">{tickets.length === 0 ? "No support queries yet" : "No matching queries"}</p><p className="mt-1 text-xs text-[#8a9da5]">{tickets.length === 0 ? "Create a query when you need help from the BookLeaf team." : "Try a ticket ID, subject or category."}</p></div> : null}</div>
      </section>
    </div>
  );
}
