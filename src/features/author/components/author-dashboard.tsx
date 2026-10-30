import {
  ArrowRight,
  BadgeIndianRupee,
  BookOpen,
  CheckCircle2,
  Clock3,
  Headphones,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

import { currency, number } from "../formatters";
import type { AuthorBook, AuthorSupportTicket } from "../types";

export function AuthorDashboard({ author, books, tickets }: { author: { firstName: string }; books: AuthorBook[]; tickets: AuthorSupportTicket[] }) {
  const totals = books.reduce(
    (summary, book) => ({
      copies: summary.copies + book.totalCopiesSold,
      earned: summary.earned + book.totalRoyaltyEarned,
      pending: summary.pending + book.royaltyPending,
    }),
    { copies: 0, earned: 0, pending: 0 },
  );
  const openTickets = tickets.filter((ticket) => ticket.status === "Open" || ticket.status === "In Progress");

  const metrics = [
    { label: "Published books", value: books.length, detail: "Titles in your catalogue", icon: BookOpen, tone: "bg-[#e9f5f7] text-[#176786]" },
    { label: "Total copies sold", value: number.format(totals.copies), detail: "Across all titles", icon: ShoppingBag, tone: "bg-violet-50 text-violet-700" },
    { label: "Royalty earned", value: currency.format(totals.earned), detail: "Lifetime total", icon: TrendingUp, tone: "bg-emerald-50 text-emerald-700" },
    { label: "Pending royalty", value: currency.format(totals.pending), detail: "Across 2 books", icon: BadgeIndianRupee, tone: "bg-amber-50 text-amber-700" },
  ];

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#176786]">Author dashboard</p>
          <h1 className="text-balance text-2xl font-bold tracking-[-0.03em] text-[#172b36] sm:text-3xl">Welcome back, {author.firstName}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#687f89]">Track your published books, royalty earnings and conversations with the BookLeaf support team.</p>
        </div>
        <Link href="/author/support/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#176786] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#125a76]">Raise a query<ArrowRight className="size-4" /></Link>
      </div>

      <section aria-label="Author performance summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article key={metric.label} className="rounded-2xl border border-[#dfe7ea] bg-white p-5 shadow-[0_8px_30px_rgba(24,57,70,0.04)]">
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-sm font-medium text-[#687f89]">{metric.label}</p><p className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[#172b36]">{metric.value}</p><p className="mt-1 text-xs text-[#8a9da5]">{metric.detail}</p></div>
                <span className={`grid size-10 place-items-center rounded-xl ${metric.tone}`}><Icon className="size-[18px]" /></span>
              </div>
            </article>
          );
        })}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,.65fr)]">
        <section className="overflow-hidden rounded-2xl border border-[#dfe7ea] bg-white shadow-[0_8px_30px_rgba(24,57,70,0.04)]">
          <div className="flex items-center justify-between border-b border-[#e7edef] px-5 py-4 sm:px-6"><div><h2 className="font-bold text-[#172b36]">Your books</h2><p className="mt-1 text-xs text-[#78909b]">Current status and earnings at a glance</p></div><Link href="/author/books" className="text-sm font-semibold text-[#176786] hover:underline">View details</Link></div>
          <div className="divide-y divide-[#edf1f2]">
            {books.map((book) => (
              <Link key={book.id} href="/author/books" className="group grid gap-4 px-5 py-5 transition hover:bg-[#f8fbfc] sm:grid-cols-[minmax(0,1fr)_130px_140px] sm:items-center sm:px-6">
                <div className="flex min-w-0 items-center gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#e9f5f7] text-[#176786]"><BookOpen className="size-5" /></span><div className="min-w-0"><p className="truncate text-sm font-bold text-[#243e49] group-hover:text-[#176786]">{book.title}</p><p className="mt-1 truncate text-xs text-[#78909b]">{book.genre} · {book.isbn}</p></div></div>
                <div><p className="text-xs text-[#78909b]">Copies sold</p><p className="mt-1 text-sm font-bold text-[#29434f]">{number.format(book.totalCopiesSold)}</p></div>
                <div><p className="text-xs text-[#78909b]">Pending royalty</p><p className="mt-1 text-sm font-bold text-amber-700">{currency.format(book.royaltyPending)}</p></div>
              </Link>
            ))}
          </div>
        </section>

        <div className="space-y-5">
          <section className="rounded-2xl bg-[#123346] p-6 text-white shadow-[0_14px_40px_rgba(18,51,70,0.18)]">
            <div className="flex items-start justify-between gap-4"><span className="grid size-10 place-items-center rounded-xl bg-white/10 text-sky-100"><Headphones className="size-5" /></span><span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-200">{openTickets.length} open</span></div>
            <h2 className="mt-5 font-bold">Support that keeps you informed</h2>
            <p className="mt-2 text-sm leading-6 text-sky-50/65">View every response and continue the conversation from the same ticket.</p>
            <Link href="/author/support" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white hover:underline">Open support centre<ArrowRight className="size-4" /></Link>
          </section>
          <section className="rounded-2xl border border-[#dfe7ea] bg-white p-5">
            <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><CheckCircle2 className="size-[18px]" /></span><div><p className="text-sm font-bold text-[#29434f]">Both titles are live</p><p className="mt-0.5 text-xs text-[#78909b]">Across 5 unique marketplaces</p></div></div>
            <div className="mt-4 flex items-center gap-2 border-t border-[#edf1f2] pt-4 text-xs text-[#687f89]"><Clock3 className="size-4" />Marketplace updates may take 7–10 business days.</div>
          </section>
        </div>
      </div>
    </div>
  );
}
