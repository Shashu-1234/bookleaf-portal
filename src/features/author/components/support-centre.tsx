import Form from "next/form";
import { ArrowRight, BookOpen, CircleCheck, Clock3, Headphones, Plus, Search } from "lucide-react";
import Link from "next/link";

import { Pagination } from "@/features/shared/components/pagination";
import type { PaginationMeta } from "@/lib/pagination";
import type { AuthorBookOption, AuthorSupportTicketSummary } from "../types";
import { AuthorTicketStatus } from "./support-badges";

type SupportCentreProps = {
  tickets: AuthorSupportTicketSummary[];
  books: AuthorBookOption[];
  search: string;
  stats: { open: number; resolved: number };
  pagination: PaginationMeta;
};

export function SupportCentre({ tickets, books, search, stats, pagination }: SupportCentreProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#176786]">Help centre</p><h1 className="text-2xl font-bold tracking-[-0.03em] text-[#172b36] sm:text-3xl">Support</h1><p className="mt-2 text-sm leading-6 text-[#687f89]">Raise a query, follow its progress and keep every response in one conversation.</p></div><Link href="/author/support/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#176786] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#125a76]"><Plus className="size-4" />New query</Link></div>
      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-[#dfe7ea] bg-white p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-700"><Clock3 className="size-5" /></span><div><p className="text-2xl font-bold text-[#172b36]">{stats.open}</p><p className="text-xs text-[#78909b]">Open queries</p></div></div></article>
        <article className="rounded-2xl border border-[#dfe7ea] bg-white p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><CircleCheck className="size-5" /></span><div><p className="text-2xl font-bold text-[#172b36]">{stats.resolved}</p><p className="text-xs text-[#78909b]">Resolved queries</p></div></div></article>
        <article className="rounded-2xl border border-[#dfe7ea] bg-white p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#e9f5f7] text-[#176786]"><Headphones className="size-5" /></span><div><p className="text-sm font-bold text-[#29434f]">Within 48 hours</p><p className="text-xs text-[#78909b]">Typical first response</p></div></div></article>
      </section>
      <section className="overflow-hidden rounded-2xl border border-[#dfe7ea] bg-white shadow-[0_8px_30px_rgba(24,57,70,0.04)]">
        <div className="flex flex-col gap-3 border-b border-[#e7edef] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><h2 className="font-bold text-[#172b36]">Your queries</h2><p className="mt-1 text-xs text-[#78909b]">Newest activity first</p></div><Form key={search} action="/author/support" scroll={false} className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9aabb2]" /><input name="q" type="search" defaultValue={search} aria-label="Search support queries" placeholder="Search queries" className="h-9 w-full rounded-lg border border-[#dfe7ea] bg-[#f8fafb] pl-9 pr-16 text-sm outline-none transition focus:border-[#73aabc] sm:w-64" /><button type="submit" className="absolute right-1 top-1/2 h-7 -translate-y-1/2 rounded-md bg-[#176786] px-2 text-[10px] font-semibold text-white">Search</button></Form></div>
        <div className="divide-y divide-[#edf1f2]">{tickets.map((ticket) => { const book = ticket.bookId ? books.find((entry) => entry.id === ticket.bookId) : null; return <Link key={ticket.id} href={`/author/support/${ticket.id}`} className="group grid gap-4 px-5 py-5 transition hover:bg-[#f8fbfc] sm:grid-cols-[minmax(0,1fr)_160px_120px_24px] sm:items-center sm:px-6"><div className="min-w-0"><div className="mb-2 flex flex-wrap items-center gap-2"><span className="text-xs font-bold text-[#176786]">{ticket.id}</span><AuthorTicketStatus status={ticket.status} /></div><p className="truncate text-sm font-bold text-[#29434f] group-hover:text-[#176786]">{ticket.subject}</p><p className="mt-1 flex items-center gap-1.5 truncate text-xs text-[#78909b]"><BookOpen className="size-3.5" />{book?.title ?? "General account query"} · {ticket.category}</p></div><div><p className="text-xs text-[#8a9da5]">Last updated</p><p className="mt-1 text-xs font-medium text-[#5f7680]">{ticket.updatedAt}</p></div><p className="text-xs text-[#78909b]">{ticket.messageCount} {ticket.messageCount === 1 ? "message" : "messages"}</p><ArrowRight className="size-4 text-[#9aabb2] transition group-hover:translate-x-0.5 group-hover:text-[#176786]" /></Link>; })}{tickets.length === 0 ? <div className="px-6 py-12 text-center">{search ? <Search className="mx-auto size-6 text-[#9aabb2]" /> : <Headphones className="mx-auto size-6 text-[#9aabb2]" />}<p className="mt-3 text-sm font-semibold text-[#405963]">{search ? "No matching queries" : "No support queries yet"}</p><p className="mt-1 text-xs text-[#8a9da5]">{search ? "Try a ticket ID or subject." : "Create a query when you need help from the BookLeaf team."}</p>{search ? <Link href="/author/support" className="mt-3 inline-block text-xs font-semibold text-[#176786] hover:underline">Clear search</Link> : null}</div> : null}</div>
        <Pagination meta={pagination} basePath="/author/support" query={{ q: search || undefined }} itemLabel="tickets" />
      </section>
    </div>
  );
}
